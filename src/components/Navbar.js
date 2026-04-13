'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Menu, X, User, LogIn } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { createClient } from '@/lib/supabase/client';
import Cart from './Cart';

export default function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [user, setUser]               = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const { toggleCart, getItemCount }  = useCart();
  const itemCount = getItemCount();

  const supabase = createClient();

  // Obtener sesión actual y escuchar cambios
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoadingUser(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const categorias = [
    'Mochilas', 'Bolsos', 'Carteras',
    'Billeteras', 'Cinturones', 'Accesorios',
  ];

  return (
    <>
      <nav className="bg-white shadow-md sticky top-0 z-40">

        {/* Top bar */}
        <div className="bg-jmr-green text-white text-xs py-2">
          <div className="container mx-auto px-4 flex flex-wrap justify-between items-center gap-2">
            <span>📍 Rivadavia 564 - SFVC / Av Pte Castillo 1165 - Valle Viejo</span>
            <div className="flex items-center gap-4">
              <a href="tel:+543834927252" className="hover:underline">📞 +54 383 492-7252</a>
              <a href="mailto:cuerosjmr@hotmail.com" className="hover:underline hidden sm:inline">
                ✉️ cuerosjmr@hotmail.com
              </a>
            </div>
          </div>
        </div>

        {/* Main navbar */}
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">

            {/* Logo */}
            <Link href="/" className="flex items-center flex-shrink-0">
              <div className="relative w-32 h-16 sm:w-40 sm:h-20">
                <Image
                  src="/logo-jmr-removebg.png"
                  alt="Marroquinería JMR"
                  fill
                  sizes="(max-width: 640px) 128px, 160px"
                  className="object-contain"
                  priority
                />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6">
              <Link href="/" className="text-gray-700 hover:text-jmr-green font-medium transition-colors">
                Inicio
              </Link>
              <Link href="/productos" className="text-gray-700 hover:text-jmr-green font-medium transition-colors">
                Productos
              </Link>
              <Link href="/nosotros" className="text-gray-700 hover:text-jmr-green font-medium transition-colors">
                Nosotros
              </Link>
              <Link href="/contacto" className="text-gray-700 hover:text-jmr-green font-medium transition-colors">
                Contacto
              </Link>
            </div>

            {/* Icons */}
            <div className="flex items-center space-x-1">

              {/* Cuenta / Login */}
              {!loadingUser && (
                user ? (
                  // Usuario logueado → va a su cuenta
                  <Link
                    href="/cuenta"
                    className="relative p-2 text-gray-700 hover:text-jmr-green transition-colors"
                    title="Mi cuenta"
                  >
                    <div className="w-8 h-8 rounded-full bg-jmr-green flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  </Link>
                ) : (
                  // Sin sesión → va al login
                  <Link
                    href="/auth/login"
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-jmr-green border border-gray-200 hover:border-jmr-green rounded-lg transition-colors"
                    title="Iniciar sesión"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Ingresar</span>
                  </Link>
                )
              )}

              {/* Carrito */}
              <button
                onClick={toggleCart}
                className="relative p-2 text-gray-700 hover:text-jmr-green transition-colors"
              >
                <ShoppingCart className="w-6 h-6" />
                {itemCount > 0 && (
                  <span className="cart-badge absolute -top-1 -right-1 bg-jmr-green text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setMenuAbierto(!menuAbierto)}
                className="lg:hidden p-2 text-gray-700 hover:text-jmr-green transition-colors"
              >
                {menuAbierto ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {menuAbierto && (
          <div className="lg:hidden border-t">
            <div className="container mx-auto px-4 py-4 space-y-3">
              <Link href="/" onClick={() => setMenuAbierto(false)}
                className="block py-2 text-gray-700 hover:text-jmr-green font-medium transition-colors">
                Inicio
              </Link>
              <Link href="/productos" onClick={() => setMenuAbierto(false)}
                className="block py-2 text-gray-700 hover:text-jmr-green font-medium transition-colors">
                Productos
              </Link>
              <Link href="/nosotros" onClick={() => setMenuAbierto(false)}
                className="block py-2 text-gray-700 hover:text-jmr-green font-medium transition-colors">
                Nosotros
              </Link>
              <Link href="/contacto" onClick={() => setMenuAbierto(false)}
                className="block py-2 text-gray-700 hover:text-jmr-green font-medium transition-colors">
                Contacto
              </Link>

              {/* Cuenta en mobile */}
              <div className="pt-2 border-t border-gray-100">
                {user ? (
                  <Link href="/cuenta" onClick={() => setMenuAbierto(false)}
                    className="flex items-center gap-2 py-2 text-jmr-green font-semibold transition-colors">
                    <User className="w-4 h-4" />
                    Mi cuenta
                  </Link>
                ) : (
                  <Link href="/auth/login" onClick={() => setMenuAbierto(false)}
                    className="flex items-center gap-2 py-2 text-gray-700 hover:text-jmr-green font-medium transition-colors">
                    <LogIn className="w-4 h-4" />
                    Iniciar sesión / Registrarse
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      <Cart />
    </>
  );
}