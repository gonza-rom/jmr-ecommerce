// src/emails/base.js
// Plantilla HTML base para todos los emails de JMR.
// Compatible con Gmail, Outlook, Apple Mail y clientes móviles.
// Usa tablas para máxima compatibilidad (email HTML es diferente al web).

import { BRAND } from "@/lib/brevo";

/**
 * Envuelve el contenido en el layout base del email JMR.
 *
 * @param {object} opciones
 * @param {string} opciones.titulo      - Título del email (en el header verde)
 * @param {string} opciones.subtitulo   - Subtítulo debajo del título (opcional)
 * @param {string} opciones.contenido   - HTML del cuerpo del email
 * @param {string} [opciones.preview]   - Texto de preview (aparece en la bandeja antes de abrir)
 * @returns {string} HTML completo del email
 */
export function emailBase({ titulo, subtitulo = "", contenido, preview = "" }) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://jmrmarroquineria.com.ar";
  const waNumber = "543834927252";

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${titulo}</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; background-color: #f5f4f2; font-family: 'Inter', Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    a { color: ${BRAND.green}; text-decoration: none; }
    a:hover { text-decoration: underline; }
    img { max-width: 100%; height: auto; display: block; }
    @media only screen and (max-width: 600px) {
      .email-wrapper { width: 100% !important; }
      .email-body { padding: 24px 16px !important; }
      .btn { width: 100% !important; display: block !important; text-align: center !important; }
      .hide-mobile { display: none !important; }
    }
  </style>
</head>
<body>
  ${preview ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preview}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>` : ""}

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f4f2;padding:32px 16px;">
    <tr>
      <td align="center">
        <table class="email-wrapper" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;">

          <!-- Header / Logo -->
          <tr>
            <td align="center" style="padding-bottom:20px;">
              <a href="${appUrl}" style="text-decoration:none;">
                <div style="font-family:'Inter',Arial,sans-serif;font-size:20px;font-weight:900;letter-spacing:0.12em;text-transform:uppercase;color:${BRAND.dark};">
                  Marroquinería JMR
                </div>
                <div style="font-size:9px;font-weight:600;letter-spacing:0.22em;text-transform:uppercase;color:#9ca3af;margin-top:2px;">
                  Cueros · Carteras · Accesorios
                </div>
              </a>
            </td>
          </tr>

          <!-- Hero strip -->
          <tr>
            <td style="background:linear-gradient(135deg,${BRAND.greenDark},${BRAND.green});border-radius:12px 12px 0 0;padding:28px 32px;text-align:center;">
              <div style="font-family:'Inter',Arial,sans-serif;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.02em;line-height:1.2;">
                ${titulo}
              </div>
              ${subtitulo ? `<div style="font-size:13px;color:rgba(255,255,255,0.75);margin-top:6px;">${subtitulo}</div>` : ""}
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td class="email-body" style="background:#ffffff;border-radius:0 0 12px 12px;border:1px solid ${BRAND.border};border-top:none;padding:32px 36px;">
              ${contenido}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 0 8px;text-align:center;">
              <div style="font-size:11px;color:#9ca3af;line-height:1.7;">
                <strong style="color:#6b7280;">Marroquinería JMR</strong><br>
                Rivadavia 564, San Fernando del Valle de Catamarca<br>
                Av. Pte. Castillo 1165, Valle Viejo · Catamarca, Argentina<br><br>
                <a href="https://wa.me/${waNumber}" style="color:${BRAND.green};font-weight:600;">+54 383 492-7252</a>
                &nbsp;·&nbsp;
                <a href="mailto:cuerosjmr@hotmail.com" style="color:${BRAND.green};font-weight:600;">cuerosjmr@hotmail.com</a>
                &nbsp;·&nbsp;
                <a href="${appUrl}" style="color:${BRAND.green};font-weight:600;">jmrmarroquineria.com.ar</a><br><br>
                <a href="${appUrl}/terminos"     style="color:#9ca3af;">Términos</a>
                &nbsp;·&nbsp;
                <a href="${appUrl}/devoluciones" style="color:#9ca3af;">Devoluciones</a>
                &nbsp;·&nbsp;
                <a href="${appUrl}/privacidad"   style="color:#9ca3af;">Privacidad</a>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}

// ─── Componentes reutilizables ─────────────────────────────────────────────────

/** Tabla de items del pedido */
export function tablaItems(items = []) {
  const filas = items.map((item) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;vertical-align:top;">
        <div style="font-size:13px;font-weight:600;color:#111;">${item.nombre}</div>
        ${item.talle || item.color ? `<div style="font-size:11px;color:#9ca3af;margin-top:2px;">${[item.talle && `T: ${item.talle}`, item.color].filter(Boolean).join(" · ")}</div>` : ""}
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;text-align:center;font-size:13px;color:#6b7280;vertical-align:top;">
        ×${item.cantidad}
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;text-align:right;font-size:13px;font-weight:600;color:#111;vertical-align:top;white-space:nowrap;">
        ${new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(item.subtotal)}
      </td>
    </tr>
  `).join("");

  return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:16px 0;">
      <thead>
        <tr>
          <th style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#9ca3af;text-align:left;padding-bottom:8px;border-bottom:2px solid #f3f4f6;">Producto</th>
          <th style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#9ca3af;text-align:center;padding-bottom:8px;border-bottom:2px solid #f3f4f6;">Cant.</th>
          <th style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#9ca3af;text-align:right;padding-bottom:8px;border-bottom:2px solid #f3f4f6;">Subtotal</th>
        </tr>
      </thead>
      <tbody>${filas}</tbody>
    </table>
  `;
}

/** Fila de resumen (Subtotal / Envío / Total) */
export function filaTotales({ subtotal, costoEnvio, total }) {
  const fmt = (n) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n ?? 0);
  return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:8px;">
      <tr>
        <td style="font-size:12px;color:#9ca3af;padding:3px 0;">Subtotal</td>
        <td style="font-size:12px;color:#9ca3af;text-align:right;padding:3px 0;">${fmt(subtotal)}</td>
      </tr>
      <tr>
        <td style="font-size:12px;color:#9ca3af;padding:3px 0;">Envío</td>
        <td style="font-size:12px;padding:3px 0;text-align:right;${costoEnvio === 0 ? `color:${BRAND.greenDark};font-weight:600;` : "color:#9ca3af;"}">
          ${costoEnvio === 0 ? "¡Gratis!" : fmt(costoEnvio)}
        </td>
      </tr>
      <tr>
        <td style="font-size:15px;font-weight:800;color:#111;padding-top:10px;border-top:1px solid #e5e7eb;">Total</td>
        <td style="font-size:15px;font-weight:800;color:${BRAND.greenDark};text-align:right;padding-top:10px;border-top:1px solid #e5e7eb;">${fmt(total)}</td>
      </tr>
    </table>
  `;
}

/** Botón CTA */
export function btnCta(texto, url) {
  return `
    <div style="text-align:center;margin:24px 0;">
      <a href="${url}" class="btn" style="display:inline-block;background:linear-gradient(135deg,${BRAND.greenDark},${BRAND.green});color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:8px;letter-spacing:-0.01em;">
        ${texto}
      </a>
    </div>
  `;
}

/** Caja de información (fondo claro) */
export function cajaInfo(contenido, color = BRAND.green) {
  const bgMap = {
    [BRAND.green]:  { bg: "#f0fdf4", border: "#bbf7d0" },
    "#f59e0b":      { bg: "#fef3c7", border: "#fde68a" },
    "#3b82f6":      { bg: "#eff6ff", border: "#bfdbfe" },
    "#ef4444":      { bg: "#fff5f5", border: "#fecaca" },
  };
  const { bg, border } = bgMap[color] ?? { bg: "#f9fafb", border: "#e5e7eb" };

  return `
    <div style="background:${bg};border:1px solid ${border};border-radius:10px;padding:14px 18px;margin:16px 0;">
      ${contenido}
    </div>
  `;
}

/** Separador */
export const sep = `<div style="height:1px;background:#f3f4f6;margin:20px 0;"></div>`;

/** Par clave-valor */
export function fila(label, valor) {
  return `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;padding:5px 0;">
      <span style="font-size:12px;color:#9ca3af;">${label}</span>
      <span style="font-size:12px;font-weight:600;color:#111;text-align:right;max-width:60%;">${valor}</span>
    </div>
  `;
}