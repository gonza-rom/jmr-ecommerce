// src/app/api/oca/tarifar/route.js
import { NextResponse } from 'next/server'
import { tarifar } from '@/lib/oca'

export const dynamic = 'force-dynamic'

export async function POST(req) {
  try {
    const body = await req.json()
    const {
      cpDestino,
      codigoPostalDestino, // alias por compatibilidad con checkout anterior
      operativa,
      pesoKg        = 0.5,
      alto          = 10,
      ancho         = 20,
      largo         = 30,
      valorDeclarado = 0,
    } = body

    const cp = cpDestino ?? codigoPostalDestino
    if (!cp) {
      return NextResponse.json({ ok: false, error: 'cpDestino requerido' }, { status: 400 })
    }

    const tarifa = await tarifar({ cpDestino: cp, pesoKg, alto, ancho, largo, valorDeclarado, operativa })

    return NextResponse.json({ ok: true, tarifa })

  } catch (error) {
    console.error('[POST /api/oca/tarifar]', error.message)
    return NextResponse.json({
      ok:       false,
      error:    error.message,
      fallback: { precio: 6500, diasHabiles: 5 },
    })
  }
}