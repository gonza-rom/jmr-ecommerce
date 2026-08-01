'use client';

import { useState } from 'react';
import {
  CreditCard, ChevronDown, ChevronUp,
  Banknote, Smartphone, Building2, Repeat,
  AlertCircle, X, Zap,
} from 'lucide-react';

const GREEN      = '#6DBE45';
const GREEN_DARK = '#286c00';

const PROMOS = [
  {
    banco: 'Banco Nación (Marcatón)',
    icon:  Building2,
    items: [
      { dias: 'Lunes a jueves',     promo: 'Hasta 6 cuotas sin interés' },
      { dias: 'Viernes y sábado',   promo: '3 cuotas sin interés (consultar)' },
    ],
  },
  {
    banco: 'CentroCard (Oxígeno)',
    icon:  CreditCard,
    items: [
      { dias: 'Miércoles, jueves y viernes', promo: '3 cuotas sin interés' },
      { dias: 'Otros días',                  promo: '15% de recargo' },
    ],
  },
  {
    banco: 'Tarjeta Naranja',
    icon:  CreditCard,
    color: '#f97316',
    items: [
      { dias: 'Jueves, viernes y sábado', promo: '3 cuotas sin interés + 10% OFF (tope $10.000)' },
      { dias: 'Todos los días',           promo: '5 cuotas sin interés (sin descuento)' },
      { dias: 'Otras compras',            promo: '15% de recargo' },
    ],
  },
  {
    banco: 'Tarjeta SOL',
    icon:  CreditCard,
    color: '#eab308',
    items: [
      { dias: 'Todos los días', promo: '3 cuotas · 15% de recargo' },
    ],
  },
  {
    banco: 'Todas las tarjetas de crédito',
    icon:  CreditCard,
    items: [
      { dias: 'Todos los días', promo: '1 pago sin interés' },
    ],
  },
];

const METODOS_ONLINE = [
  { label: 'Go Cuotas',        icon: Zap,        color: '#7c3aed' },
  { label: 'Mercado Pago',     icon: Smartphone, color: '#009ee3' },
  { label: 'Transferencia',    icon: Repeat,     color: GREEN_DARK },
  { label: 'Efectivo en local', icon: Banknote,  color: '#374151' },
];

export default function PromosPago() {
  const [abierto, setAbierto] = useState(false);

  return (
    <div style={{
      border: '1px solid #e5e7eb', borderRadius: 12,
      overflow: 'hidden', fontFamily: 'Inter, sans-serif', fontSize: 13,
    }}>
      {/* Header colapsable */}
      <button
        onClick={() => setAbierto(a => !a)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px',
          background: abierto ? '#f0fdf4' : 'white',
          border: 'none', cursor: 'pointer',
          borderBottom: abierto ? '1px solid #e5e7eb' : 'none',
          transition: 'background 0.15s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CreditCard size={15} color={GREEN} />
          <span style={{ fontWeight: 700, color: '#1a1c1c', fontSize: 13 }}>
            Promos y formas de pago
          </span>
        </div>
        {abierto
          ? <ChevronUp size={15} color="#9ca3af" />
          : <ChevronDown size={15} color="#9ca3af" />}
      </button>

      {abierto && (
        <div style={{ padding: '12px 16px', background: 'white', display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* Métodos online */}
          <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '10px 12px' }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: GREEN_DARK, margin: '0 0 8px' }}>
              Pagos online disponibles
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {METODOS_ONLINE.map(({ label, icon: Icon, color }) => (
                <span key={label} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '4px 10px', borderRadius: 9999,
                  background: 'white', border: '1px solid #bbf7d0',
                  fontSize: 11, fontWeight: 600, color: '#1a1c1c',
                }}>
                  <Icon size={11} color={color} />
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Promos presenciales */}
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6b7280', margin: '4px 0 0' }}>
            Promos con tarjeta (pago presencial)
          </p>

          {PROMOS.map(({ banco, icon: Icon, color, items }) => (
            <div key={banco} style={{ border: '1px solid #f3f4f6', borderRadius: 8, overflow: 'hidden' }}>
              <div style={{ padding: '8px 12px', background: '#f9fafb', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon size={13} color={color ?? '#6b7280'} />
                <span style={{ fontWeight: 700, fontSize: 12, color: '#1a1c1c' }}>{banco}</span>
              </div>
              <div style={{ padding: '6px 12px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {items.map(({ dias, promo }, i) => (
                  <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                    <span style={{ color: GREEN, flexShrink: 0, marginTop: 1, fontWeight: 700 }}>›</span>
                    <div>
                      <span style={{ fontWeight: 600, color: '#374151', fontSize: 12 }}>{dias}: </span>
                      <span style={{ color: '#6b7280', fontSize: 12 }}>{promo}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Aviso Amex */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 12px', background: '#fef2f2',
            border: '1px solid #fecaca', borderRadius: 8,
          }}>
            <X size={13} color="#dc2626" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: '#991b1b', fontWeight: 600 }}>
              No trabajamos con American Express
            </span>
          </div>

          <p style={{ fontSize: 11, color: '#9ca3af', margin: 0, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <Zap size={11} color="#9ca3af" />
            Próximamente: pagos con tarjeta online con todas las promos
          </p>
        </div>
      )}
    </div>
  );
}