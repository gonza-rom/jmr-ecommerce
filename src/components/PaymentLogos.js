'use client';

import Image from 'next/image';

export default function PaymentLogos({ mediosDePago }) {
  return (
    <div className="pago-logos">
      {mediosDePago.map((m) => (
        <div key={m.nombre} className="pago-logo-item" title={m.nombre}>
          <Image
            src={`/pagos/${m.logo}`}
            alt={m.nombre}
            width={48}
            height={32}
            style={{ objectFit: 'contain', maxHeight: '32px', width: 'auto' }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = `<span style="font-size:0.65rem;font-weight:700;color:#444;text-align:center">${m.nombre}</span>`;
            }}
          />
        </div>
      ))}
    </div>
  );
}
