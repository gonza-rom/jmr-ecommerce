'use client';
// src/context/ToastContext.js

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ToastContainer } from '@/components/Toast';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback(({ type = 'info', title, desc }) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, type, title, desc }]);
  }, []);

  // Escuchar eventos del CartContext
  useEffect(() => {
    const handler = (e) => toast(e.detail);
    window.addEventListener('jmr-toast', handler);
    return () => window.removeEventListener('jmr-toast', handler);
  }, [toast]);

  const success = useCallback((title, desc) => toast({ type: 'success', title, desc }), [toast]);
  const error   = useCallback((title, desc) => toast({ type: 'error',   title, desc }), [toast]);
  const warning = useCallback((title, desc) => toast({ type: 'warning', title, desc }), [toast]);
  const info    = useCallback((title, desc) => toast({ type: 'info',    title, desc }), [toast]);
  const cart    = useCallback((title, desc) => toast({ type: 'cart',    title, desc }), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info, cart }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast debe usarse dentro de ToastProvider');
  return ctx;
}