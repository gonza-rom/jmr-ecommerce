import { prisma } from "@/lib/prisma";

// ✅ Caché de 60 segundos — la DB no se consulta en cada request
export const revalidate = 60;

function normalizarImagenes(producto) {
  let imagenes = [];
  if (Array.isArray(producto.imagenes)) {
    imagenes = producto.imagenes;
  } else if (typeof producto.imagenes === 'string' && producto.imagenes.length > 0) {
    if (producto.imagenes.startsWith('{')) {
      imagenes = producto.imagenes.replace(/^\{/, '').replace(/\}$/, '').split(',')
        .map(s => s.replace(/^"/, '').replace(/"$/, '').trim()).filter(Boolean);
    } else if (producto.imagenes.startsWith('[')) {
      try { imagenes = JSON.parse(producto.imagenes); } catch {}
    } else if (producto.imagenes.startsWith('http')) {
      imagenes = [producto.imagenes];
    }
  }
  const imagenesValidas = imagenes.filter(url => url && typeof url === 'string' && url.startsWith('http'));
  if (imagenesValidas.length === 0 && producto.imagen?.startsWith('http')) imagenesValidas.push(producto.imagen);
  return { ...producto, imagenes: imagenesValidas };
}

function toNullIfEmpty(value) {
  if (value === null || value === undefined) return null;
  const trimmed = String(value).trim();
  return trimmed === '' ? null : trimmed;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const page     = Math.max(1, parseInt(searchParams.get('page')     || '1'));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') || '12')));
    const skip     = (page - 1) * pageSize;

    const busqueda  = searchParams.get('busqueda')?.trim()  || '';
    const categoria = searchParams.get('categoria')?.trim() || '';
    const ordenar   = searchParams.get('ordenar')           || '';

    const precioMinParam = searchParams.get('precioMin');
    const precioMaxParam = searchParams.get('precioMax');
    const precioMin = precioMinParam !== null ? parseFloat(precioMinParam) : null;
    const precioMax = precioMaxParam !== null ? parseFloat(precioMaxParam) : null;

    // ✅ Nuevo: excluir producto por ID (para relacionados)
    const excludeId = searchParams.get('exclude') ? parseInt(searchParams.get('exclude')) : null;

    // ✅ Nuevo: limit directo sin paginación
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam) : null;

    // Modo: rango de precios
    if (searchParams.get('rangoPrecios') === 'true') {
      const [minResult, maxResult] = await Promise.all([
        prisma.producto.findFirst({ where: { stock: { gt: 0 } }, orderBy: { precio: 'asc' }, select: { precio: true } }),
        prisma.producto.findFirst({ where: { stock: { gt: 0 } }, orderBy: { precio: 'desc' }, select: { precio: true } }),
      ]);
      return Response.json({ min: Math.floor(minResult?.precio ?? 0), max: Math.ceil(maxResult?.precio ?? 100000) });
    }

    const destacados = searchParams.get('destacados') === 'true';

    // WHERE
    const where = { stock: { gt: 0 } };
    if (categoria)  where.categoriaId = parseInt(categoria);
    if (excludeId)  where.id = { not: excludeId };

    if (busqueda) {
      where.OR = [
        { nombre:         { contains: busqueda, mode: 'insensitive' } },
        { descripcion:    { contains: busqueda, mode: 'insensitive' } },
        { codigoProducto: { contains: busqueda, mode: 'insensitive' } },
      ];
    }

    if (precioMin !== null || precioMax !== null) {
      where.precio = {};
      if (precioMin !== null) where.precio.gte = precioMin;
      if (precioMax !== null) where.precio.lte = precioMax;
    }

    // ORDER BY
    let orderBy = [{ imagen: { sort: 'desc', nulls: 'last' } }, { createdAt: 'desc' }];
    if (ordenar === 'precio-asc')  orderBy = [{ imagen: { sort: 'desc', nulls: 'last' } }, { precio: 'asc' }];
    if (ordenar === 'precio-desc') orderBy = [{ imagen: { sort: 'desc', nulls: 'last' } }, { precio: 'desc' }];
    if (ordenar === 'nombre')      orderBy = [{ imagen: { sort: 'desc', nulls: 'last' } }, { nombre: 'asc' }];
    if (ordenar === 'recientes')   orderBy = [{ imagen: { sort: 'desc', nulls: 'last' } }, { createdAt: 'desc' }];

    // Sin paginación (destacados o limit directo)
    if (destacados || limit) {
      const productos = await prisma.producto.findMany({
        where,
        include: { categoria: true, proveedor: true },
        orderBy,
        take: limit ?? 8,
      });
      return Response.json(productos.map(normalizarImagenes));
    }

    // Paginado
    const [productos, total] = await Promise.all([
      prisma.producto.findMany({ where, include: { categoria: true, proveedor: true }, orderBy, skip, take: pageSize }),
      prisma.producto.count({ where }),
    ]);

    return Response.json({
      productos: productos.map(normalizarImagenes),
      pagination: {
        page, pageSize, total,
        totalPages: Math.ceil(total / pageSize),
        hasNext: page < Math.ceil(total / pageSize),
        hasPrev: page > 1,
      },
    });

  } catch (error) {
    console.error('Error al obtener productos:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { nombre, descripcion, precio, stock, stockMinimo, imagen, imagenes, categoriaId, proveedorId } = body;
    const codigoProducto = toNullIfEmpty(body.codigoProducto);
    const codigoBarras   = toNullIfEmpty(body.codigoBarras);

    if (codigoProducto) {
      const existente = await prisma.producto.findUnique({ where: { codigoProducto } });
      if (existente) return Response.json({ error: `Ya existe un producto con el código "${codigoProducto}": ${existente.nombre}` }, { status: 400 });
    }
    if (codigoBarras) {
      const existente = await prisma.producto.findUnique({ where: { codigoBarras } });
      if (existente) return Response.json({ error: `Ya existe un producto con ese código de barras: ${existente.nombre}` }, { status: 400 });
    }

    const producto = await prisma.producto.create({
      data: {
        nombre, descripcion: descripcion || null, codigoProducto, codigoBarras,
        precio: parseFloat(precio), stock: parseInt(stock) || 0, stockMinimo: parseInt(stockMinimo) || 5,
        imagen: imagen || null, imagenes: imagenes || [],
        categoriaId: parseInt(categoriaId), proveedorId: parseInt(proveedorId),
      },
      include: { categoria: true, proveedor: true },
    });

    return Response.json(normalizarImagenes(producto), { status: 201 });

  } catch (error) {
    console.error('Error al crear producto:', error);
    if (error.code === 'P2002') {
      const campo = error.meta?.target?.includes('codigoBarras') ? 'código de barras' : 'código de producto';
      return Response.json({ error: `Ya existe un producto con ese ${campo}` }, { status: 400 });
    }
    return Response.json({ error: error.message }, { status: 500 });
  }
}