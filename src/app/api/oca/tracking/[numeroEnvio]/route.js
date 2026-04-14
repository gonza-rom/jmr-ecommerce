// src/app/api/oca/tracking/[numeroEnvio]/route.js
// GET /api/oca/tracking/:numeroEnvio
// Consulta el estado de un envío OCA.
// Llamado desde /mis-pedidos y desde el admin.

import { NextResponse } from "next/server";
import { trackEnvio }   from "@/lib/oca";
import { prisma }       from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req, context) {
  try {
    const { numeroEnvio } = await context.params;

    if (!numeroEnvio) {
      return NextResponse.json(
        { ok: false, error: "numeroEnvio requerido" },
        { status: 400 }
      );
    }

    const resultado = await trackEnvio(numeroEnvio);

    // Actualizar el estado en BD si cambió
    try {
      const pedido = await prisma.pedido.findFirst({
        where:  { ocaNumeroEnvio: numeroEnvio },
        select: { id: true, ocaEstado: true },
      });

      if (pedido && pedido.ocaEstado !== resultado.estado) {
        const data = {
          ocaEstado: resultado.estado,
          ...(resultado.estado === "ENTREGADO" && {
            ocaFechaEntrega: resultado.fechaEntrega
              ? new Date(resultado.fechaEntrega)
              : new Date(),
            estado:      "ENTREGADO",
            entregadoAt: new Date(),
          }),
        };
        await prisma.pedido.update({ where: { id: pedido.id }, data });
      }
    } catch (dbErr) {
      // No bloquear la respuesta si falla la actualización en BD
      console.error("[OCA tracking DB update]", dbErr.message);
    }

    return NextResponse.json({ ok: true, ...resultado });

  } catch (error) {
    console.error("[GET /api/oca/tracking]", error.message);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}