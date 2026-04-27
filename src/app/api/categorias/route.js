import { getCategorias } from "@/lib/devhub";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categorias = await getCategorias();
    // Garantizar que siempre devuelve un array
    return Response.json(Array.isArray(categorias) ? categorias : []);
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    // Devolver array vacío en vez de objeto de error
    // para que el cliente no falle con .map()
    return Response.json([]);
  }
}