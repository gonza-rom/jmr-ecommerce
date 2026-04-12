// src/app/api/checkout/route.js
import { NextResponse }          from 'next/server';
import { prisma }                from '@/lib/prisma';
import { devhub, JMR_TENANT_ID } from '@/lib/prisma-devhub';
import { crearVentaEnDevhub }    from '@/lib/devhub';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

// ── Mercado Pago ──────────────────────────────────────────────────────────────
async function crearPreferenciaMp(pedido, items, compradorEmail) {
  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) return null;

  try {
    const body = {
      items: items.map(item => ({
        id:          item.productoDevhubId ?? 'producto',
        title:       item.nombre,
        quantity:    item.cantidad,
        unit_price:  item.precioUnit,
        currency_id: 'ARS',
      })),
      payer: { email: compradorEmail },
      back_urls: {
        success: `${APP_URL}/checkout/exito?pedido=${pedido.id}&status=approved&metodo=mercadopago`,
        failure: `${APP_URL}/checkout/exito?pedido=${pedido.id}&status=rejected&metodo=mercadopago`,
        pending: `${APP_URL}/checkout/exito?pedido=${pedido.id}&status=pending&metodo=mercadopago`,
      },
      auto_return:          'approved',
      external_reference:   pedido.id,
      statement_descriptor: 'MARROQUINERIA JMR',
    };

    const res  = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body:    JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) { console.error('[MP]', data); return null; }

    await prisma.pedido.update({
      where: { id: pedido.id },
      data:  { mpPaymentId: data.id },
    });

    return data.init_point;
  } catch (err) {
    console.error('[MP] Error:', err);
    return null;
  }
}

// ── Registrar venta en DevHub y bajar stock ───────────────────────────────────
async function sincronizarConDevhub(pedido, items, compradorNombre, metodoPago) {
  try {
    const result = await crearVentaEnDevhub({
      items: items.map(item => ({
        productoId: item.productoDevhubId,
        varianteId: item.varianteDevhubId ?? null,
        cantidad:   item.cantidad,
        precioUnit: item.precioUnit,
      })),
      cliente: {
        nombre: compradorNombre,
        dni:    null,
      },
      metodoPago,
      descuento:     pedido.descuento ?? 0,
      observaciones: pedido.observaciones,
      pedidoJmrId:   pedido.id,
    });

    // Guardar el ID de venta DevHub en el pedido
    await prisma.pedido.update({
      where: { id: pedido.id },
      data:  { ventaDevhubId: result.ventaDevhubId },
    });

    console.log(`[DevHub] Venta creada: ${result.ventaDevhubId} para pedido ${pedido.id}`);
    return result;

  } catch (err) {
    // No bloqueamos el pedido si DevHub falla — se puede sincronizar después
    console.error('[DevHub] Error al crear venta:', err.message);
    return null;
  }
}

// ── POST /api/checkout ────────────────────────────────────────────────────────
export async function POST(req) {
  try {
    const body = await req.json();
    const {
      items,
      subtotal,
      costoEnvio = 0,
      total,
      metodoPago,
      tipoEnvio,
      compradorNombre,
      compradorEmail,
      compradorTelefono,
      notas,
      direccion,
    } = body;

    // ── Validaciones ─────────────────────────────────────────────────────────
    if (!items?.length)
      return NextResponse.json({ ok: false, error: 'El carrito está vacío' }, { status: 400 });
    if (!compradorNombre?.trim())
      return NextResponse.json({ ok: false, error: 'Nombre requerido' }, { status: 400 });
    if (!compradorEmail?.trim())
      return NextResponse.json({ ok: false, error: 'Email requerido' }, { status: 400 });
    if (!metodoPago)
      return NextResponse.json({ ok: false, error: 'Método de pago requerido' }, { status: 400 });
    if (tipoEnvio === 'envio' && !direccion)
      return NextResponse.json({ ok: false, error: 'Dirección requerida para envío' }, { status: 400 });

    // Validar precioUnit en todos los items
    for (const item of items) {
      if (item.precioUnit === undefined || item.precioUnit === null) {
        return NextResponse.json(
          { ok: false, error: `Precio faltante para: ${item.nombre}` },
          { status: 400 }
        );
      }
    }

    // ── Verificar stock en DevHub ─────────────────────────────────────────────
    for (const item of items) {
      if (item.varianteDevhubId) {
        const v = await devhub.productoVariante.findFirst({
          where: { id: item.varianteDevhubId, tenantId: JMR_TENANT_ID, activo: true },
        });
        if (!v || v.stock < item.cantidad)
          return NextResponse.json(
            { ok: false, error: `Sin stock suficiente para: ${item.nombre}` },
            { status: 409 }
          );
      } else if (item.productoDevhubId) {
        const p = await devhub.producto.findFirst({
          where: { id: item.productoDevhubId, tenantId: JMR_TENANT_ID, activo: true },
        });
        if (!p || p.stock < item.cantidad)
          return NextResponse.json(
            { ok: false, error: `Sin stock suficiente para: ${item.nombre}` },
            { status: 409 }
          );
      }
    }

    // ── Upsert cliente por email ──────────────────────────────────────────────
    let clienteId = null;
    try {
      const cliente = await prisma.cliente.upsert({
        where:  { email: compradorEmail.trim().toLowerCase() },
        update: {
          nombre:   compradorNombre.trim(),
          telefono: compradorTelefono?.trim() ?? undefined,
        },
        create: {
          email:    compradorEmail.trim().toLowerCase(),
          nombre:   compradorNombre.trim(),
          telefono: compradorTelefono?.trim() ?? null,
        },
        select: { id: true },
      });
      clienteId = cliente.id;
    } catch (err) {
      console.error('[Cliente upsert]', err);
    }

    // ── Crear pedido + dirección en transacción ───────────────────────────────
    const pedido = await prisma.$transaction(async (tx) => {
      let direccionId = null;

      if (tipoEnvio === 'envio' && direccion && clienteId) {
        const dir = await tx.direccion.create({
          data: {
            clienteId,
            calle:        direccion.calle,
            numero:       direccion.numero       ?? null,
            piso:         direccion.piso         ?? null,
            departamento: direccion.departamento ?? null,
            ciudad:       direccion.ciudad,
            provincia:    direccion.provincia    ?? null,
            cp:           direccion.codigoPostal ?? null,
          },
        });
        direccionId = dir.id;
      }

      return tx.pedido.create({
        data: {
          clienteId,
          direccionId,
          estado:            'PENDIENTE',
          metodoPago,
          tipoEnvio,
          subtotal,
          costoEnvio,
          total,
          compradorNombre:   compradorNombre.trim(),
          compradorEmail:    compradorEmail.trim().toLowerCase(),
          compradorTelefono: compradorTelefono?.trim() ?? null,
          observaciones:     notas ?? null,
          items: {
            create: items.map(item => ({
              productoDevhubId: item.productoDevhubId ?? null,
              varianteDevhubId: item.varianteDevhubId ?? null,
              nombre:           item.nombre,
              cantidad:         item.cantidad,
              precioUnit:       item.precioUnit,
              subtotal:         item.subtotal ?? item.precioUnit * item.cantidad,
              talle:            item.talle    ?? null,
              color:            item.color    ?? null,
              imagen:           item.imagen   ?? null,
            })),
          },
        },
      });
    });

    // ── Mercado Pago: diferir stock hasta confirmación del webhook ────────────
    if (metodoPago === 'mercadopago') {
      const mpInitPoint = await crearPreferenciaMp(pedido, items, compradorEmail);
      if (!mpInitPoint) {
        return NextResponse.json({
          ok:       true,
          pedidoId: pedido.id,
          warning:  'No se pudo crear el link de pago. Coordiná el pago por WhatsApp.',
        });
      }
      // Para MP el stock se baja en el webhook cuando el pago es aprobado
      return NextResponse.json({ ok: true, pedidoId: pedido.id, mpInitPoint });
    }

    // ── Pago no-MP (efectivo / transferencia): registrar en DevHub ahora ──────
    // Los items que tienen productoDevhubId se sincronizan; los de prueba sin ID se omiten
    const itemsConDevhub = items.filter(i => i.productoDevhubId);

    if (itemsConDevhub.length > 0) {
      await sincronizarConDevhub(pedido, itemsConDevhub, compradorNombre.trim(), metodoPago);
    } else {
      // Sin productoDevhubId → bajar stock manualmente igual (productos sin ID en DevHub)
      console.warn('[DevHub] Items sin productoDevhubId — stock no modificado en DevHub');
    }

    return NextResponse.json({ ok: true, pedidoId: pedido.id });

  } catch (error) {
    console.error('[POST /api/checkout]', error);
    return NextResponse.json({ ok: false, error: 'Error al procesar el pedido' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';