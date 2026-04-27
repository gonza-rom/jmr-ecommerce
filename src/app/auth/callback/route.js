// src/app/auth/callback/route.js
import { NextResponse }       from "next/server";
import { createClient }       from "@/lib/supabase/server";
import { prisma }             from "@/lib/prisma";
import { enviarBienvenida }   from "@/emails/bienvenida";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code     = searchParams.get("code");
  const redirect = searchParams.get("redirect") ?? "/cuenta";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    console.log('[Callback] exchangeCodeForSession result:', { 
      error: error?.message,
      code: code?.slice(0, 8) + '...' 
    });

    if (!error) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const esNuevo = await sincronizarCliente(user);
          if (esNuevo) {
            const nombre = user.user_metadata?.nombre
                        ?? user.user_metadata?.full_name
                        ?? user.email?.split("@")[0]
                        ?? "Cliente";
            enviarBienvenida({ email: user.email, nombre }).catch(err =>
              console.error("[Brevo] Error email bienvenida:", err.message)
            );
          }
        }
      } catch (e) {
        console.error("[callback] Error al sincronizar cliente:", e);
      }
      return NextResponse.redirect(`${origin}${redirect}`);
    }
  }

  const errorDesc = searchParams.get("error_description") ?? "El link es inválido o expiró";
  return NextResponse.redirect(
    `${origin}/auth/login?error=${encodeURIComponent(errorDesc)}`
  );
}

async function sincronizarCliente(user) {
  const emailNorm = user.email.trim().toLowerCase();
  const nombre    = user.user_metadata?.nombre
                 ?? user.user_metadata?.full_name
                 ?? emailNorm.split("@")[0];

  const porSupabaseId = await prisma.cliente.findUnique({
    where: { supabaseId: user.id },
  });
  if (porSupabaseId) {
    await prisma.cliente.update({
      where: { supabaseId: user.id },
      data:  { email: emailNorm, nombre, updatedAt: new Date() },
    });
    return false;
  }

  const porEmail = await prisma.cliente.findUnique({
    where: { email: emailNorm },
  });
  if (porEmail) {
    await prisma.cliente.update({
      where: { email: emailNorm },
      data:  { supabaseId: user.id, nombre, updatedAt: new Date() },
    });
    return false;
  }

  await prisma.cliente.create({
    data: { supabaseId: user.id, email: emailNorm, nombre },
  });
  return true;
}