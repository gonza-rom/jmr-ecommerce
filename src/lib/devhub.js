// lib/devhub.js
import { devhub, JMR_TENANT_ID } from "./prisma-devhub.js";

// ═══════════════════════════════════════════════════════════════
// PRODUCTOS
// ═══════════════════════════════════════════════════════════════

export async function getProductos({
  q = "",
  categoriaId,
  page = 1,
  pageSize = 20,
  ordenar = "nombre",
  soloConStock = true,
} = {}) {
  const where = {
    tenantId: JMR_TENANT_ID,
    activo: true,
    visibleCatalogo: true,
    ...(soloConStock && { stock: { gt: 0 } }),
    ...(categoriaId && { categoriaId }),
    ...(q.trim() && {
      OR: [
        { nombre:         { contains: q, mode: "insensitive" } },
        { descripcion:    { contains: q, mode: "insensitive" } },
        { codigoProducto: { contains: q, mode: "insensitive" } },
        { codigoBarras:   { contains: q, mode: "insensitive" } },
      ],
    }),
  };

  let orderBy = { nombre: "asc" };
  if (ordenar === "precio-asc")  orderBy = { precio: "asc" };
  if (ordenar === "precio-desc") orderBy = { precio: "desc" };
  if (ordenar === "recientes")   orderBy = { createdAt: "desc" };

  const skip = (page - 1) * pageSize;

  const [productos, total] = await Promise.all([
    devhub.producto.findMany({
      where,
      select: {
        id:             true,
        nombre:         true,
        descripcion:    true,
        precio:         true,
        stock:          true,
        imagen:         true,
        imagenes:       true,
        codigoProducto: true,
        unidad:         true,
        tieneVariantes: true,
        categoria: { select: { id: true, nombre: true } },
        variantes: {
          where:   { activo: true },
          select:  { id: true, talle: true, color: true, stock: true, precio: true },
          orderBy: [{ talle: "asc" }, { color: "asc" }],
        },
      },
      orderBy,
      skip,
      take: Math.min(pageSize, 50),
    }),
    devhub.producto.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return {
    productos: productos.map((p) => ({
      ...p,
      disponible: p.stock > 0,
      imagenes:   p.imagenes ?? [],
      variantes:  p.tieneVariantes ? p.variantes : [],
    })),
    meta: { page, pageSize, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
  };
}

// ─────────────────────────────────────────────────────────────

export async function getProducto(id) {
  const p = await devhub.producto.findFirst({
    where: { id, tenantId: JMR_TENANT_ID, activo: true },
    select: {
      id:             true,
      nombre:         true,
      descripcion:    true,
      precio:         true,
      stock:          true,
      imagen:         true,
      imagenes:       true,
      codigoProducto: true,
      unidad:         true,
      tieneVariantes: true,
      categoria: { select: { id: true, nombre: true } },
      variantes: {
        where:   { activo: true },
        select:  { id: true, talle: true, color: true, stock: true, precio: true },
        orderBy: [{ talle: "asc" }, { color: "asc" }],
      },
    },
  });

  if (!p) return null;

  const tallesDisponibles  = [...new Set(p.variantes.filter(v => v.stock > 0 && v.talle).map(v => v.talle))].sort();
  const coloresDisponibles = [...new Set(p.variantes.filter(v => v.stock > 0 && v.color).map(v => v.color))].sort();
  const stockTotal         = p.tieneVariantes ? p.variantes.reduce((a, v) => a + v.stock, 0) : p.stock;

  return {
    ...p,
    stock:             stockTotal,
    disponible:        stockTotal > 0,
    imagenes:          p.imagenes ?? [],
    variantes:         p.tieneVariantes ? p.variantes : [],
    tallesDisponibles,
    coloresDisponibles,
  };
}

// ═══════════════════════════════════════════════════════════════
// CATEGORÍAS
// ═══════════════════════════════════════════════════════════════

export async function getCategorias() {
  const cats = await devhub.categoria.findMany({
    where: {
      tenantId: JMR_TENANT_ID,
      productos: { some: { activo: true } },
    },
    select: {
      id:          true,
      nombre:      true,
      descripcion: true,
      _count: { select: { productos: { where: { activo: true } } } },
    },
    orderBy: { nombre: "asc" },
  });

  return cats.map((c) => ({
    id:             c.id,
    nombre:         c.nombre,
    descripcion:    c.descripcion,
    totalProductos: c._count.productos,
  }));
}

// ═══════════════════════════════════════════════════════════════
// CREAR VENTA EN DEVHUB (descuenta stock automáticamente)
// ═══════════════════════════════════════════════════════════════

export async function crearVentaEnDevhub({
  items,
  cliente,
  metodoPago,
  descuento = 0,
  observaciones,
  pedidoJmrId,
}) {
  return devhub.$transaction(async (tx) => {
    const productoIds = items.map((i) => i.productoId);
    const varianteIds = items.filter((i) => i.varianteId).map((i) => i.varianteId);

    const [productos, variantes] = await Promise.all([
      tx.producto.findMany({
        where:  { id: { in: productoIds }, tenantId: JMR_TENANT_ID, activo: true },
        select: { id: true, nombre: true, stock: true },
      }),
      varianteIds.length > 0
        ? tx.productoVariante.findMany({
            where:  { id: { in: varianteIds }, tenantId: JMR_TENANT_ID, activo: true },
            select: { id: true, stock: true, talle: true, color: true },
          })
        : Promise.resolve([]),
    ]);

    const productoMap = new Map(productos.map((p) => [p.id, p]));
    const varianteMap = new Map(variantes.map((v) => [v.id, v]));

    // ── Validar stock ──────────────────────────────────────────
    for (const item of items) {
      const producto = productoMap.get(item.productoId);
      if (!producto) throw new Error(`Producto "${item.productoId}" no disponible`);

      if (item.varianteId) {
        const variante = varianteMap.get(item.varianteId);
        if (!variante) throw new Error(`Variante no encontrada para "${producto.nombre}"`);
        if (variante.stock < item.cantidad)
          throw new Error(
            `Sin stock para "${producto.nombre}"` +
            (variante.talle ? ` talle ${variante.talle}` : "") +
            `. Disponible: ${variante.stock}`
          );
      } else {
        if (producto.stock < item.cantidad)
          throw new Error(`Sin stock para "${producto.nombre}". Disponible: ${producto.stock}`);
      }
    }

    // ── Armar items con datos completos ────────────────────────
    const itemsData = items.map((item) => {
      const producto = productoMap.get(item.productoId);
      const variante = item.varianteId ? varianteMap.get(item.varianteId) : null;
      return {
        productoId:    item.productoId,
        varianteId:    item.varianteId ?? null,
        nombre:        producto.nombre,
        cantidad:      item.cantidad,
        precioUnit:    item.precioUnit,
        subtotal:      item.precioUnit * item.cantidad,
        talle:         variante?.talle ?? null,
        color:         variante?.color ?? null,
        stockAnterior: item.varianteId ? (variante?.stock ?? 0) : producto.stock,
      };
    });

    const subtotal = itemsData.reduce((a, i) => a + i.subtotal, 0);
    const total    = Math.max(0, subtotal - descuento);

    const notasTienda = [
      observaciones?.trim(),
      pedidoJmrId ? `Pedido JMR #${pedidoJmrId}` : null,
      "Venta desde Tienda Online JMR",
    ].filter(Boolean).join(" | ");

    // ── Crear venta en DevHub ──────────────────────────────────
    const venta = await tx.venta.create({
      data: {
        tenantId:      JMR_TENANT_ID,
        total,
        subtotal,
        descuento,
        metodoPago:    metodoPago.toUpperCase(),
        clienteNombre: cliente.nombre.trim(),
        clienteDni:    cliente.dni?.trim() || null,
        observaciones: notasTienda,
        usuarioNombre: "Tienda Online JMR",
        items: {
          create: itemsData.map((i) => ({
            nombre:     i.nombre,
            cantidad:   i.cantidad,
            precioUnit: i.precioUnit,
            subtotal:   i.subtotal,
            productoId: i.productoId,
            ...(i.varianteId && { varianteId: i.varianteId }),
            ...(i.talle      && { talle:      i.talle }),
            ...(i.color      && { color:      i.color }),
          })),
        },
      },
      select: { id: true, total: true, createdAt: true },
    });

    // ── Descontar stock ────────────────────────────────────────
    await Promise.all(
      itemsData.map((item) =>
        item.varianteId
          ? tx.productoVariante.update({
              where: { id: item.varianteId },
              data:  { stock: { decrement: item.cantidad } },
            })
          : tx.producto.update({
              where: { id: item.productoId },
              data:  { stock: { decrement: item.cantidad } },
            })
      )
    );

    // ── Registrar movimientos de stock ─────────────────────────
    await tx.movimiento.createMany({
      data: itemsData.map((item) => ({
        tenantId:        JMR_TENANT_ID,
        productoId:      item.productoId,
        productoNombre:  [item.nombre, item.talle, item.color].filter(Boolean).join(" — "),
        tipo:            "VENTA",
        cantidad:        item.cantidad,
        stockAnterior:   item.stockAnterior,
        stockResultante: item.stockAnterior - item.cantidad,
        ventaId:         venta.id,
        motivo:          `Pedido Tienda Online JMR${pedidoJmrId ? ` #${pedidoJmrId}` : ""}`,
        usuarioNombre:   "Tienda Online JMR",
      })),
    });

    return { ventaDevhubId: venta.id, total: venta.total };
  });
}