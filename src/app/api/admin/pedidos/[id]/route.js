// src/app/api/admin/pedidos/[id]/route.js
import { NextResponse }       from 'next/server';
import { prisma }             from '@/lib/prisma';
import { crearVentaEnDevhub } from '@/lib/devhub';

export const dynamic = 'force-dynamic';

// ── PATCH: cambiar estado o forzar sync con DevHub ────────────────────────────
export async function PATCH(req, context) {
  try {
    const { id }  = await context.params;
    const body    = await req.json();
    const { estado, forzarDevhub } = body;

    const pedido = await prisma.pedido.findUnique({
      where:   { id },
      include: { items: true },
    });

    if (!pedido) {
      return NextResponse.json({ ok: false, error: 'Pedido no encontrado' }, { status: 404 });
    }

    // ── Actualizar estado ─────────────────────────────────────────────────────
    if (estado) {
      await prisma.pedido.update({
        where: { id },
        data:  { estado },
      });
    }

    // ── Sincronizar con DevHub manualmente ────────────────────────────────────
    if (forzarDevhub && !pedido.ventaDevhubId) {
      const itemsConDevhub = pedido.items.filter(i => i.productoDevhubId);
      if (itemsConDevhub.length === 0) {
        return NextResponse.json({ ok: false, error: 'No hay items con ID de DevHub para sincronizar' });
      }

      try {
        const result = await crearVentaEnDevhub({
          items: itemsConDevhub.map(item => ({
            productoId: item.productoDevhubId,
            varianteId: item.varianteDevhubId ?? null,
            cantidad:   item.cantidad,
            precioUnit: item.precioUnit,
          })),
          cliente: {
            nombre: pedido.compradorNombre ?? 'Cliente',
            dni:    null,
          },
          metodoPago:    pedido.metodoPago ?? 'EFECTIVO',
          descuento:     pedido.descuento  ?? 0,
          observaciones: pedido.observaciones,
          pedidoJmrId:   pedido.id,
        });

        await prisma.pedido.update({
          where: { id },
          data:  { ventaDevhubId: result.ventaDevhubId },
        });

        return NextResponse.json({ ok: true, ventaDevhubId: result.ventaDevhubId });
      } catch (err) {
        return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error('[PATCH /api/admin/pedidos/:id]', error);
    return NextResponse.json({ ok: false, error: 'Error interno' }, { status: 500 });
  }
}