// src/lib/oca.js
// Integración con OCA e-Pak / API REST
//
// Variables de entorno requeridas:
//   OCA_USUARIO         = email de cuenta OCA
//   OCA_PASSWORD        = contraseña OCA
//   OCA_CUIT_REMITENTE  = CUIT de tu empresa sin guiones (ej: "20123456789")
//   OCA_NUMERO_CUENTA   = número de cuenta OCA asignado al dar de alta
//   OCA_OPERATIVA_ENVIO = código de operativa para "puerta a puerta" (ej: "77000")
//   OCA_OPERATIVA_SUC   = código de operativa "puerta a sucursal" (opcional)
//   OCA_CENTRO_IMPOS    = centro de imposición (sucursal desde donde despachás)
//
// Docs:
//   https://www.oca.com.ar/epak/

const OCA_BASE_URL = "https://operaciones.oca.com.ar/epak";

// ─── Utilidades ────────────────────────────────────────────────────────────────

function getCredenciales() {
  const usuario  = process.env.OCA_USUARIO;
  const password = process.env.OCA_PASSWORD;
  const cuit     = process.env.OCA_CUIT_REMITENTE;
  const cuenta   = process.env.OCA_NUMERO_CUENTA;

  if (!usuario || !password || !cuit || !cuenta) {
    throw new Error(
      "Faltan variables de entorno OCA: OCA_USUARIO, OCA_PASSWORD, OCA_CUIT_REMITENTE, OCA_NUMERO_CUENTA"
    );
  }
  return { usuario, password, cuit, cuenta };
}

// OCA usa Basic Auth en sus endpoints REST
function authHeader() {
  const { usuario, password } = getCredenciales();
  const encoded = Buffer.from(`${usuario}:${password}`).toString("base64");
  return { Authorization: `Basic ${encoded}` };
}

// ─── 1. Tarifar envío ──────────────────────────────────────────────────────────
/**
 * Calcula el costo de envío según OCA.
 *
 * @param {object} params
 * @param {string} params.codigoPostalOrigen  - CP de tu sucursal (ej: "4700")
 * @param {string} params.codigoPostalDestino - CP del cliente
 * @param {number} params.pesoTotal           - Peso en kg (ej: 1.5)
 * @param {number} params.volumen             - Volumen en cm³ (largo×ancho×alto)
 * @param {number} params.valorDeclarado      - Valor del paquete en pesos
 * @param {string} [params.operativa]         - Código de operativa (usa env por defecto)
 * @returns {Promise<{ precio: number, diasHabiles: number, operativa: string }>}
 */
export async function tarifar({
  codigoPostalOrigen  = process.env.OCA_CP_ORIGEN ?? "4700",
  codigoPostalDestino,
  pesoTotal,
  volumen,
  valorDeclarado,
  operativa = process.env.OCA_OPERATIVA_ENVIO,
}) {
  if (!codigoPostalDestino) throw new Error("codigoPostalDestino es requerido");
  if (!operativa)           throw new Error("OCA_OPERATIVA_ENVIO no configurada");

  const { cuit, cuenta } = getCredenciales();

  const url = new URL(`${OCA_BASE_URL}/Cotizar`);
  url.searchParams.set("CPOrigen",          codigoPostalOrigen);
  url.searchParams.set("CPDestino",         codigoPostalDestino);
  url.searchParams.set("Operativa",         operativa);
  url.searchParams.set("Cuenta",            cuenta);
  url.searchParams.set("Cuit",              cuit);
  url.searchParams.set("Peso",              String(pesoTotal));
  url.searchParams.set("Vol",               String(volumen));
  url.searchParams.set("ValorDeclarado",    String(valorDeclarado));
  url.searchParams.set("Cant",              "1");

  const res = await fetch(url.toString(), {
    headers: { ...authHeader(), Accept: "application/json" },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OCA Cotizar error ${res.status}: ${text}`);
  }

  const data = await res.json();

  // OCA devuelve array de tarifas — tomamos la primera (la más relevante)
  const tarifa = Array.isArray(data) ? data[0] : data;

  return {
    precio:      parseFloat(tarifa?.Precio ?? tarifa?.precio ?? 0),
    diasHabiles: parseInt(tarifa?.DiasHabiles ?? tarifa?.diasHabiles ?? 5),
    operativa:   tarifa?.Operativa ?? operativa,
    raw:         tarifa,
  };
}

// ─── 2. Generar etiqueta / ingreso de envío ────────────────────────────────────
/**
 * Genera el número de envío OCA y la etiqueta PDF.
 *
 * @param {object} params
 * @param {object} params.pedido     - Registro de Pedido de la BD
 * @param {object} params.direccion  - Objeto Direccion del cliente (o null si retira en suc.)
 * @param {object[]} params.items    - Array de PedidoItem
 * @param {number}  params.peso      - Peso total en kg
 * @param {number}  params.alto      - Alto del paquete en cm
 * @param {number}  params.ancho     - Ancho del paquete en cm
 * @param {number}  params.largo     - Largo del paquete en cm
 * @returns {Promise<{ numeroEnvio: string, etiquetaUrl: string, admision: string }>}
 */
export async function generarEnvio({
  pedido,
  direccion,
  items    = [],
  peso     = 1,
  alto     = 20,
  ancho    = 30,
  largo    = 40,
}) {
  const { cuit, cuenta } = getCredenciales();
  const operativa = process.env.OCA_OPERATIVA_ENVIO;
  const centroImpos = process.env.OCA_CENTRO_IMPOS ?? "0";

  if (!operativa) throw new Error("OCA_OPERATIVA_ENVIO no configurada");
  if (!direccion) throw new Error("Dirección requerida para generar envío OCA");

  const descripcion = items
    .slice(0, 3)
    .map((i) => `${i.cantidad}x ${i.nombre}`)
    .join(", ");

  const volumen = alto * ancho * largo;
  const valorDeclarado = Math.round(pedido.total);

  const body = {
    // Remitente
    cuitRemitente:          cuit,
    nroCuenta:              cuenta,
    centroImposicion:       centroImpos,
    operativa,
    // Destinatario
    nroDespacho:            pedido.id.slice(-12).toUpperCase(), // referencia interna
    apellido:               pedido.compradorNombre ?? "Cliente",
    nombre:                 "",
    calle:                  direccion.calle,
    nro:                    direccion.numero ?? "S/N",
    piso:                   direccion.piso ?? "",
    depto:                  direccion.departamento ?? "",
    localidad:              direccion.ciudad,
    provincia:              direccion.provincia ?? "Catamarca",
    codigoPostal:           direccion.cp ?? "",
    telefono:               pedido.compradorTelefono ?? "",
    email:                  pedido.compradorEmail ?? "",
    // Paquete
    cantidadPaquetes:       1,
    peso:                   peso,
    volumen:                volumen,
    valorDeclarado,
    descripcion:            descripcion || "Artículos de marroquinería",
    // Referencia cliente
    obs1:                   `JMR-${pedido.id.slice(-8).toUpperCase()}`,
    obs2:                   "",
  };

  const res = await fetch(`${OCA_BASE_URL}/Envios`, {
    method:  "POST",
    headers: {
      ...authHeader(),
      "Content-Type": "application/json",
      Accept:         "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OCA Envios error ${res.status}: ${text}`);
  }

  const data = await res.json();

  const numeroEnvio  = String(data?.NumeroEnvio  ?? data?.numeroEnvio  ?? "");
  const admision     = String(data?.NroAdmision   ?? data?.nroAdmision  ?? "");
  const etiquetaUrl  = data?.UrlEtiqueta ?? data?.urlEtiqueta ?? null;

  if (!numeroEnvio) {
    throw new Error(`OCA no devolvió número de envío. Respuesta: ${JSON.stringify(data)}`);
  }

  return { numeroEnvio, etiquetaUrl, admision, raw: data };
}

// ─── 3. Tracking ──────────────────────────────────────────────────────────────
/**
 * Consulta el estado de un envío OCA por número de envío.
 *
 * @param {string} numeroEnvio
 * @returns {Promise<{ estado: string, eventos: object[], fechaEntrega: string|null }>}
 */
export async function trackEnvio(numeroEnvio) {
  if (!numeroEnvio) throw new Error("numeroEnvio requerido");

  const url = new URL(`${OCA_BASE_URL}/Tracking`);
  url.searchParams.set("nroEnvio", numeroEnvio);

  const res = await fetch(url.toString(), {
    headers: { ...authHeader(), Accept: "application/json" },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OCA Tracking error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const eventos = Array.isArray(data) ? data : (data?.eventos ?? []);

  // Mapear estados OCA a estados internos legibles
  const OCA_ESTADO_MAP = {
    "1":  "EN_CAMINO",
    "2":  "EN_SUCURSAL",
    "3":  "ENTREGADO",
    "4":  "DEVUELTO",
    "5":  "EN_CAMINO",
    "6":  "SIN_MOVIMIENTO",
    "99": "EN_CAMINO",
  };

  const ultimoEvento = eventos[eventos.length - 1];
  const codigoEstado = String(ultimoEvento?.CodEstado ?? ultimoEvento?.codEstado ?? "");
  const estado = OCA_ESTADO_MAP[codigoEstado] ?? "EN_CAMINO";

  const fechaEntrega =
    estado === "ENTREGADO"
      ? (ultimoEvento?.Fecha ?? ultimoEvento?.fecha ?? null)
      : null;

  return { estado, eventos, fechaEntrega, raw: data };
}

// ─── 4. Sucursales OCA cercanas ────────────────────────────────────────────────
/**
 * Lista sucursales OCA cercanas a un código postal (útil para mostrar
 * opción "Retiro en sucursal OCA" en el checkout).
 *
 * @param {string} codigoPostal
 * @returns {Promise<object[]>}
 */
export async function getSucursalesCercanas(codigoPostal) {
  if (!codigoPostal) throw new Error("codigoPostal requerido");

  const url = new URL(`${OCA_BASE_URL}/Sucursales`);
  url.searchParams.set("CodigoPostal", codigoPostal);

  const res = await fetch(url.toString(), {
    headers: { ...authHeader(), Accept: "application/json" },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OCA Sucursales error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const sucursales = Array.isArray(data) ? data : [];

  return sucursales.map((s) => ({
    id:        s.IdSucursal   ?? s.id,
    nombre:    s.Nombre       ?? s.nombre,
    domicilio: s.Domicilio    ?? s.domicilio,
    localidad: s.Localidad    ?? s.localidad,
    cp:        s.CodigoPostal ?? s.codigoPostal,
    telefono:  s.Telefono     ?? s.telefono,
    horario:   s.Horario      ?? s.horario,
    raw:       s,
  }));
}