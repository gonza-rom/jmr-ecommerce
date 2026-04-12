// src/app/api/admin/productos/route.js
// Lee productos de DevHub POS (no de la BD de JMR).
// Solo expone lo necesario para el panel admin.

import { NextResponse }          from 'next/server';
import { devhub, JMR_TENANT_ID } from '@/lib/prisma-devhub';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const page        = Math.max(1,   parseInt(searchParams.get('page')     ?? '1'));
    const pageSize    = Math.min(100, parseInt(searchParams.get('pageSize') ?? '20'));
    const skip        = (page - 1) * pageSize;
    const q           = searchParams.get('q')           ?? '';
    const categoriaId = searchParams.get('categoriaId') ?? '';
    const soloVisible = searchParams.get('soloVisible') === 'true';

    const where = {
      tenantId: JMR_TENANT_ID,
      activo:   true,
      ...(soloVisible && { visibleCatalogo: true }),
      ...(categoriaId && { categoriaId }),
      ...(q.trim() && {
        OR: [
          { nombre:         { contains: q, mode: 'insensitive' } },
          { codigoProducto: { contains: q, mode: 'insensitive' } },
          { codigoBarras:   { contains: q, mode: 'insensitive' } },
        ],
      }),
    };

    const [productos, total, visibles] = await Promise.all([
      devhub.producto.findMany({
        where,
        select: {
          id:              true,
          nombre:          true,
          codigoProducto:  true,
          precio:          true,
          stock:           true,
          stockMinimo:     true,
          imagen:          true,
          activo:          true,
          visibleCatalogo: true,
          tieneVariantes:  true,
          categoria: { select: { id: true, nombre: true } },
        },
        orderBy: { nombre: 'asc' },
        skip,
        take: pageSize,
      }),
      devhub.producto.count({ where }),
      devhub.producto.count({ where: { tenantId: JMR_TENANT_ID, activo: true, visibleCatalogo: true } }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({
      ok: true,
      productos,
      pagination: { page, pageSize, total, totalPages, visibles, hasNext: page < totalPages, hasPrev: page > 1 },
    });

  } catch (error) {
    console.error('[GET /api/admin/productos]', error);
    return NextResponse.json({ ok: false, error: 'Error al obtener productos' }, { status: 500 });
  }
}