'use client';
// src/app/admin/page.js

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import {
  Package, Tag, ShoppingBag, ArrowRight,
  TrendingUp, DollarSign, Clock, CheckCircle, AlertTriangle,
} from 'lucide-react';

const fmt = (n) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency', currency: 'ARS', maximumFractionDigits: 0,
  }).format(n ?? 0);

const fmtShort = (n) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`;
  return fmt(n);
};

const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const ESTADOS = {
  PENDIENTE:   { label: 'Pendiente',   color: '#f59e0b', bg: '#fef3c7', border: '#fde68a' },
  CONFIRMADO:  { label: 'Confirmado',  color: '#10b981', bg: '#f0fdf4', border: '#bbf7d0' },
  PREPARANDO:  { label: 'Preparando',  color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' },
  ENVIADO:     { label: 'Enviado',     color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe' },
  ENTREGADO:   { label: 'Entregado',   color: '#6DBE45', bg: '#f0fdf4', border: '#bbf7d0' },
  CANCELADO:   { label: 'Cancelado',   color: '#ef4444', bg: '#fff5f5', border: '#fecaca' },
};

// ── Gráfico de barras ─────────────────────────────────────────────────────────
function SalesChart({ data }) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  if (!data?.length) return null;

  const max = Math.max(...data.map(d => d.total), 1);

  return (
    <div style={{ width: '100%', background: '#f8fafc', borderRadius: 10, padding: '12px 8px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
        <span style={{ fontSize: 10, color: '#bbb', fontFamily: 'monospace' }}>{fmtShort(max)}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 140, padding: '0 2px' }}>
        {data.map((d, i) => {
          const pct    = max > 0 ? (d.total / max) * 100 : 0;
          const esHoy  = i === data.length - 1;
          const altura = animated ? `${Math.max(pct, d.pedidos > 0 ? 4 : 0)}%` : '0%';
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}
              title={`${d.label}: ${fmt(d.total)} (${d.pedidos} pedidos)`}>
              {d.total > 0 && (
                <span style={{ fontSize: 9, color: esHoy ? '#111' : '#aaa', fontWeight: esHoy ? 700 : 500, fontFamily: 'monospace', whiteSpace: 'nowrap', opacity: animated ? 1 : 0, transition: 'opacity 0.4s ease 0.3s' }}>
                  {fmtShort(d.total)}
                </span>
              )}
              <div style={{
                width: '100%', height: altura,
                background: esHoy ? '#6DBE45' : d.total > 0 ? '#286c00' : '#e2e8f0',
                borderRadius: '4px 4px 0 0',
                transition: 'height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                transitionDelay: `${i * 0.05}s`,
                minHeight: d.pedidos > 0 ? 4 : 0,
              }} />
              <span style={{ fontSize: 10, color: esHoy ? '#111' : '#aaa', fontWeight: esHoy ? 700 : 400 }}>
                {d.label}
              </span>
            </div>
          );
        })}
      </div>
      <div style={{ height: 1, background: '#e2e8f0', marginTop: 2 }} />
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/pedidos?pageSize=200')
      .then(r => r.json())
      .then(ped => {
        const pedidos = ped.pedidos ?? [];

        const chartData = Array.from({ length: 7 }, (_, i) => {
          const d = new Date(); d.setDate(d.getDate() - (6 - i)); d.setHours(0, 0, 0, 0);
          const fin = new Date(d); fin.setHours(23, 59, 59, 999);
          const delDia = pedidos.filter(p => {
            const f = new Date(p.createdAt);
            return f >= d && f <= fin && p.estado !== 'CANCELADO';
          });
          return {
            label:   i === 6 ? 'Hoy' : DIAS[d.getDay()],
            total:   delDia.reduce((a, p) => a + (p.total ?? 0), 0),
            pedidos: delDia.length,
          };
        });

        const hoy    = new Date(); hoy.setHours(0, 0, 0, 0);
        const semana = new Date(); semana.setDate(semana.getDate() - 7);

        const pedidosHoy    = pedidos.filter(p => new Date(p.createdAt) >= hoy && p.estado !== 'CANCELADO');
        const pedidosSemana = pedidos.filter(p => new Date(p.createdAt) >= semana && p.estado !== 'CANCELADO');

        setStats({
          pedidosTotal:  ped.stats?.total ?? pedidos.length,
          pendientes:    pedidos.filter(p => p.estado === 'PENDIENTE').length,
          confirmados:   pedidos.filter(p => p.estado === 'CONFIRMADO').length,
          entregados:    pedidos.filter(p => p.estado === 'ENTREGADO').length,
          sinSync:       pedidos.filter(p => !p.ventaDevhubId && ['CONFIRMADO','ENTREGADO','ENVIADO'].includes(p.estado)).length,
          ventasHoy:     pedidosHoy.reduce((a, p) => a + (p.total ?? 0), 0),
          ventasSemana:  pedidosSemana.reduce((a, p) => a + (p.total ?? 0), 0),
          pedidosHoy:    pedidosHoy.length,
          ultimos:       pedidos.slice(0, 5),
          chartData,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 4px', color: '#111' }}>
          Dashboard
        </h1>
        <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>Panel de JMR Marroquinería</p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }} className="lg:grid-cols-4-kpi">
        <style>{`@media(min-width:1024px){.lg\\:grid-cols-4-kpi{grid-template-columns:repeat(4,1fr)!important}}`}</style>
        {[
          { icon: DollarSign, label: 'Ventas hoy',    value: loading ? '—' : fmt(stats?.ventasHoy),   sub: `${stats?.pedidosHoy ?? 0} pedidos`,  iconBg: '#f0fdf4', iconColor: '#6DBE45', valColor: '#111' },
          { icon: TrendingUp, label: '7 días',         value: loading ? '—' : fmt(stats?.ventasSemana),sub: 'Últimos 7 días',                       iconBg: '#eff6ff', iconColor: '#3b82f6', valColor: '#111' },
          { icon: Clock,      label: 'Pendientes',     value: loading ? '—' : stats?.pendientes ?? 0,  sub: 'Requieren atención',                   iconBg: '#fef3c7', iconColor: '#f59e0b', valColor: '#f59e0b' },
          { icon: CheckCircle,label: 'Entregados',     value: loading ? '—' : stats?.entregados ?? 0,  sub: 'Completados',                          iconBg: '#f0fdf4', iconColor: '#6DBE45', valColor: '#6DBE45' },
        ].map(({ icon: Icon, label, value, sub, iconBg, iconColor, valColor }) => (
          <div key={label} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={15} color={iconColor} />
              </div>
              <span style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
            </div>
            <p style={{ fontSize: 22, fontWeight: 800, margin: '0 0 2px', color: valColor }}>{value}</p>
            <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Alerta sin sync */}
      {!loading && stats?.sinSync > 0 && (
        <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertTriangle size={16} color="#f59e0b" />
          <p style={{ fontSize: 13, color: '#92400e', margin: 0 }}>
            <strong>{stats.sinSync} pedido{stats.sinSync > 1 ? 's' : ''}</strong> confirmado{stats.sinSync > 1 ? 's' : ''} sin sincronizar con DevHub.{' '}
            <Link href="/admin/pedidos" style={{ color: '#f59e0b', fontWeight: 700 }}>Revisar →</Link>
          </p>
        </div>
      )}

      {/* Gráfico + lateral */}
      <div style={{ display: 'grid', gap: 16 }} className="lg:grid-cols-3-chart">
        <style>{`@media(min-width:1024px){.lg\\:grid-cols-3-chart{grid-template-columns:2fr 1fr!important}}`}</style>

        {/* Gráfico */}
        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: '20px 20px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#111', margin: '0 0 2px' }}>Ventas últimos 7 días</p>
              <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>{loading ? '—' : fmt(stats?.ventasSemana)} en total</p>
            </div>
          </div>
          {loading ? (
            <div style={{ height: 160, display: 'flex', alignItems: 'flex-end', gap: 8, padding: '0 4px' }}>
              {[...Array(7)].map((_, i) => (
                <div key={i} style={{ flex: 1, height: '40%', background: '#f3f4f6', borderRadius: '4px 4px 0 0' }} />
              ))}
            </div>
          ) : (
            <SalesChart data={stats?.chartData ?? []} />
          )}
          <div style={{ display: 'flex', gap: 16, marginTop: 12, paddingTop: 10, borderTop: '1px solid #f3f4f6' }}>
            {[
              { color: '#6DBE45', label: 'Hoy' },
              { color: '#286c00', label: 'Días anteriores' },
              { color: '#e2e8f0', label: 'Sin ventas' },
            ].map(({ color, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
                <span style={{ fontSize: 11, color: '#9ca3af' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Panel estado */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 20px', flex: 1 }}>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9ca3af', marginBottom: 16 }}>
              Estado de pedidos
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Pendientes',  value: stats?.pendientes  ?? 0, color: '#f59e0b', bg: '#fef3c7' },
                { label: 'Confirmados', value: stats?.confirmados ?? 0, color: '#6DBE45', bg: '#f0fdf4' },
                { label: 'Entregados',  value: stats?.entregados  ?? 0, color: '#286c00', bg: '#dcfce7' },
              ].map(({ label, value, color, bg }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: '#6b7280' }}>{label}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 800, padding: '3px 8px', borderRadius: 6, background: bg, color }}>{loading ? '—' : value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Accesos rápidos */}
          <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: '16px 20px' }}>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9ca3af', marginBottom: 12 }}>
              Accesos rápidos
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { href: '/admin/pedidos',   label: 'Ver pedidos →'      },
                { href: '/admin/productos', label: 'Gestionar productos →' },
                { href: '/',                label: 'Ver tienda →'       },
              ].map(({ href, label }) => (
                <Link key={label} href={href} style={{
                  display: 'block', padding: '8px 12px',
                  border: '1px solid #e5e7eb', borderRadius: 8,
                  fontSize: 12, fontWeight: 500, color: '#555',
                  textDecoration: 'none', textAlign: 'center',
                  transition: 'all 0.15s',
                }}>
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Nav cards + últimos pedidos */}
      <div style={{ display: 'grid', gap: 16 }} className="lg:grid-cols-3-bottom">
        <style>{`@media(min-width:1024px){.lg\\:grid-cols-3-bottom{grid-template-columns:1fr 2fr!important}}`}</style>

        {/* Cards nav */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { label: 'Pedidos',    value: stats?.pedidosTotal ?? 0, icon: ShoppingBag, href: '/admin/pedidos',    color: '#6DBE45' },
            { label: 'Productos',  value: '—',                       icon: Package,     href: '/admin/productos',  color: '#286c00' },
            { label: 'Categorías', value: '—',                       icon: Tag,         href: '/admin/categorias', color: '#1a1c1c' },
          ].map(({ label, value, icon: Icon, href, color }) => (
            <Link key={label} href={href} style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'white', border: '1px solid #e5e7eb', borderRadius: 12,
                padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                transition: 'box-shadow 0.2s',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={15} color="white" />
                  </div>
                  <div>
                    <p style={{ fontSize: 18, fontWeight: 800, color: '#111', margin: 0, lineHeight: 1 }}>{loading ? '—' : value}</p>
                    <p style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '2px 0 0' }}>{label}</p>
                  </div>
                </div>
                <ArrowRight size={14} color="#d1d5db" />
              </div>
            </Link>
          ))}
        </div>

        {/* Últimos pedidos */}
        <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #f3f4f6' }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9ca3af', margin: 0 }}>Últimos pedidos</p>
            <Link href="/admin/pedidos" style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textDecoration: 'none' }}>Ver todos →</Link>
          </div>

          {loading ? (
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[...Array(5)].map((_, i) => <div key={i} style={{ height: 36, background: '#f3f4f6', borderRadius: 8 }} />)}
            </div>
          ) : !stats?.ultimos?.length ? (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <ShoppingBag size={32} color="#e5e7eb" style={{ margin: '0 auto 8px' }} />
              <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>No hay pedidos aún</p>
            </div>
          ) : (
            <div>
              {stats.ultimos.map(p => {
                const est = ESTADOS[p.estado] ?? ESTADOS.PENDIENTE;
                return (
                  <div key={p.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 20px', borderBottom: '1px solid #f9f9f9',
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#111', margin: 0 }}>
                          #{p.id.slice(-6).toUpperCase()}
                        </p>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 9999,
                          background: est.bg, color: est.color, border: `1px solid ${est.border}`,
                        }}>
                          {est.label}
                        </span>
                        {!p.ventaDevhubId && ['CONFIRMADO','ENTREGADO'].includes(p.estado) && (
                          <span style={{ fontSize: 10, color: '#f59e0b', fontWeight: 600 }}>⚠ sin sync</span>
                        )}
                      </div>
                      <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>{p.compradorNombre ?? '—'}</p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#111', margin: 0 }}>{fmt(p.total)}</p>
                      <p style={{ fontSize: 11, color: '#9ca3af', margin: '2px 0 0' }}>
                        {new Date(p.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}