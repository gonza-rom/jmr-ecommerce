'use client';

import { useCart } from '@/context/CartContext';
import ProductCard from '@/components/ProductCard';

export default function FeaturedProductsGrid({ productos }) {
  const { addToCart } = useCart();

  return (
    <div className="products-grid">
      {productos.map((producto) => (
        <ProductCard
          key={producto.id}
          producto={producto}
          onAddToCart={addToCart}
        />
      ))}
    </div>
  );
}
