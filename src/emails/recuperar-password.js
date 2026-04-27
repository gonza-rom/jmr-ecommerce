// src/emails/recuperar-password.js
// Email con el link para resetear la contraseña.
// Reemplaza el email nativo de Supabase con nuestro template.

import { enviarEmail, BRAND } from "@/lib/brevo";
import { emailBase, sep } from "@/emails/base";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://jmrmarroquineria.com.ar";

/**
 * Envía el email de recuperación de contraseña.
 *
 * @param {object} params
 * @param {string} params.email      - Email del usuario
 * @param {string} params.nombre     - Nombre del usuario (puede ser null)
 * @param {string} params.resetUrl   - URL de reset generada por Supabase
 */
export async function enviarRecuperarPassword({ email, nombre, resetUrl }) {
  const nombreCorto = nombre?.split(" ")[0] ?? "Cliente";

  const contenido = `
    <p style="font-size:15px;color:#111;margin:0 0 6px;">
      Hola <strong>${nombreCorto}</strong>,
    </p>
    <p style="font-size:14px;color:#6b7280;margin:0 0 24px;line-height:1.6;">
      Recibimos una solicitud para restablecer la contraseña de tu cuenta en Marroquinería JMR.
      Hacé click en el botón para crear una nueva.
    </p>

    <div style="text-align:center;margin:28px 0;">
      <a href="${resetUrl}"
        style="display:inline-block;background:linear-gradient(135deg,${BRAND.greenDark},${BRAND.green});color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:16px 36px;border-radius:8px;letter-spacing:-0.01em;">
        Restablecer contraseña
      </a>
    </div>

    <p style="font-size:12px;color:#9ca3af;text-align:center;margin:0 0 20px;">
      Este link expira en <strong>1 hora</strong>.
    </p>

    ${sep}

    <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:8px;padding:12px 16px;margin:0 0 16px;">
      <p style="font-size:12px;color:#92400e;margin:0;line-height:1.6;">
        ⚠️ Si no solicitaste este cambio, ignorá este email.
        Tu contraseña actual sigue siendo la misma y nadie puede cambiarla sin este link.
      </p>
    </div>

    <p style="font-size:11px;color:#d1d5db;margin:0;line-height:1.6;">
      Si el botón no funciona, copiá y pegá este link en tu navegador:<br>
      <span style="color:#9ca3af;word-break:break-all;">${resetUrl}</span>
    </p>
  `;

  return enviarEmail({
    to:      email,
    toName:  nombre ?? "Cliente",
    subject: "Restablecé tu contraseña — Marroquinería JMR",
    html:    emailBase({
      titulo:    "Restablecer contraseña",
      subtitulo: "Solicitaste un cambio de contraseña",
      contenido,
      preview:   "Hacé click para restablecer tu contraseña en JMR. El link expira en 1 hora.",
    }),
    tags: ["recuperar-password"],
  });
}