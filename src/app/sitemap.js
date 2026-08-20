// src/app/sitemap.js
// Genera /sitemap.xml automáticamente con las páginas estáticas,
// categorías y todos los productos activos del catálogo.

import { getProductos, getCategorias } from '@/lib/devhub';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.jmrmarroquineria.com.ar';

export default async function sitemap() {
  const estaticas = [
    { url: `${BASE_URL}/`,           changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE_URL}/productos`,  changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE_URL}/nosotros`,   changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/contacto`,   changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/devoluciones`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE_URL}/terminos`,   changeFrequency: 'yearly',  priority: 0.2 },
    { url: `${BASE_URL}/privacidad`, changeFrequency: 'yearly',  priority: 0.2 },
  ].map((e) => ({ ...e, lastModified: new Date() }));

  let categorias = [];
  let productos  = [];

  try {
    const cats = await getCategorias();
    categorias = cats.flatMap((c) => [
      { url: `${BASE_URL}/productos?categoria=${c.id}`, changeFrequency: 'weekly', priority: 0.6, lastModified: new Date() },
      ...c.hijas.map((h) => ({
        url: `${BASE_URL}/productos?categoria=${h.id}`, changeFrequency: 'weekly', priority: 0.5, lastModified: new Date(),
      })),
    ]);
  } catch (err) {
    console.error('[sitemap] Error al listar categorías:', err.message);
  }

  try {
    // getProductos limita pageSize a 50 por llamada — paginamos hasta traer todo.
    const primera = await getProductos({ page: 1, pageSize: 50 });
    let todos = [...primera.productos];
    for (let page = 2; page <= primera.meta.totalPages; page++) {
      const siguiente = await getProductos({ page, pageSize: 50 });
      todos = todos.concat(siguiente.productos);
    }
    productos = todos.map((p) => ({
      url: `${BASE_URL}/productos/${p.id}`,
      changeFrequency: 'weekly',
      priority: 0.7,
      lastModified: new Date(),
    }));
  } catch (err) {
    console.error('[sitemap] Error al listar productos:', err.message);
  }

  return [...estaticas, ...categorias, ...productos];
}
