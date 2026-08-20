// src/app/api/mercadopago/webhook/route.js
// Notificación de Mercado Pago cuando cambia el estado de un pago.
//
// IMPORTANTE: nunca confiamos en el body del webhook (se puede falsear).
// Solo usamos el id del pago que llega, y reconsultamos el estado real
// contra la API de Mercado Pago con nuestro propio access token.
//
// Configurar en el panel de Mercado Pago (Tu negocio → Configuración →
// Notificaciones webhooks): URL = https://tu-dominio/api/mercadopago/webhook
// Ahí también se genera la "Clave secreta" → guardarla en .env como
// MP_WEBHOOK_SECRET (opcional pero recomendado, valida la firma x-signature).

import { NextResponse }       from "next/server";
import crypto                 from "node:crypto";
import { prisma }             from "@/lib/prisma";
import { crearVentaEnDevhub } from "@/lib/devhub";
import { enviarCambioEstado } from "@/emails/cambio-estado";

export const dynamic = "force-dynamic";

// Estados que, si se confirman, cierran el pedido automáticamente.
const ESTADOS_CON_EMAIL = new Set(["CONFIRMADO", "CANCELADO"]);

function verificarFirma(req, dataId) {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) return true; // sin secreto configurado todavía — no bloquea, pero no valida

  const signatureHeader = req.headers.get("x-signature");
  const requestId        = req.headers.get("x-request-id");
  if (!signatureHeader || !requestId) return false;

  const partes = Object.fromEntries(
    signatureHeader.split(",").map((p) => p.trim().split("=").map((s) => s.trim()))
  );
  const { ts, v1 } = partes;
  if (!ts || !v1) return false;

  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
  const hash = crypto.createHmac("sha256", secret).update(manifest).digest("hex");

  return hash === v1;
}

async function extraerNotificacion(req) {
  const { searchParams } = new URL(req.url);
  let dataId = searchParams.get("data.id") ?? searchParams.get("id");
  let type   = searchParams.get("type")    ?? searchParams.get("topic");

  let body = null;
  try { body = await req.json(); } catch { /* puede no traer body */ }

  if (body?.data?.id) dataId = String(body.data.id);
  if (body?.type)     type   = body.type;

  return { dataId, type };
}

export async function POST(req) {
  try {
    const { dataId, type } = await extraerNotificacion(req);

    // Solo nos interesan las notificaciones de pagos.
    if (type !== "payment" || !dataId) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    if (!verificarFirma(req, dataId)) {
      console.warn("[MP Webhook] Firma inválida para el pago:", dataId);
      return NextResponse.json({ ok: false, error: "Firma inválida" }, { status: 401 });
    }

    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) {
      console.error("[MP Webhook] Falta MP_ACCESS_TOKEN");
      return NextResponse.json({ ok: false, error: "No configurado" }, { status: 500 });
    }

    // Fuente de verdad: el pago tal como lo tiene Mercado Pago, no el payload recibido.
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${dataId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!mpRes.ok) {
      console.error("[MP Webhook] No se pudo consultar el pago", dataId, mpRes.status);
      return NextResponse.json({ ok: false, error: "Pago no encontrado en MP" }, { status: 502 });
    }

    const payment   = await mpRes.json();
    const pedidoId  = payment.external_reference;
    const estadoMp  = payment.status; // approved | pending | in_process | rejected | cancelled | refunded | charged_back

    if (!pedidoId) {
      console.warn("[MP Webhook] Pago sin external_reference:", dataId);
      return NextResponse.json({ ok: true, skipped: true });
    }

    const pedido = await prisma.pedido.findUnique({
      where:   { id: pedidoId },
      include: { items: true, direccion: true },
    });

    if (!pedido) {
      console.warn("[MP Webhook] Pedido no encontrado:", pedidoId);
      return NextResponse.json({ ok: true, skipped: true });
    }

    // Idempotencia — MP reintenta notificaciones; no reprocesar el mismo estado dos veces.
    if (pedido.mpPaymentId === String(payment.id) && pedido.mpStatus === estadoMp) {
      return NextResponse.json({ ok: true, alreadyProcessed: true });
    }

    const data = {
      mpPaymentId: String(payment.id),
      mpStatus:    estadoMp,
    };

    let nuevoEstado = null;

    if (estadoMp === "approved") {
      nuevoEstado    = "CONFIRMADO";
      data.estado    = nuevoEstado;
      if (!pedido.pagadoAt) data.pagadoAt = new Date();
    } else if (["rejected", "cancelled"].includes(estadoMp) && !pedido.pagadoAt) {
      // Solo auto-cancelamos si el pago nunca llegó a confirmarse.
      nuevoEstado = "CANCELADO";
      data.estado = nuevoEstado;
    }
    // pending / in_process / refunded / charged_back: guardamos el status pero el
    // `estado` del pedido se resuelve a mano desde el panel admin.

    await prisma.pedido.update({ where: { id: pedido.id }, data });

    // ── Descontar stock en DevHub solo cuando el pago queda confirmado ───────
    if (estadoMp === "approved" && !pedido.ventaDevhubId) {
      const itemsConDevhub = pedido.items.filter((i) => i.productoDevhubId);
      if (itemsConDevhub.length > 0) {
        try {
          const result = await crearVentaEnDevhub({
            items: itemsConDevhub.map((item) => ({
              productoId: item.productoDevhubId,
              varianteId: item.varianteDevhubId ?? null,
              cantidad:   item.cantidad,
              precioUnit: item.precioUnit,
            })),
            cliente:       { nombre: pedido.compradorNombre ?? "Cliente", dni: null },
            metodoPago:    "MERCADOPAGO",
            descuento:     pedido.descuento ?? 0,
            observaciones: pedido.observaciones,
            pedidoJmrId:   pedido.id,
          });
          await prisma.pedido.update({
            where: { id: pedido.id },
            data:  { ventaDevhubId: result.ventaDevhubId },
          });
        } catch (err) {
          console.error("[MP Webhook] Error al sincronizar con DevHub:", err.message);
        }
      }
    }

    // ── Avisar al cliente cuando el pedido queda confirmado o cancelado ──────
    if (nuevoEstado && ESTADOS_CON_EMAIL.has(nuevoEstado)) {
      const pedidoActualizado = { ...pedido, ...data, estado: nuevoEstado };
      enviarCambioEstado(pedidoActualizado, nuevoEstado).catch((err) =>
        console.error("[MP Webhook] Error al enviar email:", err.message)
      );
    }

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error("[POST /api/mercadopago/webhook]", error);
    return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 });
  }
}
