// src/lib/oca.js
// Integración OCA ePak — API oficial webservice.oca.com.ar
//
// Variables de entorno requeridas:
//   OCA_USUARIO          = email de cuenta ePak  (jmrmarroquineria@gmail.com)
//   OCA_PASSWORD         = contraseña ePak
//   OCA_CUIT_REMITENTE   = CUIT con guiones      (ej: 20-12345678-9)
//   OCA_NUMERO_CUENTA    = nro de cuenta OCA      (197500/000)
//   OCA_OPERATIVA_SAP    = operativa SaP          (466987)
//   OCA_OPERATIVA_SAS    = operativa SaS          (466988)
//   OCA_CENTRO_IMPOS     = sigla centro imposición (CAT)
//   OCA_CP_ORIGEN        = CP de despacho         (4700)

const BASE = 'https://webservice.oca.com.ar/ePak_tracking/Oep_TrackEPak.asmx'

// Volumen en m³ desde cm: (alto × ancho × largo) / 1_000_000
function cmToM3(alto, ancho, largo) {
  return (alto * ancho * largo) / 1_000_000
}

// ── 1. COTIZAR ENVÍO ──────────────────────────────────────────────────────────
/**
 * Cotiza un envío OCA ePak.
 * Devuelve precio (ARS) y días hábiles estimados.
 *
 * @param {object} params
 * @param {string} params.cpDestino        - CP destino (4 dígitos)
 * @param {number} [params.pesoKg=0.5]     - Peso en kg
 * @param {number} [params.alto=10]        - Alto en cm
 * @param {number} [params.ancho=20]       - Ancho en cm
 * @param {number} [params.largo=30]       - Largo en cm
 * @param {number} [params.valorDeclarado=0]
 * @param {string} [params.operativa]      - Usa OCA_OPERATIVA_SAP por defecto
 * @returns {Promise<{ precio: number, diasHabiles: number, operativa: string }>}
 */
export async function tarifar({
  cpDestino,
  pesoKg        = 0.5,
  alto          = 10,
  ancho         = 20,
  largo         = 30,
  valorDeclarado = 0,
  operativa,
}) {
  if (!cpDestino) throw new Error('cpDestino es requerido')

  const cuit      = process.env.OCA_CUIT_REMITENTE
  const op        = operativa ?? process.env.OCA_OPERATIVA_SAP ?? '466987'
  const cpOrigen  = process.env.OCA_CP_ORIGEN ?? '4700'
  const volumenM3 = cmToM3(alto, ancho, largo)

  if (!cuit) throw new Error('OCA_CUIT_REMITENTE no configurado')

  const params = new URLSearchParams({
    Cuit:                 cuit,
    Operativa:            op,
    PesoTotal:            String(pesoKg),
    VolumenTotal:         String(volumenM3),
    CodigoPostalOrigen:   cpOrigen,
    CodigoPostalDestino:  cpDestino,
    CantidadPaquetes:     '1',
    ValorDeclarado:       String(Math.round(valorDeclarado)),
  })

  const url = `${BASE}/Tarifar_Envio_Corporativo?${params}`

  const res = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json, text/xml' },
  })

  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`OCA Tarifar error ${res.status}: ${txt}`)
  }

  const text = await res.text()

  // La respuesta es XML — parseamos manualmente los campos clave
  const precio      = parseFloat(extraerXml(text, 'Total')     ?? extraerXml(text, 'precio')     ?? '0')
  const diasMin     = parseInt(extraerXml(text, 'PlazoEntrega') ?? extraerXml(text, 'DiasHabiles') ?? '5')

  if (!precio) {
    // Si OCA devuelve 0 o vacío, probablemente el CP no tiene cobertura
    throw new Error(`OCA no pudo cotizar para CP ${cpDestino}. Respuesta: ${text.slice(0, 300)}`)
  }

  return {
    precio,
    diasHabiles: diasMin,
    operativa:   op,
    raw:         text,
  }
}

// ── 2. CREAR ENVÍO ────────────────────────────────────────────────────────────
/**
 * Genera una orden de admisión/retiro en OCA ePak.
 * Como el cliente lleva el paquete a la sucursal CAT, usamos Admisión en Sucursal.
 *
 * @param {object} p
 * @param {object} p.pedido      - Registro Pedido de la BD
 * @param {object} p.direccion   - Dirección del destinatario
 * @param {object[]} p.items     - Items del pedido
 * @param {number} [p.pesoKg=1]
 * @param {number} [p.alto=20]
 * @param {number} [p.ancho=30]
 * @param {number} [p.largo=40]
 */
export async function generarEnvio({
  pedido,
  direccion,
  items   = [],
  pesoKg  = 1,
  alto    = 20,
  ancho   = 30,
  largo   = 40,
}) {
  const usr      = process.env.OCA_USUARIO
  const psw      = process.env.OCA_PASSWORD
  const cuenta   = process.env.OCA_NUMERO_CUENTA   // 197500/000
  const operativa = process.env.OCA_OPERATIVA_SAP  // 466987
  const cpOrigen = process.env.OCA_CP_ORIGEN ?? '4700'

  if (!usr || !psw || !cuenta || !operativa) {
    throw new Error('Faltan variables de entorno OCA (usuario, password, cuenta u operativa)')
  }
  if (!direccion) throw new Error('Dirección requerida para generar envío OCA')

  const nroRemito  = `JMR-${pedido.id.slice(-10).toUpperCase()}`
  const fechaHoy   = new Date().toISOString().slice(0, 10).replace(/-/g, '') // AAAAMMDD
  const descripcion = items.slice(0, 2).map(i => `${i.cantidad}x ${i.nombre}`).join(', ')

  // Nombre del destinatario — separar en apellido/nombre
  const nombreCompleto = (pedido.compradorNombre ?? 'Cliente').trim()
  const partes         = nombreCompleto.split(' ')
  const apellido       = partes.slice(-1)[0] ?? 'Cliente'
  const nombre         = partes.slice(0, -1).join(' ') || apellido

  const xml = `<?xml version="1.0" encoding="iso-8859-1" standalone="yes"?>
<ROWS>
  <cabecera ver="2.0" nrocuenta="${cuenta}" origen="API" />
  <origenes>
    <origen
      calle="Villegas"
      nro="837"
      piso=""
      depto=""
      cp="${cpOrigen}"
      localidad="SAN FERNANDO DEL VALLE DE CATAMARCA"
      provincia="CATAMARCA"
      contacto="JMR Marroquineria"
      email="${process.env.OCA_USUARIO}"
      solicitante=""
      observaciones="Admision en sucursal OCA Catamarca"
      centrocosto="1"
      idfranjahoraria="1"
      idcentroimposicionorigen="0"
      fecha="${fechaHoy}"
    >
      <envios>
        <envio idoperativa="${operativa}" nroremito="${nroRemito}">
          <destinatario
            apellido="${sanitize(apellido)}"
            nombre="${sanitize(nombre)}"
            calle="${sanitize(direccion.calle)}"
            nro="${sanitize(direccion.numero ?? 'SN')}"
            piso="${sanitize(direccion.piso ?? '')}"
            depto="${sanitize(direccion.departamento ?? '')}"
            localidad="${sanitize(direccion.ciudad)}"
            provincia="${sanitize(direccion.provincia)}"
            cp="${direccion.codigoPostal ?? direccion.cp}"
            telefono="${sanitize(pedido.compradorTelefono ?? '')}"
            email="${sanitize(pedido.compradorEmail ?? '')}"
            idci="0"
            celular="${sanitize(pedido.compradorTelefono ?? '')}"
            observaciones="${sanitize(descripcion)}"
          />
          <paquetes>
            <paquete
              alto="${alto}"
              ancho="${ancho}"
              largo="${largo}"
              peso="${pesoKg}"
              valor="0"
              cant="1"
            />
          </paquetes>
        </envio>
      </envios>
    </origen>
  </origenes>
</ROWS>`

  const body = new URLSearchParams({
    usr,
    psw,
    XML_Datos:       xml,
    ConfirmarRetiro: 'true',
    ArchivoCliente:  '',
    ArchivoProceso:  '',
  })

  const res = await fetch(`${BASE}/IngresoORMultiplesRetiros`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    body.toString(),
  })

  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`OCA IngresoOR error ${res.status}: ${txt}`)
  }

  const text = await res.text()

  // Respuesta XML: <Numero_OR>XXXXX</Numero_OR> o similar
  const numeroOR  = extraerXml(text, 'Numero_OR')   ?? extraerXml(text, 'numeroOR')
  const nroEnvio  = extraerXml(text, 'nroEnvio')    ?? extraerXml(text, 'NroEnvio') ?? numeroOR
  const error     = extraerXml(text, 'Errores')     ?? extraerXml(text, 'Error')

  if (error && error.trim() && error.trim() !== '0') {
    throw new Error(`OCA rechazó el envío: ${error}`)
  }
  if (!numeroOR) {
    throw new Error(`OCA no devolvió número de orden. Respuesta: ${text.slice(0, 500)}`)
  }

  return {
    numeroEnvio:  nroEnvio ?? numeroOR,
    numeroOrden:  numeroOR,
    etiquetaUrl:  `${BASE}/GetHtmlDeEtiquetasPorOrdenOrNumeroEnvio?idOrdenRetiro=${numeroOR}`,
    admision:     nroRemito,
    raw:          text,
  }
}

// ── 3. TRACKING ───────────────────────────────────────────────────────────────
/**
 * Consulta el estado de un envío OCA.
 * Usa el endpoint público de tracking.
 */
export async function trackEnvio(nroEnvio) {
  if (!nroEnvio) throw new Error('nroEnvio requerido')

  const url = `https://webservice.oca.com.ar/epak_tracking/Oep_TrackEPak.asmx/Tracking_Pieza?Pieza=${nroEnvio}&Password=&Usr=`

  const res = await fetch(url)
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`OCA Tracking error ${res.status}: ${txt}`)
  }

  const text    = await res.text()
  const eventos = parsearEventosTracking(text)

  const OCA_ESTADOS = {
    'EN CAMINO':          'EN_CAMINO',
    'EN SUCURSAL':        'EN_SUCURSAL',
    'ENTREGADO':          'ENTREGADO',
    'DEVUELTO':           'DEVUELTO',
    'EN DISTRIBUCION':    'EN_CAMINO',
    'EN TRANSITO':        'EN_CAMINO',
  }

  const ultimoEvento  = eventos[eventos.length - 1]
  const estadoRaw     = (ultimoEvento?.Estado ?? '').toUpperCase()
  const estado        = OCA_ESTADOS[estadoRaw] ?? 'EN_CAMINO'
  const fechaEntrega  = estado === 'ENTREGADO' ? ultimoEvento?.Fecha ?? null : null

  return { estado, eventos, fechaEntrega, raw: text }
}

// ── 4. SUCURSALES CERCANAS ────────────────────────────────────────────────────
/**
 * Obtiene sucursales OCA cercanas a un CP (para mostrar opción retiro en sucursal)
 */
export async function getSucursalesCercanas(codigoPostal) {
  if (!codigoPostal) throw new Error('codigoPostal requerido')

  const url = `https://webservice.oca.com.ar/epak_tracking/Oep_TrackEPak.asmx/GetCentrosImposicionConServiciosByCP?CodigoPostal=${codigoPostal}`

  const res = await fetch(url)
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`OCA Sucursales error ${res.status}: ${txt}`)
  }

  const text = await res.text()
  // Parsear XML de sucursales
  const matches = [...text.matchAll(/<Sucursal[^>]*>([\s\S]*?)<\/Sucursal>/gi)]

  return matches.map(m => {
    const bloque = m[1]
    return {
      id:        extraerXml(bloque, 'Idci')        ?? '',
      nombre:    extraerXml(bloque, 'Descripcion') ?? '',
      domicilio: extraerXml(bloque, 'Calle')       ?? '',
      cp:        extraerXml(bloque, 'CodigoPostal') ?? '',
      localidad: extraerXml(bloque, 'Localidad')   ?? '',
      telefono:  extraerXml(bloque, 'Telefono')    ?? '',
      horario:   extraerXml(bloque, 'Horario')     ?? '',
    }
  })
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Extrae contenido de una etiqueta XML simple */
function extraerXml(xml, tag) {
  const re    = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i')
  const match = xml.match(re)
  return match ? match[1].trim() : null
}

/** Elimina caracteres que rompen el XML de OCA */
function sanitize(str) {
  return String(str ?? '')
    .replace(/&/g, 'y')
    .replace(/</g, '')
    .replace(/>/g, '')
    .replace(/"/g, '')
    .replace(/\|/g, '')
    .slice(0, 100)
}

/** Parsea los eventos de tracking del XML de OCA */
function parsearEventosTracking(xml) {
  const matches = [...xml.matchAll(/<TrackingPiezaVO[^>]*>([\s\S]*?)<\/TrackingPiezaVO>/gi)]
  if (!matches.length) {
    // Intentar con tag alternativo
    const alt = [...xml.matchAll(/<Evento[^>]*>([\s\S]*?)<\/Evento>/gi)]
    return alt.map(m => ({
      Fecha:       extraerXml(m[1], 'Fecha')       ?? '',
      Estado:      extraerXml(m[1], 'Estado')      ?? '',
      Descripcion: extraerXml(m[1], 'Descripcion') ?? '',
      Sucursal:    extraerXml(m[1], 'Sucursal')    ?? '',
    }))
  }
  return matches.map(m => ({
    Fecha:       extraerXml(m[1], 'Fecha')       ?? '',
    Estado:      extraerXml(m[1], 'Estado')      ?? '',
    Descripcion: extraerXml(m[1], 'Descripcion') ?? '',
    Sucursal:    extraerXml(m[1], 'Sucursal')    ?? '',
  }))
}