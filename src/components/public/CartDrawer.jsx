import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../contexts/CartContext';

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(price);
};

export default function CartDrawer() {
  const { cart, removeFromCart, updateQty, clearCart, cartTotalPrice, isCartOpen, setIsCartOpen } = useCart();
  
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '' });
  const [orderSentSuccess, setOrderSentSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const businessWhatsAppNumber = "1234567890"; // Reemplazar en config

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);

    const items = cart.map(item => ({
      id: item.product.id,
      name: item.product.name,
      qty: item.qty,
      price: item.product.price,
      shirtSize: item.shirtSize,
      pantsSize: item.pantsSize,
      customDetails: item.customDetails // Guardado para la DB
    }));

    const orderData = {
      id: 'ord-' + Date.now().toString(36),
      total: cartTotalPrice,
      items: items,
      customer_name: customerInfo.name,
      customer_phone: customerInfo.phone,
      status: 'pending'
    };

    try {
      const response = await fetch('http://localhost:3000/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      if (!response.ok) throw new Error('Error de red');
      setOrderSentSuccess(true);
    } catch (e) {
      console.error('Error saving order', e);
      alert('Hubo un error enviando el pedido. Por favor verifica tu conexión y vuelve a intentar.');
    } finally {
      setIsSubmitting(false);
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
      
      if (item.customDetails && item.customDetails.length > 0) {
        item.customDetails.forEach((detail, i) => {
          let detailStr = `  └ ${i + 1}. `;
          if (detail.name) detailStr += `Nombre: ${detail.name} `;
          if (detail.rh) detailStr += `(RH: ${detail.rh}) `;
          if (detail.club) detailStr += `[Club: ${detail.club}]`;
          line += `${detailStr}%0A`;
        });
      }
      text += line;
    });
    
    text += `%0A*Total Estimado: ${formatPrice(cartTotalPrice)}*%0A%0A`;
    text += `*Aviso:* Pasaré a recoger el pedido en el negocio (Sin domicilio).%0A%0A`;
    text += `Quedo atento(a) para confirmar la prefactura. Mi nombre es ${customerInfo.name}.`;

    window.open(`https://wa.me/${businessWhatsAppNumber}?text=${text}`, '_blank');
    handleClose();
  };

  const handleClose = () => {
    setIsCartOpen(false);
    setTimeout(() => {
      if (orderSentSuccess) {
        clearCart();
        setCustomerInfo({ name: '', phone: '' });
        setOrderSentSuccess(false);
      }
    }, 300);
  };

  if (!isCartOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 90, backdropFilter: 'blur(3px)' }}
      />
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        style={{ position: 'fixed', top: 0, bottom: 0, right: 0, width: '100%', maxWidth: '420px', background: '#f8fafc', zIndex: 100, display: 'flex', flexDirection: 'column', boxShadow: '-5px 0 25px rgba(0,0,0,0.1)' }}
      >
        <div style={{ padding: '24px', background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#1e293b', fontWeight: '900' }}>
            {orderSentSuccess ? '¡Pedido Exitoso!' : 'Tu Carrito'}
          </h2>
          <button onClick={handleClose} style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', color: '#64748b', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&times;</button>
        </div>

        {orderSentSuccess ? (
          <div style={{ padding: '30px', textAlign: 'center', flex: 1, overflowY: 'auto' }}>
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
              onClick={handleClose}
              style={{ width: '100%', padding: '16px', background: 'transparent', color: '#64748b', border: 'none', borderRadius: '16px', fontSize: '1rem', fontWeight: 'bold', marginTop: '10px', cursor: 'pointer' }}
            >
              No, terminar
            </button>
          </div>
        ) : cart.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', color: '#64748b' }}>
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" style={{ marginBottom: '16px' }}>
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <p style={{ fontSize: '1.1rem', margin: 0 }}>Tu carrito está vacío</p>
          </div>
        ) : (
          <>
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
              {cart.map((item) => (
                <div key={item.cartItemId} style={{ background: '#fff', borderRadius: '16px', padding: '16px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1, paddingRight: '10px' }}>
                      <h4 style={{ margin: '0 0 6px 0', color: '#1e293b', fontSize: '1rem' }}>{item.product.name}</h4>
                      
                      {(item.shirtSize || item.pantsSize) && (
                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '8px', background: '#f1f5f9', padding: '6px 10px', borderRadius: '8px', display: 'inline-block' }}>
                          {item.shirtSize && <span style={{ marginRight: '8px' }}>Camisa: <strong>{item.shirtSize}</strong></span>}
                          {item.pantsSize && <span>Pantalón: <strong>{item.pantsSize}</strong></span>}
                        </div>
                      )}

                      {/* Mostrar detalles de bordado */}
                      {item.customDetails && item.customDetails.length > 0 && (
                        <div style={{ marginTop: '8px', marginBottom: '10px', fontSize: '0.85rem', color: '#475569', background: '#e0e7ff', padding: '8px 12px', borderRadius: '8px', border: '1px dashed #a5b4fc' }}>
                          <p style={{ margin: '0 0 6px 0', fontWeight: 'bold', color: '#3730a3' }}>Detalles de Bordado:</p>
                          {item.customDetails.map((detail, idx) => (
                            <div key={idx} style={{ paddingLeft: '8px', marginBottom: '4px' }}>
                              <strong>{idx + 1}.</strong> {detail.name && `Nombre: ${detail.name} `} 
                              {detail.rh && `(RH: ${detail.rh}) `}
                              {detail.club && `[Club: ${detail.club}]`}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', borderRadius: '8px', padding: '2px' }}>
                          <button onClick={() => updateQty(item.cartItemId, -1)} style={{ width: '28px', height: '28px', border: 'none', background: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', color: '#64748b' }}>-</button>
                          <span style={{ width: '30px', textAlign: 'center', fontSize: '0.9rem', fontWeight: 'bold' }}>{item.qty}</span>
                          <button onClick={() => updateQty(item.cartItemId, 1)} style={{ width: '28px', height: '28px', border: 'none', background: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', color: '#10b981' }}>+</button>
                        </div>
                        <button onClick={() => removeFromCart(item.cartItemId)} style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '0.85rem', cursor: 'pointer', padding: '4px 8px' }}>Eliminar</button>
                      </div>
                    </div>
                    <div style={{ fontWeight: '900', color: '#184a2c', textAlign: 'right', fontSize: '1.1rem' }}>
                      {formatPrice(item.product.price * item.qty)}
                    </div>
                  </div>
                </div>
              ))}

              <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <p style={{ margin: '0 0 16px 0', fontSize: '1rem', color: '#1e293b', fontWeight: 'bold' }}>Tus Datos para el Pedido</p>
                <input 
                  type="text" 
                  placeholder="Nombre completo *" 
                  value={customerInfo.name} 
                  onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} 
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '12px', background: '#f8fafc', outline: 'none', fontSize: '1rem' }} 
                />
                <input 
                  type="tel" 
                  placeholder="Teléfono / WhatsApp *" 
                  value={customerInfo.phone} 
                  onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} 
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none', fontSize: '1rem' }} 
                />
              </div>
            </div>

            <div style={{ background: '#fff', padding: '24px', borderTop: '1px solid #e2e8f0', boxShadow: '0 -4px 15px rgba(0,0,0,0.03)' }}>
              <div style={{ background: '#fef3c7', padding: '12px 16px', borderRadius: '12px', marginBottom: '20px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" style={{ flexShrink: 0, marginTop: '2px' }}>
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                <span style={{ fontSize: '0.85rem', color: '#92400e', lineHeight: '1.5' }}>
                  <strong>Aviso:</strong> No realizamos entregas a domicilio. Los pedidos deben ser recogidos en la tienda.
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <span style={{ fontSize: '1.2rem', color: '#64748b', fontWeight: 'bold' }}>Total</span>
                <span style={{ fontSize: '1.8rem', color: '#184a2c', fontWeight: '900' }}>{formatPrice(cartTotalPrice)}</span>
              </div>

              <button 
                onClick={handleCheckout}
                disabled={!customerInfo.name || !customerInfo.phone || isSubmitting}
                style={{ 
                  width: '100%', 
                  padding: '18px', 
                  background: (!customerInfo.name || !customerInfo.phone) ? '#cbd5e1' : '#184a2c', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: '16px', 
                  fontSize: '1.15rem', 
                  fontWeight: 'bold', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  gap: '10px', 
                  cursor: (!customerInfo.name || !customerInfo.phone) || isSubmitting ? 'not-allowed' : 'pointer', 
                  boxShadow: (!customerInfo.name || !customerInfo.phone) ? 'none' : '0 10px 25px rgba(24, 74, 44, 0.3)',
                  transition: 'all 0.2s'
                }}
              >
                {isSubmitting ? (
                  'Procesando...'
                ) : (
                  <>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    Enviar Pedido
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
