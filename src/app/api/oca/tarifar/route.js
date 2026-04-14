// src/app/api/oca/tarifar/route.js
// POST /api/oca/tarifar
// Calcula el costo de envío OCA para un CP destino.
// Llamado desde el checkout cuando el usuario elige "Envío a domicilio".

import { NextResponse } from "next/server";
import { tarifar }      from "@/lib/oca";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      codigoPostalDestino,
      pesoTotal     = 1,
      volumen       = 24000, // 20×30×40 cm por defecto
      valorDeclarado,
    } = body;

    if (!codigoPostalDestino) {
      return NextResponse.json(
        { ok: false, error: "codigoPostalDestino requerido" },
        { status: 400 }
      );
    }

    const tarifa = await tarifar({
      codigoPostalDestino,
      pesoTotal,
      volumen,
      valorDeclarado: valorDeclarado ?? 1,
    });

    return NextResponse.json({ ok: true, tarifa });
  } catch (error) {
    console.error("[POST /api/oca/tarifar]", error.message);
    // Si OCA falla, devolvemos un costo fallback en vez de romper el checkout
    return NextResponse.json({
      ok:      false,
      error:   error.message,
      fallback: { precio: 5000, diasHabiles: 5 },
    });
  }
}