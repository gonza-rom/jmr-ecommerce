// src/emails/verificacion-cuenta.js
// Email con el link de verificación para confirmar la cuenta.
// Supabase maneja el envío nativo, pero podemos sobreescribirlo
// con nuestro propio template via el webhook de auth.
//
// IMPORTANTE: Para usar este template en lugar del email nativo de Supabase:
// 1. En Supabase → Authentication → Email Templates → desactivar "Confirm signup"
// 2. Usar el hook /api/auth/brevo/confirm que llama esta función
//    con el link generado por Supabase.

import { enviarEmail, BRAND } from "@/lib/brevo";
import { emailBase, sep } from "@/emails/base";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://jmrmarroquineria.com.ar";

/**
 * Envía el email de verificación de cuenta.
 *
 * @param {object} params
 * @param {string} params.email       - Email del usuario
 * @param {string} params.nombre      - Nombre del usuario
 * @param {string} params.confirmUrl  - URL de confirmación generada por Supabase
 */
export async function enviarVerificacionCuenta({ email, nombre, confirmUrl }) {
  const nombreCorto = nombre?.split(" ")[0] ?? "Cliente";

  const contenido = `
    <p style="font-size:15px;color:#111;margin:0 0 6px;">
      Hola <strong>${nombreCorto}</strong>! 👋
    </p>
    <p style="font-size:14px;color:#6b7280;margin:0 0 24px;line-height:1.6;">
      Gracias por registrarte en Marroquinería JMR.
      Solo falta un paso: confirmá tu dirección de email haciendo click en el botón de abajo.
    </p>

    <div style="text-align:center;margin:28px 0;">
      <a href="${confirmUrl}"
        style="display:inline-block;background:linear-gradient(135deg,${BRAND.greenDark},${BRAND.green});color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:16px 36px;border-radius:8px;letter-spacing:-0.01em;">
        Confirmar mi cuenta
      </a>
    </div>

    <p style="font-size:12px;color:#9ca3af;text-align:center;margin:0 0 20px;">
      Este link expira en <strong>24 horas</strong>.
    </p>

    ${sep}

    <p style="font-size:12px;color:#9ca3af;margin:0;line-height:1.6;">
      Si no creaste una cuenta en Marroquinería JMR podés ignorar este email.
      Nadie más podrá acceder a tu cuenta sin confirmar este link.
    </p>

    <p style="font-size:11px;color:#d1d5db;margin:12px 0 0;">
      Si el botón no funciona, copiá y pegá este link en tu navegador:<br>
      <span style="color:#9ca3af;word-break:break-all;">${confirmUrl}</span>
    </p>
  `;

  return enviarEmail({
    to:      email,
    toName:  nombre ?? "Cliente",
    subject: "Confirmá tu cuenta — Marroquinería JMR",
    html:    emailBase({
      titulo:    "Confirmá tu cuenta",
      subtitulo: "Un click y listo",
      contenido,
      preview:   `${nombreCorto}, confirmá tu email para activar tu cuenta en JMR.`,
    }),
    tags: ["verificacion-cuenta"],
  });
}