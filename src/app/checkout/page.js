'use client';
// src/app/checkout/page.js

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, ShoppingBag, Truck, CheckCircle,
  Loader2, AlertCircle, Store,
  CreditCard, Banknote, Building2, Tag, X, User,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { createBrowserClient } from '@supabase/ssr';

const WA_NUMBER = '543834927252';

const TRANSFERENCIA = {
  titular: 'Maria Lourdes Quispe',
  banco:   'Banco Nación / Mercado Pago',
  cbu:     '',
  alias:   '',
};

const PROVINCIAS_AR = [
  'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut',
  'Córdoba', 'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy',
  'La Pampa', 'La Rioja', 'Mendoza', 'Misiones', 'Neuquén',
  'Río Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz',
  'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucumán',
];

function calcularEnvio(provincia, subtotal) {
  const LOCAL     = ['Catamarca'];
  const NOA       = ['Tucumán', 'Jujuy', 'Salta', 'La Rioja', 'Santiago del Estero'];
  const CUYO      = ['Mendoza', 'San Juan', 'San Luis'];
  const LITORAL   = ['Corrientes', 'Misiones', 'Formosa', 'Chaco', 'Entre Ríos'];
  const PATAGONIA = ['Neuquén', 'Río Negro', 'Chubut', 'Santa Cruz', 'Tierra del Fuego'];
  const GRATIS_DESDE = 150000;

  let precio = 0, zona = '', dias = [3, 7];
  if (LOCAL.includes(provincia))        { precio = 2500; zona = 'Catamarca';  dias = [1, 2]; }
  else if (NOA.includes(provincia))     { precio = 4500; zona = 'NOA';        dias = [2, 4]; }
  else if (CUYO.includes(provincia))    { precio = 5500; zona = 'Cuyo';       dias = [3, 5]; }
  else if (LITORAL.includes(provincia)) { precio = 5000; zona = 'Litoral';    dias = [3, 5]; }
  else if (PATAGONIA.includes(provincia)){ precio = 7500; zona = 'Patagonia'; dias = [5, 8]; }
  else                                  { precio = 5000; zona = provincia;    dias = [3, 7]; }

  const gratis = subtotal >= GRATIS_DESDE;
  return { disponible: true, gratis, precio: gratis ? 0 : precio, zona: { nombre: zona }, diasMin: dias[0], diasMax: dias[1] };
}

const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(n ?? 0);

const GREEN      = '#6DBE45';
const GREEN_DARK = '#286c00';

// ── Barra de pasos ────────────────────────────────────────────────────────────
function StepBar({ paso }) {
  const pasos = ['Contacto', 'Entrega', 'Pago'];
  return (
    <div className="flex items-center gap-0 mb-8">
      {pasos.map((label, i) => {
        const num = i + 1, activo = paso === num, hecho = paso > num;
        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2">
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700,
                border: `2px solid ${hecho || activo ? GREEN : '#d1d5db'}`,
                background: hecho ? GREEN : 'white',
                color: hecho ? 'white' : activo ? GREEN_DARK : '#9ca3af',
                transition: 'all 0.2s',
              }}>
                {hecho ? <CheckCircle size={14} /> : num}
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: activo || hecho ? '#1a1c1c' : '#9ca3af', display: 'none' }} className="hidden sm:block">
                {label}
              </span>
            </div>
            {i < pasos.length - 1 && (
              <div style={{ flex: 1, height: 1, margin: '0 12px', background: paso > num ? GREEN : '#e5e7eb' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Resumen lateral ───────────────────────────────────────────────────────────
function ResumenLateral({ cart, subtotal, costoEnvio, total, tipoEnvio, infoEnvio }) {
  const [mostrarCupon, setMostrarCupon] = useState(false);
  const [cuponInput,   setCuponInput]   = useState('');

  return (
    <div style={{ background: '#f9f9f9', border: '1px solid #e5e7eb', borderRadius: 16, overflow: 'hidden' }}>
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 256, overflowY: 'auto' }}>
        {cart.map(item => (
          <div key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              {item.imagen
                ? <img src={item.imagen} alt={item.nombre} style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', border: '1px solid #e5e7eb' }} />
                : <div style={{ width: 48, height: 48, borderRadius: 8, background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ShoppingBag size={14} color="#9ca3af" /></div>
              }
              <span style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: '#6b7280', color: 'white', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.cantidad}
              </span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: '#111', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.nombre}</p>
              {(item.talle || item.color) && (
                <p style={{ fontSize: 11, color: '#9ca3af', margin: '2px 0 0' }}>
                  {[item.talle && `T: ${item.talle}`, item.color].filter(Boolean).join(' · ')}
                </p>
              )}
            </div>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#111', flexShrink: 0, margin: 0 }}>{fmt(item.precio * item.cantidad)}</p>
          </div>
        ))}
      </div>

      <div style={{ borderTop: '1px solid #e5e7eb' }} />

      <div style={{ padding: '12px 20px' }}>
        {!mostrarCupon ? (
          <button onClick={() => setMostrarCupon(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <Tag size={14} /> Agregar cupón de descuento
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={cuponInput} onChange={e => setCuponInput(e.target.value)} placeholder="Código de cupón" autoFocus
              style={{ flex: 1, padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none' }} />
            <button style={{ padding: '8px 12px', background: GREEN, color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Aplicar</button>
            <button onClick={() => setMostrarCupon(false)} style={{ padding: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={14} /></button>
          </div>
        )}
      </div>

      <div style={{ borderTop: '1px solid #e5e7eb' }} />

      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6b7280' }}>
          <span>Subtotal</span><span>{fmt(subtotal)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#6b7280' }}>
          <span>Envío</span>
          <span style={{ color: costoEnvio === 0 && tipoEnvio ? GREEN_DARK : '#6b7280', fontWeight: costoEnvio === 0 && tipoEnvio ? 600 : 400 }}>
            {!tipoEnvio ? 'Calculando...' :
             tipoEnvio.startsWith('retiro') ? 'Retiro gratis' :
             infoEnvio?.gratis ? '¡Gratis!' :
             infoEnvio?.disponible ? fmt(infoEnvio.precio) : 'A calcular'}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 700, color: '#111', paddingTop: 8, borderTop: '1px solid #e5e7eb', marginTop: 4 }}>
          <span>Total</span>
          <span style={{ color: GREEN_DARK }}>{fmt(total)}</span>
        </div>
      </div>
    </div>
  );
}

// ── Checkout principal ────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart } = useCart();
  const pedidoConfirmado = useRef(false);

  const [paso,       setPaso]       = useState(1);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [infoEnvio,  setInfoEnvio]  = useState(null);
  const [tipoEnvio,  setTipoEnvio]  = useState('');
  const [metodoPago, setMetodoPago] = useState('');
  const [errores,    setErrores]    = useState({});
  const [copiado,    setCopiado]    = useState('');
  const [usuarioLogueado, setUsuarioLogueado] = useState(null);

  const [form, setForm] = useState({
    nombre: '', email: '', telefono: '',
    calle: '', numero: '', piso: '', depto: '',
    ciudad: '', provincia: '', codigoPostal: '',
    notas: '',
  });

  // ── Pre-completar datos del usuario logueado ──────────────────────────────
  useEffect(() => {
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      );
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (!user) return;
        setUsuarioLogueado(user);
        // Pre-completar email y nombre si el form está vacío
        setForm(prev => ({
          ...prev,
          email:  prev.email  || user.email  || '',
          nombre: prev.nombre || user.user_metadata?.full_name || user.user_metadata?.nombre || '',
        }));
      });
    } catch { /* sin auth */ }
  }, []);

  useEffect(() => {
    if (cart.length === 0 && !pedidoConfirmado.current) router.replace('/productos');
  }, [cart, router]);

  useEffect(() => {
    if (tipoEnvio === 'envio' && form.provincia) {
      setInfoEnvio(calcularEnvio(form.provincia, subtotal));
    } else {
      setInfoEnvio(null);
    }
  }, [form.provincia, tipoEnvio]);

  const subtotal   = useMemo(() => cart.reduce((acc, item) => acc + item.precio * item.cantidad, 0), [cart]);
  const costoEnvio = tipoEnvio.startsWith('retiro') ? 0 : (infoEnvio?.disponible ? infoEnvio.precio : 0);
  const total      = subtotal + costoEnvio;

  function copiar(campo) {
    const valor = campo === 'cbu' ? TRANSFERENCIA.cbu : TRANSFERENCIA.alias;
    navigator.clipboard.writeText(valor).then(() => {
      setCopiado(campo);
      setTimeout(() => setCopiado(''), 2000);
    });
  }

  function validarPaso1() {
    const e = {};
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email inválido';
    if (!form.codigoPostal.trim()) e.codigoPostal = 'Requerido';
    setErrores(e);
    return Object.keys(e).length === 0;
  }

  function validarPaso2() {
    const e = {};
    if (!tipoEnvio)            e.tipoEnvio = 'Seleccioná una opción de entrega';
    if (!form.nombre.trim())   e.nombre    = 'Requerido';
    if (!form.telefono.trim()) e.telefono  = 'Requerido';
    if (tipoEnvio === 'envio') {
      if (!form.calle.trim())  e.calle     = 'Requerido';
      if (!form.ciudad.trim()) e.ciudad    = 'Requerido';
      if (!form.provincia)     e.provincia = 'Requerido';
    }
    setErrores(e);
    return Object.keys(e).length === 0;
  }

  function validarPaso3() {
    const e = {};
    if (!metodoPago) e.metodoPago = 'Seleccioná un método de pago';
    setErrores(e);
    return Object.keys(e).length === 0;
  }

  async function confirmar() {
    if (!validarPaso3()) return;
    setLoading(true);
    setError('');

    try {
      const payload = {
        items: cart.map(item => ({
          productoDevhubId: item.id,
          varianteDevhubId: item.varianteId ?? null,
          nombre:           item.nombre,
          precioUnit:       item.precio,
          cantidad:         item.cantidad,
          subtotal:         item.precio * item.cantidad,
          talle:            item.talle  ?? null,
          color:            item.color  ?? null,
          imagen:           item.imagen ?? null,
        })),
        subtotal, costoEnvio, total,
        metodoPago, tipoEnvio,
        compradorNombre:   form.nombre.trim(),
        compradorEmail:    form.email.trim(),
        compradorTelefono: form.telefono.trim(),
        notas: form.notas.trim() || null,
        ...(tipoEnvio === 'envio' && {
          direccion: {
            calle:        form.calle.trim(),
            numero:       form.numero.trim()  || null,
            piso:         form.piso.trim()    || null,
            departamento: form.depto.trim()   || null,
            ciudad:       form.ciudad.trim(),
            provincia:    form.provincia,
            codigoPostal: form.codigoPostal.trim(),
          },
        }),
      };

      const res  = await fetch('/api/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.ok) { setError(data.error ?? 'Error al procesar el pedido'); return; }

      pedidoConfirmado.current = true;

      if (metodoPago === 'mercadopago' && data.mpInitPoint) {
        clearCart();
        window.location.href = data.mpInitPoint;
        return;
      }

      clearCart();
      // Pasar email a la página de éxito para el banner de registro
      const emailParam = usuarioLogueado ? '' : `&email=${encodeURIComponent(form.email.trim())}`;
      router.push(`/checkout/exito?pedido=${data.pedidoId}&metodo=${metodoPago}${emailParam}`);

    } catch { setError('Error de conexión. Intentá de nuevo.'); }
    finally  { setLoading(false); }
  }

  if (cart.length === 0 && !pedidoConfirmado.current) return null;

  const inp = (err) => ({
    width: '100%', padding: '10px 12px',
    border: `1px solid ${err ? '#fca5a5' : '#e5e7eb'}`,
    borderRadius: 8, fontSize: 13, outline: 'none',
    background: 'white', boxSizing: 'border-box',
    fontFamily: 'Inter, sans-serif',
  });

  const metodosPago = [
    { id: 'mercadopago',   icon: CreditCard, label: 'Mercado Pago',           desc: 'Tarjeta, débito, efectivo en puntos de pago' },
    { id: 'transferencia', icon: Building2,  label: 'Transferencia bancaria', desc: 'Transferí y envianos el comprobante por WhatsApp' },
    { id: 'efectivo',      icon: Banknote,   label: 'Efectivo',               desc: tipoEnvio.startsWith('retiro') ? 'Al retirar en el local' : 'Al recibir el pedido' },
  ];

  const btnPrimario = {
    width: '100%', padding: '14px',
    background: `linear-gradient(135deg, ${GREEN_DARK}, ${GREEN})`,
    color: 'white', border: 'none', borderRadius: 12,
    fontSize: 14, fontWeight: 700, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    boxShadow: '0 4px 16px rgba(109,190,69,0.3)',
    fontFamily: 'Inter, sans-serif',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f9f9f9', fontFamily: 'Inter, sans-serif' }}>

      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: 18, fontWeight: 900, letterSpacing: '-0.02em', color: GREEN_DARK }}>JMR</span>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9ca3af', marginLeft: 6 }}>Marroquinería</span>
          </Link>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9ca3af' }}>Checkout</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {usuarioLogueado && (
              <span style={{ fontSize: 12, color: '#6DBE45', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                <User size={13} /> {usuarioLogueado.email?.split('@')[0]}
              </span>
            )}
            <Link href="/productos" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6b7280', textDecoration: 'none' }}>
              <ArrowLeft size={13} /> Volver
            </Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 32 }} className="lg:grid-cols-checkout">
          <style>{`@media(min-width:1024px){.lg\\:grid-cols-checkout{grid-template-columns:1fr 380px}}`}</style>

          {/* Columna izquierda */}
          <div>
            <StepBar paso={paso} />

            {/* PASO 1: Contacto */}
            {paso === 1 && (
              <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111', margin: 0 }}>Datos de contacto</h2>

                {/* Badge usuario logueado */}
                {usuarioLogueado && (
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <User size={14} color="#6DBE45" />
                    <p style={{ fontSize: 13, color: '#15803d', fontWeight: 600, margin: 0 }}>
                      Comprando como <strong>{usuarioLogueado.email}</strong>
                    </p>
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>E-mail *</label>
                  <input
                    type="email" value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    placeholder="tu@email.com"
                    readOnly={!!usuarioLogueado}
                    style={{ ...inp(errores.email), background: usuarioLogueado ? '#f9fafb' : 'white', color: usuarioLogueado ? '#6b7280' : '#111' }}
                  />
                  {errores.email && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errores.email}</p>}
                </div>

                <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 16 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 12 }}>Código Postal</h3>
                  <input value={form.codigoPostal} onChange={e => setForm(p => ({ ...p, codigoPostal: e.target.value }))}
                    placeholder="Ej: 4700" style={{ ...inp(errores.codigoPostal), maxWidth: 160 }} />
                  {errores.codigoPostal && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errores.codigoPostal}</p>}
                  <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>Catamarca Capital: 4700</p>
                </div>

                <button onClick={() => { if (validarPaso1()) { setTipoEnvio(''); setPaso(2); } }} style={btnPrimario}>
                  Continuar
                </button>
              </div>
            )}

            {/* PASO 2: Entrega */}
            {paso === 2 && (
              <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

                {[
                  { label: 'Contacto', valor: form.email,               p: 1 },
                  { label: 'CP',       valor: `CP ${form.codigoPostal}`, p: 1 },
                ].map(({ label, valor, p }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9f9f9', borderRadius: 10, padding: '10px 16px' }}>
                    <div>
                      <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>{label}</p>
                      <p style={{ fontSize: 13, fontWeight: 500, color: '#111', margin: 0 }}>{valor}</p>
                    </div>
                    <button onClick={() => setPaso(p)} style={{ fontSize: 12, fontWeight: 600, color: GREEN, background: 'none', border: 'none', cursor: 'pointer' }}>Cambiar</button>
                  </div>
                ))}

                <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111', margin: 0 }}>Datos personales</h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nombre completo *</label>
                    <input value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
                      placeholder="Juan Pérez" style={inp(errores.nombre)} />
                    {errores.nombre && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errores.nombre}</p>}
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Teléfono / WhatsApp *</label>
                    <input value={form.telefono} onChange={e => setForm(p => ({ ...p, telefono: e.target.value }))}
                      placeholder="+54 9 383 000-0000" style={inp(errores.telefono)} />
                    {errores.telefono && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errores.telefono}</p>}
                  </div>
                </div>

                {/* Método de entrega */}
                <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 16 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 12 }}>Método de entrega</h3>
                  {errores.tipoEnvio && <p style={{ fontSize: 11, color: '#ef4444', marginBottom: 8 }}>{errores.tipoEnvio}</p>}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { value: 'retiro-rivadavia',  label: 'Retirar en Rivadavia 564', desc: 'San Fernando · Lun–Vie 8:30–13 / 17–21:30 · Sáb 9–13 / 17–21' },
                      { value: 'retiro-valleviejo', label: 'Retirar en Valle Viejo',   desc: 'Av. Pte. Castillo 1165 · Mismo horario' },
                      { value: 'envio',             label: 'Envío a domicilio',        desc: 'Se calcula según tu provincia' },
                    ].map(({ value, label, desc }) => {
                      const esRetiro = value.startsWith('retiro');
                      return (
                        <label key={value} style={{
                          display: 'flex', alignItems: 'flex-start', gap: 12, padding: 14,
                          border: `2px solid ${tipoEnvio === value ? GREEN : '#e5e7eb'}`,
                          borderRadius: 12, cursor: 'pointer',
                          background: tipoEnvio === value ? '#f0fdf4' : 'white',
                          transition: 'all 0.15s',
                        }}>
                          <input type="radio" name="entrega" value={value} checked={tipoEnvio === value} onChange={() => setTipoEnvio(value)} style={{ marginTop: 2 }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                {esRetiro ? <Store size={14} color="#6b7280" /> : <Truck size={14} color="#6b7280" />}
                                <span style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{label}</span>
                              </div>
                              {esRetiro && <span style={{ fontSize: 13, fontWeight: 700, color: GREEN_DARK }}>Gratis</span>}
                              {value === 'envio' && infoEnvio?.disponible && (
                                <span style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>
                                  {infoEnvio.gratis ? 'Gratis' : fmt(infoEnvio.precio)}
                                </span>
                              )}
                            </div>
                            <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4, marginLeft: 20 }}>{desc}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Dirección */}
                {tipoEnvio === 'envio' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, borderTop: '1px solid #f3f4f6', paddingTop: 16 }}>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: '#111', margin: 0 }}>Dirección de entrega</h3>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Calle *</label>
                      <input value={form.calle} onChange={e => setForm(p => ({ ...p, calle: e.target.value }))} placeholder="Av. Belgrano" style={inp(errores.calle)} />
                      {errores.calle && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errores.calle}</p>}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Número</label>
                        <input value={form.numero} onChange={e => setForm(p => ({ ...p, numero: e.target.value }))} placeholder="1234" style={inp()} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Piso / Depto</label>
                        <input value={form.piso} onChange={e => setForm(p => ({ ...p, piso: e.target.value }))} placeholder="3° B" style={inp()} />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ciudad *</label>
                        <input value={form.ciudad} onChange={e => setForm(p => ({ ...p, ciudad: e.target.value }))} placeholder="San Fernando del V. C." style={inp(errores.ciudad)} />
                        {errores.ciudad && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errores.ciudad}</p>}
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Provincia *</label>
                        <select value={form.provincia} onChange={e => setForm(p => ({ ...p, provincia: e.target.value }))} style={{ ...inp(errores.provincia), background: 'white' }}>
                          <option value="">Seleccioná</option>
                          {PROVINCIAS_AR.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                        {errores.provincia && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{errores.provincia}</p>}
                      </div>
                    </div>
                    {infoEnvio && (
                      <div style={{ borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'flex-start', gap: 8, background: infoEnvio.gratis ? '#f0fdf4' : '#eff6ff', border: `1px solid ${infoEnvio.gratis ? '#bbf7d0' : '#bfdbfe'}` }}>
                        <span style={{ fontSize: 16 }}>{infoEnvio.gratis ? '🎉' : '🚚'}</span>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: infoEnvio.gratis ? '#15803d' : '#1d4ed8', margin: 0 }}>
                            {infoEnvio.gratis ? `¡Envío gratis a ${infoEnvio.zona?.nombre}!` : `Envío a ${infoEnvio.zona?.nombre}: ${fmt(infoEnvio.precio)}`}
                          </p>
                          <p style={{ fontSize: 11, color: '#6b7280', margin: '2px 0 0' }}>{infoEnvio.diasMin}–{infoEnvio.diasMax} días hábiles</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Notas (opcional)</label>
                  <textarea value={form.notas} onChange={e => setForm(p => ({ ...p, notas: e.target.value }))} rows={2} placeholder="Aclaraciones, horario preferido..." style={{ ...inp(), resize: 'none' }} />
                </div>

                <button onClick={() => { if (validarPaso2()) setPaso(3); }} style={btnPrimario}>
                  Continuar al pago
                </button>
              </div>
            )}

            {/* PASO 3: Pago */}
            {paso === 3 && (
              <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e5e7eb', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

                {[
                  { label: 'Contacto', valor: form.email, pasoN: 1 },
                  { label: tipoEnvio?.startsWith('retiro') ? 'Retiro en local' : 'Envío a domicilio',
                    valor: tipoEnvio === 'retiro-rivadavia' ? 'Rivadavia 564, San Fernando'
                         : tipoEnvio === 'retiro-valleviejo' ? 'Av. Pte. Castillo 1165, Valle Viejo'
                         : `${form.calle} ${form.numero}, ${form.ciudad}`,
                    pasoN: 2 },
                ].map(({ label, valor, pasoN }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9f9f9', borderRadius: 10, padding: '10px 16px' }}>
                    <div>
                      <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>{label}</p>
                      <p style={{ fontSize: 13, fontWeight: 500, color: '#111', margin: 0 }}>{valor}</p>
                    </div>
                    <button onClick={() => setPaso(pasoN)} style={{ fontSize: 12, fontWeight: 600, color: GREEN, background: 'none', border: 'none', cursor: 'pointer' }}>Cambiar</button>
                  </div>
                ))}

                <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111', margin: 0 }}>Método de pago</h2>
                {errores.metodoPago && <p style={{ fontSize: 11, color: '#ef4444' }}>{errores.metodoPago}</p>}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {metodosPago.map(({ id, icon: Icon, label, desc }) => (
                    <label key={id} style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: 14,
                      border: `2px solid ${metodoPago === id ? GREEN : '#e5e7eb'}`,
                      borderRadius: 12, cursor: 'pointer',
                      background: metodoPago === id ? '#f0fdf4' : 'white',
                      transition: 'all 0.15s',
                    }}>
                      <input type="radio" name="pago" value={id} checked={metodoPago === id} onChange={() => setMetodoPago(id)} />
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon size={16} color="#6b7280" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{label}</span>
                        <p style={{ fontSize: 11, color: '#9ca3af', margin: '2px 0 0' }}>{desc}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {metodoPago === 'transferencia' && TRANSFERENCIA.cbu && (
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#15803d', margin: 0 }}>Datos para transferir</p>
                    {[
                      { label: 'Titular', value: TRANSFERENCIA.titular },
                      { label: 'Banco',   value: TRANSFERENCIA.banco },
                      { label: 'CBU',     value: TRANSFERENCIA.cbu,   campo: 'cbu'   },
                      { label: 'Alias',   value: TRANSFERENCIA.alias, campo: 'alias' },
                    ].map(({ label, value, campo }) => (
                      <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <div>
                          <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>{label}</p>
                          <p style={{ fontSize: 12, fontWeight: 700, color: '#111', margin: 0, fontFamily: 'monospace' }}>{value}</p>
                        </div>
                        {campo && (
                          <button onClick={() => copiar(campo)} style={{ flexShrink: 0, padding: '4px 10px', borderRadius: 6, border: '1px solid #86efac', fontSize: 11, fontWeight: 600, cursor: 'pointer', background: copiado === campo ? GREEN : 'white', color: copiado === campo ? 'white' : GREEN_DARK, transition: 'all 0.2s' }}>
                            {copiado === campo ? '✓ Copiado' : 'Copiar'}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {metodoPago === 'transferencia' && !TRANSFERENCIA.cbu && (
                  <div style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: 10, padding: '12px 14px' }}>
                    <p style={{ fontSize: 13, color: '#92400e', margin: 0 }}>Te enviaremos los datos bancarios por WhatsApp al confirmar el pedido.</p>
                  </div>
                )}

                {error && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 14px' }}>
                    <AlertCircle size={15} color="#ef4444" style={{ flexShrink: 0 }} />
                    <p style={{ fontSize: 13, color: '#dc2626', margin: 0 }}>{error}</p>
                  </div>
                )}

                <button onClick={confirmar} disabled={loading} style={{
                  ...btnPrimario,
                  background: loading ? '#9ca3af' : `linear-gradient(135deg, ${GREEN_DARK}, ${GREEN})`,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: loading ? 'none' : '0 4px 16px rgba(109,190,69,0.3)',
                }}>
                  {loading
                    ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Procesando...</>
                    : metodoPago === 'mercadopago' ? `Pagar con Mercado Pago · ${fmt(total)}` : `Confirmar pedido · ${fmt(total)}`
                  }
                </button>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

                <p style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', margin: 0 }}>
                  Al confirmar aceptás los términos y condiciones de compra.
                </p>
              </div>
            )}
          </div>

          {/* Resumen lateral */}
          <div style={{ position: 'sticky', top: 24, alignSelf: 'start' }}>
            <ResumenLateral cart={cart} subtotal={subtotal} costoEnvio={costoEnvio} total={total} tipoEnvio={tipoEnvio} infoEnvio={infoEnvio} />
          </div>
        </div>
      </div>
    </div>
  );
}