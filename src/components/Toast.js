'use client';
// src/components/Toast.js

import { useEffect, useRef } from 'react';

const ICONS = {
  success: (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="#6DBE45" strokeWidth="2" strokeLinecap="round">
      <path d="M2 6l3 3 5-5"/>
    </svg>
  ),
  error: (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round">
      <path d="M2 2l8 8M10 2l-8 8"/>
    </svg>
  ),
  warning: (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round">
      <path d="M6 2v5M6 9.5v.5"/>
    </svg>
  ),
  info: (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round">
      <path d="M6 5v4M6 2.5v.5"/>
    </svg>
  ),
  cart: (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="#6DBE45" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 1h2l1.5 6h5l1-4H3.5"/>
      <circle cx="5.5" cy="10" r="0.8" fill="#6DBE45" stroke="none"/>
      <circle cx="9"   cy="10" r="0.8" fill="#6DBE45" stroke="none"/>
    </svg>
  ),
};

const COLORS = {
  success: { icon: '#f0fdf4', bar: '#6DBE45' },
  error:   { icon: '#fff5f5', bar: '#ef4444' },
  warning: { icon: '#fef3c7', bar: '#f59e0b' },
  info:    { icon: '#eff6ff', bar: '#3b82f6' },
  cart:    { icon: '#1a1c1c', bar: '#6DBE45' },
};

const DURATION = 3500;

export function ToastItem({ toast, onRemove }) {
  const ref = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (ref.current) ref.current.classList.add('jmr-toast-removing');
      setTimeout(() => onRemove(toast.id), 220);
    }, DURATION);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  function handleClose() {
    if (ref.current) ref.current.classList.add('jmr-toast-removing');
    setTimeout(() => onRemove(toast.id), 220);
  }

  const colors = COLORS[toast.type] ?? COLORS.info;

  return (
    <div ref={ref} className="jmr-toast" role="alert">
      <div className="jmr-toast-icon" style={{ background: colors.icon }}>
        {ICONS[toast.type] ?? ICONS.info}
      </div>
      <div className="jmr-toast-body">
        <div className="jmr-toast-title">{toast.title}</div>
        {toast.desc && <div className="jmr-toast-desc">{toast.desc}</div>}
      </div>
      <button className="jmr-toast-close" onClick={handleClose} aria-label="Cerrar">×</button>
      <div className="jmr-toast-progress" style={{ background: colors.bar, animationDuration: `${DURATION}ms` }} />
    </div>
  );
}

export function ToastContainer({ toasts, onRemove }) {
  return (
    <>
      <style>{`
        .jmr-toast-container {
          position: fixed;
          top: 24px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;          
          flex-direction: column;
          gap: 8px;
          z-index: 9999;
          pointer-events: none;
          width: 320px;
        }
        @media (max-width: 400px) {
          .jmr-toast-container {
            left: 12px;
            right: 12px;
            width: auto;
            bottom: 16px;
          }
        }
        .jmr-toast {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px 14px;
          border-radius: 10px;
          background: white;
          border: 1px solid #e5e7eb;
          box-shadow: 0 4px 16px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04);
          pointer-events: all;
          position: relative;
          overflow: hidden;
          animation: jmrToastIn 0.28s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .jmr-toast.jmr-toast-removing {
          animation: jmrToastOut 0.22s ease-in forwards;
        }
        @keyframes jmrToastIn {
        from { opacity: 0; transform: translateY(-12px) scale(0.96); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes jmrToastOut {
        from { opacity: 1; transform: translateY(0) scale(1); max-height: 120px; }
        to   { opacity: 0; transform: translateY(-12px) scale(0.96); max-height: 0; padding: 0; margin: 0; border: none; }
        }
        .jmr-toast-icon {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 1px;
        }
        .jmr-toast-body { flex: 1; min-width: 0; }
        .jmr-toast-title {
          font-size: 13px;
          font-weight: 700;
          color: #111;
          line-height: 1.3;
          font-family: 'Inter', Arial, sans-serif;
        }
        .jmr-toast-desc {
          font-size: 12px;
          color: #6b7280;
          line-height: 1.4;
          margin-top: 1px;
          font-family: 'Inter', Arial, sans-serif;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .jmr-toast-close {
          background: none;
          border: none;
          cursor: pointer;
          color: #d1d5db;
          padding: 0;
          font-size: 18px;
          line-height: 1;
          flex-shrink: 0;
          margin-top: -2px;
          transition: color 0.15s;
          font-family: Arial, sans-serif;
        }
        .jmr-toast-close:hover { color: #6b7280; }
        .jmr-toast-progress {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 2px;
          border-radius: 0 0 10px 10px;
          animation: jmrToastProgress linear forwards;
        }
        @keyframes jmrToastProgress {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>

      <div className="jmr-toast-container">
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onRemove={onRemove} />
        ))}
      </div>
    </>
  );
}