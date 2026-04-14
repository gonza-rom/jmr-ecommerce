// src/app/api/mis-pedidos/route.js
import { NextResponse } from 'next/server';
import { prisma }       from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email')?.trim().toLowerCase();

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 });
    }

    const pedidos = await prisma.pedido.findMany({
      where: { compradorEmail: email },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        items: {
          select: {
            id:        true,
            nombre:    true,
            cantidad:  true,
            precioUnit: true,
            subtotal:  true,
            talle:     true,
            color:     true,
            imagen:    true,
          },
        },
      },
    });

    return NextResponse.json({ pedidos });

  } catch (error) {
    console.error('[GET /api/mis-pedidos]', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}