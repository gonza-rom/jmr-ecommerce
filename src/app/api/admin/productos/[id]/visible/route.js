// src/app/api/admin/productos/[id]/visible/route.js
// PATCH: togglear visibleCatalogo de un producto en DevHub

import { NextResponse }          from 'next/server';
import { devhub, JMR_TENANT_ID } from '@/lib/prisma-devhub';

export const dynamic = 'force-dynamic';

export async function PATCH(req, context) {
  try {
    const { id }             = await context.params;
    const { visibleCatalogo } = await req.json();

    if (typeof visibleCatalogo !== 'boolean') {
      return NextResponse.json({ ok: false, error: 'visibleCatalogo debe ser boolean' }, { status: 400 });
    }

    // Verificar que el producto pertenece al tenant JMR
    const producto = await devhub.producto.findFirst({
      where:  { id, tenantId: JMR_TENANT_ID },
      select: { id: true },
    });

    if (!producto) {
      return NextResponse.json({ ok: false, error: 'Producto no encontrado' }, { status: 404 });
    }

    await devhub.producto.update({
      where: { id },
      data:  { visibleCatalogo },
    });

    return NextResponse.json({ ok: true, visibleCatalogo });

  } catch (error) {
    console.error('[PATCH /api/admin/productos/:id/visible]', error);
    return NextResponse.json({ ok: false, error: 'Error al actualizar visibilidad' }, { status: 500 });
  }
}