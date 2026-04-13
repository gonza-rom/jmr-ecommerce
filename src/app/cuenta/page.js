'use client';
// src/app/cuenta/page.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag, MapPin, LogOut, User, Package, Loader2, Plus, Star } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const TABS = [
  { id: 'pedidos',     label: 'Mis pedidos',   icon: ShoppingBag },
  { id: 'direcciones', label: 'Direcciones',   icon: MapPin      },
];

const ESTADOS = {
  PENDIENTE:      { label: 'Pendiente',      color: 'bg-amber-50 text-amber-700 border-amber-200'   },
  PAGADO:         { label: 'Pagado',         color: 'bg-blue-50 text-blue-700 border-blue-200'       },
  EN_PREPARACION: { label: 'En preparación', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  EN_CAMINO:      { label: 'En camino',      color: 'bg-orange-50 text-orange-700 border-orange-200' },
  ENTREGADO:      { label: 'Entregado',      color: 'bg-green-50 text-green-700 border-green-200'    },
  CANCELADO:      { label: 'Cancelado',      color: 'bg-red-50 text-red-500 border-red-200'          },
};

export default function CuentaPage() {
  const router   = useRouter();
  const supabase = createClient();

  const [user,        setUser]        = useState(null);
  const [tab,         setTab]         = useState('pedidos');
  const [loading,     setLoading]     = useState(true);
  const [loggingOut,  setLoggingOut]  = useState(false);
  const [pedidos,     setPedidos]     = useState([]);
  const [direcciones, setDirecciones] = useState([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return; }
      setUser(user);
      setLoading(false);
      fetchDatos();
    });
  }, []);

  async function fetchDatos() {
    try {
      const res  = await fetch('/api/cuenta/pedidos');
      const data = await res.json();
      setPedidos(data.data ?? []);
    } catch {}
    try {
      const res  = await fetch('/api/cuenta/direcciones');
      const data = await res.json();
      setDirecciones(data.data ?? []);
    } catch {}
  }

  async function handleLogout() {
    setLoggingOut(true);
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-green-700" />
    </div>
  );

  const nombre = user?.user_metadata?.nombre ?? user?.email?.split('@')[0] ?? 'Cliente';

  return (
    <div className="min-h-screen bg-[#f5f4f0]">

      {/* Header */}
      <div className="bg-[#1a1a1a] text-white">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-[#2d6a4f] flex items-center justify-center flex-shrink-0">
                <User size={18} color="#fff" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold truncate">Hola, {nombre}</p>
                <p className="text-[11px] text-white/50 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center gap-1.5 bg-white/10 border border-white/15 text-white/70 px-3 py-2 rounded-lg text-xs font-medium transition-colors hover:bg-white/20"
            >
              {loggingOut
                ? <Loader2 size={13} className="animate-spin" />
                : <LogOut size={13} />}
              <span className="hidden sm:inline">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-5 md:py-7">

        {/* Tabs móvil */}
        <div className="flex md:hidden gap-2 mb-5 overflow-x-auto pb-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 border transition-all
                ${tab === id
                  ? 'bg-[#2d6a4f] text-white border-[#2d6a4f]'
                  : 'bg-white text-gray-500 border-gray-200'}`}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>

        <div className="flex gap-6 items-start">

          {/* Sidebar desktop */}
          <aside className="hidden md:block w-52 flex-shrink-0">
            <nav className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`w-full flex items-center gap-2.5 px-4 py-3.5 border-b border-gray-100 text-[13px] font-medium text-left transition-all
                    ${tab === id
                      ? 'bg-[#2d6a4f] text-white font-semibold'
                      : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
              <Link
                href="/productos"
                className="flex items-center gap-2.5 px-4 py-3.5 text-[13px] text-gray-400 no-underline hover:bg-gray-50 transition-colors"
              >
                <ShoppingBag size={14} /> Ver catálogo
              </Link>
            </nav>

            {/* Card contacto */}
            <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-[12px] font-bold text-green-800 mb-1">¿Necesitás ayuda?</p>
              <p className="text-[11px] text-green-700 mb-3">Contactanos por WhatsApp</p>
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center bg-[#25D366] text-white text-[12px] font-bold py-2 rounded-lg no-underline"
              >
                Abrir WhatsApp
              </a>
            </div>
          </aside>

          {/* Contenido */}
          <div className="flex-1 min-w-0">

            {/* ── Pedidos ── */}
            {tab === 'pedidos' && (
              <div>
                <h2 className="text-lg font-extrabold tracking-tight mb-4">Mis pedidos</h2>
                {pedidos.length === 0 ? (
                  <EstadoVacio
                    icon={Package}
                    titulo="Todavía no hiciste pedidos"
                    desc="Cuando hagas tu primera compra, aparecerá acá."
                    cta={{ href: '/productos', label: 'Ver catálogo' }}
                  />
                ) : (
                  <div className="flex flex-col gap-3">
                    {pedidos.map(pedido => (
                      <TarjetaPedido key={pedido.id} pedido={pedido} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Direcciones ── */}
            {tab === 'direcciones' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-extrabold tracking-tight">Mis direcciones</h2>
                  <button className="flex items-center gap-1.5 text-xs font-semibold bg-[#2d6a4f] text-white px-3 py-2 rounded-lg">
                    <Plus size={13} /> Agregar
                  </button>
                </div>
                {direcciones.length === 0 ? (
                  <EstadoVacio
                    icon={MapPin}
                    titulo="No tenés direcciones guardadas"
                    desc="Guardá tu dirección para comprar más rápido la próxima vez."
                  />
                ) : (
                  <div className="flex flex-col gap-3">
                    {direcciones.map(dir => (
                      <div key={dir.id} className="bg-white border border-gray-200 rounded-xl p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            {dir.alias && (
                              <p className="text-[11px] font-bold text-[#2d6a4f] uppercase tracking-wide mb-1">{dir.alias}</p>
                            )}
                            <p className="text-[13px] font-semibold text-[#1a1a1a]">
                              {dir.calle} {dir.numero}{dir.piso ? `, piso ${dir.piso}` : ''}{dir.departamento ? ` dto ${dir.departamento}` : ''}
                            </p>
                            <p className="text-[12px] text-gray-400 mt-0.5">
                              {dir.ciudad}{dir.provincia ? `, ${dir.provincia}` : ''}{dir.cp ? ` — CP ${dir.cp}` : ''}
                            </p>
                          </div>
                          {dir.principal && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md flex-shrink-0">
                              <Star size={9} /> Principal
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tarjeta de pedido ─────────────────────────────────────────
function TarjetaPedido({ pedido }) {
  const estado = ESTADOS[pedido.estado] ?? { label: pedido.estado, color: 'bg-gray-50 text-gray-400 border-gray-200' };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex justify-between items-start gap-2">
        <div className="min-w-0">
          <p className="text-[13px] font-bold text-[#1a1a1a] mb-0.5">
            Pedido #{pedido.id.slice(-6).toUpperCase()}
          </p>
          <p className="text-[11px] text-gray-400">
            {new Date(pedido.createdAt).toLocaleDateString('es-AR', {
              day: 'numeric', month: 'long', year: 'numeric'
            })}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wide ${estado.color}`}>
            {estado.label}
          </span>
          <p className="text-sm font-extrabold text-[#1a1a1a]">
            ${pedido.total?.toLocaleString('es-AR')}
          </p>
        </div>
      </div>

      {/* Items */}
      {pedido.items?.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          {pedido.items.slice(0, 2).map((item, i) => (
            <p key={i} className="text-[12px] text-gray-400 mb-0.5">
              {item.cantidad}x {item.nombre}
              {item.talle && ` — T: ${item.talle}`}
              {item.color && ` — ${item.color}`}
            </p>
          ))}
          {pedido.items.length > 2 && (
            <p className="text-[12px] text-gray-300">+ {pedido.items.length - 2} más</p>
          )}
        </div>
      )}

      {/* Botón WhatsApp si está en camino */}
      {pedido.estado === 'EN_CAMINO' && (
        <a
          href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hola! Quería consultar por mi pedido #${pedido.id.slice(-6).toUpperCase()}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex items-center justify-center gap-1.5 w-full bg-green-50 border border-green-200 text-green-700 text-[12px] font-semibold py-2 rounded-lg no-underline"
        >
          Consultar por WhatsApp
        </a>
      )}
    </div>
  );
}

// ── Estado vacío ──────────────────────────────────────────────
function EstadoVacio({ icon: Icon, titulo, desc, cta }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-6 py-12 text-center">
      <Icon size={36} className="text-gray-200 mx-auto mb-3" />
      <p className="text-sm font-bold text-gray-600 mb-1">{titulo}</p>
      <p className="text-xs text-gray-400 mb-5">{desc}</p>
      {cta && (
        <Link
          href={cta.href}
          className="inline-block bg-[#2d6a4f] text-white px-5 py-2.5 rounded-lg text-xs font-semibold no-underline"
        >
          {cta.label}
        </Link>
      )}
    </div>
  );
}