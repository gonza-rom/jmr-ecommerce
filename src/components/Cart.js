'use client';

import { X, Plus, Minus, Trash2, ShoppingBag, Loader2, Truck, Store } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';

const fmt = (n) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency', currency: 'ARS', maximumFractionDigits: 0,
  }).format(n ?? 0);

const GREEN      = '#6DBE45';
const GREEN_DARK = '#286c00';

export default function Cart() {
  const router = useRouter();
  const {
    cart, isOpen, setIsOpen,
    removeFromCart, updateQuantity, clearCart, getTotal,
  } = useCart();

  // ── Cotizador OCA ──────────────────────────────────────────────────────────
  const [cpInput,     setCpInput]     = useState('');
  const [cpActivo,    setCpActivo]    = useState('');
  const [tarifando,   setTarifando]   = useState(false);
  const [tarifas,     setTarifas]     = useState(null); // null | { sap, sas }
  const [errorTarifa, setErrorTarifa] = useState('');

  const subtotal = getTotal();

  async function calcularEnvio() {
    const cp = cpInput.trim();
    if (!cp || cp.length < 4) {
      setErrorTarifa('Ingresá un CP válido (4 dígitos)');
      return;
    }
    setTarifando(true);
    setErrorTarifa('');
    setTarifas(null);

    try {
      // Cotizar SaP (domicilio) y SaS (sucursal) en paralelo
      const [resSap, resSas] = await Promise.allSettled([
        fetch('/api/oca/tarifar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cpDestino:     cp,
            pesoKg:        0.5,
            alto:          10,
            ancho:         20,
            largo:         30,
            valorDeclarado: subtotal,
          }),
        }).then(r => r.json()),
        fetch('/api/oca/tarifar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cpDestino:     cp,
            operativa:     '466988',
            pesoKg:        0.5,
            alto:          10,
            ancho:         20,
            largo:         30,
            valorDeclarado: subtotal,
          }),
        }).then(r => r.json()),
      ]);

      const sap = resSap.status === 'fulfilled' && resSap.value.ok
        ? resSap.value.tarifa
        : resSap.status === 'fulfilled' ? resSap.value.fallback : null;

      const sas = resSas.status === 'fulfilled' && resSas.value.ok
        ? resSas.value.tarifa
        : resSas.status === 'fulfilled' ? resSas.value.fallback : null;

      if (!sap && !sas) {
        setErrorTarifa('No se pudo calcular el envío para ese CP. Verificá el código postal.');
      } else {
        setTarifas({ sap, sas });
        setCpActivo(cp);
      }
    } catch {
      setErrorTarifa('Error de conexión. Intentá de nuevo.');
    } finally {
      setTarifando(false);
    }
  }

  function irAlCheckout() {
    if (cart.length === 0) return;
    setIsOpen(false);
    router.push('/checkout');
  }

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={() => setIsOpen(false)}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(2px)',
          zIndex: 40,
        }}
      />

      {/* Panel */}
      <div
        className="cart-panel"
        style={{
          position: 'fixed', right: 0, top: 0, height: '100%',
          width: '100%', maxWidth: '420px',
          background: '#f9f9f9',
          boxShadow: '-8px 0 48px rgba(0,0,0,0.12)',
          zIndex: 50,
          display: 'flex', flexDirection: 'column',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #e8e8e8',
          background: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#1a1c1c', margin: 0 }}>
              Carrito
            </h2>
            {cart.length > 0 && (
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 9999,
                background: '#f3f4f6', color: '#6b7280',
              }}>
                {cart.reduce((a, i) => a + i.cantidad, 0)} {cart.reduce((a, i) => a + i.cantidad, 0) === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              background: '#f3f3f3', border: 'none', borderRadius: '50%',
              width: '2rem', height: '2rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#5e5e5e',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div style={{ flex: 1, overflowY: 'auto' }}>

          {cart.length === 0 ? (
            /* ── Carrito vacío ── */
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', height: '100%',
              padding: '3rem 2rem', gap: '1rem', textAlign: 'center',
            }}>
              <ShoppingBag size={56} strokeWidth={1} color="#d1d5db" />
              <p style={{ fontSize: 15, fontWeight: 600, color: '#5e5e5e', margin: 0 }}>
                Tu carrito está vacío
              </p>
              <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>
                Agregá productos para continuar
              </p>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  marginTop: 8, padding: '10px 24px',
                  background: GREEN, color: 'white', border: 'none',
                  borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 13,
                }}
              >
                Ver productos
              </button>
            </div>
          ) : (
            <>
              {/* ── Items ── */}
              <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {cart.map(item => (
                  <div key={item.id} className="cart-item" style={{
                    display: 'flex', gap: '0.75rem',
                    background: 'white', borderRadius: '0.75rem',
                    padding: '0.875rem', border: '1px solid #f3f4f6',
                  }}>
                    {/* Imagen */}
                    <div style={{
                      position: 'relative', width: 72, height: 90,
                      borderRadius: 8, overflow: 'hidden',
                      background: '#f3f3f3', flexShrink: 0,
                    }}>
                      {item.imagen ? (
                        <Image src={item.imagen} alt={item.nombre} fill style={{ objectFit: 'cover' }} sizes="72px" />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ShoppingBag size={24} color="#ccc" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                        <div style={{ minWidth: 0 }}>
                          {item.categoria && (
                            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9ca3af', margin: '0 0 2px' }}>
                              {item.categoria?.nombre ?? item.categoria}
                            </p>
                          )}
                          <p style={{
                            fontSize: 13, fontWeight: 600, color: '#1a1c1c', margin: 0,
                            overflow: 'hidden', display: '-webkit-box',
                            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                            lineHeight: 1.35,
                          }}>
                            {item.nombre}
                          </p>
                          {(item.talle || item.color) && (
                            <p style={{ fontSize: 11, color: '#9ca3af', margin: '2px 0 0' }}>
                              {[item.talle && `T: ${item.talle}`, item.color].filter(Boolean).join(' · ')}
                            </p>
                          )}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: GREEN_DARK, whiteSpace: 'nowrap', flexShrink: 0 }}>
                          {fmt(item.precio * item.cantidad)}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                        {/* Cantidad */}
                        <div style={{
                          display: 'flex', alignItems: 'center',
                          background: '#f3f3f3', borderRadius: 9999,
                          padding: '3px 10px', gap: '8px',
                        }}>
                          <button
                            className="qty-btn"
                            onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#5e5e5e', padding: '2px', borderRadius: '50%' }}
                          >
                            <Minus size={12} />
                          </button>
                          <span style={{ fontWeight: 700, minWidth: 16, textAlign: 'center', fontSize: 13, color: '#1a1c1c' }}>
                            {item.cantidad}
                          </span>
                          <button
                            className="qty-btn"
                            onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#5e5e5e', padding: '2px', borderRadius: '50%' }}
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        {/* Eliminar */}
                        <button
                          className="cart-delete"
                          onClick={() => removeFromCart(item.id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 4,
                            color: '#9ca3af', background: 'none', border: 'none',
                            cursor: 'pointer', fontSize: 11, fontWeight: 600,
                            textTransform: 'uppercase', letterSpacing: '0.06em',
                            padding: '3px 6px', borderRadius: 6,
                          }}
                        >
                          <Trash2 size={12} /> Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Cotizador OCA ── */}
              <div style={{
                margin: '0 1rem 1rem',
                background: 'white', borderRadius: 12,
                border: '1px solid #e5e7eb', overflow: 'hidden',
              }}>
                {/* Header cotizador */}
                <div style={{
                  padding: '10px 14px',
                  background: '#f9fafb',
                  borderBottom: '1px solid #e5e7eb',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <Truck size={13} color="#6b7280" />
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#374151' }}>
                    Calcular envío
                  </span>
                  {cpActivo && (
                    <span style={{ marginLeft: 'auto', fontSize: 11, color: '#9ca3af' }}>
                      CP: {cpActivo}
                      <button
                        onClick={() => { setCpActivo(''); setTarifas(null); setCpInput(''); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', marginLeft: 4, fontSize: 11 }}
                      >
                        Cambiar
                      </button>
                    </span>
                  )}
                </div>

                <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>

                  {/* Input CP */}
                  {!cpActivo && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={8}
                        value={cpInput}
                        onChange={e => { setCpInput(e.target.value.replace(/\D/g, '')); setErrorTarifa(''); }}
                        onKeyDown={e => e.key === 'Enter' && calcularEnvio()}
                        placeholder="Ej: 5300"
                        style={{
                          flex: 1, padding: '8px 12px',
                          border: `1px solid ${errorTarifa ? '#fca5a5' : '#e5e7eb'}`,
                          borderRadius: 8, fontSize: 13, outline: 'none',
                          fontFamily: 'Inter, sans-serif',
                        }}
                      />
                      <button
                        onClick={calcularEnvio}
                        disabled={tarifando}
                        style={{
                          padding: '8px 14px',
                          background: tarifando ? '#9ca3af' : GREEN,
                          color: 'white', border: 'none', borderRadius: 8,
                          fontSize: 12, fontWeight: 700, cursor: tarifando ? 'not-allowed' : 'pointer',
                          display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap',
                        }}
                      >
                        {tarifando
                          ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                          : 'Calcular'
                        }
                      </button>
                    </div>
                  )}

                  {/* Link no sé mi CP */}
                  {!cpActivo && (
                    <a
                      href="https://www.correoargentino.com.ar/formularios/cpa"
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: 11, color: '#6b7280', textDecoration: 'underline' }}
                    >
                      No sé mi código postal
                    </a>
                  )}

                  {/* Error */}
                  {errorTarifa && (
                    <p style={{ fontSize: 12, color: '#ef4444', margin: 0 }}>{errorTarifa}</p>
                  )}

                  {/* Resultados */}
                  {tarifas && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>

                      {/* Envío a domicilio */}
                      {tarifas.sap && (
                        <div style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '10px 12px', background: '#f9fafb',
                          border: '1px solid #e5e7eb', borderRadius: 8,
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Truck size={14} color="#6b7280" />
                            <div>
                              <p style={{ fontSize: 12, fontWeight: 600, color: '#1a1c1c', margin: 0 }}>
                                Envío a domicilio
                              </p>
                              <p style={{ fontSize: 10, color: '#9ca3af', margin: '1px 0 0' }}>
                                {tarifas.sap.diasHabiles} días hábiles · OCA
                              </p>
                            </div>
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 700, color: GREEN_DARK }}>
                            {fmt(tarifas.sap.precio)}
                          </span>
                        </div>
                      )}

                      {/* Retiro en sucursal */}
                      {tarifas.sas && (
                        <div style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '10px 12px', background: '#f9fafb',
                          border: '1px solid #e5e7eb', borderRadius: 8,
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Store size={14} color="#6b7280" />
                            <div>
                              <p style={{ fontSize: 12, fontWeight: 600, color: '#1a1c1c', margin: 0 }}>
                                Retiro en sucursal OCA
                              </p>
                              <p style={{ fontSize: 10, color: '#9ca3af', margin: '1px 0 0' }}>
                                {tarifas.sas.diasHabiles} días hábiles
                              </p>
                            </div>
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 700, color: GREEN_DARK }}>
                            {fmt(tarifas.sas.precio)}
                          </span>
                        </div>
                      )}

                      {/* Retiro en local - siempre gratis */}
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 12px', background: '#f0fdf4',
                        border: '1px solid #bbf7d0', borderRadius: 8,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Store size={14} color={GREEN} />
                          <div>
                            <p style={{ fontSize: 12, fontWeight: 600, color: '#1a1c1c', margin: 0 }}>
                              Retiro en local JMR
                            </p>
                            <p style={{ fontSize: 10, color: '#9ca3af', margin: '1px 0 0' }}>
                              Rivadavia 564 o Valle Viejo
                            </p>
                          </div>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: GREEN_DARK }}>Gratis</span>
                      </div>

                      <p style={{ fontSize: 10, color: '#9ca3af', margin: '4px 0 0', textAlign: 'center' }}>
                        * Precios calculados por OCA para CP {cpActivo}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div style={{
            borderTop: '1px solid #e8e8e8',
            background: 'white',
            padding: '1.25rem 1.5rem',
            flexShrink: 0,
          }}>
            {/* Subtotal */}
            <div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#5e5e5e' }}>
                <span>Subtotal ({cart.reduce((a, i) => a + i.cantidad, 0)} productos)</span>
                <span style={{ fontWeight: 600, color: '#1a1c1c' }}>{fmt(subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#9ca3af' }}>
                <span>Envío</span>
                <span>Calculado en el checkout</span>
              </div>
            </div>

            <div style={{ height: 1, background: '#e8e8e8', marginBottom: '1rem' }} />

            {/* Total */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#1a1c1c' }}>Total estimado</span>
              <p style={{ fontSize: '1.75rem', fontWeight: 900, color: GREEN_DARK, margin: 0, letterSpacing: '-0.03em', lineHeight: 1 }}>
                {fmt(subtotal)}
              </p>
            </div>

            {/* Botón checkout */}
            <button
              onClick={irAlCheckout}
              style={{
                width: '100%', padding: '1rem',
                background: `linear-gradient(135deg, ${GREEN_DARK}, ${GREEN})`,
                color: 'white', border: 'none', borderRadius: 10,
                fontWeight: 700, fontSize: 14, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: '0 4px 16px rgba(109,190,69,0.3)',
                marginBottom: '0.75rem',
              }}
            >
              Finalizar compra
              <span style={{ fontSize: 13, opacity: 0.9 }}>→</span>
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  color: '#5e5e5e', background: 'none', border: 'none',
                  cursor: 'pointer', fontSize: 12, fontWeight: 600,
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                }}
              >
                ← Seguir comprando
              </button>
              <button
                className="clear-btn"
                onClick={clearCart}
                style={{
                  color: '#9ca3af', background: 'none', border: 'none',
                  cursor: 'pointer', fontSize: 12, fontWeight: 600,
                  padding: '4px 8px', borderRadius: 6,
                }}
              >
                Vaciar
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}