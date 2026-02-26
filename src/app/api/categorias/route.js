import { prisma } from "@/lib/prisma";

// ✅ Categorías cambian muy poco — caché de 5 minutos
export const revalidate = 300;

export async function GET() {
  try {
    const categorias = await prisma.categoria.findMany({
      orderBy: { nombre: "asc" },
      include: {
        _count: {
          select: {
            productos: {
              where: { stock: { gt: 0 } },
            },
          },
        },
      },
    });

    return Response.json(categorias);
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}