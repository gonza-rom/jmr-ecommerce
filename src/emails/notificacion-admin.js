// src/emails/notificacion-admin.js
// Email interno que se envía al admin cuando entra un pedido nuevo.
// Reemplaza el sistema de WhatsApp comentado en notificaciones.js.

import { enviarEmail, fmt, fmtFecha, metodoLabel, envioLabel, BRAND } from "@/lib/brevo";
import { emailBase, tablaItems, filaTotales, cajaInfo, sep, fila } from "@/emails/base";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://jmrmarroquineria.com.ar";

/**
 * Envía notificación de pedido nuevo al email del admin.
 *
 * @param {object} pedido  - Registro completo del Pedido
 */
export async function notificarAdminPedidoNuevo(pedido) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.warn("[Brevo] ADMIN_EMAIL no configurado — notificación al admin omitida");
    return { ok: false, error: "ADMIN_EMAIL no configurado" };
  }

  const numeroPedido = pedido.id.slice(-8).toUpperCase();
  const esMp         = pedido.metodoPago === "mercadopago";
  const esTransf     = pedido.metodoPago === "transferencia";

  // Badge de urgencia según método de pago
  const badgePago = esMp
    ? `<span style="background:#fff7ed;border:1px solid #fed7aa;color:#c2410c;font-size:10px;font-weight:700;padding:2px 8px;border-radius:9999px;">PENDIENTE CONFIRMACIÓN MP</span>`
    : esTransf
    ? `<span style="background:#fef3c7;border:1px solid #fde68a;color:#92400e;font-size:10px;font-weight:700;padding:2px 8px;border-radius:9999px;">ESPERANDO COMPROBANTE</span>`
    : `<span style="background:#f0fdf4;border:1px solid #bbf7d0;color:#15803d;font-size:10px;font-weight:700;padding:2px 8px;border-radius:9999px;">EFECTIVO</span>`;

  const contenido = `
    <div style="margin-bottom:20px;">
      <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#9ca3af;margin-bottom:6px;">
        Nuevo pedido entrante
      </div>
      <div style="font-size:22px;font-weight:900;color:#111;letter-spacing:-0.02em;">
        #${numeroPedido}
      </div>
      <div style="font-size:11px;color:#9ca3af;margin-top:2px;">${fmtFecha(pedido.createdAt)}</div>
      <div style="margin-top:8px;">${badgePago}</div>
    </div>

    ${sep}

    <p style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#9ca3af;margin:0 0 8px;">
      Datos del comprador
    </p>
    ${fila("Nombre",    pedido.compradorNombre    ?? "—")}
    ${fila("Email",     pedido.compradorEmail     ?? "—")}
    ${fila("Teléfono",  pedido.compradorTelefono  ?? "—")}
    ${fila("Entrega",   envioLabel(pedido.tipoEnvio))}
    ${fila("Pago",      metodoLabel(pedido.metodoPago))}
    ${pedido.tipoEnvio === "envio" && pedido.direccion
      ? fila("Dirección", `${pedido.direccion.calle} ${pedido.direccion.numero ?? ""}, ${pedido.direccion.ciudad}, ${pedido.direccion.provincia ?? ""}`)
      : ""}
    ${pedido.observaciones
      ? fila("Notas", `<em>${pedido.observaciones}</em>`)
      : ""}

    ${sep}

    <p style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#9ca3af;margin:0 0 0;">
      Productos
    </p>
    ${tablaItems(pedido.items ?? [])}
    ${filaTotales({ subtotal: pedido.subtotal, costoEnvio: pedido.costoEnvio, total: pedido.total })}

    ${sep}

    ${pedido.compradorTelefono ? cajaInfo(`
      <p style="font-size:12px;font-weight:700;color:#15803d;margin:0 0 6px;">Contactar al cliente</p>
      <a href="https://wa.me/${pedido.compradorTelefono.replace(/\D/g, "")}?text=${encodeURIComponent(`Hola ${pedido.compradorNombre ?? ""}! Te contactamos de Marroquinería JMR por tu pedido #${numeroPedido}. `)}"
        style="font-size:13px;color:#25D366;font-weight:700;text-decoration:none;">
        📱 Abrir WhatsApp →
      </a>
    `) : ""}

    <div style="text-align:center;margin-top:16px;">
      <a href="${appUrl}/admin/pedidos"
        style="display:inline-block;background:${BRAND.dark};color:#fff;font-size:13px;font-weight:700;padding:12px 28px;border-radius:8px;text-decoration:none;">
        Ver en el admin →
      </a>
    </div>
  `;

  return enviarEmail({
    to:      adminEmail,
    toName:  "Admin JMR",
    subject: `🛍️ Nuevo pedido #${numeroPedido} — ${fmt(pedido.total)} — ${metodoLabel(pedido.metodoPago)}`,
    html:    emailBase({
      titulo:    `Nuevo pedido — #${numeroPedido}`,
      subtitulo: `${fmt(pedido.total)} · ${metodoLabel(pedido.metodoPago)}`,
      contenido,
      preview:   `Pedido #${numeroPedido} de ${pedido.compradorNombre} — ${fmt(pedido.total)}`,
    }),
    tags: ["admin-nuevo-pedido"],
  });
}