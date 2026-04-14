// src/app/auth/callback/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma }       from '@/lib/prisma';

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code     = searchParams.get('code');
  const redirect = searchParams.get('redirect') ?? '/cuenta';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) await sincronizarCliente(user);
      } catch (e) {
        console.error('[callback] Error al sincronizar cliente:', e);
      }
      return NextResponse.redirect(`${origin}${redirect}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=callback`);
}

async function sincronizarCliente(user) {
  const emailNorm = user.email.trim().toLowerCase();
  const nombre    = user.user_metadata?.nombre
                 ?? user.user_metadata?.full_name
                 ?? emailNorm.split('@')[0];

  const porSupabaseId = await prisma.cliente.findUnique({ where: { supabaseId: user.id } });
  if (porSupabaseId) {
    await prisma.cliente.update({
      where: { supabaseId: user.id },
      data:  { email: emailNorm, nombre, updatedAt: new Date() },
    });
    return;
  }

  const porEmail = await prisma.cliente.findUnique({ where: { email: emailNorm } });
  if (porEmail) {
    await prisma.cliente.update({
      where: { email: emailNorm },
      data:  { supabaseId: user.id, nombre, updatedAt: new Date() },
    });
    return;
  }

  await prisma.cliente.create({
    data: { supabaseId: user.id, email: emailNorm, nombre },
  });
}