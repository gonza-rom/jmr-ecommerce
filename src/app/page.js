'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, ArrowRight, Star, TrendingUp, CreditCard, Wallet, QrCode, ChevronRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import ProductCard from '@/components/ProductCard';

export default function Home() {
  const [productosDestacados, setProductosDestacados] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProductosDestacados();
  }, []);

  const fetchProductosDestacados = async () => {
    try {
      const response = await fetch('/api/productos?destacados=true&limit=8');
      const data = await response.json();
      setProductosDestacados(data.productos ?? []);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const mediosDePago = [
    { nombre: 'BNA+', logo: 'bna-plus.png' },
    { nombre: 'Mercado Pago', logo: 'mercado-pago.png' },
    { nombre: 'Modo', logo: 'modo.png' },
    { nombre: 'VISA', logo: 'visa.png' },
    { nombre: 'Mastercard', logo: 'mastercard.png' },
    { nombre: 'Cabal', logo: 'cabal.png' },
    { nombre: 'Naranja X', logo: 'naranja-x.png' },
    { nombre: 'Centrocard', logo: 'centrocard.png' },
    { nombre: 'Sol', logo: 'sol.png' },
  ];

  return (
    <div className="jmr-new">
      <style>{`
        .jmr-new {
          --green: #6DBE45;
          --green-dark: #286c00;
          --surface: #f9f9f9;
          --surface-low: #f3f3f3;
          --surface-high: #e8e8e8;
          --surface-highest: #e2e2e2;
          --on-surface: #1a1c1c;
          --secondary: #5e5e5e;
          font-family: 'Inter', sans-serif;
        }
        .jmr-new * { box-sizing: border-box; }

        /* Hero */
        .hero-section {
          position: relative;
          min-height: 819px;
          display: flex;
          align-items: center;
          overflow: hidden;
          background: var(--surface-low);
        }
        .hero-inner {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
          width: 100%;
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: center;
          gap: 3rem;
        }
        @media (max-width: 768px) {
          .hero-inner { grid-template-columns: 1fr; }
          .hero-image { display: none; }
          .hero-section { min-height: auto; padding: 4rem 0; }
        }
        .hero-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          margin-bottom: 1.5rem;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          background: var(--green);
          color: white;
          border-radius: 9999px;
        }
        .hero-title {
          font-size: clamp(3.5rem, 8vw, 6rem);
          font-weight: 900;
          letter-spacing: -0.04em;
          line-height: 0.9;
          margin-bottom: 2rem;
          color: var(--on-surface);
        }
        .hero-title .accent { color: var(--green); }
        .hero-desc {
          font-size: 1.1rem;
          color: var(--secondary);
          margin-bottom: 2.5rem;
          max-width: 420px;
          line-height: 1.7;
        }
        .hero-btns { display: flex; gap: 1rem; flex-wrap: wrap; }
        .btn-primary {
          padding: 1rem 2rem;
          background: linear-gradient(135deg, var(--green-dark), var(--green));
          color: white;
          font-weight: 700;
          border-radius: 0.5rem;
          border: none;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
          box-shadow: 0 8px 24px rgba(109,190,69,0.25);
        }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 12px 32px rgba(109,190,69,0.35); }
        .btn-secondary {
          padding: 1rem 2rem;
          background: var(--surface-highest);
          color: var(--on-surface);
          font-weight: 700;
          border-radius: 0.5rem;
          border: none;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
        }
        .btn-secondary:hover { background: var(--surface-high); }
        .hero-image {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .hero-image-blob {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, rgba(109,190,69,0.08) 0%, transparent 70%);
          border-radius: 50%;
          transform: scale(0.75);
        }
        .hero-img {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 520px;
          height: 560px;
          object-fit: contain;
          filter: drop-shadow(0 24px 48px rgba(0,0,0,0.15));
          transition: transform 0.7s ease;
        }
        .hero-img:hover { transform: scale(1.03); }

        /* Brands strip */
        .brands-strip {
          padding: 4rem 2rem;
          background: white;
          overflow: hidden;
        }
        .brands-inner {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          align-items: center;
          gap: 3rem 5rem;
          opacity: 0.35;
          filter: grayscale(1);
          transition: all 0.5s;
        }
        .brands-inner:hover { opacity: 1; filter: grayscale(0); }
        .brand-logo { height: 2.5rem; object-fit: contain; }

        /* Curated sections */
        .section-header {
          margin-bottom: 3.5rem;
        }
        .section-title {
          font-size: 1.75rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          margin-bottom: 0.5rem;
          color: var(--on-surface);
        }
        .section-title-bar {
          height: 4px;
          width: 5rem;
          background: var(--green);
          border-radius: 2px;
        }

        /* Category bento grid */
        .category-section {
          padding: 5rem 2rem;
          background: var(--surface);
        }
        .category-inner { max-width: 1400px; margin: 0 auto; }
        .category-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          grid-template-rows: repeat(2, 340px);
          gap: 1.5rem;
        }
        @media (max-width: 900px) {
          .category-grid { grid-template-columns: 1fr 1fr; grid-template-rows: auto; }
          .cat-main { grid-column: span 2 !important; grid-row: span 1 !important; }
          .cat-wide { grid-column: span 2 !important; }
        }
        @media (max-width: 600px) {
          .category-grid { grid-template-columns: 1fr; }
          .cat-main { grid-column: span 1 !important; }
          .cat-wide { grid-column: span 1 !important; }
        }
        .cat-card {
          position: relative;
          overflow: hidden;
          border-radius: 0.75rem;
          background: var(--surface-low);
          cursor: pointer;
        }
        .cat-main { grid-column: span 2; grid-row: span 2; }
        .cat-wide { grid-column: span 2; }
        .cat-card img {
          width: 100%; height: 100%;
          object-fit: cover;
          transition: transform 0.7s ease;
        }
        .cat-card:hover img { transform: scale(1.08); }
        .cat-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.18);
          transition: background 0.3s;
        }
        .cat-card:hover .cat-overlay { background: rgba(0,0,0,0.38); }
        .cat-label-main { position: absolute; bottom: 2.5rem; left: 2.5rem; color: white; }
        .cat-label-main h3 { font-size: 2.25rem; font-weight: 900; margin-bottom: 0.75rem; }
        .cat-label-main span {
          font-size: 0.75rem; font-weight: 700; letter-spacing: 0.12em;
          text-transform: uppercase; border-bottom: 2px solid white; padding-bottom: 2px;
        }
        .cat-label { position: absolute; bottom: 1.5rem; left: 1.5rem; color: white; }
        .cat-label h3 { font-size: 1.3rem; font-weight: 700; margin-bottom: 0.25rem; }
        .cat-label span { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; opacity: 0.8; }

        /* Featured products */
        .featured-section {
          padding: 5rem 2rem;
          background: var(--surface-low);
        }
        .featured-inner { max-width: 1400px; margin: 0 auto; }
        .featured-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 3.5rem;
        }
        .featured-header p { color: var(--secondary); margin-top: 0.25rem; }
        .view-all {
          color: var(--green);
          font-weight: 700;
          text-decoration: none;
          font-size: 0.9rem;
        }
        .view-all:hover { text-decoration: underline; text-underline-offset: 3px; }
        .products-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
        }
        @media (max-width: 1100px) { .products-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 768px) { .products-grid { grid-template-columns: repeat(2, 1fr); gap: 1rem; } }
        .product-skeleton {
          background: var(--surface-highest);
          border-radius: 0.75rem;
          height: 320px;
          animation: pulse 1.5s ease-in-out infinite;
        }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }

        /* Trust section */
        .trust-section {
          padding: 4rem 2rem;
          background: white;
        }
        .trust-inner {
          max-width: 1400px; margin: 0 auto;
          display: grid; grid-template-columns: repeat(3,1fr); gap: 3rem; text-align: center;
        }
        @media (max-width: 768px) { .trust-inner { grid-template-columns: 1fr; gap: 2rem; } }
        .trust-icon {
          width: 4rem; height: 4rem;
          background: var(--surface-low);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 1.5rem;
          color: var(--green);
        }
        .trust-icon svg { width: 2rem; height: 2rem; }
        .trust-item h3 { font-size: 1.1rem; font-weight: 700; margin-bottom: 0.5rem; }
        .trust-item p { color: var(--secondary); font-size: 0.9rem; max-width: 240px; margin: 0 auto; }

        /* Payment section */
        .payment-section {
          padding: 4rem 2rem;
          background: var(--surface-low);
        }
        .payment-inner { max-width: 900px; margin: 0 auto; text-align: center; }
        .payment-title { font-size: 1.75rem; font-weight: 900; letter-spacing: -0.02em; font-style: italic; margin-bottom: 0.75rem; color: var(--on-surface); }
        .payment-desc { color: var(--secondary); font-size: 1rem; margin-bottom: 2.5rem; }
        .payment-form {
          display: flex;
          gap: 1rem;
          max-width: 440px;
          margin: 0 auto;
          flex-wrap: wrap;
          justify-content: center;
        }
        .payment-input {
          flex: 1;
          min-width: 220px;
          padding: 1rem 1.5rem;
          background: #EFEAE4;
          border: none;
          border-radius: 0.5rem;
          font-size: 0.95rem;
          outline: none;
          transition: all 0.2s;
        }
        .payment-input:focus { background: white; box-shadow: 0 0 0 3px rgba(109,190,69,0.2); }
        .payment-btn {
          padding: 1rem 2rem;
          background: var(--green-dark);
          color: white;
          font-weight: 700;
          border-radius: 0.5rem;
          border: none;
          cursor: pointer;
          transition: background 0.2s;
        }
        .payment-btn:hover { background: var(--green); }

        /* Pago cards */
        .pago-grid {
          display: grid;
          grid-template-columns: repeat(4,1fr);
          gap: 1.5rem;
          margin-bottom: 3rem;
        }
        @media (max-width: 768px) { .pago-grid { grid-template-columns: repeat(2,1fr); } }
        .pago-card {
          border-radius: 0.75rem;
          padding: 1.5rem;
          display: flex; flex-direction: column; align-items: center; text-align: center;
          gap: 0.75rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .pago-card-icon {
          width: 3.5rem; height: 3.5rem;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: white;
        }
        .pago-card h3 { font-weight: 700; font-size: 0.95rem; color: var(--on-surface); }
        .pago-card p { font-size: 0.8rem; color: var(--secondary); }
        .pago-logos {
          display: flex; flex-wrap: wrap; justify-content: center; gap: 0.75rem;
          background: white; border-radius: 1rem; padding: 2rem;
        }
        .pago-logo-item {
          width: 64px; height: 64px;
          background: white;
          border-radius: 0.5rem;
          box-shadow: 0 1px 4px rgba(0,0,0,0.08);
          display: flex; align-items: center; justify-content: center;
          padding: 0.5rem;
        }
      `}</style>

      {/* ── HERO ── */}
      <section className="hero-section">
        <div className="hero-inner">
          <div>
            <span className="hero-badge">Nueva Temporada</span>
            <h1 className="hero-title">
              JMR<br />
              <span className="accent">Marroquineria</span>
            </h1>
            <p className="hero-desc">
              Explorá la gran variedad de mochilas, bolsos de viaje y valijas diseñados para el movimiento constante.
            </p>
            <div className="hero-btns">
              <Link href="/productos" className="btn-primary">
                Comprar Ahora
                <ArrowRight size={18} />
              </Link>
              <Link href="/productos" className="btn-secondary">
                Ver Colección
              </Link>
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-image-blob" />
            <Image
              src="/local-fachada.jpg"
              alt="JMR Marroquinería"
              width={520}
              height={560}
              className="hero-img"
              priority
            />
          </div>
        </div>
      </section>

      {/* ── BRAND LOGOS ── */}
      <section className="brands-strip">
        <div className="brands-inner">
          {[
            { nombre: 'Wilson',       archivo: 'wilson.png'       },
            { nombre: 'Head',         archivo: 'head.png'         },
            { nombre: 'Biwo',    archivo: 'biwo.png'    },
            { nombre: 'Carey',     archivo: 'carey.png'     },
            { nombre: 'Everlast',     archivo: 'everlast.png'     },
            { nombre: 'Pierre Cardin',archivo: 'pierre-cardin.png'},
            { nombre: 'Alpine Skate', archivo: 'alpine-skate.png' },
            { nombre: 'Discovery',       archivo: 'Discovery.png'},
            { nombre: 'Influencer',         archivo: 'influencer.png'},
            { nombre: 'lsyd',    archivo: 'lsyd.png'    },
            { nombre: 'ELF',     archivo: 'elf.png'     },
            { nombre: 'Owen',     archivo: 'owen.png'     },
            { nombre: 'amayra',archivo: 'amayra.png'},
            { nombre: 'Reef', archivo: 'reef.png' },
          ].map(({ nombre, archivo }) => (
            <Image
              key={nombre}
              src={`/marcas/${archivo}`}
              alt={nombre}
              width={100}
              height={40}
              style={{ objectFit: 'contain', height: 36, width: 'auto' }}
            />
          ))}
        </div>
      </section>

      {/* ── CATEGORY BENTO GRID ── */}
      <section className="category-section">
        <div className="category-inner">
          <div className="section-header">
            <h2 className="section-title">Colecciones</h2>
            <div className="section-title-bar" />
          </div>
          <div className="category-grid">
            {/* Main — Mochilas */}
            <Link href="/productos?busqueda=mochila" className="cat-card cat-main" style={{ display: 'block' }}>
              <Image src="/mochila.jpg" alt="Mochilas" fill style={{ objectFit: 'cover' }} />
              <div className="cat-overlay" />
              <div className="cat-label-main">
                <h3>Mochilas</h3>
                <span>Ver Todo</span>
              </div>
            </Link>
            {/* Valijas */}
            <Link href="/productos?busqueda=valija" className="cat-card cat-wide" style={{ display: 'block' }}>
              <Image src="/valija2.jpg" alt="Valijas" fill style={{ objectFit: 'cover' }} />
              <div className="cat-overlay" />
              <div className="cat-label">
                <h3>Valijas</h3>  
                <span>Viajá con Estilo</span>
              </div>
            </Link>
            {/* Billeteras */}
            <Link href="/productos?busqueda=billetera" className="cat-card" style={{ display: 'block' }}>
              <Image src="/billetera.webp" alt="Billeteras" fill style={{ objectFit: 'cover' }} />
              <div className="cat-overlay" />
              <div className="cat-label">
                <h3>Billeteras</h3>
              </div>
            </Link>
            {/* Accesorios */}
            <Link href="/productos" className="cat-card" style={{ display: 'block' }}>
              <Image src="/local-fachada.jpg" alt="Accesorios" fill style={{ objectFit: 'cover' }} />
              <div className="cat-overlay" />
              <div className="cat-label">
                <h3>Ver Productos</h3>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section className="featured-section">
        <div className="featured-inner">
          <div className="featured-header">
            <div>
              <h2 className="section-title">Productos Destacados</h2>
              <p>Lo más buscado de la semana</p>
            </div>
            <Link href="/productos" className="view-all">Ver Todos →</Link>
          </div>

          {loading ? (
            <div className="products-grid">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="product-skeleton" />
              ))}
            </div>
          ) : (
            <div className="products-grid">
              {productosDestacados.map((producto) => (
                <ProductCard
                  key={producto.id}
                  producto={producto}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── TRUST ── */}
      <section className="trust-section">
        <div className="trust-inner">
          <div className="trust-item">
            <div className="trust-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M5 12l7-7m-7 7 7 7"/><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
            </div>
            <h3>Envío Gratis</h3>
            <p>En todas tus compras superiores a $150.000 a todo el país.</p>
          </div>
          <div className="trust-item">
            <div className="trust-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
            </div>
            <h3>6 Cuotas</h3>
            <p>Pagá en 6 cuotas fijas con todas las tarjetas de crédito.</p>
          </div>
          <div className="trust-item">
            <div className="trust-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h3>Garantía Total</h3>
            <p>¿No es lo que esperabas? Tenés 30 días para devoluciones.</p>
          </div>
        </div>
      </section>

      {/* ── MÉTODOS DE PAGO ── */}
      <section style={{ padding: '4rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 className="section-title" style={{ textAlign: 'center' }}>Medios de Pago</h2>
            <p style={{ color: 'var(--secondary)', marginTop: '0.5rem' }}>
              Aceptamos todas las formas de pago para tu comodidad
            </p>
          </div>
          <div className="pago-grid">
            {[
              { title: 'Tarjetas de Débito', desc: 'Todas las tarjetas', bg: '#EFF6FF', iconBg: '#2563EB' },
              { title: 'Tarjetas de Crédito', desc: 'En cuotas disponibles', bg: '#FAF5FF', iconBg: '#7C3AED' },
              { title: 'Transferencias y QR', desc: 'Mercado Pago, Modo, BNA+', bg: '#F0FDF4', iconBg: '#16A34A' },
              { title: 'Efectivo', desc: 'Pesos argentinos', bg: '#FFFBEB', iconBg: '#D97706' },
            ].map((p, i) => (
              <div key={i} className="pago-card" style={{ background: p.bg }}>
                <div className="pago-card-icon" style={{ background: p.iconBg }}>
                  <CreditCard size={22} />
                </div>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
              </div>
            ))}
          </div>
          <div className="pago-logos">
            {mediosDePago.map((m) => (
              <div key={m.nombre} className="pago-logo-item" title={m.nombre}>
                <Image
                  src={`/pagos/${m.logo}`}
                  alt={m.nombre}
                  width={48}
                  height={32}
                  style={{ objectFit: 'contain', maxHeight: '32px', width: 'auto' }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = `<span style="font-size:0.65rem;font-weight:700;color:#444;text-align:center">${m.nombre}</span>`;
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}