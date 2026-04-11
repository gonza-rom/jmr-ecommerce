import { getCategorias } from "@/lib/devhub";

export const revalidate = 300;

export async function GET() {
  try {
    const categorias = await getCategorias();
    return Response.json(categorias);

  } catch (error) {
    console.error("Error al obtener categorías:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}