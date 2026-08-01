'use client';

import { Suspense, useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ShoppingBag, Search, X, SlidersHorizontal,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import ProductCard from '@/components/ProductCard';

const PAGE_SIZE = 12;

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) return null;
  const { page, totalPages, total, pageSize } = pagination;
  const desde = (page - 1) * pageSize + 1;
  const hasta = Math.min(page * pageSize, total);

  const getPages = () => {
    const delta = 2;
    const range = [];
    for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++)
      range.push(i);
    return range;
  };

  const navBtnStyle = (disabled) => ({
    padding: '0.5rem', borderRadius: '0.5rem', border: 'none', background: 'transparent',
    color: disabled ? '#ccc' : '#5e5e5e', cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  });
  const pageNumStyle = (active) => ({
    width: '2.25rem', height: '2.25rem', borderRadius: '0.5rem', border: 'none',
    background: active ? '#6DBE45' : 'transparent',
    color: active ? 'white' : '#1a1c1c',
    fontWeight: active ? 700 : 500,
    fontSize: '0.875rem', cursor: 'pointer',
    boxShadow: active ? '0 2px 8px rgba(109,190,69,0.35)' : 'none',
  });

  return (
    <div style={{ marginTop: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
      <p style={{ fontSize: '0.85rem', color: '#5e5e5e' }}>
        Mostrando <strong style={{ color: '#1a1c1c' }}>{desde}–{hasta}</strong> de{' '}
        <strong style={{ color: '#1a1c1c' }}>{total}</strong> productos
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <button onClick={() => onPageChange(1)}       disabled={page === 1}          style={navBtnStyle(page === 1)}          ><ChevronsLeft  size={16} /></button>
        <button onClick={() => onPageChange(page - 1)} disabled={page === 1}         style={navBtnStyle(page === 1)}          ><ChevronLeft   size={16} /></button>

        {getPages()[0] > 1 && (
          <>
            <button onClick={() => onPageChange(1)} style={pageNumStyle(false)}>1</button>
            {getPages()[0] > 2 && <span style={{ padding: '0 0.25rem', color: '#aaa' }}>…</span>}
          </>
        )}

        {getPages().map((p) => (
          <button key={p} onClick={() => onPageChange(p)} style={pageNumStyle(p === page)}>{p}</button>
        ))}

        {getPages()[getPages().length - 1] < totalPages && (
          <>
            {getPages()[getPages().length - 1] < totalPages - 1 && <span style={{ padding: '0 0.25rem', color: '#aaa' }}>…</span>}
            <button onClick={() => onPageChange(totalPages)} style={pageNumStyle(false)}>{totalPages}</button>
          </>
        )}

        <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages} style={navBtnStyle(page === totalPages)}><ChevronRight  size={16} /></button>
        <button onClick={() => onPageChange(totalPages)} disabled={page === totalPages} style={navBtnStyle(page === totalPages)}><ChevronsRight size={16} /></button>
      </div>
    </div>
  );
}

function ProductosContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [productos, setProductos]           = useState([]);
  const [categorias, setCategorias]         = useState([]);
  const [pagination, setPagination]         = useState(null);
  const [loading, setLoading]               = useState(true);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const [catalogoMin, setCatalogoMin] = useState(0);
  const [catalogoMax, setCatalogoMax] = useState(100000);

  const [busquedaInput, setBusquedaInput]           = useState(searchParams.get('busqueda') || '');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(searchParams.get('categoria') || '');
  const [ordenar, setOrdenar]   = useState('');
  const [page, setPage]         = useState(1);
  const [precioMin, setPrecioMin] = useState(null);
  const [precioMax, setPrecioMax] = useState(null);
  const [sliderKey, setSliderKey] = useState(0);

  const busqueda = useDebounce(busquedaInput, 400);
  const { addToCart } = useCart();
  const topRef = useRef(null);

  // ✅ Reemplazar con valores por defecto
  useEffect(() => {
    setCatalogoMin(0);
    setCatalogoMax(500000);
    setPrecioMin(0);
    setPrecioMax(500000);
  }, []);
  
useEffect(() => {
  fetch('/api/categorias')
    .then(r => r.json())
    .then(data => {
      console.log('CATEGORIAS:', JSON.stringify(data.slice(0,3), null, 2));
      setCategorias(Array.isArray(data) ? data : []);
    })
    .catch(console.error);
}, []);

  const fetchProductos = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('pageSize', String(PAGE_SIZE));
      if (busqueda)             params.set('busqueda',  busqueda);
      if (categoriaSeleccionada) params.set('categoria', categoriaSeleccionada);
      if (ordenar)              params.set('ordenar',   ordenar);
      if (precioMin > catalogoMin || precioMax < catalogoMax) {
        params.set('precioMin', String(precioMin));
        params.set('precioMax', String(precioMax));
      }
      const response = await fetch(`/api/productos?${params.toString()}`);
      const data = await response.json();
      if (data.productos) {
        setProductos(data.productos); 
        setPagination(data.meta); // ← cambiar .pagination por .meta
      } else {
        setProductos(Array.isArray(data) ? data : []); setPagination(null);
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  }, [page, busqueda, categoriaSeleccionada, ordenar, precioMin, precioMax, catalogoMin, catalogoMax]);

  useEffect(() => { fetchProductos(); }, [fetchProductos]);
  useEffect(() => { setPage(1); }, [busqueda, categoriaSeleccionada, ordenar, precioMin, precioMax]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const limpiarFiltros = () => {
    setBusquedaInput(''); setCategoriaSeleccionada(''); setOrdenar('');
    setPrecioMin(catalogoMin); setPrecioMax(catalogoMax);
    setSliderKey(k => k + 1); setPage(1);
    router.push('/productos');
  };

  const precioFiltrado = precioMin !== null && precioMax !== null &&
    (precioMin > catalogoMin || precioMax < catalogoMax);
  const hayFiltrosActivos = busquedaInput || categoriaSeleccionada || ordenar || precioFiltrado;

  const SidebarFilters = () => {
  const [expandidas, setExpandidas] = useState({});
  const toggle = (id) => setExpandidas(p => ({ ...p, [id]: !p[id] }));

  return (
    <div>
      <div style={{ borderBottom: '1px solid #e8e8e8', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1a1c1c', marginBottom: '1rem' }}>
          Categoría
        </h3>

        {/* Todas */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', marginBottom: '0.5rem' }}>
          <input type="radio" name="categoria" checked={!categoriaSeleccionada} onChange={() => setCategoriaSeleccionada('')} style={{ accentColor: '#6DBE45' }} />
          <span style={{ fontSize: '0.875rem', fontWeight: !categoriaSeleccionada ? 600 : 400, color: !categoriaSeleccionada ? '#1a1c1c' : '#5e5e5e' }}>
            Todas
          </span>
        </label>

        {categorias.map(padre => (
          <div key={padre.id} style={{ marginBottom: '0.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', flex: 1 }}>
                <input
                  type="radio" name="categoria"
                  checked={categoriaSeleccionada === padre.id}
                  onChange={() => setCategoriaSeleccionada(padre.id)}
                  style={{ accentColor: '#6DBE45' }}
                />
                <span style={{ fontSize: '0.875rem', fontWeight: categoriaSeleccionada === padre.id ? 600 : 400, color: categoriaSeleccionada === padre.id ? '#1a1c1c' : '#5e5e5e' }}>
                  {padre.nombre}
                </span>
              </label>
              {padre.hijas?.length > 0 && (
                <button onClick={() => toggle(padre.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', padding: '0 0.25rem', fontSize: '0.7rem' }}>
                  {expandidas[padre.id] ? '▲' : '▼'}
                </button>
              )}
            </div>

            {padre.hijas?.length > 0 && expandidas[padre.id] && (
              <div style={{ marginLeft: '1.75rem', marginTop: '0.35rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {padre.hijas.map(hija => (
                  <label key={hija.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                    <input
                      type="radio" name="categoria"
                      checked={categoriaSeleccionada === hija.id}
                      onChange={() => setCategoriaSeleccionada(hija.id)}
                      style={{ accentColor: '#6DBE45' }}
                    />
                    <span style={{ fontSize: '0.8rem', fontWeight: categoriaSeleccionada === hija.id ? 600 : 400, color: categoriaSeleccionada === hija.id ? '#1a1c1c' : '#5e5e5e' }}>
                      {hija.nombre}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Ordenar */}
      <div>
        <h3 style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#1a1c1c', marginBottom: '0.75rem' }}>Ordenar</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {[
            { value: '', label: 'Recomendados' },
            { value: 'precio-asc', label: 'Menor Precio' },
            { value: 'precio-desc', label: 'Mayor Precio' },
            { value: 'recientes', label: 'Nuevos' },
          ].map((op) => (
            <button key={op.value} onClick={() => setOrdenar(op.value)} style={{
              padding: '0.25rem 0.75rem', borderRadius: '9999px', border: 'none',
              fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
              cursor: 'pointer',
              background: ordenar === op.value ? '#6DBE45' : '#e8e8e8',
              color: ordenar === op.value ? 'white' : '#1a1c1c',
            }}>{op.label}</button>
          ))}
        </div>
      </div>
    </div>
  );
};

  return (
    <div style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="catalog-layout">

        {/* Header */}
        <div>
          <nav className="breadcrumb" style={{ marginBottom: '1rem' }}>
            <a href="/">Home</a>
            <span>›</span>
            <span className="current">Catálogo</span>
          </nav>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, letterSpacing: '-0.03em', color: '#1a1c1c', marginBottom: '0.5rem' }}>
            Explorar Colección
          </h1>
          <p style={{ color: '#5e5e5e', maxWidth: '560px' }}>
            Curaduría exclusiva de accesorios en cuero y materiales técnicos para el viaje moderno.
          </p>
        </div>

        {/* Search + sort */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-bar" style={{ flex: '1', minWidth: '200px' }}>
            <Search size={18} color="#aaa" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={busquedaInput}
              onChange={(e) => setBusquedaInput(e.target.value)}
            />
            {busquedaInput && (
              <button onClick={() => setBusquedaInput('')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#aaa' }}>
                <X size={16} />
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#5e5e5e', whiteSpace: 'nowrap' }}>Ordenar por:</span>
            <select
              value={ordenar}
              onChange={(e) => setOrdenar(e.target.value)}
              style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid #e8e8e8', background: 'white', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', outline: 'none', minWidth: '180px' }}
            >
              <option value="">Recomendados</option>
              <option value="precio-asc">Menor Precio</option>
              <option value="precio-desc">Mayor Precio</option>
              <option value="recientes">Nuevos Ingresos</option>
            </select>
          </div>

          <button className="mobile-filter-btn" onClick={() => setMostrarFiltros(!mostrarFiltros)}>
            <SlidersHorizontal size={16} />
            Filtros
            {(categoriaSeleccionada || ordenar || precioFiltrado) && (
              <span style={{ background: 'white', color: '#6DBE45', borderRadius: '50%', width: '1.25rem', height: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800 }}>
                {(categoriaSeleccionada ? 1 : 0) + (ordenar ? 1 : 0) + (precioFiltrado ? 1 : 0)}
              </span>
            )}
          </button>
        </div>

        {/* Mobile filters panel */}
        {mostrarFiltros && (
          <div className="mobile-filters-panel">
            <SidebarFilters />
            {hayFiltrosActivos && (
              <button onClick={limpiarFiltros} style={{ marginTop: '1rem', width: '100%', padding: '0.75rem', background: '#e8e8e8', border: 'none', borderRadius: '0.5rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <X size={16} /> Limpiar Filtros
              </button>
            )}
          </div>
        )}

        {/* Active filter tags */}
        {(busqueda || categoriaSeleccionada || precioFiltrado) && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {busqueda && (
              <span className="active-filter-tag">
                &ldquo;{busqueda}&rdquo;
                <button onClick={() => setBusquedaInput('')}><X size={12} /></button>
              </span>
            )}
            {categoriaSeleccionada && (
              <span className="active-filter-tag">
                {categorias.find(c => c.id === categoriaSeleccionada)?.nombre ||
                categorias.flatMap(c => c.hijas || []).find(h => h.id === categoriaSeleccionada)?.nombre ||
                'Categoría'}
                <button onClick={() => setCategoriaSeleccionada('')}><X size={12} /></button>
              </span>
            )}
            {precioFiltrado && (
              <span className="active-filter-tag">
                ${precioMin?.toLocaleString('es-AR')} – ${precioMax?.toLocaleString('es-AR')}
                <button onClick={() => { setPrecioMin(catalogoMin); setPrecioMax(catalogoMax); }}><X size={12} /></button>
              </span>
            )}
          </div>
        )}

        {/* Body: sidebar + grid */}
        <div className="catalog-body" ref={topRef}>

          {/* Sidebar */}
          <aside className="catalog-sidebar">
            <div className="sticky-sidebar">
              <div className="sidebar-card">
                <div className="sidebar-header">
                  <h2 style={{ fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1a1c1c' }}>
                    <SlidersHorizontal size={18} /> Filtros
                  </h2>
                  {hayFiltrosActivos && (
                    <button onClick={limpiarFiltros} style={{ fontSize: '0.8rem', color: '#6DBE45', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>
                      Limpiar todo
                    </button>
                  )}
                </div>
                <SidebarFilters />
              </div>
            </div>
          </aside>

          {/* Main grid */}
          <main className="catalog-main">
            {!loading && pagination && (
              <p style={{ marginBottom: '1rem', fontSize: '0.875rem', color: '#5e5e5e' }}>
                {pagination.total === 0
                  ? 'No se encontraron productos'
                  : <><strong style={{ color: '#1a1c1c' }}>{pagination.total}</strong>{' '}{pagination.total === 1 ? 'producto' : 'productos'} encontrados</>}
              </p>
            )}

            {loading ? (
              <div className="products-grid-cat">
                {[...Array(PAGE_SIZE)].map((_, i) => (
                  <div key={i} className="product-skeleton" style={{ height: '320px' }} />
                ))}
              </div>
            ) : productos.length === 0 ? (
              <div className="empty-state">
                <ShoppingBag size={56} color="#ccc" style={{ margin: '0 auto 1rem' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#5e5e5e', marginBottom: '0.5rem' }}>No se encontraron productos</h3>
                <p style={{ color: '#aaa', marginBottom: '1.5rem' }}>Intenta con otros filtros o búsqueda</p>
                <button onClick={limpiarFiltros} style={{ padding: '0.75rem 1.5rem', background: '#6DBE45', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 700, cursor: 'pointer' }}>
                  Ver todos los productos
                </button>
              </div>
            ) : (
              <>
                <div className="products-grid-cat">
                  {productos.map((producto) => (
                    <ProductCard key={producto.id} producto={producto} onAddToCart={addToCart} />
                  ))}
                </div>
                <Pagination pagination={pagination} onPageChange={handlePageChange} />
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function ProductosPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f9f9f9', fontFamily: 'Inter, sans-serif' }}>
      <Suspense fallback={
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '3rem 2rem' }}>
          <div className="products-grid-cat">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="product-skeleton" style={{ height: '320px' }} />
            ))}
          </div>
        </div>
      }>
        <ProductosContent />
      </Suspense>
    </div>
  );
}