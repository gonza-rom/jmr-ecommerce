// src/app/productos/page.js
// Server wrapper solo para poder exportar metadata real (título/preview al
// compartir el catálogo o una categoría). El filtrado interactivo sigue
// siendo 100% client-side en CatalogoClient.

import CatalogoClient from '@/components/CatalogoClient';

export async function generateMetadata({ searchParams }) {
  const sp = await searchParams;
  const busqueda = sp?.busqueda;

  if (busqueda) {
    return {
      title: `"${busqueda}" — Resultados | Marroquinería JMR`,
      description: `Resultados de búsqueda para "${busqueda}" en Marroquinería JMR. Mochilas, bolsos, carteras y más.`,
    };
  }

  return {
    title: 'Catálogo — Mochilas, Bolsos y Carteras | Marroquinería JMR',
    description: 'Explorá todo el catálogo de Marroquinería JMR: mochilas, valijas, billeteras y carteras en cuero y materiales técnicos.',
  };
}

export default function ProductosPage() {
  return <CatalogoClient />;
}
