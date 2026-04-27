'use client';
// src/app/admin/pedidos/page.js

import { useState, useEffect, useCallback } from 'react';
import {
  ShoppingBag, Search, X, Loader2, Eye,
  RefreshCw, CheckCircle, AlertTriangle,
} from 'lucide-react';
import OcaPanel from '@/components/admin/OcaPanel';

const ESTADOS = {
  PENDIENTE:   { label: 'Pendiente',   color: '#f59e0b', bg: '#fef3c7', border: '#fde68a' },
  CONFIRMADO:  { label: 'Confirmado',  color: '#10b981', bg: '#f0fdf4', border: '#bbf7d0' },
  PREPARANDO:  { label: 'Preparando',  color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' },
  ENVIADO:     { label: 'Enviado',     color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe' },
  ENTREGADO:   { label: 'Entregado',   color: '#6DBE45', bg: '#f0fdf4', border: '#bbf7d0' },
  CANCELADO:   { label: 'Cancelado',   color: '#ef4444', bg: '#fff5f5', border: '#fecaca' },
};

const FLUJO = ['PENDIENTE', 'CONFIRMADO', 'PREPARANDO', 'ENVIADO', 'ENTREGADO'];

const METODOS = {
  mercadopago:   'Mercado Pago',
  transferencia: 'Transferencia',
  efectivo:      'Efectivo',
};

const TIPO_ENVIO = {
  'retiro-rivadavia':  'Retiro Rivadavia 564',
  'retiro-valleviejo': 'Retiro Valle Viejo',
  'envio':             'Envío a domicilio',
};

const fmt = (n) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency', currency: 'ARS', maximumFractionDigits: 0,
  }).format(n ?? 0);

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
      <span style={{ fontSize: 12, color: '#9ca3af', flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 600, color: '#111', textAlign: 'right' }}>{value}</span>
    </div>
  );
}

export default function AdminPedidosPage() {
  const [pedidos,       setPedidos]       = useState([]);
  const [stats,         setStats]         = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [busqueda,      setBusqueda]      = useState('');
  const [filtroEstado,  setFiltroEstado]  = useState('');
  const [page,          setPage]          = useState(1);
  const [pagination,    setPagination]    = useState(null);
  const [detalle,       setDetalle]       = useState(null);
  const [cambiando,     setCambiando]     = useState(false);
  const [sincronizando, setSincronizando] = useState(false);

  const fetchPedidos = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, pageSize: 20 });
      if (busqueda)    params.set('q',      busqueda);
      if (filtroEstado) params.set('estado', filtroEstado);
      const res  = await fetch(`/api/admin/pedidos?${params}`);
      const data = await res.json();
      setPedidos(data.pedidos ?? []);
      setStats(data.stats    ?? null);
      // Calcular paginación simple
      const total     = data.stats?.total ?? (data.pedidos?.length ?? 0);
      const pageSize  = 20;
      setPagination({ total, totalPages: Math.ceil(total / pageSize), page });
    } catch { setPedidos([]); }
    finally  { setLoading(false); }
  }, [page, busqueda, filtroEstado]);

  useEffect(() => { fetchPedidos(); }, [fetchPedidos]);

  async function cambiarEstado(pedidoId, nuevoEstado) {
    setCambiando(true);
    try {
      const res  = await fetch(`/api/admin/pedidos/${pedidoId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      const data = await res.json();
      if (data.ok) {
        setDetalle(prev => prev ? { ...prev, estado: nuevoEstado } : null);
        setPedidos(prev => prev.map(p => p.id === pedidoId ? { ...p, estado: nuevoEstado } : p));
      }
    } finally { setCambiando(false); }
  }

  async function sincronizarDevhub(pedidoId) {
    setSincronizando(true);
    try {
      const res  = await fetch(`/api/admin/pedidos/${pedidoId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forzarDevhub: true }),
      });
      const data = await res.json();
      if (data.ok) {
        setDetalle(prev => prev ? { ...prev, ventaDevhubId: data.ventaDevhubId } : null);
        setPedidos(prev => prev.map(p => p.id === pedidoId ? { ...p, ventaDevhubId: data.ventaDevhubId } : p));
        alert('Sincronizado con DevHub correctamente');
      } else {
        alert(`Error: ${data.error}`);
      }
    } finally { setSincronizando(false); }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 4px' }}>Pedidos</h1>
          <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>{stats?.total ?? 0} pedidos en total</p>
        </div>
        <button onClick={fetchPedidos} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'white', border: '1px solid #e5e7eb',
          padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
          cursor: 'pointer', color: '#6b7280', flexShrink: 0,
        }}>
          <RefreshCw size={13} /> Actualizar
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}
        className="pedidos-kpis">
        <style>{`
          @media(max-width:640px){ .pedidos-kpis { grid-template-columns: repeat(2,1fr) !important; } }
        `}</style>
        {[
          { label: 'Pendientes',  value: stats?.pendientes  ?? 0, color: '#f59e0b', bg: '#fef3c7' },
          { label: 'Confirmados', value: stats?.confirmados ?? 0, color: '#10b981', bg: '#f0fdf4' },
          { label: 'Enviados',    value: stats?.enviados    ?? 0, color: '#8b5cf6', bg: '#f5f3ff' },
          { label: 'Ingresos',    value: fmt(stats?.ingresos ?? 0), color: '#6DBE45', bg: '#f0fdf4' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
            <p style={{ fontSize: 22, fontWeight: 900, color, margin: '0 0 4px' }}>{value}</p>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9ca3af', margin: 0 }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: 14, marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ flex: 1, minWidth: 180, position: 'relative' }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            value={busqueda}
            onChange={e => { setBusqueda(e.target.value); setPage(1); }}
            placeholder="Buscar pedido, cliente o email..."
            style={{ width: '100%', padding: '9px 12px 9px 30px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <select
          value={filtroEstado}
          onChange={e => { setFiltroEstado(e.target.value); setPage(1); }}
          style={{ padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, background: 'white', outline: 'none', cursor: 'pointer' }}
        >
          <option value="">Todos los estados</option>
          {Object.entries(ESTADOS).map(([key, { label }]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        {(busqueda || filtroEstado) && (
          <button onClick={() => { setBusqueda(''); setFiltroEstado(''); setPage(1); }}
            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '9px 12px', border: '1px solid #e5e7eb', borderRadius: 8, background: 'transparent', fontSize: 13, cursor: 'pointer', color: '#9ca3af' }}>
            <X size={13} /> Limpiar
          </button>
        )}
      </div>

      {/* Tabla */}
      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <Loader2 size={28} style={{ color: '#d1d5db', animation: 'spin 1s linear infinite' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : pedidos.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <ShoppingBag size={40} color="#e5e7eb" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontSize: 14, color: '#9ca3af', margin: 0 }}>
              {busqueda || filtroEstado ? 'No hay resultados para los filtros aplicados.' : 'No hay pedidos todavía.'}
            </p>
          </div>
        ) : (
          <>
            {/* Tabla desktop */}
            <div style={{ overflowX: 'auto' }} className="hidden md:block">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 600 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                    {['Pedido', 'Cliente', 'Fecha', 'Total', 'Pago', 'Estado', 'DevHub', ''].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9ca3af' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pedidos.map(p => {
                    const est = ESTADOS[p.estado] ?? ESTADOS.PENDIENTE;
                    return (
                      <tr key={p.id} style={{ borderBottom: '1px solid #f9f9f9' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '12px 16px' }}>
                          <p style={{ fontWeight: 700, color: '#111', margin: 0 }}>#{p.id.slice(-8).toUpperCase()}</p>
                          <p style={{ fontSize: 11, color: '#9ca3af', margin: '2px 0 0' }}>
                            {TIPO_ENVIO[p.tipoEnvio] ?? p.tipoEnvio ?? '—'}
                          </p>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <p style={{ fontWeight: 600, color: '#111', margin: 0 }}>{p.compradorNombre ?? '—'}</p>
                          <p style={{ fontSize: 11, color: '#9ca3af', margin: '2px 0 0', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {p.compradorEmail ?? ''}
                          </p>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#9ca3af', fontSize: 12 }}>
                          {new Date(p.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 700, color: '#111' }}>
                          {fmt(p.total)}
                        </td>
                        <td style={{ padding: '12px 16px', color: '#9ca3af', fontSize: 12 }}>
                          {METODOS[p.metodoPago] ?? p.metodoPago ?? '—'}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 9999,
                            background: est.bg, color: est.color, border: `1px solid ${est.border}`,
                            whiteSpace: 'nowrap',
                          }}>
                            {est.label}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {p.ventaDevhubId ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#6DBE45', fontWeight: 600 }}>
                              <CheckCircle size={12} /> Sync
                            </span>
                          ) : ['CONFIRMADO', 'ENVIADO', 'ENTREGADO'].includes(p.estado) ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#f59e0b', fontWeight: 600 }}>
                              <AlertTriangle size={12} /> Pendiente
                            </span>
                          ) : (
                            <span style={{ fontSize: 11, color: '#d1d5db' }}>—</span>
                          )}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <button onClick={() => setDetalle(p)} style={{
                            display: 'flex', alignItems: 'center', gap: 4,
                            padding: '6px 10px', border: '1px solid #e5e7eb', borderRadius: 8,
                            background: 'transparent', cursor: 'pointer', fontSize: 12, color: '#6b7280',
                          }}>
                            <Eye size={12} /> Ver
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Cards móvil */}
            <div className="md:hidden">
              {pedidos.map(p => {
                const est = ESTADOS[p.estado] ?? ESTADOS.PENDIENTE;
                return (
                  <div key={p.id} style={{ padding: '14px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#111', margin: 0 }}>#{p.id.slice(-8).toUpperCase()}</p>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 9999, background: est.bg, color: est.color, border: `1px solid ${est.border}` }}>
                          {est.label}
                        </span>
                      </div>
                      <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>{p.compradorNombre ?? '—'}</p>
                      <p style={{ fontSize: 11, color: '#9ca3af', margin: '2px 0 0' }}>
                        {new Date(p.createdAt).toLocaleDateString('es-AR')} · {fmt(p.total)}
                      </p>
                    </div>
                    <button onClick={() => setDetalle(p)} style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      padding: '6px 12px', border: '1px solid #e5e7eb', borderRadius: 8,
                      background: 'transparent', cursor: 'pointer', fontSize: 12, color: '#6b7280', flexShrink: 0,
                    }}>
                      <Eye size={12} /> Ver
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Paginación */}
            {pagination && pagination.totalPages > 1 && (
              <div style={{ padding: '12px 16px', borderTop: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: '#9ca3af' }}>Página {page} de {pagination.totalPages}</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                    style={{ padding: '6px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1, background: 'transparent', color: '#6b7280' }}>
                    ← Anterior
                  </button>
                  <button disabled={page === pagination.totalPages} onClick={() => setPage(p => p + 1)}
                    style={{ padding: '6px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12, cursor: page === pagination.totalPages ? 'not-allowed' : 'pointer', opacity: page === pagination.totalPages ? 0.4 : 1, background: 'transparent', color: '#6b7280' }}>
                    Siguiente →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Modal detalle ── */}
      {detalle && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px 16px', overflowY: 'auto' }}
          onClick={() => setDetalle(null)}>
          <div style={{ background: 'white', borderRadius: 16, width: '100%', maxWidth: 520, boxShadow: '0 24px 48px rgba(0,0,0,0.2)', marginTop: 8 }}
            onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid #f3f4f6' }}>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 2px' }}>
                  Pedido #{detalle.id.slice(-8).toUpperCase()}
                </h2>
                <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>
                  {new Date(detalle.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <button onClick={() => setDetalle(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 20 }}>✕</button>
            </div>

            <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 18, maxHeight: '75vh', overflowY: 'auto' }}>

              {/* Flujo de estado */}
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9ca3af', marginBottom: 10 }}>Estado del pedido</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                  {FLUJO.map((est, i) => {
                    const info   = ESTADOS[est];
                    const actual = detalle.estado === est;
                    const pasado = FLUJO.indexOf(detalle.estado) > i;
                    return (
                      <button key={est} onClick={() => cambiarEstado(detalle.id, est)} disabled={cambiando}
                        style={{
                          fontSize: 11, fontWeight: 700, padding: '5px 12px', borderRadius: 8,
                          border: `1px solid ${actual ? info.border : '#e5e7eb'}`,
                          background: actual ? info.bg : pasado ? '#f9fafb' : 'white',
                          color: actual ? info.color : pasado ? '#d1d5db' : '#9ca3af',
                          cursor: 'pointer', transition: 'all 0.15s',
                        }}>
                        {info.label}
                      </button>
                    );
                  })}
                </div>
                {!['CANCELADO'].includes(detalle.estado) && (
                  <button onClick={() => cambiarEstado(detalle.id, 'CANCELADO')} disabled={cambiando}
                    style={{ fontSize: 11, padding: '5px 12px', border: '1px solid #fecaca', borderRadius: 8, background: 'transparent', color: '#ef4444', cursor: 'pointer' }}>
                    Cancelar pedido
                  </button>
                )}
              </div>

              {/* DevHub sync */}
              <div style={{
                padding: '12px 14px', borderRadius: 10,
                background: detalle.ventaDevhubId ? '#f0fdf4' : '#fef3c7',
                border: `1px solid ${detalle.ventaDevhubId ? '#bbf7d0' : '#fde68a'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {detalle.ventaDevhubId ? <CheckCircle size={14} color="#6DBE45" /> : <AlertTriangle size={14} color="#f59e0b" />}
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: detalle.ventaDevhubId ? '#15803d' : '#92400e', margin: 0 }}>
                      {detalle.ventaDevhubId ? 'Sincronizado con DevHub POS' : 'Sin sincronizar con DevHub'}
                    </p>
                    {detalle.ventaDevhubId && (
                      <p style={{ fontSize: 11, color: '#6b7280', margin: '2px 0 0' }}>
                        Venta ID: {detalle.ventaDevhubId.slice(-8).toUpperCase()}
                      </p>
                    )}
                  </div>
                </div>
                {!detalle.ventaDevhubId && detalle.items?.some(i => i.productoDevhubId) && (
                  <button onClick={() => sincronizarDevhub(detalle.id)} disabled={sincronizando}
                    style={{
                      fontSize: 11, fontWeight: 700, padding: '6px 12px', borderRadius: 8,
                      border: '1px solid #fde68a', background: 'white', color: '#92400e',
                      cursor: 'pointer', flexShrink: 0, opacity: sincronizando ? 0.6 : 1,
                    }}>
                    {sincronizando ? 'Sincronizando...' : 'Sincronizar ahora'}
                  </button>
                )}
              </div>

              {detalle.tipoEnvio === 'envio' && (
                <OcaPanel
                  pedido={detalle}
                  onActualizado={(cambios) => {
                    setDetalle(prev => ({ ...prev, ...cambios }));
                    setPedidos(prev => prev.map(p => p.id === detalle.id ? { ...p, ...cambios } : p));
                  }}
                />
              )}

              {/* Comprador */}
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9ca3af', marginBottom: 10 }}>Comprador</p>
                <div style={{ background: '#f9fafb', borderRadius: 10, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <InfoRow label="Nombre"   value={detalle.compradorNombre    ?? '—'} />
                  <InfoRow label="Email"    value={detalle.compradorEmail     ?? '—'} />
                  <InfoRow label="Teléfono" value={detalle.compradorTelefono  ?? '—'} />
                  <InfoRow label="Entrega"  value={TIPO_ENVIO[detalle.tipoEnvio] ?? detalle.tipoEnvio ?? '—'} />
                  <InfoRow label="Pago"     value={METODOS[detalle.metodoPago]   ?? detalle.metodoPago ?? '—'} />
                  {detalle.observaciones && <InfoRow label="Notas" value={detalle.observaciones} />}
                </div>
                {detalle.compradorTelefono && (
                  <a href={`https://wa.me/${detalle.compradorTelefono.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${detalle.compradorNombre ?? ''}! Te contactamos de JMR Marroquinería por tu pedido #${detalle.id.slice(-8).toUpperCase()}.`)}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 12, color: '#25D366', fontWeight: 700, textDecoration: 'none' }}>
                    📱 Contactar por WhatsApp →
                  </a>
                )}
              </div>

              {/* Productos */}
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9ca3af', marginBottom: 10 }}>Productos</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(detalle.items ?? []).map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#f9fafb', borderRadius: 10, padding: '10px 12px' }}>
                      {item.imagen && (
                        <img src={item.imagen} alt={item.nombre} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#111', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.nombre}</p>
                        {(item.talle || item.color) && (
                          <p style={{ fontSize: 11, color: '#9ca3af', margin: '2px 0 0' }}>
                            {[item.talle && `T: ${item.talle}`, item.color].filter(Boolean).join(' · ')}
                          </p>
                        )}
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>×{item.cantidad}</p>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#111', margin: '2px 0 0' }}>{fmt(item.subtotal)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totales */}
              <div style={{ background: '#f9fafb', borderRadius: 10, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <InfoRow label="Subtotal" value={fmt(detalle.subtotal)} />
                <InfoRow label="Envío"    value={detalle.costoEnvio === 0 ? 'Gratis' : fmt(detalle.costoEnvio)} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 14, borderTop: '1px solid #e5e7eb', paddingTop: 8, marginTop: 4 }}>
                  <span>Total</span>
                  <span style={{ color: '#6DBE45' }}>{fmt(detalle.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}