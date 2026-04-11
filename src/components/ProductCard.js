'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { getImagenesValidas } from './ProductGallery';

export default function ProductCard({ producto, onAddToCart }) {
  const images = getImagenesValidas(producto);
  const imagenPrincipal = images[0] || null;

  return (
    <div className="jmr-card">
      {/* Image */}
      <div className="jmr-card-img">
        <Link
          href={`/productos/${producto.id}`}
          style={{ display: 'block', width: '100%', height: '100%', position: 'relative', aspectRatio: '4/5' }}
        >
          {imagenPrincipal ? (
            <Image
              src={imagenPrincipal}
              alt={producto.nombre}
              fill
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f3f3' }}>
              <ShoppingBag size={48} color="#ddd" />
            </div>
          )}
        </Link>

        {images.length > 1 && (
          <div className="img-count">
            <svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            {images.length}
          </div>
        )}

        {producto.stock === 0 && (
          <div className="badge-nostock">
            <span>Sin Stock</span>
          </div>
        )}

        <button
          className="jmr-card-add"
          onClick={(e) => { e.preventDefault(); onAddToCart(producto, 1); }}
          disabled={producto.stock === 0}
          title={producto.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
        >
          <ShoppingBag size={18} />
        </button>
      </div>

      {/* Body */}
      <div className="jmr-card-body">
        {producto.categoria && (
          <p className="jmr-card-brand">{producto.categoria.nombre}</p>
        )}
        <Link href={`/productos/${producto.id}`} className="jmr-card-name">
          {producto.nombre}
        </Link>
        <p className="jmr-card-price">${producto.precio.toFixed(2)}</p>
        <Link href={`/productos/${producto.id}`} className="jmr-card-detail-btn">
          Ver Detalles
        </Link>
      </div>
    </div>
  );
}