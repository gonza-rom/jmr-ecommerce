import { NextResponse } from "next/server";

// IMPORTANTE: En el middleware (Edge Runtime) NO usar NEXT_PUBLIC_
// Usar el nombre simple — se lee en runtime correctamente.
const MANTENIMIENTO = process.env.MODO_MANTENIMIENTO === "true";

const RUTAS_EXCLUIDAS = [
  "/mantenimiento",
  "/api/",
  "/_next/",
  "/favicon.ico",
  "/logo-jmr",
  "/pagos/",
];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (!MANTENIMIENTO) return NextResponse.next();

  const esExcluida = RUTAS_EXCLUIDAS.some((ruta) => pathname.startsWith(ruta));
  if (esExcluida) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/mantenimiento";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};