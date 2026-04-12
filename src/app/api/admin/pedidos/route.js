// src/app/api/admin/pedidos/route.js
import { NextResponse } from 'next/server';
import { prisma }       from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const q      = searchParams.get('q')      ?? '';
    const estado = searchParams.get('estado') ?? '';

    const where = {
      ...(estado && { estado }),
      ...(q.trim() && {
        OR: [
          { compradorNombre: { contains: q, mode: 'insensitive' } },
          { compradorEmail:  { contains: q, mode: 'insensitive' } },
          { id:              { contains: q, mode: 'insensitive' } },
        ],
      }),
    };

    const [pedidos, total, pendientes, confirmados, enviados, ingresos] = await Promise.all([
      prisma.pedido.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take:    200,
        include: {
          items:    true,
          direccion: true,
        },
      }),
      prisma.pedido.count(),
      prisma.pedido.count({ where: { estado: 'PENDIENTE' } }),
      prisma.pedido.count({ where: { estado: 'CONFIRMADO' } }),
      prisma.pedido.count({ where: { estado: 'ENVIADO' } }),
      prisma.pedido.aggregate({
        _sum: { total: true },
        where: { estado: { in: ['CONFIRMADO', 'PREPARANDO', 'ENVIADO', 'ENTREGADO'] } },
      }),
    ]);

    return NextResponse.json({
      pedidos,
      stats: {
        total,
        pendientes,
        confirmados,
        enviados,
        ingresos: ingresos._sum.total ?? 0,
      },
    });

  } catch (error) {
    console.error('[GET /api/admin/pedidos]', error);
    return NextResponse.json({ pedidos: [], stats: null }, { status: 500 });
  }
}