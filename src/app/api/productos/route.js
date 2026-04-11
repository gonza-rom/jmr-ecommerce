import { getProductos } from "@/lib/devhub";

export const revalidate = 60;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Modo rango de precios — ya no aplica desde JMR
    // (DevHub no expone min/max directo, se puede agregar después)

    const result = await getProductos({
      q:          searchParams.get("busqueda")  || "",
      categoriaId: searchParams.get("categoria") || undefined,
      page:       parseInt(searchParams.get("page")     || "1"),
      pageSize:   parseInt(searchParams.get("pageSize") || "12"),
      ordenar:    searchParams.get("ordenar")            || "nombre",
      soloConStock: true,
    });

    return Response.json(result);

  } catch (error) {
    console.error("Error al obtener productos:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}