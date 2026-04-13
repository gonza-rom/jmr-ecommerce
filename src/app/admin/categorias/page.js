'use client';
// src/app/admin/categorias/page.js

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Tag, Loader2, ChevronRight, FolderOpen, ExternalLink } from 'lucide-react';

export default function AdminCategoriasPage() {
  const [categorias, setCategorias] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [modal,      setModal]      = useState(null);
  const [form,       setForm]       = useState({ nombre: '', descripcion: '', parentId: '' });
  const [guardando,  setGuardando]  = useState(false);
  const [error,      setError]      = useState('');
  const [confirmDel, setConfirmDel] = useState(null);

  useEffect(() => { fetchCategorias(); }, []);

  async function fetchCategorias() {
    setLoading(true);
    try {
      const res  = await fetch('/api/admin/categorias');
      const data = await res.json();
      setCategorias(data.data ?? []);
    } catch { setCategorias([]); }
    finally  { setLoading(false); }
  }

  function abrirNuevo(parentId = '') {
    setForm({ nombre: '', descripcion: '', parentId });
    setError('');
    setModal('nuevo');
  }

  function abrirEditar(cat) {
    setForm({
      nombre:      cat.nombre,
      descripcion: cat.descripcion ?? '',
      parentId:    cat.parentId    ?? '',
    });
    setError('');
    setModal(cat);
  }

  async function guardar() {
    if (!form.nombre.trim()) { setError('El nombre es requerido'); return; }
    setGuardando(true); setError('');
    try {
      const esEdicion = modal !== 'nuevo';
      const res = await fetch(
        esEdicion ? `/api/admin/categorias/${modal.id}` : '/api/admin/categorias',
        {
          method:  esEdicion ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ ...form, parentId: form.parentId || null }),
        }
      );
      const data = await res.json();
      if (!data.ok) { setError(data.error ?? 'Error al guardar'); return; }
      setModal(null);
      fetchCategorias();
    } catch { setError('Error de conexión'); }
    finally  { setGuardando(false); }
  }

  async function eliminar(id) {
    try {
      await fetch(`/api/admin/categorias/${id}`, { method: 'DELETE' });
      setConfirmDel(null);
      fetchCategorias();
    } catch { alert('Error al eliminar'); }
  }

  const totalProductos = categorias.reduce((a, c) => a + (c._count?.productos ?? 0) + (c.hijos ?? []).reduce((b, h) => b + (h._count?.productos ?? 0), 0), 0);
  const totalSubs      = categorias.reduce((a, c) => a + (c.hijos?.length ?? 0), 0);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 4px' }}>Categorías</h1>
          <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>
            {categorias.length} categorías · {totalSubs} subcategorías · {totalProductos} productos
          </p>
        </div>
        <button onClick={() => abrirNuevo()} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#6DBE45', color: 'white', border: 'none',
          padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
          flexShrink: 0,
        }}>
          <Plus size={14} /> Nueva categoría
        </button>
      </div>

      {/* Aviso DevHub */}
      <div style={{
        background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10,
        padding: '12px 16px', marginBottom: 20,
        display: 'flex', alignItems: 'flex-start', gap: 10,
      }}>
        <ExternalLink size={15} color="#3b82f6" style={{ flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: 13, color: '#1d4ed8', margin: 0 }}>
          Las categorías aquí creadas son de uso interno (filtros del catálogo online).
          Las categorías de productos se gestionan desde{' '}
          <strong>DevHub POS</strong>. Asegurate de que los nombres coincidan para filtrar correctamente.
        </p>
      </div>

      {/* Lista */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {loading ? (
          <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: 48, textAlign: 'center' }}>
            <Loader2 size={28} style={{ color: '#d1d5db', animation: 'spin 1s linear infinite' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : categorias.length === 0 ? (
          <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: 48, textAlign: 'center' }}>
            <Tag size={40} color="#e5e7eb" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontSize: 14, color: '#9ca3af', margin: 0 }}>No hay categorías. Creá la primera.</p>
          </div>
        ) : (
          categorias.map(cat => (
            <div key={cat.id} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>

              {/* Categoría raíz */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FolderOpen size={15} color="#6DBE45" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#111', margin: 0 }}>{cat.nombre}</p>
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>
                      {cat._count?.productos ?? 0} productos
                      {cat.hijos?.length > 0 && ` · ${cat.hijos.length} subcategorías`}
                    </span>
                  </div>
                  {cat.descripcion && (
                    <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {cat.descripcion}
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <button onClick={() => abrirNuevo(cat.id)} style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '6px 10px', border: '1px solid #e5e7eb', borderRadius: 8,
                    background: 'transparent', cursor: 'pointer', fontSize: 12, color: '#6b7280',
                  }}>
                    <Plus size={11} /> Sub
                  </button>
                  <button onClick={() => abrirEditar(cat)} style={{ padding: '6px 8px', border: '1px solid #e5e7eb', borderRadius: 8, background: 'transparent', cursor: 'pointer', color: '#6b7280' }}>
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => setConfirmDel(cat)} style={{ padding: '6px 8px', border: '1px solid #fecaca', borderRadius: 8, background: 'transparent', cursor: 'pointer', color: '#ef4444' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Subcategorías */}
              {cat.hijos?.length > 0 && (
                <div style={{ borderTop: '1px solid #f3f4f6' }}>
                  {cat.hijos.map((hijo, i) => (
                    <div key={hijo.id} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 18px', background: '#f9fafb',
                      borderBottom: i < cat.hijos.length - 1 ? '1px solid #f3f4f6' : 'none',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 16, flexShrink: 0 }}>
                        <ChevronRight size={12} color="#d1d5db" />
                        <Tag size={13} color="#9ca3af" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <p style={{ fontSize: 13, fontWeight: 500, color: '#374151', margin: 0 }}>{hijo.nombre}</p>
                          <span style={{ fontSize: 11, color: '#9ca3af' }}>{hijo._count?.productos ?? 0} productos</span>
                        </div>
                        {hijo.descripcion && (
                          <p style={{ fontSize: 11, color: '#9ca3af', margin: '2px 0 0' }}>{hijo.descripcion}</p>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        <button onClick={() => abrirEditar({ ...hijo, parentId: cat.id })} style={{ padding: '5px 8px', border: '1px solid #e5e7eb', borderRadius: 8, background: 'transparent', cursor: 'pointer', color: '#6b7280' }}>
                          <Pencil size={12} />
                        </button>
                        <button onClick={() => setConfirmDel(hijo)} style={{ padding: '5px 8px', border: '1px solid #fecaca', borderRadius: 8, background: 'transparent', cursor: 'pointer', color: '#ef4444' }}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* ── Modal crear/editar ── */}
      {modal !== null && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.6)' }}
          onClick={() => !guardando && setModal(null)}>
          <div style={{ background: 'white', borderRadius: 16, width: '100%', maxWidth: 440, boxShadow: '0 24px 48px rgba(0,0,0,0.2)' }}
            onClick={e => e.stopPropagation()}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid #f3f4f6' }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>
                {modal === 'nuevo'
                  ? form.parentId ? 'Nueva subcategoría' : 'Nueva categoría'
                  : `Editar: ${modal.nombre}`}
              </h2>
              <button onClick={() => !guardando && setModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 6 }}>Nombre *</label>
                <input
                  autoFocus
                  value={form.nombre}
                  onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
                  placeholder="Ej: Mochilas"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 6 }}>Descripción</label>
                <textarea
                  value={form.descripcion}
                  onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
                  rows={2}
                  placeholder="Descripción opcional..."
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', resize: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 6 }}>
                  Categoría padre <span style={{ fontWeight: 400, color: '#9ca3af' }}>(opcional)</span>
                </label>
                <select
                  value={form.parentId}
                  onChange={e => setForm(p => ({ ...p, parentId: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', background: 'white', boxSizing: 'border-box' }}
                >
                  <option value="">— Categoría raíz —</option>
                  {categorias
                    .filter(c => modal === 'nuevo' || c.id !== modal.id)
                    .map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)
                  }
                </select>
              </div>

              {error && <p style={{ fontSize: 13, color: '#ef4444', margin: 0 }}>{error}</p>}
            </div>

            <div style={{ display: 'flex', gap: 10, padding: '14px 22px', borderTop: '1px solid #f3f4f6' }}>
              <button onClick={() => !guardando && setModal(null)} disabled={guardando}
                style={{ flex: 1, padding: '10px', border: '1px solid #e5e7eb', borderRadius: 8, background: 'transparent', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#555' }}>
                Cancelar
              </button>
              <button onClick={guardar} disabled={guardando}
                style={{ flex: 1, padding: '10px', border: 'none', borderRadius: 8, background: '#6DBE45', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: guardando ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                {guardando && <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />}
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal confirmar eliminar ── */}
      {confirmDel && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setConfirmDel(null)}>
          <div style={{ background: 'white', borderRadius: 16, width: '100%', maxWidth: 360, padding: 28, textAlign: 'center', boxShadow: '0 24px 48px rgba(0,0,0,0.2)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fff5f5', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Trash2 size={20} color="#ef4444" />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px' }}>¿Eliminar categoría?</h3>
            <p style={{ fontSize: 13, color: '#9ca3af', margin: '0 0 6px' }}>
              Vas a eliminar <strong>{confirmDel.nombre}</strong>.
            </p>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 24px' }}>
              Los productos quedarán sin categoría y las subcategorías pasarán a ser raíz.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmDel(null)}
                style={{ flex: 1, padding: '10px', border: '1px solid #e5e7eb', borderRadius: 8, background: 'transparent', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#555' }}>
                Cancelar
              </button>
              <button onClick={() => eliminar(confirmDel.id)}
                style={{ flex: 1, padding: '10px', border: 'none', borderRadius: 8, background: '#ef4444', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}