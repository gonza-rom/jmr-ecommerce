// src/app/api/auth/sync/route.js
import { NextResponse }           from 'next/server';
import { createClient }           from '@/lib/supabase/server';
import { prisma }                 from '@/lib/prisma';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(req) {
  try {
    const ip = getClientIp(req);
    const limite = rateLimit(`auth-sync:${ip}`, { limit: 20, windowMs: 60_000 });
    if (!limite.ok) {
      return NextResponse.json(
        { ok: false, error: 'Demasiados intentos. Esperá un momento.' },
        { status: 429, headers: { 'Retry-After': String(limite.retryAfterSeconds) } }
      );
    }

    const supabase           = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ ok: false, error: 'No autenticado' }, { status: 401 });
    }

    const emailNorm = user.email.trim().toLowerCase();
    const nombre    = user.user_metadata?.nombre
                   ?? user.user_metadata?.full_name
                   ?? emailNorm.split('@')[0];

    // 1. Ya existe con supabaseId → solo actualizar
    const porSupabaseId = await prisma.cliente.findUnique({
      where: { supabaseId: user.id },
    });

    if (porSupabaseId) {
      const cliente = await prisma.cliente.update({
        where: { supabaseId: user.id },
        data:  { email: emailNorm, nombre, updatedAt: new Date() },
        select: { id: true },
      });
      return NextResponse.json({ ok: true, clienteId: cliente.id });
    }

    // 2. Existe por email (compró como invitado) → vincular supabaseId
    const porEmail = await prisma.cliente.findUnique({
      where: { email: emailNorm },
    });

    if (porEmail) {
      const cliente = await prisma.cliente.update({
        where: { email: emailNorm },
        data:  { supabaseId: user.id, nombre, updatedAt: new Date() },
        select: { id: true },
      });
      return NextResponse.json({ ok: true, clienteId: cliente.id });
    }

    // 3. No existe → crear
    const cliente = await prisma.cliente.create({
      data: { supabaseId: user.id, email: emailNorm, nombre },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, clienteId: cliente.id });

  } catch (error) {
    if (error.code === 'P2002') {
      return NextResponse.json({ ok: true });
    }
    console.error('[POST /api/auth/sync]', error);
    return NextResponse.json({ ok: false, error: 'Error al sincronizar' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';