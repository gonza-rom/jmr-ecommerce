// src/lib/brevo.js
// Capa de envío de emails usando la API transaccional de Brevo (ex-Sendinblue).
// No requiere SDK — usa la REST API directamente con fetch.
//
// Variables de entorno requeridas:
//   BREVO_API_KEY          = tu API key de Brevo (Settings → API Keys)
//   BREVO_FROM_EMAIL       = email remitente verificado en Brevo (ej: ventas@jmrmarroquineria.com.ar)
//   BREVO_FROM_NAME        = nombre del remitente (ej: "Marroquinería JMR")
//   BREVO_REPLY_TO         = email de respuesta (ej: cuerosjmr@hotmail.com)
//
// Documentación Brevo API:
//   https://developers.brevo.com/reference/sendtransacemail

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

// ─── Función base de envío ────────────────────────────────────────────────────

/**
 * Envía un email transaccional via Brevo.
 *
 * @param {object} opciones
 * @param {string|string[]} opciones.to          - Email(s) destinatario
 * @param {string}          opciones.toName      - Nombre destinatario
 * @param {string}          opciones.subject     - Asunto del email
 * @param {string}          opciones.html        - Cuerpo HTML del email
 * @param {string}          [opciones.text]      - Versión texto plano (opcional)
 * @param {object[]}        [opciones.tags]      - Tags para analítica en Brevo
 * @returns {Promise<{ ok: boolean, messageId?: string, error?: string }>}
 */
export async function enviarEmail({ to, toName, subject, html, text, tags = [] }) {
  const apiKey   = process.env.BREVO_API_KEY;
  const fromEmail = process.env.BREVO_FROM_EMAIL;
  const fromName  = process.env.BREVO_FROM_NAME  ?? "Marroquinería JMR";
  const replyTo   = process.env.BREVO_REPLY_TO   ?? fromEmail;

  if (!apiKey) {
    console.error("[Brevo] Falta BREVO_API_KEY en las variables de entorno");
    return { ok: false, error: "BREVO_API_KEY no configurada" };
  }

  if (!fromEmail) {
    console.error("[Brevo] Falta BREVO_FROM_EMAIL en las variables de entorno");
    return { ok: false, error: "BREVO_FROM_EMAIL no configurada" };
  }

  // Normalizar destinatarios (acepta string o array)
  const destinatarios = Array.isArray(to) ? to : [to];
  const toList = destinatarios.map((email) => ({
    email: email.trim().toLowerCase(),
    name:  toName ?? email.split("@")[0],
  }));

  const payload = {
    sender:  { email: fromEmail, name: fromName },
    to:      toList,
    replyTo: { email: replyTo },
    subject,
    htmlContent: html,
    ...(text && { textContent: text }),
    ...(tags.length > 0 && { tags }),
  };

  try {
    const res = await fetch(BREVO_API_URL, {
      method:  "POST",
      headers: {
        "accept":       "application/json",
        "content-type": "application/json",
        "api-key":      apiKey,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("[Brevo] Error al enviar email:", data);
      return { ok: false, error: data?.message ?? `Error HTTP ${res.status}` };
    }

    console.log(`[Brevo] Email enviado OK — messageId: ${data.messageId} → ${destinatarios.join(", ")}`);
    return { ok: true, messageId: data.messageId };

  } catch (err) {
    console.error("[Brevo] Error de red:", err.message);
    return { ok: false, error: err.message };
  }
}

// ─── Helpers de formato ───────────────────────────────────────────────────────

export const fmt = (n) =>
  new Intl.NumberFormat("es-AR", {
    style:                 "currency",
    currency:              "ARS",
    maximumFractionDigits: 0,
  }).format(n ?? 0);

export const fmtFecha = (date) =>
  new Date(date).toLocaleDateString("es-AR", {
    day:    "numeric",
    month:  "long",
    year:   "numeric",
  });

// Colores de la marca JMR — usados en las plantillas
export const BRAND = {
  green:      "#6DBE45",
  greenDark:  "#286c00",
  dark:       "#1a1c1c",
  gray:       "#6b7280",
  lightGray:  "#f5f4f2",
  border:     "#e5e7eb",
};

const ESTADOS_LABEL = {
  PENDIENTE:  "Pendiente",
  CONFIRMADO: "Confirmado",
  PREPARANDO: "Preparando",
  ENVIADO:    "Enviado",
  ENTREGADO:  "Entregado",
  CANCELADO:  "Cancelado",
};

export const estadoLabel = (estado) => ESTADOS_LABEL[estado] ?? estado;

const METODOS_LABEL = {
  mercadopago:   "Mercado Pago",
  transferencia: "Transferencia bancaria",
  efectivo:      "Efectivo",
};

export const metodoLabel = (metodo) => METODOS_LABEL[metodo] ?? metodo;

const ENVIO_LABEL = {
  "retiro-rivadavia":  "Retiro en Rivadavia 564",
  "retiro-valleviejo": "Retiro en Valle Viejo",
  "envio":             "Envío a domicilio",
};

export const envioLabel = (tipo) => ENVIO_LABEL[tipo] ?? tipo;