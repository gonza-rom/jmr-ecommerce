// src/app/api/cuenta/direcciones/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma }       from '@/lib/prisma';

// ── GET — listar direcciones ──────────────────────────────────
export async function GET() {
  try {
    const supabase           = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ ok: false, error: 'No autenticado' }, { status: 401 });

    const cliente = await prisma.cliente.findUnique({ where: { supabaseId: user.id } });
    if (!cliente)  return NextResponse.json({ ok: true, data: [] });

    const direcciones = await prisma.direccion.findMany({
      where:   { clienteId: cliente.id },
      orderBy: [{ principal: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({ ok: true, data: direcciones });
  } catch (error) {
    console.error('[GET /api/cuenta/direcciones]', error);
    return NextResponse.json({ ok: false, error: 'Error al obtener direcciones' }, { status: 500 });
  }
}

// ── POST — crear dirección ────────────────────────────────────
export async function POST(req) {
  try {
    const supabase           = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ ok: false, error: 'No autenticado' }, { status: 401 });

    const cliente = await prisma.cliente.findUnique({ where: { supabaseId: user.id } });
    if (!cliente)  return NextResponse.json({ ok: false, error: 'Cliente no encontrado' }, { status: 404 });

    const { alias, calle, numero, piso, departamento, ciudad, provincia, cp, principal } = await req.json();

    if (!calle?.trim() || !ciudad?.trim()) {
      return NextResponse.json({ ok: false, error: 'Calle y ciudad son obligatorias' }, { status: 400 });
    }

    // Si es principal, quitar el flag de las otras
    if (principal) {
      await prisma.direccion.updateMany({
        where: { clienteId: cliente.id },
        data:  { principal: false },
      });
    }

    const direccion = await prisma.direccion.create({
      data: {
        clienteId:    cliente.id,
        alias:        alias?.trim()        || null,
        calle:        calle.trim(),
        numero:       numero?.trim()       || null,
        piso:         piso?.trim()         || null,
        departamento: departamento?.trim() || null,
        ciudad:       ciudad.trim(),
        provincia:    provincia?.trim()    || null,
        cp:           cp?.trim()           || null,
        principal:    principal ?? false,
      },
    });

    return NextResponse.json({ ok: true, data: direccion }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/cuenta/direcciones]', error);
    return NextResponse.json({ ok: false, error: 'Error al crear dirección' }, { status: 500 });
  }
}

// ── DELETE — eliminar dirección ───────────────────────────────
export async function DELETE(req) {
  try {
    const supabase           = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ ok: false, error: 'No autenticado' }, { status: 401 });

    const { id } = await req.json();
    const cliente = await prisma.cliente.findUnique({ where: { supabaseId: user.id } });
    if (!cliente)  return NextResponse.json({ ok: false, error: 'No autorizado' }, { status: 401 });

    // Verificar que la dirección pertenece al cliente
    const dir = await prisma.direccion.findFirst({ where: { id, clienteId: cliente.id } });
    if (!dir) return NextResponse.json({ ok: false, error: 'Dirección no encontrada' }, { status: 404 });

    await prisma.direccion.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[DELETE /api/cuenta/direcciones]', error);
    return NextResponse.json({ ok: false, error: 'Error al eliminar dirección' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';