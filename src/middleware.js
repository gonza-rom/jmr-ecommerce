import { NextResponse }       from "next/server";
import { createServerClient } from "@supabase/ssr";


const ADMINS = ["jmrmarroquineria@gmail.com"];

const MANTENIMIENTO = process.env.MODO_MANTENIMIENTO === "true";

const RUTAS_EXCLUIDAS_MANT = [
  "/mantenimiento",
  "/api/",
  "/_next/",
  "/favicon.ico",
  "/logo-jmr",
  "/pagos/",
];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // ── Protección del admin ──────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: () => {},
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !ADMINS.includes(user.email)) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // ── Modo mantenimiento ────────────────────────────────────────
  if (MANTENIMIENTO) {
    const esExcluida = RUTAS_EXCLUIDAS_MANT.some(r => pathname.startsWith(r));
    if (!esExcluida) {
      const url = request.nextUrl.clone();
      url.pathname = "/mantenimiento";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};