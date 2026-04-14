// src/emails/confirmacion-pedido.js
// Email que se envía al cliente inmediatamente después de confirmar un pedido.

import { enviarEmail, fmt, fmtFecha, metodoLabel, envioLabel, BRAND } from "@/lib/brevo";
import { emailBase, tablaItems, filaTotales, btnCta, cajaInfo, sep, fila } from "@/emails/base";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://jmrmarroquineria.com.ar";
const waNumber = "543834927252";

/**
 * Envía el email de confirmación de pedido al comprador.
 *
 * @param {object} pedido   - Registro completo del Pedido (con items)
 */
export async function enviarConfirmacionPedido(pedido) {
  const numeroPedido = pedido.id.slice(-8).toUpperCase();
  const esTransferencia = pedido.metodoPago === "transferencia";

  // ── Instrucciones de pago para transferencia ──────────────────────────────
  const instruccionesTransferencia = esTransferencia ? cajaInfo(`
    <p style="font-size:12px;font-weight:700;color:#15803d;margin:0 0 10px;text-transform:uppercase;letter-spacing:0.06em;">
      Datos para realizar la transferencia
    </p>
    ${fila("Titular", process.env.TRANSFERENCIA_TITULAR ?? "María Lourdes Quispe")}
    ${fila("Banco",   process.env.TRANSFERENCIA_BANCO   ?? "Banco Nación / Mercado Pago")}
    ${process.env.TRANSFERENCIA_CBU   ? fila("CBU",   process.env.TRANSFERENCIA_CBU)   : ""}
    ${process.env.TRANSFERENCIA_ALIAS ? fila("Alias", process.env.TRANSFERENCIA_ALIAS) : ""}
    <p style="font-size:11px;color:#15803d;margin:10px 0 0;">
      Una vez realizada la transferencia, envianos el comprobante por WhatsApp al
      <a href="https://wa.me/${waNumber}" style="color:#6DBE45;font-weight:700;">+54 383 492-7252</a>
      para confirmar tu pedido.
    </p>
  `) : "";

  // ── Sección de retiro ─────────────────────────────────────────────────────
  const infoRetiro = pedido.tipoEnvio?.startsWith("retiro") ? cajaInfo(`
    <p style="font-size:12px;font-weight:700;color:#15803d;margin:0 0 6px;">Retiro en local</p>
    <p style="font-size:12px;color:#15803d;margin:0;">
      ${pedido.tipoEnvio === "retiro-rivadavia"
        ? "Rivadavia 564 — San Fernando del Valle de Catamarca"
        : "Av. Pte. Castillo 1165 — Valle Viejo, Catamarca"}
      <br>Lun–Vie 8:30–13 / 17–21:30 · Sáb 9–13 / 17–21
      <br><br>Te avisamos por WhatsApp cuando tu pedido esté listo para retirar.
    </p>
  `) : "";

  // ── Cuerpo del email ──────────────────────────────────────────────────────
  const contenido = `
    <p style="font-size:15px;color:#111;margin:0 0 4px;">
      Hola <strong>${pedido.compradorNombre?.split(" ")[0] ?? ""}!</strong> 👋
    </p>
    <p style="font-size:14px;color:#6b7280;margin:0 0 24px;line-height:1.6;">
      Recibimos tu pedido correctamente. Te confirmamos los detalles a continuación.
    </p>

    ${cajaInfo(`
      <div style="text-align:center;">
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#15803d;margin-bottom:4px;">
          Número de pedido
        </div>
        <div style="font-size:22px;font-weight:900;color:#286c00;letter-spacing:0.04em;">
          #${numeroPedido}
        </div>
        <div style="font-size:11px;color:#9ca3af;margin-top:4px;">
          ${fmtFecha(pedido.createdAt)}
        </div>
      </div>
    `)}

    ${tablaItems(pedido.items ?? [])}
    ${filaTotales({ subtotal: pedido.subtotal, costoEnvio: pedido.costoEnvio, total: pedido.total })}

    ${sep}

    <p style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#9ca3af;margin:0 0 8px;">
      Detalle del pedido
    </p>
    ${fila("Método de pago", metodoLabel(pedido.metodoPago))}
    ${fila("Entrega",        envioLabel(pedido.tipoEnvio))}
    ${pedido.tipoEnvio === "envio" && pedido.direccion
      ? fila("Dirección", `${pedido.direccion.calle} ${pedido.direccion.numero ?? ""}, ${pedido.direccion.ciudad}`)
      : ""}

    ${instruccionesTransferencia}
    ${infoRetiro}

    ${sep}

    <p style="font-size:13px;font-weight:700;color:#111;margin:0 0 8px;">Próximos pasos</p>
    <div style="font-size:12px;color:#6b7280;line-height:1.8;">
      ${pedido.metodoPago === "transferencia"
        ? "1. Realizá la transferencia con los datos de arriba.<br>2. Envianos el comprobante por WhatsApp.<br>3. Confirmamos tu pedido y lo preparamos."
        : "1. Confirmamos tu pago.<br>2. Preparamos tu pedido.<br>3. Te avisamos cuando esté listo."}
    </div>

    ${btnCta("Ver estado de mi pedido", `${appUrl}/mis-pedidos`)}

    <div style="text-align:center;margin-top:8px;">
      <a href="https://wa.me/${waNumber}?text=${encodeURIComponent(`Hola! Tengo una consulta sobre mi pedido #${numeroPedido}`)}"
        style="font-size:12px;color:#25D366;font-weight:700;text-decoration:none;">
        📱 Contactar por WhatsApp →
      </a>
    </div>
  `;

  return enviarEmail({
    to:       pedido.compradorEmail,
    toName:   pedido.compradorNombre ?? "Cliente",
    subject:  `✓ Pedido #${numeroPedido} recibido — Marroquinería JMR`,
    html:     emailBase({
      titulo:    "¡Pedido recibido!",
      subtitulo: `Pedido #${numeroPedido} · ${fmtFecha(pedido.createdAt)}`,
      contenido,
      preview:   `Tu pedido #${numeroPedido} fue recibido. Total: ${fmt(pedido.total)}`,
    }),
    tags: ["confirmacion-pedido"],
  });
}