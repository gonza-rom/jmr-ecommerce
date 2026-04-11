// app/nosotros/page.jsx
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Heart, Star, Award, TrendingUp } from 'lucide-react';

export default function NosotrosPage() {
  return (
    <div className="min-h-screen bg-background text-on-surface" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-surface-container-low" style={{ minHeight: '600px', display: 'flex', alignItems: 'center' }}>
        <div className="absolute inset-0 z-0">
          <Image src="/local-fachada.jpg" alt="JMR Marroquinería" fill className="object-cover opacity-90" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(249,249,249,0.92) 0%, rgba(249,249,249,0.5) 50%, transparent 100%)' }} />
        </div>
        <div className="relative z-10 px-8 md:px-24 max-w-4xl py-24">
          <span className="block font-bold uppercase tracking-widest mb-4 text-sm" style={{ color: 'var(--jmr-green-dark)' }}>Legado de Calidad</span>
          <h1 className="font-bold tracking-tight text-on-surface mb-6" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', lineHeight: 1.05 }}>
            Nuestra Historia
          </h1>
          <p className="text-on-surface-variant leading-relaxed max-w-2xl mb-8" style={{ fontSize: '1.15rem' }}>
            Más de 20 años brindando calidad y confianza en Catamarca. Cada producto que elegís lleva consigo años de experiencia y dedicación.
          </p>
          <Link href="/productos" className="inline-flex items-center gap-2 px-8 py-4 text-white font-bold rounded-lg" style={{ background: 'linear-gradient(135deg, var(--jmr-green-dark), var(--jmr-green))' }}>
            Explorar Colección <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ── FUNDADORA ── */}
      <section className="py-24 px-8 md:px-24 bg-surface">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="w-full md:w-1/2 relative">
            <div className="relative rounded-xl overflow-hidden shadow-sm" style={{ aspectRatio: '4/5' }}>
              <Image src="/local-interior-1.jpg" alt="Local JMR" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
            </div>
            <div className="absolute -bottom-6 -right-6 p-6 rounded-xl shadow-xl hidden md:block z-20" style={{ background: 'var(--jmr-green)', color: 'white', maxWidth: '280px' }}>
              <p className="font-bold text-lg italic">"La calidad no es un acto, es un hábito."</p>
            </div>
          </div>

          <div className="w-full md:w-1/2">
            <span className="block font-bold text-sm uppercase tracking-widest mb-2" style={{ color: 'var(--jmr-green-dark)' }}>Fundadora</span>
            <h2 className="text-4xl font-semibold tracking-tight text-on-surface mb-6">María Lourdes Quispe</h2>
            <div className="space-y-4 text-on-surface-variant leading-relaxed" style={{ fontSize: '1.05rem' }}>
              <p>
                A lo largo de mi trayectoria comercial, mi enfoque ha evolucionado hacia la compra y reventa de mercadería de calidad. Inicialmente comencé vendiendo cintos y billeteras artesanales, pero con el tiempo identifiqué oportunidades en el mercado y decidí ampliar mis horizontes.
              </p>
              <p>
                En septiembre de 2003 alquilé mi primer local, proporcionando una plataforma para exhibir y vender diversos productos de cuero. Este paso me permitió consolidar mi presencia en el mercado local y diversificar mi oferta.
              </p>
              <p>
                Actualmente gestiono nuestra tienda en Rivadavia 564, en el corazón de San Fernando del Valle de Catamarca, seleccionando cuidadosamente mercadería de alta calidad para satisfacer las necesidades de nuestros clientes.
              </p>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-8 pt-10" style={{ borderTop: '1px solid var(--outline-variant)' }}>
              <div>
                <p className="font-black mb-1" style={{ fontSize: '2rem', color: 'var(--jmr-green)' }}>20+</p>
                <p className="text-sm font-medium text-secondary">Años de Experiencia</p>
              </div>
              <div>
                <p className="font-black mb-1" style={{ fontSize: '2rem', color: 'var(--jmr-green)' }}>Miles</p>
                <p className="text-sm font-medium text-secondary">de Clientes Satisfechos</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── GALERÍA ── */}
      <section className="py-16 px-8 md:px-24 bg-surface-container-low">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10 text-on-surface">Nuestro Local</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['/local-interior-1.jpg', '/local-interior-2.jpg', '/local-interior-3.jpg'].map((src, i) => (
              <div key={i} className="relative rounded-xl overflow-hidden shadow-sm" style={{ aspectRatio: '1/1' }}>
                <Image
                  src={src}
                  alt={`Interior JMR ${i + 1}`}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALORES (bento grid) ── */}
      <section className="py-24 px-8 md:px-12 bg-surface">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight mb-4 text-on-surface">Nuestros Valores</h2>
            <p className="text-secondary max-w-xl mx-auto">Los pilares que sostienen cada decisión en JMR Marroquinería.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

            <div className="md:col-span-2 rounded-xl p-10 flex flex-col justify-between bg-white hover:bg-[#6DBE45] transition-colors duration-500 group">
              <Heart size={36} className="mb-6 text-[#6DBE45] group-hover:text-white transition-colors" />
              <h3 className="text-2xl font-bold mb-4 text-on-surface group-hover:text-white transition-colors">Pasión</h3>
              <p className="text-on-surface-variant group-hover:text-white/90 transition-colors">Amor por lo que hacemos. Esa energía se traduce en una dedicación absoluta a cada detalle y a cada cliente.</p>
            </div>

            <div className="rounded-xl p-10 bg-white hover:bg-[#6DBE45] transition-colors duration-500 group">
              <Star size={36} className="mb-6 text-[#6DBE45] group-hover:text-white transition-colors" />
              <h3 className="text-xl font-bold mb-4 text-on-surface group-hover:text-white transition-colors">Calidad</h3>
              <p className="text-sm text-on-surface-variant group-hover:text-white/90 transition-colors">Selección cuidadosa de las mejores marcas y productos del mercado.</p>
            </div>

            <div className="rounded-xl p-10 bg-white hover:bg-[#6DBE45] transition-colors duration-500 group">
              <TrendingUp size={36} className="mb-6 text-[#6DBE45] group-hover:text-white transition-colors" />
              <h3 className="text-xl font-bold mb-4 text-on-surface group-hover:text-white transition-colors">Servicio</h3>
              <p className="text-sm text-on-surface-variant group-hover:text-white/90 transition-colors">Atención personalizada para cada cliente, en cada compra.</p>
            </div>

            <div className="md:col-span-4 rounded-xl p-10 flex items-center gap-12 bg-white hover:bg-[#6DBE45] transition-colors duration-500 group">
              <Award size={56} className="hidden md:block flex-shrink-0 text-[#6DBE45] group-hover:text-white transition-colors" />
              <div>
                <h3 className="text-2xl font-bold mb-4 text-on-surface group-hover:text-white transition-colors">Experiencia</h3>
                <p className="text-on-surface-variant group-hover:text-white/90 transition-colors">Más de 20 años perfeccionando la selección de productos de marroquinería nos permiten ofrecerte artículos que superan las expectativas.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── TIENDA ── */}
      <section className="py-24 px-8 md:px-24 bg-surface-container-low">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold tracking-tight mb-2 text-on-surface">Nuestra Tienda</h2>
          <p className="text-secondary mb-12">Visitanos y viví la experiencia JMR en persona.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
            <div className="rounded-xl overflow-hidden shadow-sm" style={{ aspectRatio: '4/3' }}>
              <div className="relative w-full h-full">
                <Image src="/local-fachada.jpg" alt="Local JMR Rivadavia" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
              </div>
            </div>
            <div className="bg-white rounded-xl p-8 flex flex-col justify-center" style={{ borderLeft: '4px solid var(--jmr-green)' }}>
              <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--jmr-green-dark)' }}>Marroquinería JMR</h3>
              <div className="space-y-3 text-on-surface-variant mb-6">
                <p>📍 Rivadavia 564, San Fernando del Valle de Catamarca</p>
                <p>📞 +54 383 492-7252</p>
                <p>✉️ cuerosjmr@hotmail.com</p>
              </div>
              <a href="https://maps.app.goo.gl/qAhZgq3nbN8k6MRx7" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-bold text-sm"
                style={{ color: 'var(--jmr-green)' }}>
                Ver en Google Maps →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-8">
        <div className="max-w-5xl mx-auto rounded-3xl p-12 md:p-20 text-center relative overflow-hidden" style={{ background: '#1a1c1c' }}>
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
              ¿Listo para encontrar tu producto ideal?
            </h2>
            <p className="mb-10 max-w-xl mx-auto" style={{ color: '#9ca3af', fontSize: '1.1rem' }}>
              Explorá nuestro catálogo completo con productos de las mejores marcas.
            </p>
            <Link href="/productos"
              className="inline-flex items-center gap-2 px-8 py-4 font-black uppercase text-xs tracking-widest rounded-lg hover:scale-105 transition-transform"
              style={{ background: 'var(--jmr-green)', color: 'white' }}>
              Ver Productos <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}