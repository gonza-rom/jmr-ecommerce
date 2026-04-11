'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag, ArrowLeft, Package, Truck, Shield, Star, Plus, Minus, Share2, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import ProductGallery from '@/components/ProductGallery';
import ProductCard from '@/components/ProductCard';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
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

// ── Tab content ────────────────────────────────────────────────────────────
const TABS = ['Detalles', 'Especificaciones', 'Garantía'];

function ProductTabs({ producto }) {
  const [active, setActive] = useState(0);

  return (
    <div>
      {/* Tab headers */}
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

      {/* Tab content */}
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
        <dl className="space-y-3 text-sm">
          {producto.especificaciones?.map(({ label, valor }) => (
            <div key={label} className="flex justify-between border-b border-gray-50 pb-2">
              <dt className="text-gray-500">{label}</dt>
              <dd className="font-medium text-gray-900">{valor}</dd>
            </div>
          )) ?? (
            <p className="text-gray-500">Sin especificaciones disponibles.</p>
          )}
        </dl>
      )}

      {active === 2 && (
        <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
          <p>Garantía de por vida en costuras y herrajes contra defectos de fabricación.</p>
          <p>Para hacer efectiva la garantía, contactanos por WhatsApp con tu comprobante de compra.</p>
        </div>
      )}
    </div>
  );
}

// ── Bento de especificaciones técnicas ───────────────────────────────────
function SpecsBento({ producto }) {
  const dimensiones = producto.dimensiones || { alto: '—', ancho: '—', profundidad: '—' };
  const capacidad = producto.capacidad || '—';

  return (
    <section className="mt-20 mb-20">
      <h2 className="text-3xl font-bold tracking-tight mb-8">Especificaciones técnicas</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">

        {/* Dimensiones */}
        <div className="md:col-span-2 bg-gray-50 rounded-2xl p-7">
          <Package className="w-7 h-7 text-jmr-green mb-4" />
          <h3 className="text-lg font-semibold mb-2">Dimensiones precisas</h3>
          <p className="text-sm text-gray-500 mb-6">Diseñada para cumplir normativas de equipaje de cabina internacional.</p>
          <div className="flex gap-8">
            {[
              { label: 'Alto', val: dimensiones.alto },
              { label: 'Ancho', val: dimensiones.ancho },
              { label: 'Profundidad', val: dimensiones.profundidad },
            ].map(({ label, val }) => (
              <div key={label}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{label}</p>
                <p className="text-2xl font-bold">{val}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Capacidad */}
        <div className="bg-gray-100 rounded-2xl p-7">
          <Star className="w-7 h-7 text-jmr-green mb-4" />
          <h3 className="text-lg font-semibold mb-1">Capacidad</h3>
          <p className="text-5xl font-extrabold mt-3">
            {capacidad} <span className="text-lg font-bold text-gray-400">L</span>
          </p>
          <p className="text-sm text-gray-500 mt-2">Ideal para viajes de 2 días</p>
        </div>

        {/* Garantía */}
        <div className="bg-jmr-green rounded-2xl p-7 flex flex-col justify-between">
          <Shield className="w-7 h-7 text-white mb-4" />
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Garantía de por vida</h3>
            <p className="text-sm text-white/80">Cubrimos cualquier defecto de fabricación en costuras y herrajes.</p>
          </div>
        </div>

        {/* Materiales */}
        <div className="md:col-span-2 bg-white border border-gray-100 rounded-2xl p-7 flex items-center gap-6 shadow-sm">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Package className="w-8 h-8 text-jmr-green" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-1">Materiales premium</h3>
            <p className="text-sm text-gray-500">Cuero de curtiembre sustentable con terminación semi-mate resistente al agua y arañazos.</p>
          </div>
        </div>

        {/* Tech */}
        <div className="md:col-span-2 bg-gray-50 rounded-2xl p-7 flex items-center gap-6">
          <Truck className="w-12 h-12 text-jmr-green flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold mb-1">Protección tech</h3>
            <p className="text-sm text-gray-500">Funda interior con suspensión antigolpes para laptops hasta 16" y tablet 11".</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Page principal ─────────────────────────────────────────────────────────
export default function ProductoDetallePage() {
  const params = useParams();
  const router = useRouter();
  const [producto, setProducto] = useState(null);
  const [productosRelacionados, setProductosRelacionados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);
  const [favorito, setFavorito] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    if (params.id) fetchProducto();
  }, [params.id]);

  const fetchProducto = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/productos/${params.id}`);
      if (!response.ok) {
        setError(response.status === 404 ? 'not_found' : 'error');
        setProducto(null);
        return;
      }
      const data = await response.json();
      setProducto(data);
      fetchRelacionados(data.categoriaId, data.id);
    } catch (err) {
      console.error('Error al cargar producto:', err);
      setError('error');
      setProducto(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelacionados = async (categoriaId, productoId) => {
    try {
      const response = await fetch('/api/productos');
      const data = await response.json();
      // La API puede devolver un array directo o un objeto con los productos adentro
      const todos = Array.isArray(data) ? data : (data.productos ?? data.data ?? []);
      const relacionados = todos
        .filter(p => p.categoriaId === categoriaId && p.id !== productoId)
        .slice(0, 4);
      setProductosRelacionados(relacionados);
    } catch (err) {
      console.error('Error al cargar relacionados:', err);
    }
  };

  const handleAgregarCarrito = () => {
    if (!producto || cantidad <= 0) return;
    addToCart(producto, cantidad);
    setAgregado(true);
    setTimeout(() => setAgregado(false), 2000);
  };

  const handleComprarWhatsApp = () => {
    if (!producto) return;
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

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-jmr-green mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Cargando producto...</p>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (error || !producto) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
          <ShoppingBag className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {error === 'not_found' ? 'Producto no encontrado' : 'Error al cargar'}
          </h2>
          <p className="text-gray-500 text-sm mb-8">
            {error === 'not_found'
              ? 'El producto que buscás no existe o fue eliminado.'
              : 'Hubo un problema al cargar el producto. Por favor, intentá de nuevo.'}
          </p>
          <div className="space-y-3">
            <Link
              href="/productos"
              className="inline-flex items-center gap-2 bg-jmr-green hover:bg-jmr-green-dark text-white px-6 py-3 rounded-xl font-semibold transition-colors w-full justify-center"
            >
              <ArrowLeft className="w-4 h-4" />
              Ver todos los productos
            </Link>
            {error === 'error' && (
              <button
                onClick={fetchProducto}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                Reintentar
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const total = (producto.precio * cantidad).toLocaleString('es-AR');

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Breadcrumb */}
      <motion.div
        className="bg-white border-b border-gray-100"
        initial="hidden" animate="visible" variants={fadeIn}
      >
        <div className="container mx-auto px-4 md:px-8 py-3">
          <div className="flex items-center gap-2 text-sm flex-wrap">
            <Link href="/" className="text-gray-400 hover:text-jmr-green transition-colors">Inicio</Link>
            <span className="text-gray-300">/</span>
            <Link href="/productos" className="text-gray-400 hover:text-jmr-green transition-colors">Productos</Link>
            {producto.categoria && (
              <>
                <span className="text-gray-300">/</span>
                <Link
                  href={`/productos?categoria=${producto.categoriaId}`}
                  className="text-gray-400 hover:text-jmr-green transition-colors"
                >
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
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </motion.button>

        {/* ── Grid principal ── */}
        <div className="grid lg:grid-cols-2 gap-8 md:gap-14 mb-8 items-start">

          {/* Galería */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
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
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-9 lg:sticky lg:top-24">

              {/* Categoría */}
              {producto.categoria && (
                <Link
                  href={`/productos?categoria=${producto.categoriaId}`}
                  className="inline-block text-xs font-bold uppercase tracking-widest text-gray-400 bg-gray-100 rounded-full px-3 py-1 mb-5 hover:text-jmr-green transition-colors"
                >
                  {producto.categoria.nombre}
                </Link>
              )}

              {/* Nombre + código */}
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
                  12 cuotas sin interés
                </span>
              </div>

              {/* Stock */}
              <div className="flex items-center gap-2 text-sm font-semibold mb-3">
                {producto.stock > 0 ? (
                  <>
                    <span className="text-jmr-green text-base">✓</span>
                    <span className="text-jmr-green">In stock — {producto.stock} unidades disponibles</span>
                  </>
                ) : (
                  <>
                    <span className="text-red-500 text-base">✕</span>
                    <span className="text-red-500">Sin stock</span>
                  </>
                )}
              </div>

              {/* Envío */}
              <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4 mb-6">
                <Truck className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold">Envío gratis a todo el país</p>
                  <p className="text-xs text-gray-500 mt-0.5">Recíbelo entre el 15 y 18 de Mayo</p>
                </div>
              </div>

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
                        aria-label="Disminuir"
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
                        aria-label="Aumentar"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-sm text-gray-500">
                      Total:{' '}
                      <strong className="text-jmr-green text-lg">${total}</strong>
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
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
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
                        onClick={() => setFavorito(f => !f)}
                        className={`w-12 h-12 rounded-xl border transition-all flex items-center justify-center ${
                          favorito
                            ? 'bg-red-50 border-red-200 text-red-500'
                            : 'bg-white border-gray-200 text-gray-400 hover:text-red-400 hover:border-red-200'
                        }`}
                        aria-label="Favorito"
                      >
                        <Heart className={`w-5 h-5 ${favorito ? 'fill-red-500' : ''}`} />
                      </button>
                    </div>
                  </>
                ) : (
                  <motion.button
                    onClick={handleComprarWhatsApp}
                    whileTap={{ scale: 0.97 }}
                    className="w-full bg-gray-600 hover:bg-gray-700 text-white py-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 shadow-md"
                  >
                    <WhatsAppIcon />
                    Consultar disponibilidad
                  </motion.button>
                )}
              </div>

              {/* Tabs */}
              <ProductTabs producto={producto} />

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

        {/* Bento specs */}
        <SpecsBento producto={producto} />

        {/* Productos relacionados */}
        {productosRelacionados.length > 0 && (
          <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeIn}
            className="mb-12"
          >
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold tracking-tight mb-1">Completa tu set</h2>
                <p className="text-gray-500 text-sm">Productos que combinan a la perfección.</p>
              </div>
              {producto.categoria && (
                <Link
                  href={`/productos?categoria=${producto.categoriaId}`}
                  className="text-sm text-jmr-green hover:underline font-semibold flex items-center gap-1"
                >
                  Ver todo →
                </Link>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {productosRelacionados.map((p, i) => (
                <motion.div
                  key={p.id}
                  variants={fadeUp}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
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