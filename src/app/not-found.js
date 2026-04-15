import Link from 'next/link';
import { ShoppingBag, Home, Search, ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic'; // ← agregar acá

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">

        {/* Número 404 grande */}
        <div className="relative mb-8">
          <p className="text-[160px] font-black text-jmr-green/10 leading-none select-none">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-jmr-green text-white w-24 h-24 rounded-full flex items-center justify-center shadow-xl">
              <ShoppingBag className="w-12 h-12" />
            </div>
          </div>
        </div>

        {/* Mensaje */}
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Página no encontrada
        </h1>
        <p className="text-gray-500 text-lg mb-8">
          El producto o sección que buscás no existe o fue movido.
          ¡Pero tenemos muchísimos productos esperándote!
        </p>

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-jmr-green hover:bg-jmr-green-dark text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-md"
          >
            <Home className="w-5 h-5" />
            Ir al inicio
          </Link>
          <Link
            href="/productos"
            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 px-6 py-3 rounded-lg font-semibold transition-colors shadow-sm"
          >
            <Search className="w-5 h-5" />
            Ver productos
          </Link>
        </div>

        {/* Links rápidos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wide">
            También podés ir a
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: '/nosotros',  label: 'Quiénes somos' },
              { href: '/contacto', label: 'Contacto'       },
              { href: 'https://wa.me/543834927252', label: 'WhatsApp', external: true },
              { href: '/productos', label: 'Catálogo completo' },
            ].map(({ href, label, external }) => (
              <Link
                key={href}
                href={href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
                className="text-sm text-jmr-green hover:underline font-medium py-1"
              >
                {label} →
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}