import { getProductos } from "@/lib/devhub";

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const result = await getProductos({
      q:            searchParams.get("busqueda")  || "",
      categoriaId:  searchParams.get("categoria") || undefined,
      page:         parseInt(searchParams.get("page")     || "1"),
      pageSize:     parseInt(searchParams.get("pageSize") || "12"),
      ordenar:      searchParams.get("ordenar")           || "nombre",
      soloConStock: true,
    });

    return Response.json(result);

  } catch (error) {
    console.error("Error al obtener productos:", error);
    // Devolver estructura válida en caso de error
    return Response.json({
      productos: [],
      meta: { page: 1, pageSize: 12, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
    });
  }
}