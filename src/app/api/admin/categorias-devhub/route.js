// src/app/api/admin/categorias-devhub/route.js
// Lista las categorías de DevHub para el filtro del panel admin.

import { NextResponse }          from 'next/server';
import { devhub, JMR_TENANT_ID } from '@/lib/prisma-devhub';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categorias = await devhub.categoria.findMany({
      where: {
        tenantId: JMR_TENANT_ID,
        productos: { some: { activo: true } },
      },
      select: {
        id:     true,
        nombre: true,
        _count: { select: { productos: { where: { activo: true } } } },
      },
      orderBy: { nombre: 'asc' },
    });

    return NextResponse.json({
      ok: true,
      data: categorias.map(c => ({
        id:             c.id,
        nombre:         c.nombre,
        totalProductos: c._count.productos,
      })),
    });

  } catch (error) {
    console.error('[GET /api/admin/categorias-devhub]', error);
    return NextResponse.json({ ok: false, data: [] }, { status: 500 });
  }
}