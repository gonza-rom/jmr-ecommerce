'use client';
// src/app/admin/productos/page.js
// Los productos vienen de DevHub POS (lectura).
// Desde acá se puede: buscar, filtrar, y togglear visibleCatalogo (visible en la tienda online).

import { useState, useEffect, useCallback } from 'react';
import {
  Search, Package, Eye, EyeOff, X, Loader2,
  AlertTriangle, RefreshCw, ExternalLink,
} from 'lucide-react';

const PAGE_SIZE = 20;

function formatPrecio(n) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency', currency: 'ARS', maximumFractionDigits: 0,
  }).format(n ?? 0);
}

export default function AdminProductosPage() {
  const [productos,  setProductos]  = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [toggling,   setToggling]   = useState(null); // id del producto que está siendo toggleado

  const [busqueda,    setBusqueda]    = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [soloVisible, setSoloVisible] = useState(false);
  const [page,        setPage]        = useState(1);

  const fetchProductos = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, pageSize: PAGE_SIZE });
      if (busqueda)    params.set('q',           busqueda);
      if (categoriaId) params.set('categoriaId', categoriaId);
      if (soloVisible) params.set('soloVisible', 'true');

      const res  = await fetch(`/api/admin/productos?${params}`);
      const data = await res.json();

      setProductos(data.productos ?? []);
      setPagination(data.pagination ?? null);
    } catch {
      setProductos([]);
    } finally {
      setLoading(false);
    }
  }, [page, busqueda, categoriaId, soloVisible]);

  useEffect(() => { fetchProductos(); }, [fetchProductos]);

  useEffect(() => {
    fetch('/api/admin/categorias-devhub')
      .then(r => r.json())
      .then(d => setCategorias(d.data ?? []))
      .catch(() => {});
  }, []);

  // Reset page cuando cambian los filtros
  useEffect(() => { setPage(1); }, [busqueda, categoriaId, soloVisible]);

  async function toggleVisible(producto) {
    setToggling(producto.id);
    try {
      const res = await fetch(`/api/admin/productos/${producto.id}/visible`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visibleCatalogo: !producto.visibleCatalogo }),
      });
      const data = await res.json();
      if (data.ok) {
        setProductos(prev =>
          prev.map(p => p.id === producto.id
            ? { ...p, visibleCatalogo: !p.visibleCatalogo }
            : p
          )
        );
      }
    } catch {
      alert('Error al actualizar visibilidad');
    } finally {
      setToggling(null);
    }
  }

  const visiblesCount = productos.filter(p => p.visibleCatalogo).length;

  return (
    <div>
      <style>{`
        @keyframes spin { from { transform: rotate(0) } to { transform: rotate(360deg) } }
        .prod-table-wrap { background:#fff; border:1px solid #e8e5e0; border-radius:12px; overflow:hidden; }
        .prod-table-scroll { overflow-x:auto; -webkit-overflow-scrolling:touch; }
        .prod-table { width:100%; border-collapse:collapse; font-size:13px; min-width:520px; }
        .toggle-btn { display:flex; align-items:center; gap:6px; padding:6px 10px; border-radius:8px; border:none; cursor:pointer; font-size:12px; font-weight:600; transition:all 0.15s; }
        .toggle-btn:disabled { opacity:0.5; cursor:not-allowed; }
        .toggle-visible { background:#f0fdf4; color:#15803d; border:1px solid #bbf7d0; }
        .toggle-visible:hover:not(:disabled) { background:#dcfce7; }
        .toggle-hidden  { background:#f5f4f2; color:#888; border:1px solid #e0dbd5; }
        .toggle-hidden:hover:not(:disabled)  { background:#e8e5e0; }
        .stock-badge { display:inline-flex; align-items:center; gap:3px; padding:3px 8px; border-radius:6px; font-size:11px; font-weight:600; white-space:nowrap; }
        .filter-chip { display:flex; align-items:center; gap:4px; padding:4px 10px; border-radius:9999px; font-size:11px; font-weight:600; border:none; cursor:pointer; transition:all 0.15s; }
        @media (max-width:600px) {
          .col-cat, .col-precio { display:none; }
        }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            Productos
          </h1>
          <p style={{ fontSize: 13, color: '#888', margin: 0 }}>
            Catálogo desde DevHub POS · {pagination?.total ?? 0} productos ·{' '}
            <span style={{ color: '#6DBE45', fontWeight: 600 }}>
              {pagination?.visibles ?? visiblesCount} visibles en tienda
            </span>
          </p>
        </div>
        <button
          onClick={fetchProductos}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'white', border: '1px solid #e5e7eb',
            padding: '8px 14px', borderRadius: 8,
            fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#6b7280',
          }}
        >
          <RefreshCw size={13} /> Actualizar
        </button>
      </div>

      {/* Aviso DevHub */}
      <div style={{
        background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10,
        padding: '10px 16px', marginBottom: 16,
        display: 'flex', alignItems: 'center', gap: 10, fontSize: 13,
      }}>
        <ExternalLink size={14} color="#3b82f6" style={{ flexShrink: 0 }} />
        <p style={{ margin: 0, color: '#1d4ed8' }}>
          Los productos se gestionan en <strong>DevHub POS</strong>. Desde acá solo podés activar/desactivar su visibilidad en la tienda online.
        </p>
      </div>

      {/* Filtros */}
      <div style={{
        background: 'white', border: '1px solid #e8e5e0', borderRadius: 12,
        padding: 14, marginBottom: 16,
        display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center',
      }}>
        {/* Búsqueda */}
        <div style={{ flex: 1, minWidth: 160, position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
          <input
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o código..."
            style={{
              width: '100%', padding: '9px 12px 9px 32px',
              border: '1px solid #e0dbd5', borderRadius: 8,
              fontSize: 13, outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Categoría */}
        <select
          value={categoriaId}
          onChange={e => setCategoriaId(e.target.value)}
          style={{
            padding: '9px 12px', border: '1px solid #e0dbd5',
            borderRadius: 8, fontSize: 13, background: 'white',
            outline: 'none', cursor: 'pointer',
          }}
        >
          <option value="">Todas las categorías</option>
          {categorias.map(c => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>

        {/* Chip: solo visibles */}
        <button
          onClick={() => setSoloVisible(v => !v)}
          className="filter-chip"
          style={{
            background: soloVisible ? '#6DBE45' : '#f5f4f2',
            color:      soloVisible ? 'white'   : '#555',
            border:     soloVisible ? '1px solid #6DBE45' : '1px solid #e0dbd5',
          }}
        >
          <Eye size={12} /> Solo visibles
        </button>

        {/* Limpiar */}
        {(busqueda || categoriaId || soloVisible) && (
          <button
            onClick={() => { setBusqueda(''); setCategoriaId(''); setSoloVisible(false); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '9px 12px', border: '1px solid #e0dbd5',
              borderRadius: 8, background: 'transparent',
              fontSize: 13, cursor: 'pointer', color: '#888',
            }}
          >
            <X size={13} /> Limpiar
          </button>
        )}
      </div>

      {/* Tabla */}
      <div className="prod-table-wrap">
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <Loader2 size={28} style={{ color: '#ccc', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : productos.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <Package size={40} color="#ddd" style={{ marginBottom: 12 }} />
            <p style={{ fontSize: 14, color: '#aaa', margin: 0 }}>
              {busqueda || categoriaId ? 'No hay resultados.' : 'No hay productos en DevHub.'}
            </p>
          </div>
        ) : (
          <>
            <div className="prod-table-scroll">
              <table className="prod-table">
                <thead>
                  <tr style={{ borderBottom: '1px solid #f0ede8' }}>
                    <th style={thStyle('left')}>Producto</th>
                    <th className="col-cat"  style={thStyle('left')}>Categoría</th>
                    <th className="col-precio" style={thStyle('right')}>Precio</th>
                    <th style={thStyle('right')}>Stock</th>
                    <th style={thStyle('center')}>Tienda online</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map((p, i) => {
                    const stockBajo = p.stock <= (p.stockMinimo ?? 5) && p.stock > 0;
                    const sinStock  = p.stock === 0;
                    return (
                      <tr
                        key={p.id}
                        style={{ borderBottom: i < productos.length - 1 ? '1px solid #f7f4f0' : 'none' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#fafaf8'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        {/* Nombre */}
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {p.imagen ? (
                              <img
                                src={p.imagen.replace('/upload/', '/upload/f_auto,q_auto,w_80/')}
                                alt={p.nombre}
                                style={{
                                  width: 36, height: 36, borderRadius: 8,
                                  objectFit: 'cover', border: '1px solid #f0ede8', flexShrink: 0,
                                }}
                              />
                            ) : (
                              <div style={{
                                width: 36, height: 36, borderRadius: 8,
                                background: '#f5f4f2', border: '1px solid #e8e5e0',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                              }}>
                                <Package size={14} color="#ccc" />
                              </div>
                            )}
                            <div style={{ minWidth: 0 }}>
                              <p style={{
                                fontWeight: 600, color: '#111', margin: 0,
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200,
                              }}>
                                {p.nombre}
                              </p>
                              {p.codigoProducto && (
                                <p style={{ fontSize: 11, color: '#aaa', margin: '2px 0 0' }}>
                                  {p.codigoProducto}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Categoría */}
                        <td className="col-cat" style={{ padding: '12px 16px', fontSize: 12, color: '#6b7280' }}>
                          {p.categoria?.nombre ?? '—'}
                        </td>

                        {/* Precio */}
                        <td className="col-precio" style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: '#111' }}>
                          {formatPrecio(p.precio)}
                        </td>

                        {/* Stock */}
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <span className="stock-badge" style={{
                            background: sinStock  ? '#fff5f5' : stockBajo ? '#fffbeb' : '#f0fdf4',
                            color:      sinStock  ? '#ef4444' : stockBajo ? '#d97706' : '#16a34a',
                            border:     `1px solid ${sinStock ? '#fecaca' : stockBajo ? '#fde68a' : '#bbf7d0'}`,
                          }}>
                            {sinStock  && <AlertTriangle size={10} />}
                            {stockBajo && !sinStock && <AlertTriangle size={10} />}
                            {p.stock} u.
                          </span>
                        </td>

                        {/* Toggle visibilidad */}
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <button
                            className={`toggle-btn ${p.visibleCatalogo ? 'toggle-visible' : 'toggle-hidden'}`}
                            onClick={() => toggleVisible(p)}
                            disabled={toggling === p.id}
                            title={p.visibleCatalogo ? 'Visible en tienda — click para ocultar' : 'Oculto en tienda — click para mostrar'}
                          >
                            {toggling === p.id ? (
                              <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                            ) : p.visibleCatalogo ? (
                              <Eye size={13} />
                            ) : (
                              <EyeOff size={13} />
                            )}
                            {p.visibleCatalogo ? 'Visible' : 'Oculto'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {pagination && pagination.totalPages > 1 && (
              <div style={{
                padding: '12px 16px', borderTop: '1px solid #f0ede8',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
              }}>
                <span style={{ fontSize: 12, color: '#888' }}>
                  {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, pagination.total)} de {pagination.total}
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    style={navBtn(page === 1)}
                  >
                    ← Anterior
                  </button>
                  <button
                    disabled={page === pagination.totalPages}
                    onClick={() => setPage(p => p + 1)}
                    style={navBtn(page === pagination.totalPages)}
                  >
                    Siguiente →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function thStyle(align) {
  return {
    padding: '12px 16px', textAlign: align,
    fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
    textTransform: 'uppercase', color: '#aaa',
  };
}

function navBtn(disabled) {
  return {
    padding: '6px 12px', border: '1px solid #e5e7eb', borderRadius: 8,
    fontSize: 12, cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.4 : 1, background: 'transparent', color: '#6b7280',
  };
}