// src/app/admin/config/page.js
// Esta página todavía no persiste nada — se sacó del menú del sidebar
// para no confundir al admin. Si en algún momento se implementa la
// tabla de configuración real, este placeholder se reemplaza por el
// formulario completo.

import { Construction } from 'lucide-react';

export default function AdminConfigPage() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', padding: '80px 20px', gap: 12,
    }}>
      <Construction size={32} color="#9ca3af" />
      <h1 style={{ fontSize: 18, fontWeight: 700, color: '#111', margin: 0 }}>
        Configuración todavía no disponible
      </h1>
      <p style={{ fontSize: 13, color: '#6b7280', maxWidth: 440, margin: 0, lineHeight: 1.6 }}>
        Esta sección no guarda cambios reales todavía. Por ahora, WhatsApp, costos de envío
        y datos de transferencia se editan directamente en el código
        (<code style={{ background: '#f3f4f6', padding: '1px 5px', borderRadius: 4 }}>src/app/checkout/page.js</code> y
        {' '}<code style={{ background: '#f3f4f6', padding: '1px 5px', borderRadius: 4 }}>src/app/checkout/exito/page.js</code>).
      </p>
    </div>
  );
}
