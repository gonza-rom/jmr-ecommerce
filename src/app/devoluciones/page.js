// src/app/devoluciones/page.js

import Link from 'next/link';
import { ArrowLeft, RefreshCw, Package, Clock, CheckCircle, XCircle, MessageCircle } from 'lucide-react';

export const metadata = {
  title: 'Política de Devoluciones y Cambios | Marroquinería JMR',
  description: 'Conocé nuestra política de devoluciones, cambios y garantías. Marroquinería JMR, Catamarca.',
};

const PASO = ({ numero, icon: Icon, titulo, desc, color }) => (
  <div style={{
    display: 'flex', gap: '1rem', alignItems: 'flex-start',
    padding: '1.25rem', background: 'white', borderRadius: 12,
    border: '1px solid #e5e7eb',
  }}>
    <div style={{
      width: 44, height: 44, borderRadius: 10,
      background: color + '18', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Icon size={20} color={color} />
    </div>
    <div>
      <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: color, margin: '0 0 0.25rem' }}>
        Paso {numero}
      </p>
      <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1a1a1a', margin: '0 0 0.25rem' }}>{titulo}</p>
      <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0, lineHeight: 1.6 }}>{desc}</p>
    </div>
  </div>
);

const ITEM_LISTA = ({ ok, texto }) => (
  <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', marginBottom: '0.4rem' }}>
    {ok
      ? <CheckCircle size={16} color="#6DBE45" style={{ flexShrink: 0, marginTop: 2 }} />
      : <XCircle    size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: 2 }} />}
    <span style={{ fontSize: '0.9rem', color: '#4b5563', lineHeight: 1.6 }}>{texto}</span>
  </li>
);

export default function DevolucionesPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f9f9f9', fontFamily: 'Inter, sans-serif' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #286c00, #6DBE45)', color: 'white', padding: '3.5rem 1.5rem' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <Link href="/productos" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'rgba(255,255,255,0.65)', textDecoration: 'none', marginBottom: '1.5rem' }}>
            <ArrowLeft size={14} /> Volver a la tienda
          </Link>
          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 900, letterSpacing: '-0.03em', margin: '0 0 0.75rem' }}>
            Devoluciones y Cambios
          </h1>
          <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.8)', maxWidth: 520, margin: 0, lineHeight: 1.7 }}>
            Tu satisfacción es lo primero. Contás con <strong>10 días corridos</strong> desde que recibís tu pedido para solicitar un cambio o devolución.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '3rem 1.5rem' }}>

        {/* Plazo destacado */}
        <div style={{
          background: '#f0fdf4', border: '2px solid #6DBE45',
          borderRadius: 16, padding: '1.5rem',
          display: 'flex', alignItems: 'center', gap: '1.25rem',
          marginBottom: '2.5rem',
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 12,
            background: '#6DBE45',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Clock size={28} color="white" />
          </div>
          <div>
            <p style={{ fontSize: '1.25rem', fontWeight: 900, color: '#14532d', margin: '0 0 0.25rem', letterSpacing: '-0.02em' }}>
              10 días corridos
            </p>
            <p style={{ fontSize: '0.875rem', color: '#15803d', margin: 0, lineHeight: 1.5 }}>
              Para solicitar devolución en compras online, según la <strong>Ley 24.240</strong> de Defensa del Consumidor.
              Sin necesidad de justificar el motivo.
            </p>
          </div>
        </div>

        {/* ¿Qué admite devolución? */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1a1a1a', margin: '0 0 1rem', letterSpacing: '-0.01em' }}>
            ¿Qué productos admiten devolución?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.25rem' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6DBE45', margin: '0 0 0.75rem' }}>
                ✓ Admiten devolución
              </p>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {[
                  'Productos sin usar y con etiquetas',
                  'Productos en embalaje original',
                  'Artículos con defecto de fabricación',
                  'Producto diferente al pedido',
                ].map(t => <ITEM_LISTA key={t} ok texto={t} />)}
              </ul>
            </div>
            <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.25rem' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#ef4444', margin: '0 0 0.75rem' }}>
                ✗ No admiten devolución
              </p>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {[
                  'Productos usados o sin etiqueta',
                  'Artículos personalizados o bajo pedido',
                  'Daños por uso inadecuado',
                  'Solicitudes fuera del plazo de 10 días',
                ].map(t => <ITEM_LISTA key={t} ok={false} texto={t} />)}
              </ul>
            </div>
          </div>
        </section>

        {/* Pasos */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1a1a1a', margin: '0 0 1rem', letterSpacing: '-0.01em' }}>
            ¿Cómo solicitar una devolución?
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <PASO
              numero="1" icon={MessageCircle} color="#3b82f6"
              titulo="Contactanos"
              desc='Enviá un email a cuerosjmr@hotmail.com o un WhatsApp al +54 383 492-7252 indicando tu número de pedido y el motivo de la devolución.'
            />
            <PASO
              numero="2" icon={Package} color="#f59e0b"
              titulo="Empaquetá el producto"
              desc="Asegurate de que el producto esté en las mismas condiciones que lo recibiste, con sus etiquetas y embalaje original."
            />
            <PASO
              numero="3" icon={RefreshCw} color="#8b5cf6"
              titulo="Enviá o traelo al local"
              desc="Podés enviarlo por correo (el costo corre por tu cuenta, salvo defecto de fabricación) o traerlo directamente a nuestros locales."
            />
            <PASO
              numero="4" icon={CheckCircle} color="#6DBE45"
              titulo="Recibí tu reembolso o cambio"
              desc="Una vez que recibamos y revisemos el producto, procesamos el reembolso dentro de 3 a 5 días hábiles o coordinamos el cambio."
            />
          </div>
        </section>

        {/* Garantía */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1a1a1a', margin: '0 0 1rem', letterSpacing: '-0.01em' }}>
            Garantía por defectos de fabricación
          </h2>
          <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.5rem' }}>
            <p style={{ fontSize: '0.9rem', color: '#4b5563', margin: '0 0 0.75rem', lineHeight: 1.8 }}>
              Todos nuestros productos tienen garantía legal mínima de <strong>3 meses</strong> contra defectos de fabricación
              según la Ley 24.240. En caso de defecto, asumimos el costo de devolución y el reemplazo del producto.
            </p>
            <p style={{ fontSize: '0.9rem', color: '#4b5563', margin: 0, lineHeight: 1.8 }}>
              Para artículos de marcas como <strong>Pierre Cardin, Head, Wilson</strong> y otras, la garantía del fabricante
              puede extenderse según sus propias políticas.
            </p>
          </div>
        </section>

        {/* Reembolsos */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1a1a1a', margin: '0 0 1rem', letterSpacing: '-0.01em' }}>
            Reembolsos
          </h2>
          <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { metodo: 'Mercado Pago / Fiserv', plazo: '5 a 10 días hábiles según el banco emisor', nota: 'Se acredita en la misma tarjeta o cuenta usada.' },
              { metodo: 'Transferencia bancaria', plazo: '1 a 3 días hábiles',                        note: 'Se transfiere al CBU/alias que nos indiques.' },
              { metodo: 'Efectivo',               plazo: 'Inmediato en local',                        note: 'Únicamente en nuestras sucursales.' },
            ].map(({ metodo, plazo, note }) => (
              <div key={metodo} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #f3f4f6' }}>
                <div>
                  <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1a1a1a', margin: '0 0 0.2rem' }}>{metodo}</p>
                  {note && <p style={{ fontSize: '0.8rem', color: '#9ca3af', margin: 0 }}>{note}</p>}
                </div>
                <span style={{
                  fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: 9999,
                  background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', whiteSpace: 'nowrap',
                }}>
                  {plazo}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* CTA contacto */}
        <div style={{
          background: '#1a1c1c', color: 'white', borderRadius: 16,
          padding: '2rem', textAlign: 'center',
        }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 0.5rem', letterSpacing: '-0.01em' }}>
            ¿Tenés alguna consulta?
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.55)', margin: '0 0 1.5rem' }}>
            Estamos para ayudarte de lunes a sábado
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="https://wa.me/543834927252?text=Hola!%20Quiero%20consultar%20sobre%20una%20devoluci%C3%B3n."
              target="_blank" rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '10px 20px', background: '#25D366', color: 'white',
                borderRadius: 8, fontSize: '0.875rem', fontWeight: 700, textDecoration: 'none',
              }}
            >
              <MessageCircle size={16} /> WhatsApp
            </a>
            <a
              href="mailto:cuerosjmr@hotmail.com?subject=Consulta%20devolución"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '10px 20px', background: 'rgba(255,255,255,0.08)', color: 'white',
                borderRadius: 8, fontSize: '0.875rem', fontWeight: 700, textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              Email
            </a>
          </div>
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center' }}>
          <Link href="/terminos" style={{ fontSize: '0.85rem', color: '#9ca3af', textDecoration: 'none' }}>
            Ver Términos y Condiciones completos →
          </Link>
        </div>
      </div>
    </div>
  );
}