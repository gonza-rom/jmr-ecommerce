'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag, ArrowLeft, Package, Truck, Shield, Star, Plus, Minus, Share2, Heart, Loader2, Store, Clock, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import ProductGallery from '@/components/ProductGallery';
import ProductCard from '@/components/ProductCard';
import PromosPago from '@/components/PromosPagos';
import { esFavorito, toggleFavorito } from '@/lib/favoritos';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.4, delay: i * 0.08, ease: 'easeOut' },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
};

const WhatsAppIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

const TABS = ['Detalles', 'Garantía'];

function ProductTabs({ producto }) {
  const [active, setActive] = useState(0);
  return (
    <div>
      <div className="flex gap-6 border-b border-gray-100 mb-5">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActive(i)}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
              active === i
                ? 'text-jmr-green border-jmr-green'
                : 'text-gray-500 border-transparent hover:text-gray-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {active === 0 && (
        <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
          {producto.descripcion && <p>{producto.descripcion}</p>}
          {producto.caracteristicas?.length > 0 && (
            <ul className="space-y-2">
              {producto.caracteristicas.map((c, i) => (
                <li key={i} className="flex items-center gap-2 text-gray-600">
                  <span className="w-1.5 h-1.5 bg-jmr-green rounded-full flex-shrink-0" />
                  {c}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {active === 1 && (
        <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
          <p>Garantía de por vida en costuras y herrajes contra defectos de fabricación.</p>
          <p>Para hacer efectiva la garantía, contactanos por WhatsApp con tu comprobante de compra.</p>
        </div>
      )}
    </div>
  );
}

// ── Productos relacionados ────────────────────────────────────────────────

async function buscarRelacionados(productoActual) {
  try {
    const categoriaId = productoActual.categoriaId ?? productoActual.categoria?.id;

    const stopwords = new Set(['para', 'con', 'sin', 'los', 'las', 'del', 'que', 'una', 'uno', 'mochila', 'bolso', 'valija', 'maletin', 'cartera']);
    const keywords = productoActual.nombre
      .toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .split(/[\s\-_/()]+/)
      .filter(w => w.length > 2 && !stopwords.has(w));

    const palabraClave = keywords.sort((a, b) => b.length - a.length)[0] || '';

    const searchParams = new URLSearchParams({ pageSize: '20' });
    if (palabraClave) searchParams.set('busqueda', palabraClave);
    if (categoriaId) searchParams.set('categoria', categoriaId);

    let res = await fetch(`/api/productos?${searchParams}`);
    let data = await res.json();
    let candidatos = Array.isArray(data) ? data : (data.productos ?? []);

    if (candidatos.filter(p => p.id !== productoActual.id).length < 4 && categoriaId) {
      const fb = await fetch(`/api/productos?pageSize=20&categoria=${categoriaId}`);
      const fbData = await fb.json();
      const extra = Array.isArray(fbData) ? fbData : (fbData.productos ?? []);
      const ids = new Set(candidatos.map(p => p.id));
      candidatos = [...candidatos, ...extra.filter(p => !ids.has(p.id))];
    }

    return candidatos.filter(p => p.id !== productoActual.id).slice(0, 4);
  } catch (err) {
    console.error('Error al cargar relacionados:', err);
    return [];
  }
}

// ── Componente principal ────────────────────────────────────────────────────
export default function ProductoDetalleClient({ producto }) {
  const router = useRouter();
  const [productosRelacionados, setProductosRelacionados] = useState([]);
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);
  const [favorito, setFavorito] = useState(() => esFavorito(producto.id));
  const [productoIdVisto, setProductoIdVisto] = useState(producto.id);
  const { addToCart } = useCart();

  // Resincroniza el estado de favorito si se navega a otro producto sin
  // desmontar el componente (ver "You Might Not Need an Effect" de React).
  if (productoIdVisto !== producto.id) {
    setProductoIdVisto(producto.id);
    setFavorito(esFavorito(producto.id));
  }

  useEffect(() => {
    buscarRelacionados(producto).then(setProductosRelacionados);
  }, [producto]);

  const handleAgregarCarrito = () => {
    if (!producto || cantidad <= 0) return;
    addToCart(producto, cantidad);
    setAgregado(true);
    setTimeout(() => setAgregado(false), 2000);
  };

  const handleComprarWhatsApp = () => {
    const mensaje =
      `¡Hola! Me interesa este producto:\n\n` +
      `*${producto.nombre}*\n` +
      `Cantidad: ${cantidad}\n` +
      `Precio unitario: $${producto.precio.toFixed(2)}\n` +
      `Total: $${(producto.precio * cantidad).toFixed(2)}\n\n` +
      `¿Está disponible?`;
    window.open(`https://wa.me/543834927252?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  const handleCompartir = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: producto.nombre, url }); } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(url);
        alert('¡Enlace copiado al portapapeles!');
      } catch {}
    }
  };

  const handleToggleFavorito = () => {
    setFavorito(toggleFavorito(producto.id));
  };

  const total = (producto.precio * cantidad).toLocaleString('es-AR');

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Breadcrumb */}
      <motion.div className="bg-white border-b border-gray-100" initial="hidden" animate="visible" variants={fadeIn}>
        <div className="container mx-auto px-4 md:px-8 py-3">
          <div className="flex items-center gap-2 text-sm flex-wrap">
            <Link href="/" className="text-gray-400 hover:text-jmr-green transition-colors">Inicio</Link>
            <span className="text-gray-300">/</span>
            <Link href="/productos" className="text-gray-400 hover:text-jmr-green transition-colors">Productos</Link>
            {producto.categoria && (
              <>
                <span className="text-gray-300">/</span>
                <Link href={`/productos?categoria=${producto.categoriaId}`} className="text-gray-400 hover:text-jmr-green transition-colors">
                  {producto.categoria.nombre}
                </Link>
              </>
            )}
            <span className="text-gray-300">/</span>
            <span className="text-gray-800 font-medium truncate max-w-[200px]">{producto.nombre}</span>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 md:px-8 py-6 md:py-10">

        {/* Volver */}
        <motion.button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-jmr-green mb-6 transition-colors text-sm font-medium"
          initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </motion.button>

        {/* Grid principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-14 mb-8 items-start min-w-0">

          {/* Galería */}
          <motion.div className="min-w-0" initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <ProductGallery producto={producto} />
            <button
              onClick={handleCompartir}
              className="w-full mt-4 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <Share2 className="w-4 h-4" />
              Compartir producto
            </button>
          </motion.div>

          {/* Info */}
          <motion.div className="min-w-0" initial="hidden" animate="visible" variants={fadeUp} custom={1}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-9 lg:sticky lg:top-24">

              {producto.categoria && (
                <Link
                  href={`/productos?categoria=${producto.categoriaId}`}
                  className="inline-block text-xs font-bold uppercase tracking-widest text-gray-400 bg-gray-100 rounded-full px-3 py-1 mb-5 hover:text-jmr-green transition-colors"
                >
                  {producto.categoria.nombre}
                </Link>
              )}

              <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight mb-1">
                {producto.nombre}
              </h1>
              {producto.codigoProducto && (
                <p className="text-xs text-gray-400 mb-5">SKU: {producto.codigoProducto}</p>
              )}

              {/* Precio */}
              <div className="flex items-center gap-3 mb-5 pb-5 border-b border-gray-100">
                <span className="text-4xl font-bold text-jmr-green tracking-tight">
                  ${producto.precio.toLocaleString('es-AR')}
                </span>
                <span className="text-xs font-bold bg-green-50 text-jmr-green px-2.5 py-1 rounded-lg">
                  6 cuotas sin interés
                </span>
              </div>

              {/* Stock */}
              <div className="mb-3">
                {producto.stock > 0 ? (
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <CheckCircle className="w-4 h-4 text-jmr-green flex-shrink-0" />
                    <span className="text-jmr-green">In stock — {producto.stock} unidades disponibles</span>
                  </div>
                ) : (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <span className="text-sm font-bold text-amber-700">Sin stock momentáneo</span>
                    </div>
                    <p className="text-xs text-amber-600 leading-relaxed mb-3">
                      Este producto no está disponible en este momento, pero puede que llegue próximamente.
                      Consultanos por WhatsApp y te avisamos cuando vuelva a estar disponible.
                    </p>
                    <a
                      href={`https://wa.me/543834927252?text=${encodeURIComponent(
                        `Hola! Me interesa el producto *${producto.nombre}* pero está sin stock.\n\n` +
                        `¿Saben si va a volver a haber disponibilidad?\n\n` +
                        `Link: ${typeof window !== 'undefined' ? window.location.href : ''}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20BA5A] text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-colors no-underline"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                      </svg>
                      Avisame cuando llegue
                    </a>
                  </div>
                )}
              </div>

              {/* Envío */}
              <EnvioInfo />

              {/* Cantidad */}
              {producto.stock > 0 && (
                <div className="mb-6">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-2">
                    Cantidad
                  </label>
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                        className="w-10 h-11 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-600"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        value={cantidad}
                        onChange={e => {
                          const v = parseInt(e.target.value) || 1;
                          setCantidad(Math.max(1, Math.min(producto.stock, v)));
                        }}
                        className="w-14 text-center font-semibold text-sm outline-none border-x border-gray-200 h-11"
                        min="1"
                        max={producto.stock}
                      />
                      <button
                        onClick={() => setCantidad(Math.min(producto.stock, cantidad + 1))}
                        className="w-10 h-11 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-600"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-sm text-gray-500">
                      Total: <strong className="text-jmr-green text-lg">${total}</strong>
                    </span>
                  </div>
                </div>
              )}

              {/* CTAs */}
              <div className="space-y-3 mb-8">
                {producto.stock > 0 ? (
                  <>
                    <motion.button
                      onClick={handleAgregarCarrito}
                      whileTap={{ scale: 0.97 }}
                      className={`w-full py-4 rounded-xl font-semibold text-base flex items-center justify-center gap-2 transition-colors shadow-md ${
                        agregado
                          ? 'bg-green-600 text-white'
                          : 'bg-gradient-to-r from-[#286c00] to-[#6DBE45] text-white hover:opacity-95'
                      }`}
                    >
                      <ShoppingBag className="w-5 h-5" />
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={agregado ? 'ok' : 'add'}
                          initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                          transition={{ duration: 0.2 }}
                        >
                          {agregado ? '¡Agregado al carrito!' : 'Añadir al carrito'}
                        </motion.span>
                      </AnimatePresence>
                    </motion.button>

                    <div className="grid grid-cols-[1fr_auto] gap-3">
                      <motion.button
                        onClick={handleComprarWhatsApp}
                        whileTap={{ scale: 0.97 }}
                        className="bg-[#25D366] hover:bg-[#20BA5A] text-white py-3.5 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 text-sm shadow-md"
                      >
                        <WhatsAppIcon />
                        Consultar por WhatsApp
                      </motion.button>

                      <button
                        onClick={handleToggleFavorito}
                        aria-label={favorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                        aria-pressed={favorito}
                        className={`w-12 h-12 rounded-xl border transition-all flex items-center justify-center ${
                          favorito
                            ? 'bg-red-50 border-red-200 text-red-500'
                            : 'bg-white border-gray-200 text-gray-400 hover:text-red-400 hover:border-red-200'
                        }`}
                      >
                        <Heart className={`w-5 h-5 ${favorito ? 'fill-red-500' : ''}`} />
                      </button>
                    </div>
                  </>
                ) : (
                  <motion.button
                    onClick={handleComprarWhatsApp}
                    whileTap={{ scale: 0.97 }}
                    className="w-full bg-gray-300 text-gray-500 py-4 rounded-xl font-semibold cursor-not-allowed flex items-center justify-center gap-2 shadow-none"
                  >
                    <WhatsAppIcon />
                    Consultar disponibilidad
                  </motion.button>
                )}
              </div>

              {/* Tabs */}
              <ProductTabs producto={producto} />

              {/* Promos y formas de pago */}
              <div className="mt-6">
                <PromosPago />
              </div>

              {/* Trust */}
              <div className="mt-7 pt-6 border-t border-gray-100 space-y-3">
                {[
                  { icon: Shield, text: 'Productos de calidad garantizada' },
                  { icon: Package, text: 'Retiro en sucursales San Fernando o Valle Viejo' },
                  { icon: Star, text: 'Más de 20 años de experiencia' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3 text-xs text-gray-500">
                    <Icon className="w-4 h-4 text-jmr-green flex-shrink-0" />
                    {text}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Productos relacionados */}
        {productosRelacionados.length > 0 && (
          <motion.section
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={fadeIn}
            className="mb-12"
          >
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold tracking-tight mb-1">Productos relacionados</h2>
                <p className="text-gray-500 text-sm">
                  Más opciones similares a{' '}
                  <span className="font-semibold text-gray-700">{producto.nombre}</span>
                </p>
              </div>
              {producto.categoria && (
                <Link
                  href={`/productos?categoria=${producto.categoriaId}`}
                  className="text-sm text-jmr-green hover:underline font-semibold"
                >
                  Ver todo →
                </Link>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {productosRelacionados.map((p, i) => (
                <motion.div
                  key={p.id}
                  variants={fadeUp} custom={i}
                  initial="hidden" whileInView="visible" viewport={{ once: true }}
                >
                  <ProductCard producto={p} onAddToCart={addToCart} />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}

// ── Componente de envío (preparado para OCA) ───────────────────────────────
function EnvioInfo() {
  const [cp, setCp] = useState('');
  const [tarifando, setTarifando] = useState(false);
  const [tarifas, setTarifas] = useState(null);
  const [cpActivo, setCpActivo] = useState('');
  const [error, setError] = useState('');

  const fmt = (n) => new Intl.NumberFormat('es-AR', {
    style: 'currency', currency: 'ARS', maximumFractionDigits: 0,
  }).format(n ?? 0);

  const calcular = async () => {
    if (!cp || cp.length < 4) return;
    setTarifando(true); setError(''); setTarifas(null);
    try {
      const [resSap, resSas] = await Promise.allSettled([
        fetch('/api/oca/tarifar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cpDestino: cp }),
        }).then(r => r.json()),
        fetch('/api/oca/tarifar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cpDestino: cp, operativa: '466988' }),
        }).then(r => r.json()),
      ]);

      const sap = resSap.status === 'fulfilled' && resSap.value.ok ? resSap.value.tarifa : resSap.value?.fallback ?? null;
      const sas = resSas.status === 'fulfilled' && resSas.value.ok ? resSas.value.tarifa : resSas.value?.fallback ?? null;

      if (!sap && !sas) { setError('No se pudo calcular para ese CP.'); return; }
      setTarifas({ sap, sas });
      setCpActivo(cp);
    } catch {
      setError('Error de conexión. Intentá de nuevo.');
    } finally {
      setTarifando(false);
    }
  };

  return (
    <div className="bg-gray-50 rounded-xl p-4 mb-6 text-sm">
      <div className="flex items-center gap-2 font-semibold mb-3">
        <Truck className="w-4 h-4 text-gray-500" />
        Calcular envío
      </div>

      {!cpActivo ? (
        <>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={cp}
              onChange={e => setCp(e.target.value.replace(/\D/g, '').slice(0, 8))}
              onKeyDown={e => e.key === 'Enter' && calcular()}
              placeholder="Código postal"
              className="flex-1 min-w-0 text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-jmr-green bg-white"
            />
            <button
              onClick={calcular}
              disabled={tarifando || cp.length < 4}
              className="text-sm font-bold px-3 py-2 bg-jmr-green text-white rounded-lg disabled:opacity-50 hover:bg-jmr-green-dark transition-colors flex items-center gap-1"
            >
              {tarifando ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Calcular'}
            </button>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <a href="https://www.correoargentino.com.ar/formularios/cpa" target="_blank" rel="noreferrer"
            className="text-xs text-gray-400 underline">No sé mi código postal</a>
        </>
      ) : (
        <div className="space-y-2">
          {tarifas?.sap && (
            <div className="flex items-center justify-between p-2.5 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-gray-400" />
                <div>
                  <p className="text-xs font-semibold text-gray-800">Envío a domicilio</p>
                  <p className="text-[10px] text-gray-400">{tarifas.sap.diasHabiles} días hábiles · OCA</p>
                </div>
              </div>
              <span className="text-xs font-bold text-jmr-green-dark">{fmt(tarifas.sap.precio)}</span>
            </div>
          )}
          {tarifas?.sas && (
            <div className="flex items-center justify-between p-2.5 bg-white border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Package className="w-3.5 h-3.5 text-gray-400" />
                <div>
                  <p className="text-xs font-semibold text-gray-800">Retiro en sucursal OCA</p>
                  <p className="text-[10px] text-gray-400">{tarifas.sas.diasHabiles} días hábiles</p>
                </div>
              </div>
              <span className="text-xs font-bold text-jmr-green-dark">{fmt(tarifas.sas.precio)}</span>
            </div>
          )}
          <div className="flex items-center justify-between p-2.5 bg-green-50 border border-green-100 rounded-lg">
            <div className="flex items-center gap-2">
              <Store className="w-3.5 h-3.5 text-jmr-green" />
              <div>
                <p className="text-xs font-semibold text-gray-800">Retiro en local JMR</p>
                <p className="text-[10px] text-gray-400">Rivadavia 564 o Valle Viejo</p>
              </div>
            </div>
            <span className="text-xs font-bold text-jmr-green">Gratis</span>
          </div>
          <p className="text-[10px] text-gray-400 text-center">* Precios OCA para CP {cpActivo}</p>
          <button onClick={() => { setTarifas(null); setCpActivo(''); setCp(''); }}
            className="text-xs text-gray-400 underline">Cambiar CP</button>
        </div>
      )}
    </div>
  );
}
