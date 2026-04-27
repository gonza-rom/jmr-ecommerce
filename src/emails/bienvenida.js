// src/emails/bienvenida.js
// Email que se envía cuando un usuario crea una cuenta nueva.
// Se dispara desde el auth callback después de confirmar el email.

import { enviarEmail, BRAND } from "@/lib/brevo";
import { emailBase, btnCta, cajaInfo, sep } from "@/emails/base";

const appUrl   = process.env.NEXT_PUBLIC_APP_URL ?? "https://jmrmarroquineria.com.ar";
const waNumber = "543834927252";

/**
 * Envía el email de bienvenida al nuevo usuario.
 *
 * @param {object} params
 * @param {string} params.email  - Email del usuario
 * @param {string} params.nombre - Nombre del usuario
 */
export async function enviarBienvenida({ email, nombre }) {
  const nombreCorto = nombre?.split(" ")[0] ?? "Cliente";

  const contenido = `
    <p style="font-size:15px;color:#111;margin:0 0 6px;">
      Hola <strong>${nombreCorto}</strong>! 🎉
    </p>
    <p style="font-size:14px;color:#6b7280;margin:0 0 24px;line-height:1.6;">
      Tu cuenta en Marroquinería JMR fue creada exitosamente.
      Ahora podés comprar más rápido, ver el estado de tus pedidos y guardar tus direcciones.
    </p>

    ${cajaInfo(`
      <p style="font-size:13px;font-weight:700;color:#15803d;margin:0 0 10px;">
        ¿Qué podés hacer con tu cuenta?
      </p>
      <div style="font-size:13px;color:#15803d;line-height:1.9;">
        ✓ &nbsp;Ver el historial completo de tus pedidos<br>
        ✓ &nbsp;Guardar direcciones de entrega<br>
        ✓ &nbsp;Hacer checkout más rápido<br>
        ✓ &nbsp;Recibir notificaciones de tus compras
      </div>
    `)}

    ${sep}

    <p style="font-size:13px;color:#6b7280;margin:0 0 4px;line-height:1.6;">
      Si tenés alguna consulta sobre nuestros productos o querés hacer un pedido,
      escribinos por WhatsApp — te respondemos enseguida.
    </p>

    ${btnCta("Ir a mi cuenta", `${appUrl}/cuenta`)}

    <div style="text-align:center;margin-top:4px;">
      <a href="${appUrl}/productos"
        style="font-size:12px;color:${BRAND.green};font-weight:700;text-decoration:none;">
        Ver el catálogo →
      </a>
    </div>

    ${sep}

    <div style="text-align:center;">
      <a href="https://wa.me/${waNumber}?text=${encodeURIComponent("Hola! Acabo de crear mi cuenta en JMR y tengo una consulta.")}"
        style="font-size:12px;color:#25D366;font-weight:700;text-decoration:none;">
        📱 Contactar por WhatsApp →
      </a>
    </div>
  `;

  return enviarEmail({
    to:      email,
    toName:  nombre ?? "Cliente",
    subject: `¡Bienvenido/a a Marroquinería JMR, ${nombreCorto}!`,
    html:    emailBase({
      titulo:    `¡Bienvenido/a, ${nombreCorto}!`,
      subtitulo: "Tu cuenta fue creada exitosamente",
      contenido,
      preview:   `Hola ${nombreCorto}! Tu cuenta en Marroquinería JMR está lista.`,
    }),
    tags: ["bienvenida", "registro"],
  });
}