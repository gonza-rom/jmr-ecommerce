// src/lib/auth-admin.js
// Lista de emails con acceso admin + helper para proteger route handlers.
// Usado por middleware.js (páginas /admin) y por las rutas /api/admin/* y
// /api/oca/envios, que antes no verificaban sesión.

import { createClient } from "@/lib/supabase/server";
import { ADMINS }        from "@/lib/admins";

export { ADMINS };

// Devuelve el user de Supabase si es admin, o null si no está autenticado
// o no está en la lista de admins.
export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !ADMINS.includes(user.email)) return null;
  return user;
}
