// src/app/api/checkout/route.js
// CAMBIOS respecto a la versión anterior:
//   1. Validación de precios server-side (ya implementada)
//   2. + enviarConfirmacionPedido() al cliente
//   3. + notificarAdminPedidoNuevo() al admin
// Los emails se disparan en background (no bloquean la respuesta al cliente).

import { NextResponse }                    from 'next/server';
import { prisma }                          from '@/lib/prisma';
import { devhub, JMR_TENANT_ID }          from '@/lib/prisma-devhub';
import { crearVentaEnDevhub }             from '@/lib/devhub';
import { createServerClient }             from '@supabase/ssr';
import { cookies }                        from 'next/headers';
import { enviarConfirmacionPedido }       from '@/emails/confirmacion-pedido';
import { notificarAdminPedidoNuevo }      from '@/emails/notificacion-admin';

const APP_URL          = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
const TOLERANCIA_PRECIO = 0.01;

// ── Supabase user ─────────────────────────────────────────────────────────────
async function getSupabaseUser() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    return user ?? null;
  } catch { return null; }
}

// ── Validar precios contra DevHub ─────────────────────────────────────────────
async function validarPrecios(items) {
  const errores = [];
  const itemsValidados = [];

  for (const item of items) {
    let precioReal = null;
    try {
      if (item.varianteDevhubId) {
        const variante = await devhub.productoVariante.findFirst({
          where:  { id: item.varianteDevhubId, tenantId: JMR_TENANT_ID, activo: true },
          select: { precio: true, producto: { select: { precio: true } } },
        });
        if (!variante) { errores.push(`Variante no encontrada: ${item.nombre}`); continue; }
        precioReal = variante.precio ?? variante.producto.precio;
      } else if (item.productoDevhubId) {
        const producto = await devhub.producto.findFirst({
          where:  { id: item.productoDevhubId, tenantId: JMR_TENANT_ID, activo: true },
          select: { precio: true },
        });
        if (!producto) { errores.push(`Producto no encontrado: ${item.nombre}`); continue; }
        precioReal = producto.precio;
      } else {
        errores.push(`Item sin ID de DevHub: ${item.nombre}`); continue;
      }

      const diferencia = Math.abs(item.precioUnit - precioReal) / precioReal;
      if (diferencia > TOLERANCIA_PRECIO) {
        errores.push(`Precio incorrecto para "${item.nombre}". Recibido: $${item.precioUnit} / Real: $${precioReal}`);
        continue;
      }

      itemsValidados.push({ ...item, precioUnit: precioReal, subtotal: precioReal * item.cantidad });
    } catch (err) {
      errores.push(`Error validando "${item.nombre}": ${err.message}`);
    }
  }

  if (errores.length > 0) {
    console.warn('[Checkout] Validación de precios fallida:', errores);
    return { ok: false, error: errores.join(' | ') };
  }
  return { ok: true, itemsValidados };
}

// ── Upsert cliente ────────────────────────────────────────────────────────────
async function upsertCliente({ supabaseId, email, nombre, telefono }) {
  const emailNorm = email.trim().toLowerCase();
  if (supabaseId) {
    const existente = await prisma.cliente.findFirst({
      where: { OR: [{ supabaseId }, { email: emailNorm }] },
    });
    if (existente) {
      return prisma.cliente.update({
        where: { id: existente.id },
        data:  { nombre: nombre.trim(), telefono: telefono?.trim() ?? existente.telefono, supabaseId, email: emailNorm },
        select: { id: true },
      });
    }
    return prisma.cliente.create({
      data:   { email: emailNorm, nombre: nombre.trim(), telefono: telefono?.trim() ?? null, supabaseId },
      select: { id: true },
    });
  }
  return prisma.cliente.upsert({
    where:  { email: emailNorm },
    update: { nombre: nombre.trim(), telefono: telefono?.trim() ?? undefined },
    create: { email: emailNorm, nombre: nombre.trim(), telefono: telefono?.trim() ?? null },
    select: { id: true },
  });
}

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
    await prisma.pedido.update({ where: { id: pedido.id }, data: { mpPaymentId: data.id } });
    return data.init_point;
  } catch (err) {
    console.error('[MP] Error:', err);
    return null;
  }
}

// ── Sincronizar con DevHub ────────────────────────────────────────────────────
async function sincronizarConDevhub(pedido, items, compradorNombre, metodoPago) {
  try {
    const result = await crearVentaEnDevhub({
      items: items.map(item => ({
        productoId: item.productoDevhubId,
        varianteId: item.varianteDevhubId ?? null,
        cantidad:   item.cantidad,
        precioUnit: item.precioUnit,
      })),
      cliente:       { nombre: compradorNombre, dni: null },
      metodoPago,
      descuento:     pedido.descuento ?? 0,
      observaciones: pedido.observaciones,
      pedidoJmrId:   pedido.id,
    });
    await prisma.pedido.update({ where: { id: pedido.id }, data: { ventaDevhubId: result.ventaDevhubId } });
    return result;
  } catch (err) {
    console.error('[DevHub] Error al crear venta:', err.message);
    return null;
  }
}

// ── Disparar emails en background ─────────────────────────────────────────────
// Los emails no bloquean la respuesta al cliente.
// Si fallan, se loguean pero el pedido ya fue creado correctamente.
async function dispararEmails(pedido) {
  try {
    // Cargar pedido completo con items y dirección para los emails
    const pedidoCompleto = await prisma.pedido.findUnique({
      where:   { id: pedido.id },
      include: { items: true, direccion: true },
    });

    if (!pedidoCompleto) return;

    // Enviar en paralelo — si uno falla, el otro igual se envía
    await Promise.allSettled([
      enviarConfirmacionPedido(pedidoCompleto),
      notificarAdminPedidoNuevo(pedidoCompleto),
    ]);
  } catch (err) {
    console.error('[Emails] Error al disparar emails post-checkout:', err.message);
  }
}

// ── POST /api/checkout ────────────────────────────────────────────────────────
export async function POST(req) {
  try {
    const body = await req.json();
    const {
      items, costoEnvio = 0, metodoPago, tipoEnvio,
      compradorNombre, compradorEmail, compradorTelefono, notas, direccion,
    } = body;

    // Validaciones básicas
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

    // Validar precios
    const validacion = await validarPrecios(items);
    if (!validacion.ok)
      return NextResponse.json({ ok: false, error: `Precios incorrectos: ${validacion.error}` }, { status: 422 });

    const itemsValidados = validacion.itemsValidados;
    const subtotal = itemsValidados.reduce((a, i) => a + i.subtotal, 0);
    const total    = subtotal + costoEnvio;

    // Verificar stock
    for (const item of itemsValidados) {
      if (item.varianteDevhubId) {
        const v = await devhub.productoVariante.findFirst({
          where: { id: item.varianteDevhubId, tenantId: JMR_TENANT_ID, activo: true },
        });
        if (!v || v.stock < item.cantidad)
          return NextResponse.json({ ok: false, error: `Sin stock: ${item.nombre}` }, { status: 409 });
      } else if (item.productoDevhubId) {
        const p = await devhub.producto.findFirst({
          where: { id: item.productoDevhubId, tenantId: JMR_TENANT_ID, activo: true },
        });
        if (!p || p.stock < item.cantidad)
          return NextResponse.json({ ok: false, error: `Sin stock: ${item.nombre}` }, { status: 409 });
      }
    }

    // Upsert cliente
    const supabaseUser = await getSupabaseUser();
    let clienteId = null;
    try {
      const cliente = await upsertCliente({
        supabaseId: supabaseUser?.id ?? null,
        email:      compradorEmail,
        nombre:     compradorNombre,
        telefono:   compradorTelefono,
      });
      clienteId = cliente.id;
    } catch (err) { console.error('[Cliente upsert]', err); }

    // Crear pedido
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
            create: itemsValidados.map(item => ({
              productoDevhubId: item.productoDevhubId ?? null,
              varianteDevhubId: item.varianteDevhubId ?? null,
              nombre:           item.nombre,
              cantidad:         item.cantidad,
              precioUnit:       item.precioUnit,
              subtotal:         item.subtotal,
              talle:            item.talle  ?? null,
              color:            item.color  ?? null,
              imagen:           item.imagen ?? null,
            })),
          },
        },
      });
    });

    // Mercado Pago
    if (metodoPago === 'mercadopago') {
      const mpInitPoint = await crearPreferenciaMp(pedido, itemsValidados, compradorEmail);
      // Emails en background (no esperamos a MP para confirmar)
      dispararEmails(pedido).catch(console.error);
      if (!mpInitPoint) {
        return NextResponse.json({
          ok: true, pedidoId: pedido.id,
          warning: 'No se pudo crear el link de pago. Coordiná por WhatsApp.',
        });
      }
      return NextResponse.json({ ok: true, pedidoId: pedido.id, mpInitPoint });
    }

    // Efectivo / Transferencia — sincronizar DevHub y disparar emails
    const itemsConDevhub = itemsValidados.filter(i => i.productoDevhubId);
    if (itemsConDevhub.length > 0) {
      await sincronizarConDevhub(pedido, itemsConDevhub, compradorNombre.trim(), metodoPago);
    }

    // Emails en background
    dispararEmails(pedido).catch(console.error);

    return NextResponse.json({ ok: true, pedidoId: pedido.id });

  } catch (error) {
    console.error('[POST /api/checkout]', error);
    return NextResponse.json({ ok: false, error: 'Error al procesar el pedido' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';