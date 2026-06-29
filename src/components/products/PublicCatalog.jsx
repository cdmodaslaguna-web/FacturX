import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../supabaseClient';
import { useProducts } from '../../hooks/useProducts';
import { useAuth } from '../../contexts/AuthContext';
import log2 from '../../assets/logos/log2.png';

// Hero Images
import hero1 from '../../assets/hero/1.png';
import hero2 from '../../assets/hero/2.png';
import hero3 from '../../assets/hero/3.png';
import hero5 from '../../assets/hero/5.png';

const heroImages = [hero1, hero2, hero3, hero5];

export default function PublicCatalog() {
  const { products, loading } = useProducts();
  const { isAuthenticated } = useAuth();
  
  // Cart state is now an array of items to support multiple sizes for same product
  const [cart, setCart] = useState([]);
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', embroideryName: '', bloodType: '', clubName: '' });
  const [orderSentSuccess, setOrderSentSuccess] = useState(false);
  const [currentHeroImage, setCurrentHeroImage] = useState(0);

  // Product Modal State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalSizes, setModalSizes] = useState({ shirtSize: '', pantsSize: '' });
  const [modalQty, setModalQty] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroImage(prev => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedProduct || isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedProduct, isCartOpen]);

  const businessWhatsAppNumber = "1234567890"; 

  const needsPantsSize = (product) => {
    if (!product) return false;
    const name = product.name.toLowerCase();
    if (name.includes('uniforme')) return true;
    const bottoms = ['pantalon', 'pantalón', 'falda', 'sudadera', 'short', 'pantaloneta'];
    return bottoms.some(k => name.includes(k));
  };

  const needsShirtSize = (product) => {
    if (!product) return false;
    const name = product.name.toLowerCase();
    if (name.includes('uniforme')) return true;
    const tops = ['camisa', 'chaqueta', 'buzo', 'polo', 'sueter', 'suéter', 'camiseta', 'chaleco'];
    if (tops.some(k => name.includes(k))) return true;
    
    // Si tiene tallas en variante y no es pantalón, usar este selector como genérico
    if (product.variant && (product.variant.includes('S') || product.variant.includes('M') || product.variant.includes('L') || product.variant.includes('Talla')) && !needsPantsSize(product)) return true;
    return false;
  };

  const getProductSizes = (product) => {
    if (!product || !product.variant) return null;
    const parts = product.variant.split(',').map(s => s.trim()).filter(Boolean);
    if (parts.length > 1) return parts; // Si hay comas, asumimos que son las tallas disponibles
    return null;
  };

  const defaultShirtSizes = ["4", "6", "8", "10", "12", "14", "16", "XS", "S", "M", "L", "XL", "XXL"];
  const defaultPantsSizes = ["4", "6", "8", "10", "12", "14", "16", "26", "28", "30", "32", "34", "36", "38", "40", "42", "S", "M", "L", "XL"];

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setModalSizes({ shirtSize: '', pantsSize: '' });
    setModalQty(1);
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
  };

  const addToCartFromModal = () => {
    if (!selectedProduct) return;
    
    const reqShirt = needsShirtSize(selectedProduct);
    const reqPants = needsPantsSize(selectedProduct);
    
    if (reqShirt && reqPants && (!modalSizes.shirtSize || !modalSizes.pantsSize)) {
      alert("Por favor selecciona la talla de camisa y pantalón.");
      return;
    }
    if (reqShirt && !reqPants && !modalSizes.shirtSize) {
      alert("Por favor selecciona la talla.");
      return;
    }
    if (reqPants && !reqShirt && !modalSizes.pantsSize) {
      alert("Por favor selecciona la talla.");
      return;
    }

    const existingIndex = cart.findIndex(item => 
      item.product.id === selectedProduct.id && 
      item.shirtSize === modalSizes.shirtSize && 
      item.pantsSize === modalSizes.pantsSize
    );

    if (existingIndex >= 0) {
      const newCart = [...cart];
      newCart[existingIndex].qty += modalQty;
      setCart(newCart);
    } else {
      setCart([...cart, {
        cartItemId: Date.now().toString(36),
        product: selectedProduct,
        qty: modalQty,
        shirtSize: modalSizes.shirtSize,
        pantsSize: modalSizes.pantsSize
      }]);
    }
    
    closeProductModal();
  };

  const handleRemoveItem = (cartItemId) => {
    setCart(cart.filter(item => item.cartItemId !== cartItemId));
  };

  const handleUpdateQty = (cartItemId, delta) => {
    setCart(cart.map(item => {
      if (item.cartItemId === cartItemId) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : item;
      }
      return item;
    }));
  };

  const getProductQtyInCart = (productId) => {
    return cart.filter(item => item.product.id === productId).reduce((sum, item) => sum + item.qty, 0);
  };

  const cartTotalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartTotalPrice = cart.reduce((sum, item) => sum + (item.product.price * item.qty), 0);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(price);
  };

  const needsCustomData = cart.some(item => {
    const nameLower = item.product.name.toLowerCase();
    return item.product.category === 'INS' || nameLower.includes('nombre') || nameLower.includes('medialuna') || nameLower.includes('media luna') || nameLower.includes('insignia');
  });

  const needsClubName = cart.some(item => {
    const nameLower = item.product.name.toLowerCase();
    return nameLower.includes('medialuna') || nameLower.includes('media luna');
  });

  const handleCheckout = async () => {
    if (cartTotalItems === 0) return;

    const items = cart.map(item => ({
      id: item.product.id,
      name: item.product.name,
      qty: item.qty,
      price: item.product.price,
      shirtSize: item.shirtSize,
      pantsSize: item.pantsSize
    }));

    let finalCustomerName = customerInfo.name;
    if (needsCustomData) {
      finalCustomerName += ` (Bordado: ${customerInfo.embroideryName}, RH: ${customerInfo.bloodType}`;
      if (needsClubName) {
        finalCustomerName += `, Club: ${customerInfo.clubName}`;
      }
      finalCustomerName += `)`;
    }

    const orderData = {
      id: 'ord-' + Date.now().toString(36),
      total: cartTotalPrice,
      items: items,
      customer_name: finalCustomerName,
      customer_phone: customerInfo.phone,
      status: 'pending'
    };

    try {
      const { error } = await supabase.from('orders').insert([orderData]);
      if (error) throw error;
      setOrderSentSuccess(true);
    } catch (e) {
      console.error('Error saving order', e);
      alert('Hubo un error enviando el pedido. Por favor verifica tu conexión y vuelve a intentar.');
    }
  };

  const sendToWhatsApp = () => {
    let text = `*¡Hola! Me gustaría hacer un pedido del catálogo:*%0A%0A`;
    cart.forEach(item => {
      let line = `- ${item.qty}x ${item.product.name}`;
      if (item.product.variant) line += ` (${item.product.variant})`;
      if (item.shirtSize) line += ` [Camisa: ${item.shirtSize}]`;
      if (item.pantsSize) line += ` [Pantalón: ${item.pantsSize}]`;
      line += ` - ${formatPrice(item.product.price * item.qty)}%0A`;
      text += line;
    });
    
    text += `%0A*Total Estimado: ${formatPrice(cartTotalPrice)}*%0A%0A`;
    if (needsCustomData) {
      text += `*Datos para Bordado:*%0A- Nombre a bordar: ${customerInfo.embroideryName}%0A- RH: ${customerInfo.bloodType}%0A`;
      if (needsClubName) {
        text += `- Club: ${customerInfo.clubName}%0A`;
      }
      text += `%0A`;
    }
    text += `*Aviso:* Pasaré a recoger el pedido en el negocio (Sin domicilio).%0A%0A`;
    text += `Quedo atento(a) para confirmar la prefactura. Mi nombre es ${customerInfo.name}.`;

    window.open(`https://wa.me/${businessWhatsAppNumber}?text=${text}`, '_blank');
    closeCart();
  };

  const closeCart = () => {
    setIsCartOpen(false);
    setTimeout(() => {
      if (orderSentSuccess) {
        setCart([]);
        setCustomerInfo({ name: '', phone: '', embroideryName: '', bloodType: '', clubName: '' });
        setOrderSentSuccess(false);
      }
    }, 300);
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f5f5f7' }}>Cargando catálogo...</div>;
  }

  return (
    <div className="public-catalog-wrapper" style={{ background: '#f5f5f7', minHeight: '100vh', paddingBottom: '100px' }}>
      
      {/* Header del Catálogo */}
      <header style={{ background: '#fff', padding: '15px 20px', display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <div></div>
        <img src={log2} alt="Logo" style={{ height: '40px', objectFit: 'contain', margin: '0 auto' }} />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <a href={isAuthenticated ? "/admin" : "/login"} style={{ textDecoration: 'none', color: '#184a2c', background: '#e8efe9', padding: '8px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
            <span style={{ display: 'none', '@media(min-width: 600px)': { display: 'inline' } }}>{isAuthenticated ? 'Panel de Control' : 'Acceso'}</span>
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <div style={{ position: 'relative', width: '100%', height: '400px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <AnimatePresence mode="wait">
          <motion.img 
            key={currentHeroImage}
            src={heroImages[currentHeroImage]}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover' }}
            alt="Hero Background"
          />
        </AnimatePresence>
        
        {/* Overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(24,74,44,0.9), rgba(24,74,44,0.3))' }}></div>
        
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', color: '#fff', padding: '0 20px', maxWidth: '800px' }}>
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{ margin: 0, fontSize: '3rem', fontWeight: '800', textShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
          >
            Nuestro Catálogo
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{ fontSize: '1.2rem', marginTop: '16px', textShadow: '0 2px 8px rgba(0,0,0,0.3)', opacity: 0.9 }}
          >
            Selecciona los productos que deseas y haz tu pedido directamente por WhatsApp.
          </motion.p>
        </div>
      </div>

      <div style={{ padding: '30px 20px 10px', textAlign: 'center' }}>
        <h2 style={{ margin: 0, color: '#184a2c', fontSize: '1.4rem', fontWeight: 'bold' }}>Categorías Disponibles</h2>
      </div>

      {/* Grilla de Productos */}
      <div style={{ padding: '0 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '15px', maxWidth: '1200px', margin: '0 auto' }}>
        {products.map((p, index) => {
          const qty = getProductQtyInCart(p.id);
          return (
            <motion.div 
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => openProductModal(p)}
              style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
            >
              <div style={{ height: '160px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                {p.photoUrl ? (
                  <img src={p.photoUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                )}
                {qty > 0 && (
                  <div style={{ position: 'absolute', top: '10px', right: '10px', background: '#ef4444', color: '#fff', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.9rem', boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)' }}>
                    {qty}
                  </div>
                )}
              </div>
              <div style={{ padding: '15px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: '#1e293b' }}>{p.name}</h3>
                <div style={{ fontWeight: 'bold', color: '#184a2c', fontSize: '1.1rem', marginTop: 'auto', marginBottom: '12px' }}>
                  {formatPrice(p.price)}
                </div>
                
                <button 
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #184a2c', background: qty > 0 ? '#184a2c' : 'transparent', color: qty > 0 ? '#fff' : '#184a2c', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  {qty > 0 ? `En tu carrito (${qty})` : 'Ver Detalles'}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Floating Cart Button */}
      <AnimatePresence>
        {cartTotalItems > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            style={{ position: 'fixed', bottom: '20px', left: '20px', right: '20px', zIndex: 50 }}
          >
            <button 
              onClick={() => setIsCartOpen(true)}
              style={{ width: '100%', maxWidth: '400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', background: '#184a2c', color: '#fff', border: 'none', borderRadius: '24px', boxShadow: '0 8px 20px rgba(24, 74, 44, 0.4)', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '20px', fontWeight: 'bold' }}>{cartTotalItems} items</div>
                <span style={{ fontWeight: 'bold' }}>Ver Pedido</span>
              </div>
              <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{formatPrice(cartTotalPrice)}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Modal */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeCart}
              style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 90 }}
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{ position: 'fixed', top: 0, bottom: 0, right: 0, width: '100%', maxWidth: '400px', background: '#fff', zIndex: 100, padding: '24px', display: 'flex', flexDirection: 'column', overflowY: 'auto', boxShadow: '-5px 0 25px rgba(0,0,0,0.1)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#1e293b' }}>{orderSentSuccess ? '¡Pedido Exitoso!' : 'Tu Pedido'}</h2>
                <button onClick={closeCart} style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}>&times;</button>
              </div>

              {orderSentSuccess ? (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{ width: '80px', height: '80px', background: '#e0f2fe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <h3 style={{ margin: '0 0 10px 0', color: '#1e293b', fontSize: '1.3rem' }}>Hemos recibido tu pedido</h3>
                  <p style={{ color: '#64748b', marginBottom: '30px', lineHeight: '1.5' }}>Tu solicitud ya fue registrada en nuestro sistema y la estamos procesando.</p>
                  
                  <p style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '15px' }}>¿Deseas notificarnos también por WhatsApp para agilizar?</p>
                  <button 
                    onClick={sendToWhatsApp}
                    style={{ width: '100%', padding: '16px', background: '#25D366', color: '#fff', border: 'none', borderRadius: '16px', fontSize: '1.1rem', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(37, 211, 102, 0.4)' }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    Sí, enviar por WhatsApp
                  </button>
                  <button 
                    onClick={closeCart}
                    style={{ width: '100%', padding: '16px', background: 'transparent', color: '#64748b', border: 'none', borderRadius: '16px', fontSize: '1rem', fontWeight: 'bold', marginTop: '10px', cursor: 'pointer' }}
                  >
                    No, terminar
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ flex: 1, overflowY: 'auto', marginBottom: '20px' }}>
                {cart.map((item) => (
                    <div key={item.cartItemId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ flex: 1, paddingRight: '10px' }}>
                        <h4 style={{ margin: '0 0 4px 0', color: '#1e293b' }}>{item.product.name}</h4>
                        
                        {(item.shirtSize || item.pantsSize) && (
                          <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>
                            {item.shirtSize && <span>Camisa: <strong>{item.shirtSize}</strong> </span>}
                            {item.pantsSize && <span>Pantalón: <strong>{item.pantsSize}</strong></span>}
                          </div>
                        )}
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                          <button onClick={() => handleUpdateQty(item.cartItemId, -1)} style={{ width: '24px', height: '24px', border: '1px solid #e2e8f0', background: '#fff', borderRadius: '4px', cursor: 'pointer' }}>-</button>
                          <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{item.qty}</span>
                          <button onClick={() => handleUpdateQty(item.cartItemId, 1)} style={{ width: '24px', height: '24px', border: '1px solid #e2e8f0', background: '#fff', borderRadius: '4px', cursor: 'pointer' }}>+</button>
                          <button onClick={() => handleRemoveItem(item.cartItemId)} style={{ marginLeft: '10px', background: 'transparent', border: 'none', color: '#ef4444', fontSize: '0.8rem', cursor: 'pointer' }}>Eliminar</button>
                        </div>
                      </div>
                      <div style={{ fontWeight: 'bold', color: '#184a2c', textAlign: 'right' }}>
                        {formatPrice(item.product.price * item.qty)}
                      </div>
                    </div>
                  ))}
              </div>

              <div style={{ padding: '0 0 16px 0' }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#64748b', fontWeight: 'bold' }}>Tus Datos</p>
                <input 
                  type="text" 
                  placeholder="Nombre completo" 
                  value={customerInfo.name} 
                  onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} 
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '10px', background: '#f8fafc', outline: 'none' }} 
                />
                <input 
                  type="tel" 
                  placeholder="Teléfono / WhatsApp" 
                  value={customerInfo.phone} 
                  onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} 
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: needsCustomData ? '10px' : '0', background: '#f8fafc', outline: 'none' }} 
                />
                
                {needsCustomData && (
                  <div style={{ padding: '12px', background: '#e0e7ff', borderRadius: '12px', marginTop: '10px', border: '1px solid #c7d2fe' }}>
                    <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: '#3730a3', fontWeight: 'bold' }}>Datos para insignias personalizadas:</p>
                    <input 
                      type="text" 
                      placeholder="Nombre a bordar" 
                      value={customerInfo.embroideryName} 
                      onChange={e => setCustomerInfo({...customerInfo, embroideryName: e.target.value})} 
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #a5b4fc', marginBottom: '8px', outline: 'none' }} 
                    />
                    <input 
                      type="text" 
                      placeholder="Tipo de Sangre (RH)" 
                      value={customerInfo.bloodType} 
                      onChange={e => setCustomerInfo({...customerInfo, bloodType: e.target.value})} 
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #a5b4fc', marginBottom: needsClubName ? '8px' : '0', outline: 'none' }} 
                    />
                    {needsClubName && (
                      <input 
                        type="text" 
                        placeholder="Nombre del Club (para Medialunas)" 
                        value={customerInfo.clubName} 
                        onChange={e => setCustomerInfo({...customerInfo, clubName: e.target.value})} 
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #a5b4fc', outline: 'none' }} 
                      />
                    )}
                  </div>
                )}
              </div>

              <div style={{ background: '#fef3c7', padding: '12px', borderRadius: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" style={{ flexShrink: 0 }}>
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                <span style={{ fontSize: '0.85rem', color: '#92400e', lineHeight: '1.4' }}>
                  <strong>Aviso:</strong> No realizamos entregas a domicilio. Los pedidos deben ser recogidos en la dirección del negocio.
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderTop: '2px solid #f1f5f9', marginBottom: '20px' }}>
                <span style={{ fontSize: '1.1rem', color: '#64748b', fontWeight: 'bold' }}>Total</span>
                <span style={{ fontSize: '1.4rem', color: '#184a2c', fontWeight: 'bold' }}>{formatPrice(cartTotalPrice)}</span>
              </div>

              {(() => {
                const isCustomDataValid = !needsCustomData || (customerInfo.embroideryName && customerInfo.bloodType && (!needsClubName || customerInfo.clubName));
                const isFormValid = customerInfo.name && customerInfo.phone && isCustomDataValid;

                return (
                  <button 
                    onClick={handleCheckout}
                    disabled={!isFormValid}
                    style={{ width: '100%', padding: '16px', background: !isFormValid ? '#94a3b8' : '#184a2c', color: '#fff', border: 'none', borderRadius: '16px', fontSize: '1.1rem', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', cursor: !isFormValid ? 'not-allowed' : 'pointer', boxShadow: !isFormValid ? 'none' : '0 4px 15px rgba(24, 74, 44, 0.4)' }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    Enviar Pedido al Negocio
                  </button>
                );
              })()}
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeProductModal}
              style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 110, backdropFilter: 'blur(4px)' }}
            />
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                style={{ background: '#fff', borderRadius: '24px', width: '90%', maxWidth: '450px', maxHeight: '90vh', overflowY: 'auto', pointerEvents: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
              >
                <div style={{ position: 'relative', height: '250px', background: '#f1f5f9' }}>
                  {selectedProduct.photoUrl ? (
                    <img src={selectedProduct.photoUrl} alt={selectedProduct.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                    </div>
                  )}
                  <button onClick={closeProductModal} style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(255,255,255,0.8)', border: 'none', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1.2rem', color: '#1e293b', backdropFilter: 'blur(4px)' }}>&times;</button>
                </div>

                <div style={{ padding: '24px' }}>
                  <h2 style={{ margin: '0 0 8px 0', fontSize: '1.5rem', color: '#1e293b' }}>{selectedProduct.name}</h2>
                  
                  {selectedProduct.description && (
                    <p style={{ margin: '0 0 20px 0', color: '#64748b', lineHeight: '1.5' }}>{selectedProduct.description}</p>
                  )}

                  <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#184a2c', marginBottom: '24px' }}>
                    {formatPrice(selectedProduct.price)}
                  </div>

                  {(needsShirtSize(selectedProduct) || needsPantsSize(selectedProduct)) && (
                    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
                      <h4 style={{ margin: '0 0 12px 0', color: '#1e293b' }}>Selecciona tu talla</h4>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {needsShirtSize(selectedProduct) && (
                          <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', color: '#64748b', marginBottom: '10px', fontWeight: 'bold' }}>
                              {needsPantsSize(selectedProduct) ? 'Camisa/Blusa' : 'Talla'}
                            </label>
                            <div className="notranslate" translate="no" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                              {(getProductSizes(selectedProduct) || defaultShirtSizes).map(s => (
                                <button
                                  key={s}
                                  onClick={() => setModalSizes({...modalSizes, shirtSize: s})}
                                  style={{
                                    padding: '8px 14px',
                                    borderRadius: '8px',
                                    border: modalSizes.shirtSize === s ? '2px solid #184a2c' : '1px solid #cbd5e1',
                                    background: modalSizes.shirtSize === s ? '#e8efe9' : '#fff',
                                    color: modalSizes.shirtSize === s ? '#184a2c' : '#475569',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    outline: 'none'
                                  }}
                                >
                                  {s}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        {needsPantsSize(selectedProduct) && (
                          <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', color: '#64748b', marginBottom: '10px', fontWeight: 'bold' }}>
                              {needsShirtSize(selectedProduct) ? 'Pantalón/Falda' : 'Talla'}
                            </label>
                            <div className="notranslate" translate="no" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                              {(getProductSizes(selectedProduct) || defaultPantsSizes).map(s => (
                                <button
                                  key={s}
                                  onClick={() => setModalSizes({...modalSizes, pantsSize: s})}
                                  style={{
                                    padding: '8px 14px',
                                    borderRadius: '8px',
                                    border: modalSizes.pantsSize === s ? '2px solid #184a2c' : '1px solid #cbd5e1',
                                    background: modalSizes.pantsSize === s ? '#e8efe9' : '#fff',
                                    color: modalSizes.pantsSize === s ? '#184a2c' : '#475569',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    outline: 'none'
                                  }}
                                >
                                  {s}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {(() => {
                    const reqShirt = needsShirtSize(selectedProduct);
                    const reqPants = needsPantsSize(selectedProduct);
                    const isSizeValid = (!reqShirt || modalSizes.shirtSize) && (!reqPants || modalSizes.pantsSize);

                    return (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', borderRadius: '12px', padding: '4px' }}>
                          <button onClick={() => setModalQty(Math.max(1, modalQty - 1))} style={{ width: '40px', height: '40px', border: 'none', background: '#fff', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.2rem', color: '#64748b' }}>-</button>
                          <span style={{ width: '40px', textAlign: 'center', fontWeight: 'bold', fontSize: '1.1rem' }}>{modalQty}</span>
                          <button onClick={() => setModalQty(modalQty + 1)} style={{ width: '40px', height: '40px', border: 'none', background: '#fff', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.2rem', color: '#10b981' }}>+</button>
                        </div>
                        
                        <button 
                          onClick={addToCartFromModal}
                          disabled={!isSizeValid}
                          style={{ 
                            flex: 1, 
                            padding: '16px', 
                            background: isSizeValid ? '#184a2c' : '#94a3b8', 
                            color: '#fff', 
                            border: 'none', 
                            borderRadius: '12px', 
                            fontSize: '1.1rem', 
                            fontWeight: 'bold', 
                            cursor: isSizeValid ? 'pointer' : 'not-allowed', 
                            boxShadow: isSizeValid ? '0 4px 12px rgba(24, 74, 44, 0.3)' : 'none',
                            transition: 'all 0.2s'
                          }}
                        >
                          Añadir {(modalQty > 1) ? `(${modalQty})` : ''}
                        </button>
                      </div>
                    );
                  })()}

                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
