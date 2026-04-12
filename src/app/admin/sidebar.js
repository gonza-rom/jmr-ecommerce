'use client';
// src/app/admin/sidebar.js

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  LayoutDashboard, Package, Tag, ShoppingBag,
  Settings, LogOut, Menu, X, Store,
} from 'lucide-react';

const NAV = [
  { href: '/admin',            icon: LayoutDashboard, label: 'Dashboard'  },
  { href: '/admin/pedidos',    icon: ShoppingBag,     label: 'Pedidos'    },
  { href: '/admin/productos',  icon: Package,         label: 'Productos'  },
  { href: '/admin/categorias', icon: Tag,             label: 'Categorías' },
  { href: '/admin/config',     icon: Settings,        label: 'Config.'    },
];

function Logo() {
  return (
    <div style={{
      padding: '20px 20px 16px',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
    }}>
      <p style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', margin: '0 0 6px' }}>
        Panel Admin
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: '#6DBE45',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Store size={16} color="white" />
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 800, color: 'white', margin: 0, letterSpacing: '-0.02em' }}>
            JMR
          </p>
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', margin: 0, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Marroquinería
          </p>
        </div>
      </div>
    </div>
  );
}

function NavLinks({ onNavigate }) {
  const pathname = usePathname();

  return (
    <>
      <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map(({ href, icon: Icon, label }) => {
          const activo = pathname === href || (href !== '/admin' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 12px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: activo ? 600 : 400,
                textDecoration: 'none',
                transition: 'all 0.15s',
                background: activo ? 'rgba(109,190,69,0.15)' : 'transparent',
                color: activo ? '#6DBE45' : 'rgba(255,255,255,0.5)',
                borderLeft: activo ? '2px solid #6DBE45' : '2px solid transparent',
              }}
            >
              <Icon size={15} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <Link
          href="/"
          onClick={onNavigate}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 12px', borderRadius: 8,
            fontSize: 13, color: 'rgba(255,255,255,0.35)',
            textDecoration: 'none', transition: 'color 0.15s',
          }}
        >
          <LogOut size={15} />
          Ver tienda
        </Link>
      </div>
    </>
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const [abierto, setAbierto] = useState(false);

  useEffect(() => { setAbierto(false); }, [pathname]);

  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') setAbierto(false); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, []);

  useEffect(() => {
    document.body.style.overflow = abierto ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [abierto]);

  const sidebarStyle = {
    display: 'flex',
    flexDirection: 'column',
    width: 220,
    flexShrink: 0,
    background: '#1a1c1c',
    color: 'white',
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside style={{ ...sidebarStyle, position: 'sticky', top: 0, height: '100vh' }}
        className="hidden md:flex">
        <Logo />
        <NavLinks />
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: '#1a1c1c', color: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', height: 52,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6, background: '#6DBE45',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Store size={14} color="white" />
          </div>
          <span style={{ fontSize: 14, fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>
            JMR Admin
          </span>
        </div>
        <button
          onClick={() => setAbierto(!abierto)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white', padding: 4 }}
          aria-label="Abrir menú"
        >
          {abierto ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Spacer móvil */}
      <div className="md:hidden" style={{ height: 52 }} />

      {/* Mobile drawer */}
      {abierto && (
        <>
          <div
            onClick={() => setAbierto(false)}
            className="md:hidden"
            style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.5)' }}
          />
          <div
            className="md:hidden"
            style={{
              ...sidebarStyle,
              position: 'fixed', top: 52, left: 0, bottom: 0,
              zIndex: 50, width: 240,
              boxShadow: '4px 0 24px rgba(0,0,0,0.3)',
              animation: 'slideInLeft 0.2s ease-out',
            }}
          >
            <NavLinks onNavigate={() => setAbierto(false)} />
          </div>
        </>
      )}

      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); opacity: 0; }
          to   { transform: translateX(0);     opacity: 1; }
        }
      `}</style>
    </>
  );
}