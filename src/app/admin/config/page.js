'use client';
// src/app/admin/config/page.js

import { useState, useEffect } from 'react';
import { Save, Loader2, Store, Phone, MapPin, Clock, CreditCard, Truck, Info } from 'lucide-react';

const PROVINCIAS = [
  'Buenos Aires', 'CABA', 'Catamarca', 'Chaco', 'Chubut',
  'Córdoba', 'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy',
  'La Pampa', 'La Rioja', 'Mendoza', 'Misiones', 'Neuquén',
  'Río Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz',
  'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucumán',
];

const CONFIG_DEFAULT = {
  // Tienda
  nombreTienda:    'Marroquinería JMR',
  email:           'cuerosjmr@hotmail.com',
  whatsapp:        '543834927252',
  instagram:       'marroquineriajmr',
  facebook:        'JMRmarroquineria',

  // Sucursales
  sucursal1_nombre:    'San Fernando - Central',
  sucursal1_direccion: 'Rivadavia 564',
  sucursal1_horario:   'Lun-Vie 8:30-13 / 17-21:30 · Sáb 9-13 / 17-21',

  sucursal2_nombre:    'Valle Viejo',
  sucursal2_direccion: 'Av. Pte. Castillo 1165',
  sucursal2_horario:   'Lun-Vie 8:30-13 / 17-21:30 · Sáb 9-13 / 17-21',

  // Envíos
  envioGratisDesde:   '150000',
  costoEnvioDefault:  '5000',

  // Transferencia
  titularCbu:  'Maria Lourdes Quispe',
  bancoNombre: 'Banco Nación / Mercado Pago',
  cbu:         '',
  alias:       '',

  // MP
  mpHabilitado: true,

  // Mantenimiento
  modoMantenimiento: false,
};

function Section({ icon: Icon, title, children }) {
  return (
    <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px', borderBottom: '1px solid #f3f4f6' }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={14} color="#6DBE45" />
        </div>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: '#111', margin: 0 }}>{title}</h2>
      </div>
      <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {children}
      </div>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 5 }}>{label}</label>
      {children}
      {hint && <p style={{ fontSize: 11, color: '#9ca3af', margin: '4px 0 0' }}>{hint}</p>}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = 'text', prefix }) {
  return (
    <div style={{ position: 'relative' }}>
      {prefix && (
        <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: '#9ca3af', userSelect: 'none' }}>
          {prefix}
        </span>
      )}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', padding: prefix ? '9px 12px 9px 28px' : '9px 12px',
          border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none',
          boxSizing: 'border-box', color: '#111', background: 'white',
        }}
      />
    </div>
  );
}

function Toggle({ checked, onChange, label, desc }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
      <div>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#111', margin: 0 }}>{label}</p>
        {desc && <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>{desc}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        style={{
          width: 44, height: 24, borderRadius: 12, border: 'none',
          background: checked ? '#6DBE45' : '#d1d5db',
          cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0,
        }}
      >
        <span style={{
          position: 'absolute', top: 2, width: 20, height: 20,
          borderRadius: '50%', background: 'white', transition: 'left 0.2s',
          left: checked ? 22 : 2, boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }} />
      </button>
    </div>
  );
}

function Grid2({ children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="cfg-grid2">
  <style>{`@media(max-width:520px){.cfg-grid2{grid-template-columns:1fr!important}}`}</style>
      {children}
    </div>
  );
}

export default function AdminConfigPage() {
  const [config,    setConfig]    = useState(CONFIG_DEFAULT);
  const [guardando, setGuardando] = useState(false);
  const [guardado,  setGuardado]  = useState(false);

  // En producción fetchearías desde /api/admin/config
  // useEffect(() => { fetch('/api/admin/config').then(r=>r.json()).then(d=>setConfig({...CONFIG_DEFAULT,...d})); }, []);

  const set = (key) => (val) => setConfig(p => ({ ...p, [key]: val }));

  async function guardar() {
    setGuardando(true);
    try {
      // await fetch('/api/admin/config', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(config) });
      await new Promise(r => setTimeout(r, 600)); // simulación
      setGuardado(true);
      setTimeout(() => setGuardado(false), 2500);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 4px' }}>Configuración</h1>
          <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>Ajustes generales de la tienda online</p>
        </div>
        <button onClick={guardar} disabled={guardando} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: guardado ? '#10b981' : '#6DBE45', color: 'white', border: 'none',
          padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
          cursor: 'pointer', flexShrink: 0, opacity: guardando ? 0.7 : 1, transition: 'background 0.3s',
        }}>
          {guardando
            ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Guardando...</>
            : guardado
              ? '✓ Guardado'
              : <><Save size={14} /> Guardar cambios</>
          }
        </button>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Tienda */}
        <Section icon={Store} title="Datos de la tienda">
          <Grid2>
            <Field label="Nombre de la tienda">
              <Input value={config.nombreTienda} onChange={set('nombreTienda')} placeholder="JMR Marroquinería" />
            </Field>
            <Field label="Email de contacto">
              <Input value={config.email} onChange={set('email')} placeholder="cuerosjmr@hotmail.com" type="email" />
            </Field>
          </Grid2>
          <Grid2>
            <Field label="Instagram" hint="Solo el nombre de usuario, sin @">
              <Input value={config.instagram} onChange={set('instagram')} placeholder="marroquineriajmr" prefix="@" />
            </Field>
            <Field label="Facebook" hint="Nombre de página">
              <Input value={config.facebook} onChange={set('facebook')} placeholder="JMRmarroquineria" />
            </Field>
          </Grid2>
        </Section>

        {/* WhatsApp */}
        <Section icon={Phone} title="WhatsApp">
          <Field label="Número de WhatsApp" hint="Formato internacional sin +, ej: 543834927252">
            <Input value={config.whatsapp} onChange={set('whatsapp')} placeholder="543834927252" />
          </Field>
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 14px' }}>
            <p style={{ fontSize: 12, color: '#15803d', margin: 0 }}>
              Vista previa del link:{' '}
              <a href={`https://wa.me/${config.whatsapp}`} target="_blank" rel="noopener noreferrer"
                style={{ color: '#6DBE45', fontWeight: 700 }}>
                wa.me/{config.whatsapp}
              </a>
            </p>
          </div>
        </Section>

        {/* Sucursales */}
        <Section icon={MapPin} title="Sucursales">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Sucursal 1 */}
            <div style={{ padding: '14px', border: '1px solid #e5e7eb', borderRadius: 10 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#6DBE45', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Sucursal 1 — Principal</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Field label="Nombre">
                  <Input value={config.sucursal1_nombre} onChange={set('sucursal1_nombre')} placeholder="San Fernando - Central" />
                </Field>
                <Field label="Dirección">
                  <Input value={config.sucursal1_direccion} onChange={set('sucursal1_direccion')} placeholder="Rivadavia 564" />
                </Field>
                <Field label="Horario">
                  <Input value={config.sucursal1_horario} onChange={set('sucursal1_horario')} placeholder="Lun-Vie 8:30-13 / 17-21:30" />
                </Field>
              </div>
            </div>
            {/* Sucursal 2 */}
            <div style={{ padding: '14px', border: '1px solid #e5e7eb', borderRadius: 10 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Sucursal 2</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Field label="Nombre">
                  <Input value={config.sucursal2_nombre} onChange={set('sucursal2_nombre')} placeholder="Valle Viejo" />
                </Field>
                <Field label="Dirección">
                  <Input value={config.sucursal2_direccion} onChange={set('sucursal2_direccion')} placeholder="Av. Pte. Castillo 1165" />
                </Field>
                <Field label="Horario">
                  <Input value={config.sucursal2_horario} onChange={set('sucursal2_horario')} placeholder="Lun-Vie 8:30-13 / 17-21:30" />
                </Field>
              </div>
            </div>
          </div>
        </Section>

        {/* Envíos */}
        <Section icon={Truck} title="Envíos">
          <Grid2>
            <Field label="Envío gratis desde ($)" hint="Poner 0 para desactivar">
              <Input value={config.envioGratisDesde} onChange={set('envioGratisDesde')} placeholder="150000" type="number" prefix="$" />
            </Field>
            <Field label="Costo de envío base ($)" hint="Se usa si no hay tabla por zona">
              <Input value={config.costoEnvioDefault} onChange={set('costoEnvioDefault')} placeholder="5000" type="number" prefix="$" />
            </Field>
          </Grid2>
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '10px 14px', display: 'flex', gap: 8 }}>
            <Info size={14} color="#3b82f6" style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 12, color: '#1d4ed8', margin: 0 }}>
              Los costos por zona se calculan en <code style={{ background: '#dbeafe', padding: '1px 4px', borderRadius: 4 }}>src/app/checkout/page.js</code> en la función <code style={{ background: '#dbeafe', padding: '1px 4px', borderRadius: 4 }}>calcularEnvio()</code>.
            </p>
          </div>
        </Section>

        {/* Métodos de pago */}
        <Section icon={CreditCard} title="Métodos de pago">
          <Toggle
            checked={config.mpHabilitado}
            onChange={set('mpHabilitado')}
            label="Mercado Pago habilitado"
            desc="Permite pagar con tarjeta, débito y efectivo en puntos de pago"
          />

          <div style={{ height: 1, background: '#f3f4f6' }} />

          <p style={{ fontSize: 12, fontWeight: 700, color: '#555', margin: 0 }}>Datos de transferencia bancaria</p>
          <Grid2>
            <Field label="Titular de la cuenta">
              <Input value={config.titularCbu} onChange={set('titularCbu')} placeholder="Nombre completo" />
            </Field>
            <Field label="Banco / billetera">
              <Input value={config.bancoNombre} onChange={set('bancoNombre')} placeholder="Banco Nación / MP" />
            </Field>
          </Grid2>
          <Grid2>
            <Field label="CBU" hint="22 dígitos">
              <Input value={config.cbu} onChange={set('cbu')} placeholder="0000000000000000000000" />
            </Field>
            <Field label="Alias">
              <Input value={config.alias} onChange={set('alias')} placeholder="ALIAS.PAGO.JMR" />
            </Field>
          </Grid2>
          <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 14px', display: 'flex', gap: 8 }}>
            <Info size={14} color="#f59e0b" style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 12, color: '#92400e', margin: 0 }}>
              Estos datos se muestran en la página de éxito de transferencia y en el checkout. Actualizalos en{' '}
              <code style={{ background: '#fef9c3', padding: '1px 4px', borderRadius: 4 }}>src/app/checkout/page.js</code> (constante <code style={{ background: '#fef9c3', padding: '1px 4px', borderRadius: 4 }}>TRANSFERENCIA</code>).
            </p>
          </div>
        </Section>

        {/* Mantenimiento */}
        <Section icon={Info} title="Modo mantenimiento">
          <Toggle
            checked={config.modoMantenimiento}
            onChange={set('modoMantenimiento')}
            label="Activar modo mantenimiento"
            desc="Redirige toda la tienda a /mantenimiento. Solo las APIs y el admin siguen accesibles."
          />
          <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 14px', display: 'flex', gap: 8 }}>
            <Info size={14} color="#9ca3af" style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>
              Para activar en producción, cambiá la variable de entorno{' '}
              <code style={{ background: '#f3f4f6', padding: '1px 4px', borderRadius: 4 }}>MODO_MANTENIMIENTO=true</code> en tu <code style={{ background: '#f3f4f6', padding: '1px 4px', borderRadius: 4 }}>.env</code>.
            </p>
          </div>
        </Section>

      </div>

      {/* Botón guardar inferior */}
      <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={guardar} disabled={guardando} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: guardado ? '#10b981' : '#6DBE45', color: 'white', border: 'none',
          padding: '12px 24px', borderRadius: 8, fontSize: 14, fontWeight: 600,
          cursor: 'pointer', opacity: guardando ? 0.7 : 1, transition: 'background 0.3s',
        }}>
          {guardando
            ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Guardando...</>
            : guardado
              ? '✓ Cambios guardados'
              : <><Save size={14} /> Guardar cambios</>
          }
        </button>
      </div>
    </div>
  );
}