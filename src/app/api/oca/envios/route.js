// src/app/api/oca/envios/route.js
// POST /api/oca/envios
// Genera el número de envío OCA y actualiza el pedido.
// Solo llamado desde el panel admin cuando el admin confirma el despacho.

import { NextResponse } from "next/server";
import { generarEnvio } from "@/lib/oca";
import { prisma }       from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      pedidoId,
      peso  = 1,
      alto  = 20,
      ancho = 30,
      largo = 40,
    } = body;

    if (!pedidoId) {
      return NextResponse.json(
        { ok: false, error: "pedidoId requerido" },
        { status: 400 }
      );
    }

    // Cargar pedido con dirección e items
    const pedido = await prisma.pedido.findUnique({
      where:   { id: pedidoId },
      include: { items: true, direccion: true },
    });

    if (!pedido) {
      return NextResponse.json(
        { ok: false, error: "Pedido no encontrado" },
        { status: 404 }
      );
    }

    if (pedido.ocaNumeroEnvio) {
      return NextResponse.json({
        ok:            true,
        numeroEnvio:   pedido.ocaNumeroEnvio,
        etiquetaUrl:   pedido.ocaEtiquetaUrl,
        yaExistia:     true,
      });
    }

    if (!pedido.direccion && pedido.tipoEnvio === "envio") {
      return NextResponse.json(
        { ok: false, error: "El pedido no tiene dirección de entrega cargada" },
        { status: 422 }
      );
    }

    // Generar envío en OCA
    const resultado = await generarEnvio({
      pedido,
      direccion: pedido.direccion,
      items:     pedido.items,
      peso,
      alto,
      ancho,
      largo,
    });

    // Guardar en la BD
    await prisma.pedido.update({
      where: { id: pedidoId },
      data: {
        ocaNumeroEnvio:   resultado.numeroEnvio,
        ocaEtiquetaUrl:   resultado.etiquetaUrl,
        ocaAdmision:      resultado.admision,
        ocaEstado:        "EN_CAMINO",
        ocaFechaDespacho: new Date(),
        estado:           "ENVIADO",
        enviadoAt:        new Date(),
      },
    });

    return NextResponse.json({
      ok:          true,
      numeroEnvio: resultado.numeroEnvio,
      etiquetaUrl: resultado.etiquetaUrl,
      admision:    resultado.admision,
    });

  } catch (error) {
    console.error("[POST /api/oca/envios]", error.message);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}