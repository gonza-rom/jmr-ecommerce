// src/emails/cambio-estado.js
// Email que se envía al cliente cuando el admin cambia el estado de su pedido.
// Cubre: CONFIRMADO, PREPARANDO, ENVIADO, ENTREGADO, CANCELADO.

import { enviarEmail, fmt, envioLabel, BRAND } from "@/lib/brevo";
import { emailBase, btnCta, cajaInfo, sep } from "@/emails/base";

const appUrl    = process.env.NEXT_PUBLIC_APP_URL ?? "https://jmrmarroquineria.com.ar";
const waNumber  = "543834927252";

// ── Configuración por estado ──────────────────────────────────────────────────
const CONFIG_ESTADO = {
  CONFIRMADO: {
    emoji:     "✓",
    titulo:    "Pedido confirmado",
    subtitulo: "¡Tu pago fue recibido!",
    color:     BRAND.green,
    mensaje:   (nombre, _pedido) =>
      `Hola <strong>${nombre}</strong>, confirmamos el pago de tu pedido. ¡Ahora lo estamos preparando!`,
    siguientePaso: "Estamos preparando tu pedido. Te avisamos cuando esté listo.",
    preview: (num) => `Tu pedido #${num} fue confirmado — lo estamos preparando`,
  },
  PREPARANDO: {
    emoji:     "📦",
    titulo:    "Preparando tu pedido",
    subtitulo: "Manos a la obra",
    color:     "#3b82f6",
    mensaje:   (nombre, _pedido) =>
      `Hola <strong>${nombre}</strong>, tu pedido está siendo preparado con cuidado.`,
    siguientePaso: "En cuanto esté listo te avisamos para que lo retires o lo despachamos.",
    preview: (num) => `Estamos preparando tu pedido #${num}`,
  },
  ENVIADO: {
    emoji:     "🚚",
    titulo:    "¡Tu pedido está en camino!",
    subtitulo: "Despachado por OCA",
    color:     "#8b5cf6",
    mensaje:   (nombre, pedido) => {
      const trackingInfo = pedido.ocaNumeroEnvio
        ? `<br><br>Tu número de seguimiento OCA es: <strong style="color:#111;">${pedido.ocaNumeroEnvio}</strong>`
        : "";
      return `Hola <strong>${nombre}</strong>, tu pedido ya fue despachado.${trackingInfo}`;
    },
    siguientePaso: "Podés hacer seguimiento en el sitio de OCA con tu número de envío.",
    preview: (num) => `Tu pedido #${num} está en camino`,
  },
  ENTREGADO: {
    emoji:     "🎉",
    titulo:    "¡Pedido entregado!",
    subtitulo: "Gracias por tu compra",
    color:     BRAND.green,
    mensaje:   (nombre, _pedido) =>
      `Hola <strong>${nombre}</strong>, tu pedido fue entregado exitosamente. ¡Esperamos que estés feliz con tu compra!`,
    siguientePaso: null,
    preview: (num) => `Tu pedido #${num} fue entregado — ¡Gracias!`,
  },
  CANCELADO: {
    emoji:     "✕",
    titulo:    "Pedido cancelado",
    subtitulo: "Lamentamos el inconveniente",
    color:     "#ef4444",
    mensaje:   (nombre, _pedido) =>
      `Hola <strong>${nombre}</strong>, tu pedido fue cancelado. Si tenés preguntas, no dudes en contactarnos.`,
    siguientePaso: "Si ya realizaste un pago, nos comunicamos con vos para coordinar el reembolso.",
    preview: (num) => `Tu pedido #${num} fue cancelado`,
  },
};

/**
 * Envía el email de cambio de estado al comprador.
 *
 * @param {object} pedido   - Registro del Pedido (con items y dirección)
 * @param {string} nuevoEstado - El nuevo estado ('CONFIRMADO', 'ENVIADO', etc.)
 */
export async function enviarCambioEstado(pedido, nuevoEstado) {
  const cfg = CONFIG_ESTADO[nuevoEstado];
  if (!cfg) {
    console.warn(`[Brevo] Estado ${nuevoEstado} no tiene template configurado — email no enviado`);
    return { ok: false, error: "Estado sin template" };
  }

  if (!pedido.compradorEmail) {
    console.warn(`[Brevo] Pedido ${pedido.id} sin email — email no enviado`);
    return { ok: false, error: "Sin email de comprador" };
  }

  const numeroPedido = pedido.id.slice(-8).toUpperCase();
  const nombre = pedido.compradorNombre?.split(" ")[0] ?? "Cliente";

  // ── Sección de tracking OCA ───────────────────────────────────────────────
  const trackingOCA = nuevoEstado === "ENVIADO" && pedido.ocaNumeroEnvio
    ? cajaInfo(`
        <p style="font-size:12px;font-weight:700;color:#5b21b6;margin:0 0 8px;text-transform:uppercase;letter-spacing:0.06em;">
          Seguimiento OCA
        </p>
        <p style="font-size:13px;color:#111;margin:0 0 4px;">
          Número de envío: <strong>${pedido.ocaNumeroEnvio}</strong>
        </p>
        <p style="font-size:11px;color:#6b7280;margin:0;">
          Usá este número en el sitio de OCA para seguir tu paquete en tiempo real.
        </p>
        <div style="margin-top:10px;">
          <a href="https://www.oca.com.ar/track?nroEnvio=${pedido.ocaNumeroEnvio}"
            style="font-size:12px;color:#8b5cf6;font-weight:700;text-decoration:none;">
            Rastrear en OCA →
          </a>
        </div>
      `, "#8b5cf6")
    : "";

  // ── Resumen del pedido ────────────────────────────────────────────────────
  const resumenItems = (pedido.items ?? []).slice(0, 3).map((item) =>
    `<div style="font-size:12px;color:#6b7280;padding:3px 0;">
      ${item.cantidad}× ${item.nombre}${item.talle ? ` (T: ${item.talle})` : ""}${item.color ? ` — ${item.color}` : ""}
    </div>`
  ).join("");

  const masItems = pedido.items?.length > 3
    ? `<div style="font-size:11px;color:#9ca3af;margin-top:2px;">+ ${pedido.items.length - 3} producto(s) más</div>`
    : "";

  // ── Reseña post-entrega ───────────────────────────────────────────────────
  const ctaReseña = nuevoEstado === "ENTREGADO"
    ? `
      ${sep}
      <p style="font-size:13px;font-weight:700;color:#111;margin:0 0 6px;">¿Cómo fue tu experiencia?</p>
      <p style="font-size:12px;color:#6b7280;margin:0 0 12px;">
        Tu opinión nos ayuda a mejorar. Contanos qué te pareció por WhatsApp.
      </p>
      <a href="https://wa.me/${waNumber}?text=${encodeURIComponent("Hola! Quiero dejar mi opinión sobre mi compra en JMR.")}"
        style="font-size:12px;color:#25D366;font-weight:700;text-decoration:none;">
        ✍️ Dejar mi opinión →
      </a>
    `
    : "";

  const contenido = `
    <p style="font-size:15px;color:#111;margin:0 0 4px;">
      ${cfg.mensaje(nombre, pedido)}
    </p>

    ${sep}

    <div style="margin:16px 0;background:#f9fafb;border-radius:8px;padding:14px 16px;">
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#9ca3af;margin-bottom:8px;">
        Pedido #${numeroPedido}
      </div>
      ${resumenItems}
      ${masItems}
      <div style="font-size:13px;font-weight:800;color:#111;margin-top:10px;padding-top:8px;border-top:1px solid #e5e7eb;">
        Total: ${fmt(pedido.total)}
      </div>
      <div style="font-size:11px;color:#9ca3af;margin-top:2px;">
        ${envioLabel(pedido.tipoEnvio)}
      </div>
    </div>

    ${trackingOCA}

    ${cfg.siguientePaso
      ? `<p style="font-size:13px;color:#6b7280;margin:0;line-height:1.6;">${cfg.siguientePaso}</p>`
      : ""}

    ${btnCta("Ver mi pedido", `${appUrl}/mis-pedidos`)}

    <div style="text-align:center;margin-top:8px;">
      <a href="https://wa.me/${waNumber}?text=${encodeURIComponent(`Hola! Consulto por mi pedido #${numeroPedido}`)}"
        style="font-size:12px;color:#25D366;font-weight:700;text-decoration:none;">
        📱 Contactar por WhatsApp →
      </a>
    </div>

    ${ctaReseña}
  `;

  return enviarEmail({
    to:      pedido.compradorEmail,
    toName:  pedido.compradorNombre ?? "Cliente",
    subject: `${cfg.emoji} Pedido #${numeroPedido} — ${cfg.titulo} | Marroquinería JMR`,
    html:    emailBase({
      titulo:    cfg.titulo,
      subtitulo: `Pedido #${numeroPedido}`,
      contenido,
      preview:   cfg.preview(numeroPedido),
    }),
    tags: [`estado-${nuevoEstado.toLowerCase()}`],
  });
}