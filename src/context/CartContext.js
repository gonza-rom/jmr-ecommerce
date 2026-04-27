'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

// Helper para disparar toasts sin depender del contexto
function dispatchToast(type, title, desc) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('jmr-toast', {
    detail: { type, title, desc }
  }));
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('jmr-cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('jmr-cart', JSON.stringify(cart));
    } else {
      localStorage.removeItem('jmr-cart');
    }
  }, [cart]);

  const addToCart = (producto, cantidad = 1) => {
    const existente = cart.find(item => item.id === producto.id);

    if (existente) {
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        )
      );
      dispatchToast('cart', producto.nombre, 'Cantidad actualizada');
    } else {
      setCart(prevCart => [...prevCart, { ...producto, cantidad }]);
      dispatchToast('cart', producto.nombre, 'Agregado al carrito');
    }
  };

  const removeFromCart = (productoId) => {
    const producto = cart.find(item => item.id === productoId);
    if (producto) {
      dispatchToast('warning', producto.nombre, 'Eliminado del carrito');
    }
    setCart(prevCart => prevCart.filter(item => item.id !== productoId));
  };

  const updateQuantity = (productoId, cantidad) => {
    if (cantidad <= 0) {
      removeFromCart(productoId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productoId ? { ...item, cantidad } : item
      )
    );
  };

  const clearCart = () => {
    if (cart.length > 0) {
      dispatchToast('warning', 'Carrito vaciado', 'Se eliminaron todos los productos');
    }
    setCart([]);
    localStorage.removeItem('jmr-cart');
  };

  const getTotal    = () => cart.reduce((total, item) => total + item.precio * item.cantidad, 0);
  const getItemCount = () => cart.reduce((count, item) => count + item.cantidad, 0);
  const toggleCart  = () => setIsOpen(prev => !prev);

  return (
    <CartContext.Provider value={{
      cart, isOpen, addToCart, removeFromCart,
      updateQuantity, clearCart, getTotal,
      getItemCount, toggleCart, setIsOpen,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart debe usarse dentro de CartProvider');
  return context;
}