'use client';

import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { showToast } from 'nextjs-toast-notify';

const WHATSAPP_NUMBER = '543834927252';

export default function Cart() {
  const {
    cart,
    isOpen,
    setIsOpen,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotal,
  } = useCart();

  const enviarPorWhatsApp = () => {
    if (cart.length === 0) {
      showToast.warning('⚠️ El carrito está vacío');
      return;
    }
    let mensaje = '¡Hola! Me gustaría hacer el siguiente pedido:\n\n';
    cart.forEach((item, index) => {
      mensaje += `${index + 1}. *${item.nombre}*\n`;
      mensaje += `   Cantidad: ${item.cantidad}\n`;
      mensaje += `   Precio unitario: $${item.precio.toFixed(2)}\n`;
      mensaje += `   Subtotal: $${(item.precio * item.cantidad).toFixed(2)}\n\n`;
    });
    mensaje += `*TOTAL: $${getTotal().toFixed(2)}*\n\n`;
    mensaje += '¿Podrían confirmar la disponibilidad? ¡Gracias!';
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`, '_blank');
    showToast.success('📱 Abriendo WhatsApp...');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="close-overlay"
        onClick={() => setIsOpen(false)}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 40, transition: 'opacity 0.2s',
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
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1.5rem 1.5rem 1.25rem',
          borderBottom: '1px solid #e8e8e8',
          background: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.03em', color: '#1a1c1c' }}>
            Tu Carrito
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              background: '#f3f3f3', border: 'none', borderRadius: '50%',
              width: '2.25rem', height: '2.25rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#5e5e5e',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
          {cart.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#aaa', gap: '0.75rem', paddingBottom: '4rem' }}>
              <ShoppingBag size={64} strokeWidth={1} />
              <p style={{ fontWeight: 600, fontSize: '1rem', color: '#5e5e5e' }}>Tu carrito está vacío</p>
              <p style={{ fontSize: '0.875rem' }}>¡Agrega productos para empezar!</p>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  marginTop: '0.5rem', padding: '0.75rem 1.5rem',
                  background: '#6DBE45', color: 'white', border: 'none',
                  borderRadius: '0.5rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem',
                }}
              >
                Seguir comprando
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {cart.map((item) => (
                <div key={item.id} className="cart-item" style={{
                  display: 'flex', gap: '1rem',
                  background: 'white', borderRadius: '0.75rem',
                  padding: '1rem',
                }}>
                  {/* Image */}
                  <div style={{
                    position: 'relative', width: '80px', height: '100px',
                    background: '#f3f3f3', borderRadius: '0.5rem', overflow: 'hidden', flexShrink: 0,
                  }}>
                    {item.imagen ? (
                      <Image src={item.imagen} alt={item.nombre} fill style={{ objectFit: 'cover' }} sizes="80px" />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ShoppingBag size={28} color="#ccc" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingBlock: '0.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <div>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1a1c1c', marginBottom: '0.2rem', lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                          {item.nombre}
                        </h3>
                        {item.categoria && (
                          <p style={{ fontSize: '0.7rem', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
                            {item.categoria.nombre}
                          </p>
                        )}
                      </div>
                      <span style={{ fontSize: '1rem', fontWeight: 800, color: '#6DBE45', whiteSpace: 'nowrap' }}>
                        ${(item.precio * item.cantidad).toFixed(2)}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem' }}>
                      {/* Qty controls */}
                      <div style={{
                        display: 'flex', alignItems: 'center',
                        background: '#f3f3f3', borderRadius: '9999px',
                        padding: '0.25rem 0.75rem', gap: '0.75rem',
                      }}>
                        <button
                          className="qty-btn"
                          onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#5e5e5e', padding: '0.15rem', borderRadius: '50%' }}
                          aria-label="Disminuir"
                        >
                          <Minus size={14} />
                        </button>
                        <span style={{ fontWeight: 700, minWidth: '1rem', textAlign: 'center', fontSize: '0.875rem', color: '#1a1c1c' }}>
                          {item.cantidad}
                        </span>
                        <button
                          className="qty-btn"
                          onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#5e5e5e', padding: '0.15rem', borderRadius: '50%' }}
                          aria-label="Aumentar"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      {/* Delete */}
                      <button
                        className="cart-delete"
                        onClick={() => removeFromCart(item.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.3rem',
                          color: '#aaa', background: 'none', border: 'none', cursor: 'pointer',
                          fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
                          padding: '0.3rem 0.5rem', borderRadius: '0.375rem',
                        }}
                        aria-label="Eliminar"
                      >
                        <Trash2 size={14} />
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div style={{ borderTop: '1px solid #e8e8e8', background: 'white', padding: '1.5rem' }}>
            <div style={{ marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#5e5e5e' }}>
                <span>Subtotal</span>
                <span style={{ fontWeight: 500, color: '#1a1c1c' }}>${getTotal().toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#5e5e5e' }}>
                <span>Envío</span>
                <span style={{ fontWeight: 800, color: '#6DBE45', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Gratis</span>
              </div>
            </div>

            <div style={{ height: '1px', background: '#e8e8e8', marginBottom: '1.25rem' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1a1c1c' }}>Total</span>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '2rem', fontWeight: 900, color: '#6DBE45', letterSpacing: '-0.04em', lineHeight: 1 }}>
                  ${getTotal().toFixed(2)}
                </p>
                <p style={{ fontSize: '0.65rem', color: '#aaa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '0.2rem' }}>IVA Incluido</p>
              </div>
            </div>

            <button
              className="whatsapp-btn"
              onClick={enviarPorWhatsApp}
              style={{
                width: '100%', padding: '1.1rem',
                background: 'linear-gradient(135deg, #286c00, #6DBE45)',
                color: 'white', border: 'none', borderRadius: '0.5rem',
                fontWeight: 700, fontSize: '1rem', cursor: 'pointer', marginBottom: '0.75rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                boxShadow: '0 4px 16px rgba(109,190,69,0.3)',
                letterSpacing: '-0.01em',
              }}
            >
              Finalizar Compra
              <ArrowRight size={18} />
            </button>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '0.75rem', opacity: 0.35, filter: 'grayscale(1)' }}>
              {['💳', '📱', '🏦', '📲'].map((icon, i) => (
                <span key={i} style={{ fontSize: '1.4rem' }}>{icon}</span>
              ))}
            </div>

            <p style={{ fontSize: '0.7rem', color: '#aaa', textAlign: 'center', lineHeight: 1.5 }}>
              Tus transacciones están cifradas bajo estándares SSL.
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.3rem',
                  color: '#5e5e5e', background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
                }}
              >
                ← Seguir comprando
              </button>
              <button
                className="clear-btn"
                onClick={clearCart}
                style={{
                  color: '#aaa', background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '0.8rem', fontWeight: 700, padding: '0.4rem 0.75rem', borderRadius: '0.375rem',
                }}
              >
                Vaciar carrito
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}