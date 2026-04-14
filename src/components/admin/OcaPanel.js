// src/components/admin/OcaPanel.js
// Panel OCA dentro del modal de detalle de pedido en /admin/pedidos
// Permite generar el envío, ver el tracking y descargar la etiqueta.

'use client';

import { useState } from 'react';
import {
  Truck, Package, ExternalLink, RefreshCw,
  CheckCircle, AlertTriangle, Loader2, ChevronDown, ChevronUp,
} from 'lucide-react';

const OCA_ESTADO_LABELS = {
  EN_CAMINO:      { label: 'En camino',       color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' },
  EN_SUCURSAL:    { label: 'En sucursal OCA',  color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe' },
  ENTREGADO:      { label: 'Entregado',        color: '#6DBE45', bg: '#f0fdf4', border: '#bbf7d0' },
  DEVUELTO:       { label: 'Devuelto',         color: '#ef4444', bg: '#fff5f5', border: '#fecaca' },
  SIN_MOVIMIENTO: { label: 'Sin movimiento',   color: '#f59e0b', bg: '#fef3c7', border: '#fde68a' },
};

export default function OcaPanel({ pedido, onActualizado }) {
  const [generando,      setGenerando]      = useState(false);
  const [actualizando,   setActualizando]   = useState(false);
  const [errMsg,         setErrMsg]         = useState('');
  const [eventos,        setEventos]        = useState(null);
  const [mostrarEventos, setMostrarEventos] = useState(false);

  // Datos del paquete (el admin puede ajustarlos antes de generar)
  const [peso,  setPeso]  = useState('1');
  const [alto,  setAlto]  = useState('20');
  const [ancho, setAncho] = useState('30');
  const [largo, setLargo] = useState('40');

  const tieneEnvio  = !!pedido.ocaNumeroEnvio;
  const estadoInfo  = OCA_ESTADO_LABELS[pedido.ocaEstado] ?? OCA_ESTADO_LABELS.EN_CAMINO;

  // ── Generar envío ──────────────────────────────────────────────────────────
  async function generarEnvio() {
    setGenerando(true);
    setErrMsg('');
    try {
      const res  = await fetch('/api/oca/envios', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          pedidoId: pedido.id,
          peso:     parseFloat(peso)  || 1,
          alto:     parseFloat(alto)  || 20,
          ancho:    parseFloat(ancho) || 30,
          largo:    parseFloat(largo) || 40,
        }),
      });
      const data = await res.json();
      if (!data.ok) { setErrMsg(data.error ?? 'Error al generar envío'); return; }
      onActualizado?.({ ocaNumeroEnvio: data.numeroEnvio, ocaEtiquetaUrl: data.etiquetaUrl, ocaEstado: 'EN_CAMINO', estado: 'ENVIADO' });
    } finally {
      setGenerando(false);
    }
  }

  // ── Actualizar tracking ────────────────────────────────────────────────────
  async function actualizarTracking() {
    if (!pedido.ocaNumeroEnvio) return;
    setActualizando(true);
    setErrMsg('');
    try {
      const res  = await fetch(`/api/oca/tracking/${pedido.ocaNumeroEnvio}`);
      const data = await res.json();
      if (!data.ok) { setErrMsg(data.error ?? 'Error al consultar tracking'); return; }
      setEventos(data.eventos ?? []);
      setMostrarEventos(true);
      onActualizado?.({ ocaEstado: data.estado });
    } finally {
      setActualizando(false);
    }
  }

  const inp = {
    width: '100%', padding: '7px 10px',
    border: '1px solid #e5e7eb', borderRadius: 6,
    fontSize: 13, outline: 'none',
    boxSizing: 'border-box', textAlign: 'center',
  };

  return (
    <div style={{
      border:       `1px solid ${tieneEnvio ? '#bbf7d0' : '#e5e7eb'}`,
      borderRadius: 12,
      background:   tieneEnvio ? '#f0fdf4' : '#f9fafb',
      overflow:     'hidden',
    }}>
      {/* Header */}
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: tieneEnvio ? '#6DBE45' : '#e5e7eb',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Truck size={15} color={tieneEnvio ? 'white' : '#9ca3af'} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#111', margin: 0 }}>
            {tieneEnvio ? `OCA — Nº ${pedido.ocaNumeroEnvio}` : 'OCA — Sin despacho'}
          </p>
          {pedido.ocaFechaDespacho && (
            <p style={{ fontSize: 11, color: '#6b7280', margin: '2px 0 0' }}>
              Despachado el {new Date(pedido.ocaFechaDespacho).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })}
            </p>
          )}
        </div>
        {tieneEnvio && (
          <span style={{
            fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 9999,
            background: estadoInfo.bg, color: estadoInfo.color, border: `1px solid ${estadoInfo.border}`,
          }}>
            {estadoInfo.label}
          </span>
        )}
      </div>

      <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Error */}
        {errMsg && (
          <div style={{ background: '#fff5f5', border: '1px solid #fecaca', borderRadius: 8, padding: '8px 12px', display: 'flex', gap: 6 }}>
            <AlertTriangle size={13} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 12, color: '#dc2626', margin: 0 }}>{errMsg}</p>
          </div>
        )}

        {!tieneEnvio ? (
          /* ── Sin envío: formulario para generar ── */
          <>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Dimensiones del paquete
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {[
                  { label: 'Peso (kg)', val: peso,  set: setPeso  },
                  { label: 'Alto (cm)', val: alto,  set: setAlto  },
                  { label: 'Ancho (cm)',val: ancho, set: setAncho },
                  { label: 'Largo (cm)',val: largo, set: setLargo },
                ].map(({ label, val, set }) => (
                  <div key={label}>
                    <label style={{ fontSize: 10, color: '#9ca3af', display: 'block', marginBottom: 3 }}>{label}</label>
                    <input type="number" value={val} onChange={e => set(e.target.value)} min="0" step="0.1" style={inp} />
                  </div>
                ))}
              </div>
            </div>

            {pedido.tipoEnvio !== 'envio' ? (
              <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 8, padding: '8px 12px' }}>
                <p style={{ fontSize: 12, color: '#92400e', margin: 0 }}>
                  Este pedido es de <strong>retiro en local</strong>. OCA solo aplica para envíos a domicilio.
                </p>
              </div>
            ) : (
              <button
                onClick={generarEnvio}
                disabled={generando}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '10px', border: 'none', borderRadius: 8,
                  background: '#6DBE45', color: 'white',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  opacity: generando ? 0.7 : 1,
                }}
              >
                {generando
                  ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Generando en OCA...</>
                  : <><Package size={14} /> Generar envío OCA</>
                }
              </button>
            )}
          </>
        ) : (
          /* ── Con envío: acciones ── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* Etiqueta */}
            {pedido.ocaEtiquetaUrl && (
              <a
                href={pedido.ocaEtiquetaUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '9px', border: '1px solid #bbf7d0', borderRadius: 8,
                  background: 'white', color: '#15803d',
                  fontSize: 13, fontWeight: 700, textDecoration: 'none',
                }}
              >
                <ExternalLink size={13} /> Descargar etiqueta PDF
              </a>
            )}

            {/* Tracking */}
            <button
              onClick={actualizarTracking}
              disabled={actualizando}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '9px', border: '1px solid #e5e7eb', borderRadius: 8,
                background: 'white', color: '#6b7280',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                opacity: actualizando ? 0.7 : 1,
              }}
            >
              {actualizando
                ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Consultando...</>
                : <><RefreshCw size={13} /> Actualizar tracking</>
              }
            </button>

            {/* Eventos de tracking */}
            {eventos !== null && (
              <div>
                <button
                  onClick={() => setMostrarEventos(v => !v)}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 8 }}
                >
                  {mostrarEventos ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  {eventos.length} evento{eventos.length !== 1 ? 's' : ''}
                </button>

                {mostrarEventos && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 200, overflowY: 'auto' }}>
                    {eventos.slice().reverse().map((ev, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10, fontSize: 12 }}>
                        <div style={{ width: 4, borderRadius: 2, background: i === 0 ? '#6DBE45' : '#e5e7eb', flexShrink: 0 }} />
                        <div>
                          <p style={{ fontWeight: 600, color: '#111', margin: 0 }}>
                            {ev.Descripcion ?? ev.descripcion ?? ev.Estado ?? '—'}
                          </p>
                          <p style={{ color: '#9ca3af', margin: '2px 0 0' }}>
                            {ev.Fecha ?? ev.fecha ?? '—'} · {ev.Sucursal ?? ev.sucursal ?? ''}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Fecha de entrega si fue entregado */}
            {pedido.ocaFechaEntrega && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '8px 12px' }}>
                <CheckCircle size={13} color="#6DBE45" />
                <p style={{ fontSize: 12, color: '#15803d', fontWeight: 600, margin: 0 }}>
                  Entregado el {new Date(pedido.ocaFechaEntrega).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}