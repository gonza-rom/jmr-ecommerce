'use client';
// src/app/checkout/exito/page.js

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, ShoppingBag, MessageCircle, Copy, Check, UserPlus, ArrowRight } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

const TRANSFERENCIA = {
  titular: 'Maria Lourdes Quispe',
  banco:   'Banco Nación / Mercado Pago',
  cbu:     '',
  alias:   '',
};

const WA_NUMBER  = '543834927252';
const GREEN      = '#6DBE45';
const GREEN_DARK = '#286c00';

function DatoTransferencia({ label, valor, onCopiar, copiado }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
      <div style={{ minWidth: 0 }}>
        <span style={{ fontSize: 11, color: '#888', display: 'block' }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#111', fontFamily: 'monospace', wordBreak: 'break-all' }}>{valor}</span>
      </div>
      {onCopiar && (
        <button onClick={onCopiar} style={{
          flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4,
          padding: '5px 10px', border: '1px solid #bbf7d0', borderRadius: 6,
          background: copiado ? GREEN : '#fff', cursor: 'pointer',
          fontSize: 11, fontWeight: 600,
          color: copiado ? '#fff' : GREEN_DARK,
          transition: 'all 0.2s',
        }}>
          {copiado ? <Check size={12} /> : <Copy size={12} />}
          {copiado ? 'Copiado' : 'Copiar'}
        </button>
      )}
    </div>
  );
}

// ── Banner de registro post-compra ────────────────────────────────────────────
function BannerRegistro({ email }) {
  const [cerrado,   setCerrado]   = useState(false);
  const [logueado,  setLogueado]  = useState(null); // null = cargando

  useEffect(() => {
    // Verificar si ya está logueado para no mostrar el banner
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      );
      supabase.auth.getUser().then(({ data: { user } }) => {
        setLogueado(!!user);
      });
    } catch {
      setLogueado(false);
    }
  }, []);

  // No mostrar si está cargando, ya logueado, o fue cerrado
  if (logueado === null || logueado === true || cerrado) return null;

  const registroUrl = email
    ? `/registro?email=${encodeURIComponent(email)}`
    : '/registro';

  return (
    <div style={{
      background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
      border: '1px solid #bbf7d0',
      borderRadius: 14,
      padding: '18px 20px',
      margin: '16px 0',
      position: 'relative',
    }}>
      {/* Cerrar */}
      <button
        onClick={() => setCerrado(true)}
        style={{
          position: 'absolute', top: 10, right: 12,
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#9ca3af', fontSize: 18, lineHeight: 1, padding: 2,
        }}
        aria-label="Cerrar"
      >
        ×
      </button>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: GREEN, display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <UserPlus size={18} color="white" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#14532d', margin: '0 0 4px' }}>
            ¿Guardás tus datos para la próxima compra?
          </p>
          <p style={{ fontSize: 12, color: '#16a34a', margin: '0 0 12px', lineHeight: 1.5 }}>
            Creá tu cuenta en 30 segundos y accedé a tu historial de pedidos desde cualquier dispositivo.
          </p>
          <Link
            href={registroUrl}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 16px',
              background: GREEN, color: 'white',
              borderRadius: 8, fontSize: 13, fontWeight: 700,
              textDecoration: 'none', transition: 'opacity 0.15s',
            }}
          >
            Crear cuenta gratis <ArrowRight size={13} />
          </Link>
          <Link
            href="/mis-pedidos"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              marginLeft: 12, fontSize: 12, color: '#16a34a',
              textDecoration: 'none', fontWeight: 600,
            }}
          >
            o buscá tu pedido por email →
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Contenido principal ───────────────────────────────────────────────────────
function ExitoContent() {
  const searchParams = useSearchParams();
  const pedidoId = searchParams.get('pedido');
  const metodo   = searchParams.get('metodo');
  const status   = searchParams.get('status');
  const email    = searchParams.get('email'); // opcional, pasado desde checkout

  const [copiado, setCopiado] = useState('');

  function copiar(campo) {
    const valor = campo === 'cbu' ? TRANSFERENCIA.cbu : TRANSFERENCIA.alias;
    navigator.clipboard.writeText(valor).then(() => {
      setCopiado(campo);
      setTimeout(() => setCopiado(''), 2000);
    });
  }

  const esTransferencia = metodo === 'transferencia';
  const esMercadoPago   = !!status;
  const aprobado        = status === 'approved' || !status;

  // ── Pago rechazado ────────────────────────────────────────────────────────
  if (esMercadoPago && !aprobado) {
    return (
      <div style={s.page}>
        <div style={s.card}>
          <div style={{ fontSize: 48, textAlign: 'center', marginBottom: 16 }}>❌</div>
          <h1 style={s.titulo}>Pago no completado</h1>
          <p style={{ fontSize: 13, color: '#888', textAlign: 'center', marginBottom: 24 }}>
            {status === 'pending'
              ? 'Tu pago está pendiente de acreditación. Te avisaremos cuando se confirme.'
              : 'No se pudo procesar el pago. Podés intentarlo nuevamente.'}
          </p>
          <Link href="/checkout" style={s.btnPrimary}>Intentar de nuevo</Link>
          <Link href="/productos" style={{ ...s.btnSecundario, marginTop: 8 }}>Ver productos</Link>
        </div>
      </div>
    );
  }

  // ── Éxito ─────────────────────────────────────────────────────────────────
  return (
    <div style={s.page}>
      <div style={s.card}>

        {/* Check verde */}
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: '#f0fdf4', border: '2px solid #bbf7d0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <CheckCircle size={36} color={GREEN} />
        </div>

        <p style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#aaa', margin: '0 0 6px', textAlign: 'center' }}>
          {esMercadoPago ? 'Pago confirmado' : 'Pedido recibido'}
        </p>

        <h1 style={s.titulo}>¡Gracias por tu compra!</h1>

        {pedidoId && (
          <div style={{ background: '#f0fdf4', borderRadius: 10, padding: '12px 20px', margin: '16px 0', textAlign: 'center', border: '1px solid #bbf7d0' }}>
            <p style={{ fontSize: 11, color: '#aaa', margin: '0 0 4px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>N° de pedido</p>
            <p style={{ fontSize: 16, fontWeight: 800, color: GREEN_DARK, margin: 0, letterSpacing: '0.05em' }}>
              #{pedidoId.slice(-8).toUpperCase()}
            </p>
          </div>
        )}

        {/* Banner registro — el punto central de esta mejora */}
        <BannerRegistro email={email} />

        {/* Bloque transferencia */}
        {esTransferencia && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: 16, margin: '8px 0 16px' }}>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#15803d', margin: '0 0 12px' }}>
              Realizá la transferencia
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
              <DatoTransferencia label="Titular" valor={TRANSFERENCIA.titular} />
              <DatoTransferencia label="Banco"   valor={TRANSFERENCIA.banco} />
              {TRANSFERENCIA.cbu && (
                <DatoTransferencia label="CBU" valor={TRANSFERENCIA.cbu}
                  onCopiar={() => copiar('cbu')} copiado={copiado === 'cbu'} />
              )}
              {TRANSFERENCIA.alias && (
                <DatoTransferencia label="Alias" valor={TRANSFERENCIA.alias}
                  onCopiar={() => copiar('alias')} copiado={copiado === 'alias'} />
              )}
            </div>
            <a
              href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
                `Hola! Hice una transferencia para el pedido #${pedidoId?.slice(-8).toUpperCase() ?? ''} en Marroquinería JMR.\n\nTe mando el comprobante ahora.`
              )}`}
              target="_blank" rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                width: '100%', padding: 12, borderRadius: 8,
                background: '#25D366', color: '#fff',
                fontSize: 13, fontWeight: 700, textDecoration: 'none', boxSizing: 'border-box',
              }}
            >
              <MessageCircle size={16} />
              Enviar comprobante por WhatsApp
            </a>
            <p style={{ fontSize: 11, color: '#15803d', margin: '10px 0 0', textAlign: 'center' }}>
              Tu pedido se confirma una vez que acreditemos el pago.
            </p>
          </div>
        )}

        {/* Próximos pasos (no transferencia) */}
        {!esTransferencia && (
          <div style={{ background: '#fff', border: '1px solid #e8e5e0', borderRadius: 12, padding: 16, margin: '0 0 16px' }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888', margin: '0 0 12px' }}>
              Próximos pasos
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { icon: '📧', texto: 'Revisá tu email con el resumen del pedido' },
                { icon: '📱', texto: 'Te contactamos por WhatsApp para coordinar' },
                { icon: '📦', texto: esMercadoPago ? 'Preparamos y enviamos tu pedido' : 'Confirmamos y preparamos tu pedido' },
              ].map(({ icon, texto }) => (
                <div key={texto} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18 }}>{icon}</span>
                  <p style={{ fontSize: 13, color: '#555', margin: 0 }}>{texto}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {!esTransferencia && (
            <a
              href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
                `Hola! Hice un pedido${pedidoId ? ` (#${pedidoId.slice(-8).toUpperCase()})` : ''} en Marroquinería JMR y quería confirmar.`
              )}`}
              target="_blank" rel="noopener noreferrer"
              style={{ ...s.btnPrimary, background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, textDecoration: 'none' }}
            >
              <MessageCircle size={16} /> Contactar por WhatsApp
            </a>
          )}
          <Link href="/productos"
            style={{ ...s.btnSecundario, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, textDecoration: 'none' }}>
            <ShoppingBag size={14} /> Seguir comprando
          </Link>
        </div>

        <p style={{ fontSize: 11, color: '#ccc', textAlign: 'center', marginTop: 20 }}>
          Marroquinería JMR · Catamarca, Argentina
        </p>
      </div>
    </div>
  );
}

export default function CheckoutExitoPage() {
  return (
    <Suspense fallback={null}>
      <ExitoContent />
    </Suspense>
  );
}

const s = {
  page:          { minHeight: '100vh', background: '#f5f4f2', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'Inter', sans-serif" },
  card:          { background: '#fff', borderRadius: 20, border: '1px solid #e8e5e0', padding: '36px 28px', width: '100%', maxWidth: 480, boxShadow: '0 4px 32px rgba(0,0,0,0.06)' },
  titulo:        { fontSize: 22, fontWeight: 900, color: '#111', margin: '0 0 4px', letterSpacing: '-0.02em', textAlign: 'center' },
  btnPrimary:    { display: 'block', width: '100%', padding: 13, background: `linear-gradient(135deg, #286c00, #6DBE45)`, color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', textAlign: 'center', boxSizing: 'border-box' },
  btnSecundario: { display: 'block', width: '100%', padding: 12, background: 'transparent', color: '#555', border: '1px solid #e0dbd5', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', textAlign: 'center', boxSizing: 'border-box' },
};