import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('facturx_cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('facturx_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCartOpen]);

  const addToCart = (product, qty, sizes = { shirtSize: '', pantsSize: '', customDetails: [] }) => {
    const hasCustomDetails = sizes.customDetails && sizes.customDetails.length > 0;
    
    // Si tiene detalles personalizados, NO lo agrupamos, lo añadimos como ítem nuevo
    const existingIndex = hasCustomDetails ? -1 : cart.findIndex(item => 
      item.product.id === product.id && 
      item.shirtSize === sizes.shirtSize && 
      item.pantsSize === sizes.pantsSize
    );

    if (existingIndex >= 0) {
      const newCart = [...cart];
      newCart[existingIndex].qty += qty;
      setCart(newCart);
    } else {
      setCart([...cart, {
        cartItemId: Date.now().toString(36),
        product: product,
        qty: qty,
        shirtSize: sizes.shirtSize,
        pantsSize: sizes.pantsSize,
        customDetails: sizes.customDetails || []
      }]);
    }
  };

  const removeFromCart = (cartItemId) => {
    setCart(cart.filter(item => item.cartItemId !== cartItemId));
  };

  const updateQty = (cartItemId, delta) => {
    setCart(cart.map(item => {
      if (item.cartItemId === cartItemId) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : item;
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartTotalPrice = cart.reduce((sum, item) => sum + (item.product.price * item.qty), 0);

  const getProductQtyInCart = (productId) => {
    return cart.filter(item => item.product.id === productId).reduce((sum, item) => sum + item.qty, 0);
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQty,
      clearCart,
      cartTotalItems,
      cartTotalPrice,
      getProductQtyInCart,
      isCartOpen,
      setIsCartOpen
    }}>
      {children}
    </CartContext.Provider>
  );
};
