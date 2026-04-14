'use client';
// src/app/mis-pedidos/page.js
// Página pública — el cliente ingresa su email y ve sus pedidos sin necesidad de cuenta.

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { Search, Package, MessageCircle, ArrowLeft, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

const GREEN      = '#2d6a4f';
const GREEN_LIGHT = '#6DBE45';

const ESTADOS = {
  PENDIENTE:   { label: 'Pendiente',     color: '#92400e', bg: '#fef3c7', border: '#fde68a' },
  CONFIRMADO:  { label: 'Confirmado',    color: '#1e40af', bg: '#eff6ff', border: '#bfdbfe' },
  PREPARANDO:  { label: 'Preparando',    color: '#5b21b6', bg: '#f5f3ff', border: '#ddd6fe' },
  ENVIADO:     { label: 'En camino',     color: '#9a3412', bg: '#fff7ed', border: '#fed7aa' },
  ENTREGADO:   { label: 'Entregado',     color: '#14532d', bg: '#f0fdf4', border: '#bbf7d0' },
  CANCELADO:   { label: 'Cancelado',     color: '#7f1d1d', bg: '#fef2f2', border: '#fecaca' },
};

const TIPO_ENVIO = {
  'retiro-rivadavia':  'Retiro en Rivadavia 564',
  'retiro-valleviejo': 'Retiro en Valle Viejo',
  'envio':             'Envío a domicilio',
};

const METODOS = {
  mercadopago:   'Mercado Pago',
  transferencia: 'Transferencia bancaria',
  efectivo:      'Efectivo',
};

// Timeline de estados
const FLUJO = ['PENDIENTE', 'CONFIRMADO', 'PREPARANDO', 'ENVIADO', 'ENTREGADO'];

const fmt = (n) => new Intl.NumberFormat('es-AR', {
  style: 'currency', currency: 'ARS', minimumFractionDigits: 0,
}).format(n ?? 0);

function EstadoBadge({ estado }) {
  const e = ESTADOS[estado] ?? ESTADOS.PENDIENTE;
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 9999,
      background: e.bg, color: e.color, border: `1px solid ${e.border}`,
      textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap',
    }}>
      {e.label}
    </span>
  );
}

function Timeline({ estado }) {
  const actual = FLUJO.indexOf(estado);
  if (estado === 'CANCELADO') return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 0' }}>
      <span style={{ fontSize: 16 }}>❌</span>
      <span style={{ fontSize: 12, color: '#ef4444', fontWeight: 600 }}>Pedido cancelado</span>
    </div>
  );

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginTop: 4 }}>
      {FLUJO.map((est, i) => {
        const hecho  = actual > i;
        const activo = actual === i;
        const info   = ESTADOS[est];
        return (
          <div key={est} style={{ display: 'flex', alignItems: 'center', flex: i < FLUJO.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 700,
                background: hecho ? GREEN_LIGHT : activo ? GREEN : '#e5e7eb',
                color: hecho || activo ? 'white' : '#9ca3af',
                border: `2px solid ${hecho ? GREEN_LIGHT : activo ? GREEN : '#e5e7eb'}`,
              }}>
                {hecho ? '✓' : i + 1}
              </div>
              <span style={{
                fontSize: 9, fontWeight: 600, color: activo ? GREEN : hecho ? '#6b7280' : '#d1d5db',
                whiteSpace: 'nowrap', letterSpacing: '0.03em',
              }}>
                {info.label}
              </span>
            </div>
            {i < FLUJO.length - 1 && (
              <div style={{
                flex: 1, height: 2, margin: '0 4px', marginBottom: 16,
                background: hecho ? GREEN_LIGHT : '#e5e7eb',
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function TarjetaPedido({ pedido }) {
  const [expandido, setExpandido] = useState(false);

  const waText = encodeURIComponent(
    `Hola! Quería consultar por mi pedido #${pedido.id.slice(-8).toUpperCase()} en Marroquinería JMR.`
  );

  return (
    <div style={{
      background: 'white', border: '1px solid #e8e5e0',
      borderRadius: 14, overflow: 'hidden',
    }}>
      {/* Header del pedido */}
      <div style={{ padding: '16px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 800, color: '#1a1a1a', margin: '0 0 2px', letterSpacing: '0.02em' }}>
              Pedido #{pedido.id.slice(-8).toUpperCase()}
            </p>
            <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>
              {new Date(pedido.createdAt).toLocaleDateString('es-AR', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            <EstadoBadge estado={pedido.estado} />
            <p style={{ fontSize: 15, fontWeight: 800, color: GREEN, margin: 0 }}>
              {fmt(pedido.total)}
            </p>
          </div>
        </div>

        {/* Timeline */}
        <Timeline estado={pedido.estado} />

        {/* Info rápida */}
        <div style={{ display: 'flex', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, color: '#6b7280', background: '#f5f4f0', padding: '3px 8px', borderRadius: 6 }}>
            {TIPO_ENVIO[pedido.tipoEnvio] ?? pedido.tipoEnvio ?? '—'}
          </span>
          <span style={{ fontSize: 11, color: '#6b7280', background: '#f5f4f0', padding: '3px 8px', borderRadius: 6 }}>
            {METODOS[pedido.metodoPago] ?? pedido.metodoPago ?? '—'}
          </span>
        </div>
      </div>

      {/* Expandir items */}
      <button
        onClick={() => setExpandido(!expandido)}
        style={{
          width: '100%', padding: '10px 18px',
          background: '#f9f8f6', border: 'none', borderTop: '1px solid #f0ede8',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#6b7280',
        }}
      >
        <span>{pedido.items?.length ?? 0} producto{pedido.items?.length !== 1 ? 's' : ''}</span>
        {expandido ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {/* Items expandidos */}
      {expandido && (
        <div style={{ padding: '12px 18px', borderTop: '1px solid #f0ede8', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {pedido.items?.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {item.imagen
                ? <img src={item.imagen} alt={item.nombre} style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', flexShrink: 0, border: '1px solid #e8e5e0' }} />
                : <div style={{ width: 44, height: 44, borderRadius: 8, background: '#f5f4f0', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Package size={16} color="#ccc" />
                  </div>
              }
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.nombre}
                </p>
                {(item.talle || item.color) && (
                  <p style={{ fontSize: 11, color: '#9ca3af', margin: '2px 0 0' }}>
                    {[item.talle && `T: ${item.talle}`, item.color].filter(Boolean).join(' · ')}
                  </p>
                )}
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>×{item.cantidad}</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', margin: '2px 0 0' }}>{fmt(item.subtotal)}</p>
              </div>
            </div>
          ))}

          {/* Totales */}
          <div style={{ borderTop: '1px solid #f0ede8', paddingTop: 10, marginTop: 2, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#9ca3af' }}>
              <span>Subtotal</span><span>{fmt(pedido.subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#9ca3af' }}>
              <span>Envío</span>
              <span style={{ color: pedido.costoEnvio === 0 ? GREEN : '#9ca3af', fontWeight: pedido.costoEnvio === 0 ? 600 : 400 }}>
                {pedido.costoEnvio === 0 ? 'Gratis' : fmt(pedido.costoEnvio)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 800, color: '#1a1a1a', paddingTop: 6, borderTop: '1px solid #f0ede8' }}>
              <span>Total</span>
              <span style={{ color: GREEN }}>{fmt(pedido.total)}</span>
            </div>
          </div>

          {/* WhatsApp */}
          <a
            href={`https://wa.me/543834927252?text=${waText}`}
            target="_blank" rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '10px', borderRadius: 8, marginTop: 4,
              background: '#f0fdf4', border: '1px solid #bbf7d0',
              color: '#15803d', fontSize: 12, fontWeight: 700, textDecoration: 'none',
            }}
          >
            <MessageCircle size={14} /> Consultar por WhatsApp
          </a>
        </div>
      )}
    </div>
  );
}

export default function MisPedidosPage() {
  const [email,    setEmail]    = useState('');
  const [pedidos,  setPedidos]  = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [buscado,  setBuscado]  = useState('');

  async function buscar(e) {
    e.preventDefault();
    setError('');

    const emailTrim = email.trim().toLowerCase();
    if (!emailTrim || !/\S+@\S+\.\S+/.test(emailTrim)) {
      setError('Ingresá un email válido');
      return;
    }

    setLoading(true);
    try {
      const res  = await fetch(`/api/mis-pedidos?email=${encodeURIComponent(emailTrim)}`);
      const data = await res.json();

      if (res.status === 429) {
        setError('Demasiadas consultas. Esperá un momento e intentá de nuevo.');
        return;
      }
      if (!res.ok) {
        setError(data.error ?? 'Error al consultar');
        return;
      }

      setPedidos(data.pedidos ?? []);
      setBuscado(emailTrim);
    } catch {
      setError('Error de conexión. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f4f0', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '32px 16px' }}>

        {/* Volver */}
        <Link href="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 13, color: '#6b7280', textDecoration: 'none', marginBottom: 24,
        }}>
          <ArrowLeft size={14} /> Volver al inicio
        </Link>

        {/* Título */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#1a1a1a', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            Seguí tu pedido
          </h1>
          <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>
            Ingresá el email con el que hiciste tu compra para ver el estado de tus pedidos.
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={buscar} style={{
          background: 'white', border: '1px solid #e8e5e0',
          borderRadius: 14, padding: '20px', marginBottom: 24,
        }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#555', marginBottom: 6 }}>
            Tu email de compra
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com"
              autoComplete="email"
              style={{
                flex: 1, padding: '10px 12px',
                border: `1px solid ${error ? '#fca5a5' : '#e0dbd5'}`,
                borderRadius: 8, fontSize: 14, outline: 'none',
                color: '#1a1a1a', background: '#fff', boxSizing: 'border-box',
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 18px', border: 'none', borderRadius: 8,
                background: loading ? '#9ca3af' : GREEN,
                color: 'white', fontSize: 13, fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
              }}
            >
              {loading
                ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
                : <Search size={15} />}
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
          {error && <p style={{ fontSize: 12, color: '#ef4444', marginTop: 8, marginBottom: 0 }}>{error}</p>}

          {/* Link a cuenta */}
          <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 12, marginBottom: 0 }}>
            ¿Tenés cuenta?{' '}
            <Link href="/cuenta" style={{ color: GREEN, fontWeight: 700, textDecoration: 'none' }}>
              Ver mis pedidos desde mi cuenta
            </Link>
          </p>
        </form>

        {/* Resultados */}
        {pedidos !== null && (
          <div>
            {pedidos.length === 0 ? (
              <div style={{
                background: 'white', border: '1px solid #e8e5e0',
                borderRadius: 14, padding: '40px 24px', textAlign: 'center',
              }}>
                <Package size={40} color="#e5e7eb" style={{ margin: '0 auto 12px', display: 'block' }} />
                <p style={{ fontSize: 14, fontWeight: 700, color: '#6b7280', margin: '0 0 4px' }}>
                  No encontramos pedidos
                </p>
                <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 20px' }}>
                  No hay pedidos asociados a <strong>{buscado}</strong>
                </p>
                <a
                  href={`https://wa.me/543834927252?text=${encodeURIComponent('Hola! Quería consultar sobre mi pedido en Marroquinería JMR.')}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '10px 18px', borderRadius: 8,
                    background: '#25D366', color: 'white',
                    fontSize: 13, fontWeight: 700, textDecoration: 'none',
                  }}
                >
                  <MessageCircle size={14} /> Contactar por WhatsApp
                </a>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 14 }}>
                  {pedidos.length} pedido{pedidos.length !== 1 ? 's' : ''} encontrado{pedidos.length !== 1 ? 's' : ''} para <strong style={{ color: '#1a1a1a' }}>{buscado}</strong>
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {pedidos.map(pedido => (
                    <TarjetaPedido key={pedido.id} pedido={pedido} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}