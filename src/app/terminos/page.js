// src/app/terminos/page.js

import Link from 'next/link';

export const metadata = {
  title: 'Términos y Condiciones | Marroquinería JMR',
  description: 'Términos y condiciones de compra de Marroquinería JMR. Catamarca, Argentina.',
};

const SECCION = ({ numero, titulo, children }) => (
  <section style={{ marginBottom: '2.5rem' }}>
    <h2 style={{
      fontSize: '1rem', fontWeight: 800, color: '#1a1a1a',
      margin: '0 0 0.75rem', display: 'flex', alignItems: 'baseline', gap: '0.5rem',
    }}>
      <span style={{ color: '#6DBE45', fontVariantNumeric: 'tabular-nums' }}>{numero}.</span>
      {titulo}
    </h2>
    <div style={{ fontSize: '0.9rem', color: '#4b5563', lineHeight: 1.8 }}>{children}</div>
  </section>
);

export default function TerminosPage() {
  const hoy = new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div style={{ minHeight: '100vh', background: '#f9f9f9', fontFamily: 'Inter, sans-serif' }}>

      {/* Header */}
      <div style={{ background: '#1a1c1c', color: 'white', padding: '3rem 1.5rem' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#6DBE45', margin: '0 0 0.75rem' }}>
            Marroquinería JMR
          </p>
          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 900, letterSpacing: '-0.03em', margin: '0 0 0.5rem' }}>
            Términos y Condiciones
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.45)', margin: 0 }}>
            Última actualización: {hoy}
          </p>
        </div>
      </div>

      {/* Contenido */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '3rem 1.5rem' }}>

        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '1rem 1.25rem', marginBottom: '2.5rem' }}>
          <p style={{ fontSize: '0.875rem', color: '#1d4ed8', margin: 0, lineHeight: 1.6 }}>
            Al realizar una compra en <strong>jmrmarroquineria.com.ar</strong> o en nuestras sucursales,
            aceptás los presentes Términos y Condiciones. Si no estás de acuerdo, no realices la compra.
          </p>
        </div>

        <SECCION numero="1" titulo="Datos del vendedor">
          <p>
            <strong>Marroquinería JMR</strong> es una empresa unipersonal registrada en la República Argentina,
            con domicilio comercial en Rivadavia 564, San Fernando del Valle de Catamarca, Catamarca (CP 4700).
          </p>
          <p style={{ marginTop: '0.5rem' }}>
            CUIT del titular: María Lourdes Quispe.<br />
            Email de contacto: <a href="mailto:cuerosjmr@hotmail.com" style={{ color: '#6DBE45' }}>cuerosjmr@hotmail.com</a><br />
            Teléfono: +54 383 492-7252
          </p>
        </SECCION>

        <SECCION numero="2" titulo="Alcance de los términos">
          <p>
            Estos Términos regulan la relación comercial entre Marroquinería JMR y quienes adquieran
            productos a través del sitio web, por WhatsApp, o en nuestros locales físicos.
            Aplican a todas las compras, independientemente del método de pago utilizado.
          </p>
        </SECCION>

        <SECCION numero="3" titulo="Productos y disponibilidad">
          <ul style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <li>Los precios se expresan en pesos argentinos (ARS) e incluyen IVA cuando corresponde.</li>
            <li>El stock se actualiza en tiempo real; si un producto se agota entre el carrito y el pago, te informaremos y procesaremos el reembolso correspondiente.</li>
            <li>Las imágenes de los productos son ilustrativas. Los colores reales pueden variar levemente según la pantalla.</li>
            <li>Nos reservamos el derecho de modificar precios sin previo aviso, excepto para pedidos ya confirmados.</li>
          </ul>
        </SECCION>

        <SECCION numero="4" titulo="Proceso de compra">
          <p>El proceso de compra online sigue estos pasos:</p>
          <ol style={{ paddingLeft: '1.25rem', margin: '0.5rem 0 0', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <li>Selección de productos y agregado al carrito.</li>
            <li>Ingreso de datos de contacto y entrega.</li>
            <li>Selección de método de pago.</li>
            <li>Confirmación del pedido.</li>
            <li>Acreditación del pago (según el método elegido).</li>
            <li>Preparación y despacho o coordinación de retiro.</li>
          </ol>
          <p style={{ marginTop: '0.75rem' }}>
            El pedido queda confirmado una vez acreditado el pago. Hasta ese momento, nos reservamos el derecho de cancelarlo si el stock no estuviera disponible.
          </p>
        </SECCION>

        <SECCION numero="5" titulo="Métodos de pago">
          <p>Aceptamos los siguientes métodos de pago:</p>
          <ul style={{ paddingLeft: '1.25rem', margin: '0.5rem 0 0', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <li><strong>Mercado Pago / Fiserv:</strong> tarjetas de crédito, débito y billeteras digitales. El procesamiento es realizado por plataformas de terceros sujetas a sus propios términos.</li>
            <li><strong>Transferencia bancaria / CBU:</strong> el pedido se confirma una vez que el pago es acreditado en nuestra cuenta. El cliente debe enviar el comprobante por WhatsApp.</li>
            <li><strong>Efectivo:</strong> disponible únicamente para retiro en local.</li>
          </ul>
        </SECCION>

        <SECCION numero="6" titulo="Envíos">
          <ul style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <li>Realizamos envíos a todo el país a través de <strong>OCA</strong>.</li>
            <li>El costo de envío se calcula según el código postal de destino y se muestra antes de confirmar la compra.</li>
            <li>El envío es gratuito en compras superiores a $150.000 (ARS).</li>
            <li>Los plazos de entrega son estimativos y dependen de OCA. No nos hacemos responsables por demoras imputables al correo.</li>
            <li>Una vez despachado el paquete, el cliente recibe el número de seguimiento de OCA para hacer tracking.</li>
            <li>También ofrecemos retiro gratuito en nuestras sucursales de Rivadavia 564 y Av. Pte. Castillo 1165 (Valle Viejo), Catamarca.</li>
          </ul>
        </SECCION>

        <SECCION numero="7" titulo="Cambios y devoluciones">
          <p>
            De acuerdo con la <strong>Ley 24.240 de Defensa del Consumidor</strong>, el comprador cuenta con
            <strong> 10 días corridos</strong> desde la recepción del producto para solicitar cambio o devolución,
            sin necesidad de justificar el motivo (compras online).
          </p>
          <p style={{ marginTop: '0.75rem' }}>Requisitos para hacer efectivo el cambio o devolución:</p>
          <ul style={{ paddingLeft: '1.25rem', margin: '0.5rem 0 0', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <li>El producto debe estar en las mismas condiciones en que fue recibido: sin uso, con etiquetas y en su embalaje original.</li>
            <li>El cliente debe presentar el comprobante de compra (número de pedido o ticket).</li>
            <li>El costo de devolución por correo está a cargo del cliente, salvo que el producto tenga un defecto de fabricación.</li>
            <li>Para devoluciones: contactar a <a href="mailto:cuerosjmr@hotmail.com" style={{ color: '#6DBE45' }}>cuerosjmr@hotmail.com</a> indicando el número de pedido y el motivo.</li>
          </ul>
          <p style={{ marginTop: '0.75rem' }}>
            Los productos personalizados o bajo pedido especial <strong>no admiten devolución</strong> salvo defecto de fabricación.
          </p>
        </SECCION>

        <SECCION numero="8" titulo="Garantía">
          <p>
            Todos nuestros productos tienen garantía legal mínima de <strong>3 meses</strong> contra defectos de fabricación,
            de acuerdo con la Ley 24.240. Para artículos de cuero de alta gama, la garantía en costuras y herrajes puede extenderse según la marca.
          </p>
          <p style={{ marginTop: '0.5rem' }}>
            Para hacer efectiva la garantía, el cliente debe comunicarse con nosotros adjuntando foto del defecto y número de pedido.
            La garantía no cubre daños por uso inadecuado, desgaste normal o negligencia.
          </p>
        </SECCION>

        <SECCION numero="9" titulo="Protección de datos personales">
          <p>
            Los datos personales que nos brindás son utilizados exclusivamente para procesar tu pedido y comunicarnos con vos.
            No los compartimos con terceros, salvo con los operadores logísticos (OCA) y plataformas de pago necesarios para completar la transacción.
          </p>
          <p style={{ marginTop: '0.5rem' }}>
            Podés solicitar la rectificación, actualización o eliminación de tus datos contactándonos en cualquier momento.
            Nuestro tratamiento de datos se rige por la <strong>Ley 25.326 de Protección de Datos Personales</strong> (Argentina).
          </p>
        </SECCION>

        <SECCION numero="10" titulo="Propiedad intelectual">
          <p>
            Todos los contenidos del sitio (imágenes, textos, logotipos, diseño) son propiedad de Marroquinería JMR
            o de sus respectivos titulares, y están protegidos por las leyes de propiedad intelectual vigentes.
            Queda prohibida su reproducción total o parcial sin autorización expresa.
          </p>
        </SECCION>

        <SECCION numero="11" titulo="Jurisdicción y ley aplicable">
          <p>
            Ante cualquier controversia derivada de estos Términos, las partes se someten a la jurisdicción
            de los <strong>Tribunales Ordinarios de la Ciudad de San Fernando del Valle de Catamarca</strong>,
            renunciando a cualquier otro fuero que pudiera corresponder.
            La ley aplicable es la de la <strong>República Argentina</strong>.
          </p>
        </SECCION>

        <SECCION numero="12" titulo="Modificaciones">
          <p>
            Nos reservamos el derecho de modificar estos Términos en cualquier momento.
            Los cambios serán publicados en esta página con la fecha de actualización correspondiente.
            El uso continuado del sitio implica la aceptación de los Términos vigentes.
          </p>
        </SECCION>

        {/* Navegación a política de privacidad */}
        <div style={{
          borderTop: '1px solid #e5e7eb', paddingTop: '2rem', marginTop: '1rem',
          display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem',
        }}>
          <p style={{ fontSize: '0.875rem', color: '#9ca3af', margin: 0 }}>
            Ver también:{' '}
            <Link href="/privacidad" style={{ color: '#6DBE45', fontWeight: 600 }}>
              Política de Privacidad
            </Link>
            {' · '}
            <Link href="/devoluciones" style={{ color: '#6DBE45', fontWeight: 600 }}>
              Política de Devoluciones
            </Link>
          </p>
          <Link href="/productos" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '10px 20px', background: '#6DBE45', color: 'white',
            borderRadius: 8, fontSize: '0.875rem', fontWeight: 700, textDecoration: 'none',
          }}>
            Volver a la tienda →
          </Link>
        </div>
      </div>
    </div>
  );
}