// src/emails/tracking-oca.js
// Email específico cuando se genera el envío OCA y hay número de tracking disponible.
// Complementa el email de estado ENVIADO con más detalle logístico.

import { enviarEmail, fmt, BRAND } from "@/lib/brevo";
import { emailBase, cajaInfo, btnCta, sep } from "@/emails/base";

const appUrl   = process.env.NEXT_PUBLIC_APP_URL ?? "https://jmrmarroquineria.com.ar";
const waNumber = "543834927252";

/**
 * Envía el email de tracking OCA al cliente.
 *
 * @param {object} pedido          - Registro del Pedido
 * @param {string} numeroEnvioOCA  - Número de envío asignado por OCA
 * @param {number} [diasEstimados] - Días hábiles estimados de entrega
 */
export async function enviarTrackingOCA(pedido, numeroEnvioOCA, diasEstimados = 5) {
  if (!pedido.compradorEmail) {
    return { ok: false, error: "Sin email de comprador" };
  }

  const numeroPedido = pedido.id.slice(-8).toUpperCase();
  const nombre = pedido.compradorNombre?.split(" ")[0] ?? "Cliente";

  const contenido = `
    <p style="font-size:15px;color:#111;margin:0 0 4px;">
      Hola <strong>${nombre}</strong> 🚚
    </p>
    <p style="font-size:14px;color:#6b7280;margin:0 0 20px;line-height:1.6;">
      Tu pedido fue despachado por OCA y ya está en camino.
    </p>

    ${cajaInfo(`
      <div style="text-align:center;">
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#5b21b6;margin-bottom:6px;">
          Número de seguimiento
        </div>
        <div style="font-size:26px;font-weight:900;color:#111;letter-spacing:0.04em;font-family:monospace;">
          ${numeroEnvioOCA}
        </div>
        <div style="margin-top:12px;">
          <a href="https://www.oca.com.ar/track?nroEnvio=${numeroEnvioOCA}"
            style="display:inline-block;background:#7c3aed;color:#fff;font-size:12px;font-weight:700;padding:8px 20px;border-radius:6px;text-decoration:none;">
            Rastrear en OCA →
          </a>
        </div>
      </div>
    `, "#8b5cf6")}

    ${sep}

    <p style="font-size:13px;font-weight:700;color:#111;margin:0 0 6px;">¿Cuándo llega?</p>
    <p style="font-size:13px;color:#6b7280;margin:0 0 16px;line-height:1.6;">
      El tiempo estimado de entrega es de <strong>${diasEstimados} días hábiles</strong> desde el despacho.
      Podés seguir el estado en tiempo real con tu número de envío en el sitio de OCA.
    </p>

    ${sep}

    <p style="font-size:13px;font-weight:700;color:#111;margin:0 0 6px;">Datos del envío</p>
    <div style="font-size:12px;color:#6b7280;line-height:1.8;">
      <div>Pedido: <strong style="color:#111;">#${numeroPedido}</strong></div>
      <div>Total: <strong style="color:#111;">${fmt(pedido.total)}</strong></div>
      ${pedido.direccion
        ? `<div>Destinatario: <strong style="color:#111;">${pedido.compradorNombre}</strong></div>
           <div>Dirección: <strong style="color:#111;">${pedido.direccion.calle} ${pedido.direccion.numero ?? ""}, ${pedido.direccion.ciudad}</strong></div>`
        : ""}
    </div>

    ${btnCta("Seguir mi pedido", `${appUrl}/mis-pedidos`)}

    <div style="text-align:center;margin-top:8px;">
      <a href="https://wa.me/${waNumber}?text=${encodeURIComponent(`Hola! Consulto por mi pedido #${numeroPedido} — envío OCA ${numeroEnvioOCA}`)}"
        style="font-size:12px;color:#25D366;font-weight:700;text-decoration:none;">
        📱 ¿Alguna duda? Escribinos →
      </a>
    </div>
  `;

  return enviarEmail({
    to:      pedido.compradorEmail,
    toName:  pedido.compradorNombre ?? "Cliente",
    subject: `🚚 Tu pedido #${numeroPedido} está en camino — OCA ${numeroEnvioOCA}`,
    html:    emailBase({
      titulo:    "¡Tu pedido está en camino!",
      subtitulo: `Número OCA: ${numeroEnvioOCA}`,
      contenido,
      preview:   `Número de seguimiento OCA: ${numeroEnvioOCA} — ${diasEstimados} días hábiles estimados`,
    }),
    tags: ["tracking-oca"],
  });
}