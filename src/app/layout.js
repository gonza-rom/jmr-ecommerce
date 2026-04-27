import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CartProvider } from '@/context/CartContext';
import { ToastProvider } from '@/context/ToastContext';


export const dynamic = 'force-dynamic'; // ← agregar acá

const inter = Inter({ subsets: ['latin'] });

export const viewport = {
  themeColor: '#16a34a',
  width: 'device-width',
  initialScale: 1,
};

export const metadata = {
  title: 'Marroquinería JMR - Tienda Online | Mochilas, Bolsos y Carteras en Catamarca',
  description: 'Venta de productos de marroquinería de alta calidad en Catamarca. Mochilas, bolsos, carteras, billeteras y más. Más de 20 años de experiencia. Sucursales en San Fernando y Valle Viejo.',
  keywords: 'marroquinería, mochilas, bolsos, carteras, billeteras, cuero, catamarca, san fernando, valle viejo, alpine skate, everlast, head, wilson, pierre cardin',
  authors: [{ name: 'Marroquinería JMR' }],
  creator: 'Marroquinería JMR',
  publisher: 'Marroquinería JMR',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: 'https://www.jmrmarroquineria.com.ar',
    title: 'Marroquinería JMR - Mochilas, Bolsos y Carteras',
    description: 'Venta de productos de marroquinería de alta calidad. Más de 20 años en Catamarca.',
    siteName: 'Marroquinería JMR',
    images: [
      {
        url: '/logo-jmr.png',
        width: 1200,
        height: 630,
        alt: 'Marroquinería JMR Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Marroquinería JMR - Tienda Online',
    description: 'Mochilas, bolsos, carteras y más. Catamarca, Argentina.',
    images: ['/logo-jmr.png'],
  },
  verification: {
    google: 'google-site-verification-code',
  },
  alternates: {
    canonical: 'https://www.jmrmarroquineria.com.ar',
  },
  // ✅ Reemplaza las meta tags manuales deprecadas
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
  },
  other: {
    // ✅ Nueva meta tag estándar (reemplaza apple-mobile-web-app-capable)
    'mobile-web-app-capable': 'yes',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/logo-jmr.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/logo-jmr.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es-AR">
      <head>
        {/* Solo lo que metadata no puede manejar */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/logo-jmr.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/logo-jmr.png" />
      </head>
      <body className={inter.className}>
        <CartProvider>
          <ToastProvider>
            <Navbar />
            <main className="min-h-screen">
              {children}
            </main>
            <Footer />
          </ToastProvider>
        </CartProvider>
      </body>
    </html>
  );
}