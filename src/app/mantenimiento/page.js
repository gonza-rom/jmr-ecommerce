import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Renovando nuestra tienda | Marroquinería JMR",
  description:
    "Estamos implementando pagos online y envíos a todo el país. Muy pronto podés comprar desde casa.",
};

const WhatsAppIcon = () => (
  <svg
    width="20"
    height="20"
    fill="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

const PROGRESO = [
  { label: "Catálogo online",         done: true  },
  { label: "Carrito de compras",      done: true  },
  { label: "Pagos con Mercado Pago",  done: false },
  { label: "Envíos a todo el país",   done: false },
  { label: "Cuenta y mis pedidos",    done: false },
];

export default function MantenimientoPage() {
  const completados = PROGRESO.filter((p) => p.done).length;
  const porcentaje  = Math.round((completados / PROGRESO.length) * 100);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1rem",
        background: "#f9f9f9",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Logo */}
      <div style={{ marginBottom: "2rem" }}>
        <Image
          src="/logo-jmr-removebg.png"
          alt="Marroquinería JMR"
          width={160}
          height={80}
          style={{ objectFit: "contain" }}
          priority
        />
      </div>

      {/* Card principal */}
      <div
        style={{
          background: "white",
          borderRadius: "1.25rem",
          padding: "2.5rem 2rem",
          maxWidth: "480px",
          width: "100%",
          boxShadow: "0 4px 32px rgba(0,0,0,0.07)",
          textAlign: "center",
        }}
      >
        {/* Ícono */}
        <div
          style={{
            width: "64px",
            height: "64px",
            background: "rgba(109,190,69,0.1)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.5rem",
          }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#6DBE45"
            strokeWidth="1.5"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>

        <h1
          style={{
            fontSize: "1.75rem",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: "#1a1c1c",
            marginBottom: "0.75rem",
            lineHeight: 1.2,
          }}
        >
          Estamos renovando<br />nuestra tienda
        </h1>

        <p
          style={{
            fontSize: "0.95rem",
            color: "#5e5e5e",
            lineHeight: 1.7,
            marginBottom: "2rem",
          }}
        >
          Implementamos pagos online y envíos a todo el país.
          Muy pronto podés comprar desde casa con total comodidad.
        </p>

        {/* Barra de progreso */}
        <div style={{ marginBottom: "1.5rem", textAlign: "left" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "0.8rem",
              fontWeight: 700,
              color: "#5e5e5e",
              marginBottom: "0.5rem",
            }}
          >
            <span>Progreso del proyecto</span>
            <span style={{ color: "#6DBE45" }}>{porcentaje}%</span>
          </div>
          <div
            style={{
              height: "6px",
              background: "#e8e8e8",
              borderRadius: "9999px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${porcentaje}%`,
                background: "linear-gradient(90deg, #286c00, #6DBE45)",
                borderRadius: "9999px",
                transition: "width 0.6s ease",
              }}
            />
          </div>
        </div>

        {/* Lista de hitos */}
        <ul
          style={{
            listStyle: "none",
            textAlign: "left",
            marginBottom: "2rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.6rem",
          }}
        >
          {PROGRESO.map((item) => (
            <li
              key={item.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                fontSize: "0.875rem",
                color: item.done ? "#1a1c1c" : "#9ca3af",
              }}
            >
              <span
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: item.done ? "#6DBE45" : "#e8e8e8",
                }}
              >
                {item.done ? (
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <path d="M2 6l3 3 5-5" />
                  </svg>
                ) : (
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "#c4c4c4",
                    }}
                  />
                )}
              </span>
              {item.label}
            </li>
          ))}
        </ul>

        {/* CTA WhatsApp */}
        <a
          href="https://wa.me/543834927252?text=Hola%2C%20quisiera%20hacer%20un%20pedido"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            width: "100%",
            padding: "0.9rem",
            background: "#25D366",
            color: "white",
            fontWeight: 700,
            fontSize: "0.95rem",
            borderRadius: "0.75rem",
            textDecoration: "none",
            marginBottom: "0.75rem",
          }}
        >
          <WhatsAppIcon />
          Hacer un pedido por WhatsApp
        </a>

        <p style={{ fontSize: "0.78rem", color: "#aaa" }}>
          También en{" "}
          <a
            href="mailto:cuerosjmr@hotmail.com"
            style={{ color: "#6DBE45", textDecoration: "none", fontWeight: 600 }}
          >
            cuerosjmr@hotmail.com
          </a>
          {" "}·{" "}
          <a
            href="tel:+543834927252"
            style={{ color: "#6DBE45", textDecoration: "none", fontWeight: 600 }}
          >
            +54 383 492-7252
          </a>
        </p>
      </div>

      {/* Footer mínimo */}
        <p
        style={{
            marginTop: "2rem",
            fontSize: "0.75rem",
            color: "#aaa",
            textAlign: "center",
        }}
        >
        © {new Date().getFullYear()} Marroquinería JMR · Catamarca, Argentina
        {" · "}Desarrollado por{" "}
        <a
            href="https://www.devhub.com.ar/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#6DBE45", textDecoration: "none", fontWeight: 600 }}
        >
            DevHub
        </a>
        </p>
    </div>
  );
}