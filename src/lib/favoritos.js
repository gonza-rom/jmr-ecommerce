// src/lib/favoritos.js
// Favoritos persistidos en localStorage — no requiere cuenta ni backend.

const KEY = 'jmr_favoritos';

function leer() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function guardar(ids) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(ids));
  } catch { /* localStorage no disponible (modo privado, etc.) */ }
}

export function esFavorito(productoId) {
  return leer().includes(productoId);
}

export function toggleFavorito(productoId) {
  const ids = leer();
  const idx = ids.indexOf(productoId);
  if (idx >= 0) ids.splice(idx, 1);
  else ids.push(productoId);
  guardar(ids);
  return ids.includes(productoId);
}
