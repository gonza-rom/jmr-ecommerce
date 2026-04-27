'use client';
// src/app/auth/reset-password/page.js
// Página a la que llega el usuario desde el link del email de recuperación.
// Supabase añade el token a la URL como fragment (#access_token=...).

import { useState, useEffect, Suspense } from 'react';
import { useRouter }                     from 'next/navigation';
import Link                              from 'next/link';
import { Eye, EyeOff, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { createClient }                  from '@/lib/supabase/client';

// Requisitos de contraseña
const REQUISITOS = [
  { id: 'len',       label: 'Mínimo 8 caracteres',        test: (p) => p.length >= 8 },
  { id: 'mayuscula', label: 'Al menos una mayúscula',      test: (p) => /[A-Z]/.test(p) },
  { id: 'numero',    label: 'Al menos un número',          test: (p) => /[0-9]/.test(p) },
];

function RequisitosPassword({ password }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, margin: '8px 0 0' }}>
      {REQUISITOS.map(({ id, label, test }) => {
        const ok = test(password);
        return (
          <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {ok
              ? <CheckCircle size={13} color="#6DBE45" />
              : <XCircle    size={13} color="#d1d5db" />}
            <span style={{ fontSize: 12, color: ok ? '#15803d' : '#9ca3af', fontWeight: ok ? 600 : 400 }}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// Barra de fortaleza
function FortalezaBarra({ password }) {
  const puntaje = REQUISITOS.filter(r => r.test(password)).length;
  const colores = ['#ef4444', '#f59e0b', '#6DBE45'];
  const labels  = ['Débil', 'Regular', 'Fuerte'];
  const color   = password.length === 0 ? '#e5e7eb' : colores[puntaje - 1] ?? '#e5e7eb';
  const label   = password.length === 0 ? ''         : labels[puntaje - 1]  ?? '';

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: i < puntaje ? color : '#e5e7eb',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>
      {label && (
        <p style={{ fontSize: 11, color, fontWeight: 600, margin: 0 }}>{label}</p>
      )}
    </div>
  );
}

function ResetContent() {
  const router   = useRouter();
  const supabase = createClient();

  const [password,    setPassword]    = useState('');
  const [confirmar,   setConfirmar]   = useState('');
  const [verPass,     setVerPass]     = useState(false);
  const [verConf,     setVerConf]     = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const [exito,       setExito]       = useState(false);
  const [sesionLista, setSesionLista] = useState(false);
  const [verificando, setVerificando] = useState(true);

  // Supabase pone el token en el fragment (#) de la URL.
  // onAuthStateChange lo detecta con el evento PASSWORD_RECOVERY.
  useEffect(() => {
    const supabase = createClient();
    // supabase.auth.signOut({ scope: 'local' }).catch(() => {});
      // Verificar si ya hay sesión activa (caso del F5)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSesionLista(true);
        setVerificando(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'PASSWORD_RECOVERY' && session) {
          setSesionLista(true);
          setVerificando(false);
        } else if (event === 'SIGNED_IN' && session) {
          setSesionLista(true);
          setVerificando(false);
        }
      }
    );

    const timeout = setTimeout(() => setVerificando(false), 6000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!password) { setError('Ingresá una contraseña'); return; }
    if (!REQUISITOS.every(r => r.test(password))) {
      setError('La contraseña no cumple los requisitos'); return;
    }
    if (password !== confirmar) {
      setError('Las contraseñas no coinciden'); return;
    }

    setLoading(true);
    try {
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) { setError(err.message); return; }

      setExito(true);
      // Redirigir a cuenta después de 2 segundos
      setTimeout(() => router.push('/cuenta'), 2000);
    } catch {
      setError('Error al actualizar la contraseña. Intentá de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  // ── Pantalla de verificación ──────────────────────────────────────────────
  if (verificando) {
    return (
      <div style={s.page}>
        <div style={{ ...s.card, textAlign: 'center' }}>
          <Loader2 size={36} style={{ color: '#6DBE45', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>Verificando enlace...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // ── Enlace inválido o expirado ────────────────────────────────────────────
  if (!sesionLista && !verificando) {
    return (
      <div style={s.page}>
        <div style={{ ...s.card, textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#fff5f5', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <XCircle size={24} color="#ef4444" />
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#1a1a1a', margin: '0 0 8px' }}>
            Enlace inválido o expirado
          </h1>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 24px', lineHeight: 1.6 }}>
            El enlace de recuperación ya no es válido. Los links expiran en 1 hora.
            Solicitá uno nuevo desde la pantalla de inicio de sesión.
          </p>
          <Link href="/auth/login" style={s.btnPrimary}>
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    );
  }

  // ── Contraseña actualizada con éxito ──────────────────────────────────────
  if (exito) {
    return (
      <div style={s.page}>
        <div style={{ ...s.card, textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f0fdf4', border: '2px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <CheckCircle size={32} color="#6DBE45" />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#1a1a1a', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            ¡Contraseña actualizada!
          </h1>
          <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 8px' }}>
            Tu contraseña fue cambiada correctamente.
          </p>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>
            Redirigiendo a tu cuenta...
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // ── Formulario principal ──────────────────────────────────────────────────
  return (
    <div style={s.page}>
      <div style={s.card}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <p style={{ fontSize: 20, fontWeight: 900, letterSpacing: '0.15em', color: '#1a1a1a', margin: 0, textTransform: 'uppercase' }}>
              Marroquinería JMR
            </p>
            <p style={{ fontSize: 10, color: '#888', letterSpacing: '0.2em', margin: '3px 0 0', textTransform: 'uppercase' }}>
              Cueros · Carteras · Accesorios
            </p>
          </Link>
        </div>

        <h1 style={{ fontSize: 20, fontWeight: 800, color: '#1a1a1a', margin: '0 0 4px', letterSpacing: '-0.02em', textAlign: 'center' }}>
          Nueva contraseña
        </h1>
        <p style={{ fontSize: 13, color: '#888', margin: '0 0 24px', textAlign: 'center' }}>
          Elegí una contraseña segura para tu cuenta
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Password */}
          <div>
            <label style={s.label}>Nueva contraseña</label>
            <div style={{ position: 'relative' }}>
              <input
                type={verPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
                style={{ ...s.input, paddingRight: 40 }}
              />
              <button type="button" onClick={() => setVerPass(!verPass)} style={s.eyeBtn}>
                {verPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {password.length > 0 && (
              <>
                <FortalezaBarra password={password} />
                <RequisitosPassword password={password} />
              </>
            )}
          </div>

          {/* Confirmar */}
          <div>
            <label style={s.label}>Confirmar contraseña</label>
            <div style={{ position: 'relative' }}>
              <input
                type={verConf ? 'text' : 'password'}
                value={confirmar}
                onChange={e => setConfirmar(e.target.value)}
                placeholder="Repetí la contraseña"
                autoComplete="new-password"
                style={{
                  ...s.input,
                  paddingRight: 40,
                  borderColor: confirmar && confirmar !== password ? '#fca5a5' : '#e0dbd5',
                }}
              />
              <button type="button" onClick={() => setVerConf(!verConf)} style={s.eyeBtn}>
                {verConf ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {confirmar && confirmar !== password && (
              <p style={{ fontSize: 11, color: '#ef4444', margin: '4px 0 0' }}>
                Las contraseñas no coinciden
              </p>
            )}
          </div>

          {error && (
            <div style={{ background: '#fff5f5', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 12px' }}>
              <p style={{ fontSize: 13, color: '#dc2626', margin: 0 }}>{error}</p>
            </div>
          )}

          <button type="submit" disabled={loading} style={s.btnSubmit}>
            {loading
              ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Actualizando...</>
              : 'Actualizar contraseña'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Link href="/auth/login" style={{ fontSize: 12, color: '#bbb', textDecoration: 'none' }}>
            ← Volver al inicio de sesión
          </Link>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const s = {
  page:     { minHeight: '100vh', background: '#f5f4f0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 },
  card:     { background: '#fff', borderRadius: 16, border: '1px solid #e8e5e0', padding: '36px 32px', width: '100%', maxWidth: 400, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' },
  label:    { display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 5 },
  input:    { width: '100%', padding: '10px 12px', border: '1px solid #e0dbd5', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', color: '#1a1a1a', background: '#fff' },
  eyeBtn:   { position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', padding: 0 },
  btnPrimary: { display: 'block', width: '100%', padding: '12px', border: 'none', borderRadius: 8, background: '#2d6a4f', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box' },
  btnSubmit:  { width: '100%', padding: '12px', border: 'none', borderRadius: 8, background: '#2d6a4f', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 },
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetContent />
    </Suspense>
  );
}