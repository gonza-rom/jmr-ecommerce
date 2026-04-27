// src/app/api/admin/pedidos/[id]/route.js
// CAMBIOS:
//   + enviarCambioEstado() cuando el admin cambia el estado del pedido
//   + enviarTrackingOCA() cuando se genera el envío OCA
//   + notificarAdminPedidoNuevo (no aplica aquí, es en el checkout)

import { NextResponse }            from 'next/server';
import { prisma }                  from '@/lib/prisma';
import { crearVentaEnDevhub }      from '@/lib/devhub';
import { generarEnvio }            from '@/lib/oca';
import { enviarCambioEstado }      from '@/emails/cambio-estado';
import { enviarTrackingOCA }       from '@/emails/tracking-oca';

export const dynamic = 'force-dynamic';

// Estados que disparan email al cliente
const ESTADOS_CON_EMAIL = new Set([
  'CONFIRMADO', 'ENVIADO', 'ENTREGADO', 'CANCELADO',
]);

export async function PATCH(req, context) {
  try {
    const { id }  = await context.params;
    const body    = await req.json();
    const { estado, forzarDevhub, generarEnvioOCA, pesoOCA, altoOCA, anchoOCA, largoOCA } = body;

    const pedido = await prisma.pedido.findUnique({
      where:   { id },
      include: { items: true, direccion: true },
    });

    if (!pedido) {
      return NextResponse.json({ ok: false, error: 'Pedido no encontrado' }, { status: 404 });
    }

    // ── Cambio de estado ─────────────────────────────────────────────────────
    if (estado) {
      await prisma.pedido.update({
        where: { id },
        data:  {
          estado,
          ...(estado === 'ENTREGADO' && { entregadoAt: new Date() }),
          ...(estado === 'ENVIADO'   && !pedido.enviadoAt && { enviadoAt: new Date() }),
        },
      });

      // Email al cliente en background
      if (ESTADOS_CON_EMAIL.has(estado)) {
        const pedidoActualizado = { ...pedido, estado };
        enviarCambioEstado(pedidoActualizado, estado).catch(err =>
          console.error('[Email cambio estado]', err.message)
        );
      }
    }

    // ── Sincronizar con DevHub ────────────────────────────────────────────────
    if (forzarDevhub && !pedido.ventaDevhubId) {
      const itemsConDevhub = pedido.items.filter(i => i.productoDevhubId);
      if (itemsConDevhub.length === 0) {
        return NextResponse.json({ ok: false, error: 'No hay items con ID de DevHub' });
      }
      try {
        const result = await crearVentaEnDevhub({
          items: itemsConDevhub.map(item => ({
            productoId: item.productoDevhubId,
            varianteId: item.varianteDevhubId ?? null,
            cantidad:   item.cantidad,
            precioUnit: item.precioUnit,
          })),
          cliente:       { nombre: pedido.compradorNombre ?? 'Cliente', dni: null },
          metodoPago:    pedido.metodoPago ?? 'EFECTIVO',
          descuento:     pedido.descuento ?? 0,
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

    // ── Generar envío OCA ─────────────────────────────────────────────────────
    if (generarEnvioOCA) {
      if (pedido.ocaNumeroEnvio) {
        return NextResponse.json({
          ok: true, numeroEnvio: pedido.ocaNumeroEnvio,
          etiquetaUrl: pedido.ocaEtiquetaUrl, yaExistia: true,
        });
      }
      if (!pedido.direccion) {
        return NextResponse.json(
          { ok: false, error: 'El pedido no tiene dirección de entrega' },
          { status: 422 }
        );
      }

      try {
        const resultado = await generarEnvio({
          pedido,
          direccion: pedido.direccion,
          items:     pedido.items,
          peso:  pesoOCA  ?? 1,
          alto:  altoOCA  ?? 20,
          ancho: anchoOCA ?? 30,
          largo: largoOCA ?? 40,
        });

        await prisma.pedido.update({
          where: { id },
          data:  {
            ocaNumeroEnvio:   resultado.numeroEnvio,
            ocaEtiquetaUrl:   resultado.etiquetaUrl,
            ocaAdmision:      resultado.admision,
            ocaEstado:        'EN_CAMINO',
            ocaFechaDespacho: new Date(),
            estado:           'ENVIADO',
            enviadoAt:        new Date(),
          },
        });

        // Email de tracking al cliente + email de estado ENVIADO
        const pedidoActualizado = {
          ...pedido,
          estado:          'ENVIADO',
          ocaNumeroEnvio:  resultado.numeroEnvio,
          ocaEtiquetaUrl:  resultado.etiquetaUrl,
        };

        Promise.allSettled([
          enviarCambioEstado(pedidoActualizado, 'ENVIADO'),
          enviarTrackingOCA(pedidoActualizado, resultado.numeroEnvio),
        ]).catch(err => console.error('[Email OCA]', err));

        return NextResponse.json({
          ok:          true,
          numeroEnvio: resultado.numeroEnvio,
          etiquetaUrl: resultado.etiquetaUrl,
          admision:    resultado.admision,
        });

      } catch (err) {
        console.error('[OCA generarEnvio]', err.message);
        return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error('[PATCH /api/admin/pedidos/:id]', error);
    return NextResponse.json({ ok: false, error: 'Error interno' }, { status: 500 });
  }
}