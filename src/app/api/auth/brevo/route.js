// src/app/api/auth/brevo/route.js
// Webhook que Supabase llama para cada evento de autenticación.
// Intercepta los emails nativos de Supabase y los envía con nuestros
// templates de Brevo en su lugar.
//
// ── CONFIGURACIÓN EN SUPABASE ──────────────────────────────────────────────
// 1. Supabase → Authentication → Hooks (en el plan gratuito no están disponibles)
//    Si no tenés hooks, usá la alternativa: deshabilitar emails en Supabase
//    y disparar desde el código directamente (ver notas abajo).
//
// 2. Si tenés plan Pro de Supabase:
//    Authentication → Hooks → Send Email Hook
//    URL: https://tu-dominio.vercel.app/api/auth/brevo
//    Secret: el valor de SUPABASE_HOOK_SECRET en tu .env
//
// ── ALTERNATIVA SIN HOOKS (plan gratuito) ─────────────────────────────────
// Ver auth/callback/route.js y auth/login/page.js — se disparan directamente
// desde el código en los eventos de registro y recuperación.
// ──────────────────────────────────────────────────────────────────────────

import { NextResponse }                from "next/server";
import { enviarVerificacionCuenta }    from "@/emails/verificacion-cuenta";
import { enviarRecuperarPassword }     from "@/emails/recuperar-password";
import { enviarBienvenida }            from "@/emails/bienvenida";

export const dynamic = "force-dynamic";

// Verificar que el request viene de Supabase
function verificarFirma(req) {
  const secret = process.env.SUPABASE_HOOK_SECRET;
  if (!secret) return true; // Si no hay secret configurado, permitir (solo en dev)

  const signature = req.headers.get("x-supabase-signature");
  return signature === secret;
}

export async function POST(req) {
  try {
    if (!verificarFirma(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { type, email, data } = body;

    // Extraer nombre del usuario
    const nombre = data?.user?.user_metadata?.nombre
                ?? data?.user?.user_metadata?.full_name
                ?? email?.split("@")[0]
                ?? "Cliente";

    console.log(`[Brevo Hook] Evento: ${type} → ${email}`);

    switch (type) {

      // ── Confirmación de email al registrarse ──────────────────────────────
      case "signup":
      case "email_change": {
        const confirmUrl = data?.email_action_link ?? data?.confirmation_url;
        if (!confirmUrl) {
          console.warn("[Brevo Hook] signup sin confirmation_url");
          return NextResponse.json({ ok: false, error: "Sin URL de confirmación" });
        }
        await enviarVerificacionCuenta({ email, nombre, confirmUrl });
        return NextResponse.json({ ok: true });
      }

      // ── Recuperación de contraseña ────────────────────────────────────────
      case "recovery":
      case "password_recovery": {
        const resetUrl = data?.email_action_link ?? data?.recovery_url;
        if (!resetUrl) {
          console.warn("[Brevo Hook] recovery sin recovery_url");
          return NextResponse.json({ ok: false, error: "Sin URL de reset" });
        }
        await enviarRecuperarPassword({ email, nombre, resetUrl });
        return NextResponse.json({ ok: true });
      }

      // ── Evento no manejado ────────────────────────────────────────────────
      default:
        console.log(`[Brevo Hook] Evento no manejado: ${type}`);
        return NextResponse.json({ ok: true, skipped: true });
    }

  } catch (error) {
    console.error("[Brevo Hook] Error:", error.message);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}