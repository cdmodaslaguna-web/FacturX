import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../contexts/CartContext';

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(price);
};

export default function ProductDetailModal({ product, onClose }) {
  const { addToCart } = useCart();
  
  const [modalSizes, setModalSizes] = useState({ shirtSize: '', pantsSize: '' });
  const [modalQty, setModalQty] = useState(1);

  // Funciones heredadas del componente original
  const needsPantsSize = (prod) => {
    if (!prod) return false;
    const name = prod.name.toLowerCase();
    if (name.includes('uniforme')) return true;
    const bottoms = ['pantalon', 'pantalón', 'falda', 'sudadera', 'short', 'pantaloneta'];
    return bottoms.some(k => name.includes(k));
  };

  const needsShirtSize = (prod) => {
    if (!prod) return false;
    const name = prod.name.toLowerCase();
    if (name.includes('uniforme')) return true;
    const tops = ['camisa', 'chaqueta', 'buzo', 'polo', 'sueter', 'suéter', 'camiseta', 'chaleco'];
    if (tops.some(k => name.includes(k))) return true;
    
    if (prod.variant && (prod.variant.includes('S') || prod.variant.includes('M') || prod.variant.includes('L') || prod.variant.includes('Talla')) && !needsPantsSize(prod)) return true;
    return false;
  };

  const getProductSizes = (prod) => {
    if (!prod || !prod.variant) return null;
    const parts = prod.variant.split(',').map(s => s.trim()).filter(Boolean);
    if (parts.length > 1) return parts; 
    return null;
  };

  const defaultShirtSizes = ["4", "6", "8", "10", "12", "14", "16", "XS", "S", "M", "L", "XL", "XXL"];
  const defaultPantsSizes = ["4", "6", "8", "10", "12", "14", "16", "26", "28", "30", "32", "34", "36", "38", "40", "42", "S", "M", "L", "XL"];

  const reqShirt = needsShirtSize(product);
  const reqPants = needsPantsSize(product);
  const isSizeValid = (!reqShirt || modalSizes.shirtSize) && (!reqPants || modalSizes.pantsSize);

  const handleAddToCart = () => {
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

    addToCart(product, modalQty, modalSizes);
    onClose();
  };

  if (!product) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(0,0,0,0.6)', 
          zIndex: 110, 
          backdropFilter: 'blur(5px)' 
        }}
      />
      
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        zIndex: 120, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        pointerEvents: 'none',
        padding: '20px'
      }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          style={{ 
            background: '#fff', 
            borderRadius: '24px', 
            width: '100%', 
            maxWidth: '500px', 
            maxHeight: '90vh', 
            overflowY: 'auto', 
            pointerEvents: 'auto', 
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' 
          }}
        >
          <div style={{ position: 'relative', height: '300px', background: '#f1f5f9' }}>
            {product.photoUrl ? (
              <img 
                src={product.photoUrl} 
                alt={product.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
              </div>
            )}
            <button 
              onClick={onClose} 
              style={{ 
                position: 'absolute', 
                top: '15px', 
                right: '15px', 
                background: 'rgba(255,255,255,0.9)', 
                border: 'none', 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                cursor: 'pointer', 
                fontSize: '1.5rem', 
                color: '#1e293b', 
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)' 
              }}
            >
              &times;
            </button>
          </div>

          <div style={{ padding: '30px' }}>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '1.8rem', color: '#1e293b', fontWeight: '900' }}>
              {product.name}
            </h2>
            
            {product.description && (
              <p style={{ margin: '0 0 20px 0', color: '#64748b', lineHeight: '1.6' }}>
                {product.description}
              </p>
            )}

            <div style={{ fontSize: '1.8rem', fontWeight: '900', color: '#184a2c', marginBottom: '24px' }}>
              {formatPrice(product.price)}
            </div>

            {(reqShirt || reqPants) && (
              <div style={{ 
                background: '#f8fafc', 
                padding: '20px', 
                borderRadius: '16px', 
                marginBottom: '24px', 
                border: '1px solid #e2e8f0' 
              }}>
                <h4 style={{ margin: '0 0 16px 0', color: '#1e293b', fontSize: '1.1rem' }}>Selecciona tu talla</h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {reqShirt && (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.9rem', color: '#64748b', marginBottom: '10px', fontWeight: 'bold' }}>
                        {reqPants ? 'Camisa / Blusa / Superior' : 'Talla Única'}
                      </label>
                      <div className="notranslate" translate="no" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {(getProductSizes(product) || defaultShirtSizes).map(s => (
                          <button
                            key={s}
                            onClick={() => setModalSizes({...modalSizes, shirtSize: s})}
                            style={{
                              padding: '10px 16px',
                              borderRadius: '10px',
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
                  {reqPants && (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.9rem', color: '#64748b', marginBottom: '10px', fontWeight: 'bold' }}>
                        {reqShirt ? 'Pantalón / Falda / Inferior' : 'Talla Única'}
                      </label>
                      <div className="notranslate" translate="no" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {(getProductSizes(product) || defaultPantsSizes).map(s => (
                          <button
                            key={s}
                            onClick={() => setModalSizes({...modalSizes, pantsSize: s})}
                            style={{
                              padding: '10px 16px',
                              borderRadius: '10px',
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                background: '#f1f5f9', 
                borderRadius: '16px', 
                padding: '6px' 
              }}>
                <button 
                  onClick={() => setModalQty(Math.max(1, modalQty - 1))} 
                  style={{ width: '44px', height: '44px', border: 'none', background: '#fff', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.4rem', color: '#64748b', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}
                >-</button>
                <span style={{ width: '50px', textAlign: 'center', fontWeight: 'bold', fontSize: '1.2rem', color: '#1e293b' }}>
                  {modalQty}
                </span>
                <button 
                  onClick={() => setModalQty(modalQty + 1)} 
                  style={{ width: '44px', height: '44px', border: 'none', background: '#fff', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.4rem', color: '#10b981', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}
                >+</button>
              </div>
              
              <button 
                onClick={handleAddToCart}
                disabled={!isSizeValid}
                style={{ 
                  flex: 1, 
                  padding: '20px', 
                  background: isSizeValid ? '#184a2c' : '#94a3b8', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: '16px', 
                  fontSize: '1.1rem', 
                  fontWeight: 'bold', 
                  cursor: isSizeValid ? 'pointer' : 'not-allowed', 
                  boxShadow: isSizeValid ? '0 8px 20px rgba(24, 74, 44, 0.3)' : 'none',
                  transition: 'all 0.2s',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                Añadir {(modalQty > 1) ? `(${modalQty})` : ''}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14"></path>
                  <path d="M12 5l7 7-7 7"></path>
                </svg>
              </button>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
