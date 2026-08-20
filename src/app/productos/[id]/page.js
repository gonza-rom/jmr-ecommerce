// src/app/productos/[id]/page.js
// Server Component: trae el producto en el servidor (SEO + preview al
// compartir) y delega toda la interacción (carrito, tabs, envío, etc.)
// a ProductoDetalleClient.

import { notFound } from 'next/navigation';
import { getProducto } from '@/lib/devhub';
import ProductoDetalleClient from '@/components/ProductoDetalleClient';

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { id } = await params;
  const producto = await getProducto(id);

  if (!producto) {
    return { title: 'Producto no encontrado | Marroquinería JMR' };
  }

  const precio      = producto.precio?.toLocaleString('es-AR');
  const descripcion = producto.descripcion?.slice(0, 160)
    ?? `Comprá ${producto.nombre} en Marroquinería JMR — $${precio}. Envíos a todo el país.`;
  const imagen = producto.imagen || producto.imagenes?.[0];

  return {
    title: `${producto.nombre} — $${precio} | Marroquinería JMR`,
    description: descripcion,
    openGraph: {
      type: 'website',
      title: producto.nombre,
      description: descripcion,
      images: imagen ? [{ url: imagen, width: 800, height: 800, alt: producto.nombre }] : undefined,
    },
    twitter: {
      card: imagen ? 'summary_large_image' : 'summary',
      title: producto.nombre,
      description: descripcion,
      images: imagen ? [imagen] : undefined,
    },
    alternates: {
      canonical: `https://www.jmrmarroquineria.com.ar/productos/${producto.id}`,
    },
  };
}

export default async function ProductoDetallePage({ params }) {
  const { id } = await params;
  const producto = await getProducto(id);

  if (!producto) notFound();

  return <ProductoDetalleClient producto={producto} />;
}
