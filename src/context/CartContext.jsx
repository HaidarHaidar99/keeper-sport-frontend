import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('ks_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('ks_cart', JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [items]);

  const addToCart = (product, variant = null, quantity = 1, customKitDetails = null) => {
    setItems((prev) => {
      // Key is composed of product_id + variant_id + custom kit identifier
      const customKey = customKitDetails ? JSON.stringify(customKitDetails) : '';
      const existingIndex = prev.findIndex(
        (item) =>
          item.product_id === product.id &&
          item.variant_id === (variant?.id || null) &&
          item.customKey === customKey
      );

      const effectivePrice = Number(
        variant?.price !== undefined && variant?.price !== null
          ? variant.price
          : product.sale_enabled && product.sale_price !== null
          ? product.sale_price
          : product.base_price
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        const newItem = {
          id: `${product.id}-${variant?.id || 'base'}-${Date.now()}`,
          product_id: product.id,
          variant_id: variant?.id || null,
          size: variant?.size || null,
          name_en: product.name_en,
          name_ar: product.name_ar,
          price: effectivePrice,
          image_url: product.image_url || product.primary_image || (product.images && product.images[0]?.image_url),
          quantity,
          customKitDetails,
          customKey
        };
        return [...prev, newItem];
      }
    });

    setIsCartOpen(true);
  };

  const updateQuantity = (cartItemId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === cartItemId ? { ...item, quantity: newQty } : item))
    );
  };

  const removeFromCart = (cartItemId) => {
    setItems((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalCount,
        subtotal,
        isCartOpen,
        setIsCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        toggleCart: () => setIsCartOpen((prev) => !prev)
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
