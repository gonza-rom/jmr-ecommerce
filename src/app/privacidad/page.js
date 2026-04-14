// src/app/privacidad/page.js

import Link from 'next/link';
import { ArrowLeft, Shield, Eye, Lock, Trash2, Mail, Database, Globe } from 'lucide-react';

export const metadata = {
  title: 'Política de Privacidad | Marroquinería JMR',
  description: 'Política de privacidad y tratamiento de datos personales de Marroquinería JMR. Ley 25.326, Argentina.',
};

const SECCION = ({ icon: Icon, titulo, color = '#6DBE45', children }) => (
  <section style={{ marginBottom: '2.5rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
      <div style={{
        width: 36, height: 36, borderRadius: 8, flexShrink: 0,
        background: color + '18',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={17} color={color} />
      </div>
      <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#1a1a1a', margin: 0, letterSpacing: '-0.01em' }}>
        {titulo}
      </h2>
    </div>
    <div style={{ fontSize: '0.9rem', color: '#4b5563', lineHeight: 1.85, paddingLeft: '0.25rem' }}>
      {children}
    </div>
  </section>
);

const Tabla = ({ filas }) => (
  <div style={{ overflowX: 'auto', marginTop: '0.75rem' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
      <thead>
        <tr style={{ background: '#f3f4f6' }}>
          {['Dato', 'Para qué lo usamos', 'Base legal'].map(h => (
            <th key={h} style={{
              padding: '0.6rem 0.9rem', textAlign: 'left',
              fontWeight: 700, color: '#374151', fontSize: '0.75rem',
              textTransform: 'uppercase', letterSpacing: '0.06em',
              border: '1px solid #e5e7eb',
            }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {filas.map(([dato, uso, base], i) => (
          <tr key={i} style={{ background: i % 2 === 0 ? 'white' : '#f9fafb' }}>
            <td style={{ padding: '0.65rem 0.9rem', border: '1px solid #e5e7eb', fontWeight: 600, color: '#111', whiteSpace: 'nowrap' }}>{dato}</td>
            <td style={{ padding: '0.65rem 0.9rem', border: '1px solid #e5e7eb', color: '#4b5563' }}>{uso}</td>
            <td style={{ padding: '0.65rem 0.9rem', border: '1px solid #e5e7eb', color: '#6b7280', fontStyle: 'italic' }}>{base}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Derecho = ({ titulo, desc }) => (
  <div style={{
    padding: '1rem 1.25rem',
    background: 'white', border: '1px solid #e5e7eb', borderRadius: 10,
    borderLeft: '3px solid #6DBE45',
  }}>
    <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1a1a1a', margin: '0 0 0.3rem' }}>{titulo}</p>
    <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0, lineHeight: 1.6 }}>{desc}</p>
  </div>
);

export default function PrivacidadPage() {
  const hoy = new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div style={{ minHeight: '100vh', background: '#f9f9f9', fontFamily: 'Inter, sans-serif' }}>

      {/* Header */}
      <div style={{ background: '#1a1c1c', color: 'white', padding: '3.5rem 1.5rem' }}>
        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          <Link href="/productos" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)',
            textDecoration: 'none', marginBottom: '1.5rem',
          }}>
            <ArrowLeft size={13} /> Volver a la tienda
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{
              width: 52, height: 52, borderRadius: 12,
              background: 'rgba(109,190,69,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Shield size={26} color="#6DBE45" />
            </div>
            <div>
              <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.5rem)', fontWeight: 900, letterSpacing: '-0.03em', margin: 0 }}>
                Política de Privacidad
              </h1>
              <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)', margin: '0.25rem 0 0' }}>
                Última actualización: {hoy} · Vigente en la República Argentina
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '3rem 1.5rem' }}>

        {/* Intro */}
        <div style={{
          background: '#f0fdf4', border: '1px solid #bbf7d0',
          borderRadius: 12, padding: '1.25rem 1.5rem', marginBottom: '2.5rem',
        }}>
          <p style={{ fontSize: '0.9rem', color: '#14532d', margin: 0, lineHeight: 1.8 }}>
            En <strong>Marroquinería JMR</strong> respetamos tu privacidad y nos comprometemos a proteger tus datos personales
            de acuerdo con la <strong>Ley 25.326 de Protección de Datos Personales</strong> de la República Argentina
            y sus normas reglamentarias. Esta política explica qué datos recopilamos, cómo los usamos y cuáles son tus derechos.
          </p>
        </div>

        {/* Responsable */}
        <SECCION icon={Database} titulo="Responsable del tratamiento de datos">
          <div style={{
            background: 'white', border: '1px solid #e5e7eb',
            borderRadius: 10, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem',
          }}>
            {[
              ['Titular',    'María Lourdes Quispe — Marroquinería JMR'],
              ['Domicilio',  'Rivadavia 564, San Fernando del Valle de Catamarca (CP 4700), Catamarca, Argentina'],
              ['Email',      'cuerosjmr@hotmail.com'],
              ['Teléfono',   '+54 383 492-7252'],
              ['Sitio web',  'jmrmarroquineria.com.ar'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', gap: '0.75rem', fontSize: '0.875rem' }}>
                <span style={{ fontWeight: 700, color: '#374151', minWidth: 80, flexShrink: 0 }}>{k}</span>
                <span style={{ color: '#4b5563' }}>{v}</span>
              </div>
            ))}
          </div>
        </SECCION>

        {/* Qué datos recopilamos */}
        <SECCION icon={Eye} titulo="Datos que recopilamos y para qué los usamos" color="#3b82f6">
          <p style={{ marginBottom: '0.75rem' }}>
            Recopilamos únicamente los datos necesarios para brindarte el servicio. A continuación el detalle:
          </p>
          <Tabla filas={[
            ['Nombre y apellido',        'Identificarte como comprador y preparar tu pedido',             'Ejecución de contrato'],
            ['Email',                    'Enviar confirmación de pedido y comunicaciones sobre tu compra', 'Ejecución de contrato'],
            ['Teléfono / WhatsApp',      'Coordinar entrega y contactarte ante cualquier inconveniente',   'Ejecución de contrato'],
            ['Dirección de entrega',     'Realizar el envío a través de OCA',                              'Ejecución de contrato'],
            ['Código postal',            'Calcular el costo y plazo de envío',                             'Interés legítimo'],
            ['Historial de pedidos',     'Mostrar tus compras en tu cuenta y gestionar garantías',         'Ejecución de contrato'],
            ['Datos de pago (parciales)','Verificar la transacción (no almacenamos datos de tarjeta)',     'Obligación legal'],
            ['Dirección IP / cookies',   'Seguridad del sitio y análisis de uso anónimo',                  'Interés legítimo'],
          ]} />
          <p style={{ marginTop: '1rem', color: '#6b7280', fontSize: '0.85rem' }}>
            <strong>Importante:</strong> no almacenamos números de tarjeta de crédito ni CVV. El procesamiento de pagos
            lo realizan plataformas certificadas PCI-DSS (Mercado Pago / Fiserv) que tienen sus propias políticas de privacidad.
          </p>
        </SECCION>

        {/* Cómo recopilamos */}
        <SECCION icon={Globe} titulo="Cómo recopilamos los datos" color="#8b5cf6">
          <ul style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><strong>Formularios del sitio web:</strong> cuando completás el checkout, te registrás o contactás por nuestro formulario.</li>
            <li><strong>WhatsApp:</strong> cuando nos escribís directamente para consultas o pedidos.</li>
            <li><strong>Compras en local:</strong> cuando comprás en nuestras sucursales físicas.</li>
            <li><strong>Cookies técnicas:</strong> para mantener tu sesión activa y guardar el carrito de compras. No usamos cookies de publicidad de terceros.</li>
          </ul>
        </SECCION>

        {/* Con quién compartimos */}
        <SECCION icon={Lock} titulo="Con quién compartimos tus datos" color="#f59e0b">
          <p style={{ marginBottom: '0.75rem' }}>
            Compartimos tus datos únicamente con los terceros necesarios para completar tu compra y en la medida estrictamente necesaria:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              {
                nombre:  'OCA (correo)',
                datos:   'Nombre, domicilio de entrega, teléfono, email',
                motivo:  'Realizar el despacho y permitir el tracking del envío',
                enlace:  'https://www.oca.com.ar/politica-de-privacidad',
              },
              {
                nombre:  'Mercado Pago / Fiserv',
                datos:   'Email, monto, referencia del pedido',
                motivo:  'Procesar el pago con tarjeta o billetera digital',
                enlace:  'https://www.mercadopago.com.ar/privacidad',
              },
              {
                nombre:  'Supabase (autenticación)',
                datos:   'Email, contraseña cifrada',
                motivo:  'Gestionar tu cuenta y sesión segura',
                enlace:  'https://supabase.com/privacy',
              },
            ].map(({ nombre, datos, motivo, enlace }) => (
              <div key={nombre} style={{
                background: 'white', border: '1px solid #e5e7eb',
                borderRadius: 10, padding: '1rem 1.25rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.4rem' }}>
                  <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1a1a1a', margin: 0 }}>{nombre}</p>
                  <a href={enlace} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: '0.75rem', color: '#6DBE45', textDecoration: 'none', whiteSpace: 'nowrap', fontWeight: 600 }}>
                    Ver política →
                  </a>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: '0 0 0.2rem' }}>
                  <strong>Datos compartidos:</strong> {datos}
                </p>
                <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: 0 }}>
                  <strong>Motivo:</strong> {motivo}
                </p>
              </div>
            ))}
          </div>
          <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#6b7280' }}>
            No vendemos, alquilamos ni cedemos tus datos personales a terceros con fines comerciales o publicitarios. Nunca.
          </p>
        </SECCION>

        {/* Retención */}
        <SECCION icon={Database} titulo="¿Por cuánto tiempo guardamos tus datos?" color="#6b7280">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              ['Datos de pedidos',          '5 años desde la compra (obligación contable e impositiva)'],
              ['Cuenta de usuario',         'Mientras tu cuenta esté activa. Podés solicitar la eliminación en cualquier momento.'],
              ['Registros de navegación',   'Máximo 12 meses'],
              ['Datos de WhatsApp',         'Según la política de retención de Meta/WhatsApp'],
            ].map(([k, v]) => (
              <div key={k} style={{
                display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
                padding: '0.75rem 1rem', background: 'white', border: '1px solid #e5e7eb', borderRadius: 8,
              }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#374151', minWidth: 180, flexShrink: 0 }}>{k}</span>
                <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>{v}</span>
              </div>
            ))}
          </div>
        </SECCION>

        {/* Tus derechos */}
        <SECCION icon={Shield} titulo="Tus derechos sobre tus datos (ARCO)" color="#6DBE45">
          <p style={{ marginBottom: '1rem' }}>
            Según la Ley 25.326, tenés derecho a ejercer los derechos de Acceso, Rectificación, Cancelación y Oposición (ARCO):
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            <Derecho
              titulo="📋 Acceso"
              desc="Podés solicitarnos qué datos tuyos tenemos almacenados y cómo los estamos usando."
            />
            <Derecho
              titulo="✏️ Rectificación"
              desc="Si tus datos son incorrectos o están desactualizados, podés pedirnos que los corrijamos."
            />
            <Derecho
              titulo="🗑️ Cancelación / Eliminación"
              desc="Podés solicitar que eliminemos tus datos cuando ya no sean necesarios para la finalidad con que fueron recopilados."
            />
            <Derecho
              titulo="🚫 Oposición"
              desc="Podés oponerte al tratamiento de tus datos en los casos en que la ley lo permita."
            />
          </div>
          <div style={{
            background: '#f0fdf4', border: '1px solid #bbf7d0',
            borderRadius: 10, padding: '1rem 1.25rem',
          }}>
            <p style={{ fontSize: '0.875rem', color: '#14532d', margin: 0, lineHeight: 1.7 }}>
              Para ejercer cualquiera de estos derechos, escribinos a{' '}
              <a href="mailto:cuerosjmr@hotmail.com" style={{ color: '#6DBE45', fontWeight: 700 }}>
                cuerosjmr@hotmail.com
              </a>{' '}
              con el asunto <strong>"Ejercicio de derechos ARCO"</strong> indicando tu nombre, email y el derecho que querés ejercer.
              Respondemos en un plazo máximo de <strong>5 días hábiles</strong>.
            </p>
          </div>
          <p style={{ marginTop: '0.75rem', fontSize: '0.825rem', color: '#9ca3af' }}>
            También podés realizar una consulta o denuncia ante la{' '}
            <a href="https://www.argentina.gob.ar/aaip/datospersonales" target="_blank" rel="noopener noreferrer"
              style={{ color: '#6DBE45' }}>
              Agencia de Acceso a la Información Pública (AAIP)
            </a>, organismo de control de la Ley 25.326.
          </p>
        </SECCION>

        {/* Cookies */}
        <SECCION icon={Globe} titulo="Cookies y tecnologías de seguimiento" color="#3b82f6">
          <p style={{ marginBottom: '0.75rem' }}>
            Usamos únicamente cookies técnicas necesarias para el funcionamiento del sitio:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
            {[
              { nombre: 'jmr-cart',                  tipo: 'Local Storage', desc: 'Guarda los productos de tu carrito',         expira: 'Hasta que se vacíe el carrito' },
              { nombre: 'sb-* (Supabase)',            tipo: 'Cookie',       desc: 'Mantiene tu sesión de usuario activa',        expira: '7 días' },
              { nombre: 'next-auth / session',        tipo: 'Cookie',       desc: 'Seguridad de sesión',                         expira: 'Al cerrar sesión' },
            ].map(({ nombre, tipo, desc, expira }) => (
              <div key={nombre} style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                gap: '0.5rem', padding: '0.75rem 1rem',
                background: 'white', border: '1px solid #e5e7eb', borderRadius: 8,
                fontSize: '0.8rem',
              }}>
                <span style={{ fontWeight: 700, color: '#111', fontFamily: 'monospace' }}>{nombre}</span>
                <span style={{ color: '#6b7280' }}>{desc} <em style={{ color: '#9ca3af' }}>({tipo})</em></span>
                <span style={{ color: '#9ca3af' }}>{expira}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>
            No usamos cookies de publicidad, remarketing ni analíticas de terceros. No hay píxeles de Facebook, Google Ads ni similares.
          </p>
        </SECCION>

        {/* Seguridad */}
        <SECCION icon={Lock} titulo="Seguridad de los datos" color="#8b5cf6">
          <p>
            Implementamos medidas técnicas y organizativas para proteger tus datos personales contra acceso no autorizado,
            pérdida o alteración:
          </p>
          <ul style={{ paddingLeft: '1.25rem', margin: '0.75rem 0 0', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <li>Comunicaciones cifradas con <strong>HTTPS / TLS</strong> en todo el sitio.</li>
            <li>Contraseñas de usuarios almacenadas con hash seguro (bcrypt via Supabase Auth).</li>
            <li>Base de datos alojada en infraestructura certificada (Supabase / PostgreSQL).</li>
            <li>Acceso restringido a datos personales solo al personal que lo requiere para operar el negocio.</li>
            <li>Pagos procesados exclusivamente por plataformas certificadas PCI-DSS.</li>
          </ul>
          <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#6b7280' }}>
            En caso de una brecha de seguridad que afecte tus datos, te notificaremos en el menor tiempo posible
            y tomaremos las medidas necesarias para minimizar el impacto.
          </p>
        </SECCION>

        {/* Menores */}
        <SECCION icon={Shield} titulo="Menores de edad" color="#ef4444">
          <p>
            Nuestro sitio no está dirigido a menores de 18 años. No recopilamos intencionalmente datos
            personales de menores. Si sos padre o tutor y creés que tu hijo nos ha proporcionado datos personales,
            contactanos para eliminarlos de inmediato.
          </p>
        </SECCION>

        {/* Cambios */}
        <SECCION icon={Mail} titulo="Cambios a esta política" color="#6b7280">
          <p>
            Podemos actualizar esta política ocasionalmente para reflejar cambios en nuestras prácticas o en la legislación aplicable.
            Cuando lo hagamos, actualizaremos la fecha al inicio de este documento.
            Para cambios significativos, te notificaremos por email si tenés una cuenta registrada.
          </p>
          <p style={{ marginTop: '0.5rem' }}>
            El uso continuado del sitio tras la publicación de cambios implica la aceptación de la política actualizada.
          </p>
        </SECCION>

        {/* Contacto DPO / privacidad */}
        <div style={{
          background: '#1a1c1c', color: 'white',
          borderRadius: 16, padding: '2rem', marginBottom: '2rem',
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 0.5rem', letterSpacing: '-0.01em' }}>
            ¿Consultas sobre privacidad?
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.55)', margin: '0 0 1.25rem', lineHeight: 1.6 }}>
            Si tenés dudas sobre cómo tratamos tus datos o querés ejercer tus derechos ARCO, escribinos. Respondemos en 5 días hábiles.
          </p>
          <a href="mailto:cuerosjmr@hotmail.com?subject=Consulta%20privacidad%20-%20JMR"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '10px 20px', background: '#6DBE45', color: 'white',
              borderRadius: 8, fontSize: '0.875rem', fontWeight: 700, textDecoration: 'none',
            }}>
            <Mail size={15} /> cuerosjmr@hotmail.com
          </a>
        </div>

        {/* Navegación legal */}
        <div style={{
          borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem',
          display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between',
          alignItems: 'center', gap: '1rem',
        }}>
          <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
            <Link href="/terminos"     style={{ fontSize: '0.875rem', color: '#6DBE45', textDecoration: 'none', fontWeight: 600 }}>Términos y condiciones</Link>
            <Link href="/devoluciones" style={{ fontSize: '0.875rem', color: '#6DBE45', textDecoration: 'none', fontWeight: 600 }}>Devoluciones</Link>
          </div>
          <Link href="/productos" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '9px 18px', background: '#1a1c1c', color: 'white',
            borderRadius: 8, fontSize: '0.875rem', fontWeight: 700, textDecoration: 'none',
          }}>
            Volver a la tienda →
          </Link>
        </div>
      </div>
    </div>
  );
}