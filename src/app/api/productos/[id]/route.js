import { getProducto } from "@/lib/devhub";

export const dynamic = 'force-dynamic';

export async function GET(request, context) {
  try {
    const params = await context.params;
    const id = params.id; // DevHub usa cuid (String), no Int

    const producto = await getProducto(id);

    if (!producto) {
      return Response.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    return Response.json(producto);

  } catch (error) {
    console.error("Error al obtener producto:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}