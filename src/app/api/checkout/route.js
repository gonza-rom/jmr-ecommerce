// app/api/checkout/route.js  (tienda JMR)
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";            // BD de JMR
import { crearVentaEnDevhub } from "@/lib/devhub"; // BD de DevHub POS

export async function POST(req) {
  try {
    const body = await req.json();
    const { clienteId, items, metodoPago, descuento = 0, observaciones, direccionId } = body;

    // 1️⃣ Guardar pedido en la BD de JMR
    const pedido = await prisma.pedido.create({
      data: {
        clienteId,
        direccionId,
        metodoPago,
        descuento,
        observaciones,
        estado:   "PENDIENTE",
        subtotal: items.reduce((a, i) => a + i.precioUnit * i.cantidad, 0),
        total:    items.reduce((a, i) => a + i.precioUnit * i.cantidad, 0) - descuento,
        items: {
          create: items.map((i) => ({
            productoDevhubId: i.productoId,
            varianteDevhubId: i.varianteId ?? null,
            nombre:           i.nombre,
            cantidad:         i.cantidad,
            precioUnit:       i.precioUnit,
            subtotal:         i.precioUnit * i.cantidad,
          })),
        },
      },
    });

    // 2️⃣ Obtener datos del cliente para registrar en DevHub
    const cliente = await prisma.cliente.findUnique({
      where:  { id: clienteId },
      select: { nombre: true, email: true, dni: true },
    });

    // 3️⃣ Crear venta en DevHub POS (valida stock + descuenta + registra movimiento)
    const { ventaDevhubId } = await crearVentaEnDevhub({
      items,
      cliente,
      metodoPago,
      descuento,
      observaciones,
      pedidoJmrId: pedido.id,
    });

    // 4️⃣ Guardar referencia a la venta de DevHub en el pedido de JMR
    await prisma.pedido.update({
      where: { id: pedido.id },
      data:  { ventaDevhubId },
    });

    return NextResponse.json({ ok: true, pedidoId: pedido.id }, { status: 201 });

  } catch (error) {
    const sinStock = error.message?.includes("Sin stock");
    return NextResponse.json(
      { ok: false, error: error.message ?? "Error al procesar el pedido" },
      { status: sinStock ? 400 : 500 }
    );
  }
}