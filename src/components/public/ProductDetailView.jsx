import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../contexts/CartContext';

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(price);
};

export default function ProductDetailView({ product, onBack }) {
  const { addToCart } = useCart();
  
  const [sizes, setSizes] = useState({ shirtSize: '', pantsSize: '' });
  const [qty, setQty] = useState(1);
  const [customDetails, setCustomDetails] = useState([{ name: '', rh: '', club: '' }]);
  const photos = product?.photoUrl ? product.photoUrl.split(',') : [];
  const [mainPhotoIndex, setMainPhotoIndex] = useState(0);

  // Auto scroll to details when mounting
  useEffect(() => {
    if (product) {
      setTimeout(() => {
        const el = document.getElementById('product-detail-section');
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY - 80; // 80px offset for fixed navbar
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 150); // Small delay to let framer-motion start the animation
    }
  }, [product]);

  // Adjust customDetails array when qty changes
  useEffect(() => {
    setCustomDetails(prev => {
      const newDetails = [...prev];
      if (qty > newDetails.length) {
        for (let i = newDetails.length; i < qty; i++) {
          newDetails.push({ name: '', rh: '', club: '' });
        }
      } else if (qty < newDetails.length) {
        newDetails.length = qty;
      }
      return newDetails;
    });
  }, [qty]);

  const isVariantInfo = product?.variant?.startsWith('[INFO]') || false;
  const displayVariant = product?.variant ? product.variant.replace(/^\[INFO\]/, '') : '';

  const needsPantsSize = (prod) => {
    if (!prod || isVariantInfo) return false;
    const name = prod.name.toLowerCase();
    if (name.includes('uniforme')) return true;
    const bottoms = ['pantalon', 'pantalón', 'falda', 'sudadera', 'short', 'pantaloneta'];
    return bottoms.some(k => name.includes(k));
  };

  const needsShirtSize = (prod) => {
    if (!prod || isVariantInfo) return false;
    const name = prod.name.toLowerCase();
    if (name.includes('uniforme')) return true;
    const tops = ['camisa', 'chaqueta', 'buzo', 'polo', 'sueter', 'suéter', 'camiseta', 'chaleco'];
    if (tops.some(k => name.includes(k))) return true;
    
    if (prod.variant && (prod.variant.includes('S') || prod.variant.includes('M') || prod.variant.includes('L') || prod.variant.includes('Talla')) && !needsPantsSize(prod)) return true;
    return false;
  };

  const getProductSizes = (prod) => {
    if (!prod || !displayVariant || isVariantInfo) return null;
    const parts = displayVariant.split(',').map(s => s.trim()).filter(Boolean);
    if (parts.length > 1) return parts; 
    return null;
  };

  const defaultShirtSizes = ["4", "6", "8", "10", "12", "14", "16", "XS", "S", "M", "L", "XL", "XXL"];
  const defaultPantsSizes = ["4", "6", "8", "10", "12", "14", "16", "26", "28", "30", "32", "34", "36", "38", "40", "42", "S", "M", "L", "XL"];

  const reqShirt = needsShirtSize(product);
  const reqPants = needsPantsSize(product);
  
  const needsNameAndRH = product ? product.name.toLowerCase().includes('nombre') : false;
  const needsClub = product ? (
    product.name.toLowerCase().includes('medialuna') || 
    product.name.toLowerCase().includes('media luna') ||
    product.name.toLowerCase().includes('insignia') ||
    product.name.toLowerCase().includes('emblema')
  ) : false;

  const isSizeValid = (!reqShirt || sizes.shirtSize) && (!reqPants || sizes.pantsSize);
  
  const isCustomDataValid = () => {
    if (!needsNameAndRH && !needsClub) return true;
    for (let i = 0; i < qty; i++) {
      const detail = customDetails[i] || {};
      if (needsNameAndRH && (!detail.name || !detail.rh)) return false;
      if (needsClub && !detail.club) return false;
    }
    return true;
  };

  const isValid = isSizeValid && isCustomDataValid();

  const handleAddToCart = () => {
    if (!isSizeValid) {
      alert("Por favor selecciona la talla requerida.");
      return;
    }
    if (!isCustomDataValid()) {
      alert("Por favor completa los datos obligatorios para el bordado (Nombre/RH/Club).");
      return;
    }

    const detailsToPass = (needsNameAndRH || needsClub) ? customDetails : [];
    addToCart(product, qty, { ...sizes, customDetails: detailsToPass });
    onBack();
  };

  const updateCustomDetail = (index, field, value) => {
    setCustomDetails(prev => {
      const newDetails = [...prev];
      newDetails[index] = { ...newDetails[index], [field]: value };
      return newDetails;
    });
  };

  const handleBack = () => {
    onBack();
    setTimeout(() => {
      document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  if (!product) return null;

  return (
    <motion.div 
      id="product-detail-section"
      initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
      animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
      exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
      style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '20px 20px 60px', 
      }}
    >
      <button 
        onClick={handleBack}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#64748b',
          fontSize: '1rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '20px',
          padding: '8px 0'
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Cerrar Detalles
      </button>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '40px',
        background: '#fff',
        borderRadius: '24px',
        padding: '30px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
      }}>
        
        {/* Imagen y Galería */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ borderRadius: '16px', overflow: 'hidden', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
            {photos.length > 0 ? (
              <img 
                src={photos[mainPhotoIndex]} 
                alt={product.name} 
                style={{ width: '100%', height: '100%', objectFit: 'contain', maxHeight: '500px' }} 
              />
            ) : (
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
            )}
          </div>
          
          {photos.length > 1 && (
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
              {photos.map((photo, idx) => (
                <button
                  key={idx}
                  onClick={() => setMainPhotoIndex(idx)}
                  style={{
                    padding: 0,
                    border: mainPhotoIndex === idx ? '2px solid #184a2c' : '2px solid transparent',
                    borderRadius: '8px',
                    background: 'transparent',
                    cursor: 'pointer',
                    width: '60px',
                    height: '60px',
                    flexShrink: 0,
                    overflow: 'hidden'
                  }}
                >
                  <img src={photo} alt={`${product.name} ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detalles */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '2.5rem', color: '#1e293b', fontWeight: '900', lineHeight: '1.2' }}>
            {product.name}
          </h1>

          {displayVariant && (
            <div style={{ display: 'inline-block', background: '#e0e7ff', color: '#3730a3', padding: '6px 12px', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', marginBottom: '15px', width: 'fit-content' }}>
              Variante: {displayVariant}
            </div>
          )}
          
          <div style={{ fontSize: '2rem', fontWeight: '900', color: '#184a2c', marginBottom: '24px' }}>
            {formatPrice(product.price)}
          </div>

          {product.description && (
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>Descripción</h3>
              <p style={{ margin: 0, color: '#64748b', lineHeight: '1.6', fontSize: '1.05rem' }}>
                {product.description}
              </p>
            </div>
          )}

          {(reqShirt || reqPants) && (
            <div style={{ 
              background: '#f8fafc', 
              padding: '24px', 
              borderRadius: '16px', 
              marginBottom: '30px', 
              border: '1px solid #e2e8f0' 
            }}>
              <h4 style={{ margin: '0 0 20px 0', color: '#1e293b', fontSize: '1.2rem' }}>Selecciona tu talla</h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {reqShirt && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.95rem', color: '#64748b', marginBottom: '12px', fontWeight: 'bold' }}>
                      {reqPants ? 'Camisa / Blusa / Superior' : 'Talla Única'}
                    </label>
                    <div className="notranslate" translate="no" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                      {(getProductSizes(product) || defaultShirtSizes).map(s => (
                        <button
                          key={s}
                          onClick={() => setSizes({...sizes, shirtSize: s})}
                          style={{
                            padding: '10px 16px',
                            borderRadius: '10px',
                            border: sizes.shirtSize === s ? '2px solid #184a2c' : '1px solid #cbd5e1',
                            background: sizes.shirtSize === s ? '#e8efe9' : '#fff',
                            color: sizes.shirtSize === s ? '#184a2c' : '#475569',
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
                    <label style={{ display: 'block', fontSize: '0.95rem', color: '#64748b', marginBottom: '12px', fontWeight: 'bold' }}>
                      {reqShirt ? 'Pantalón / Falda / Inferior' : 'Talla Única'}
                    </label>
                    <div className="notranslate" translate="no" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                      {(getProductSizes(product) || defaultPantsSizes).map(s => (
                        <button
                          key={s}
                          onClick={() => setSizes({...sizes, pantsSize: s})}
                          style={{
                            padding: '10px 16px',
                            borderRadius: '10px',
                            border: sizes.pantsSize === s ? '2px solid #184a2c' : '1px solid #cbd5e1',
                            background: sizes.pantsSize === s ? '#e8efe9' : '#fff',
                            color: sizes.pantsSize === s ? '#184a2c' : '#475569',
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

          {(needsNameAndRH || needsClub) && (
            <div style={{ 
              background: '#e0e7ff', 
              padding: '16px', 
              borderRadius: '16px', 
              marginBottom: '20px', 
              border: '1px solid #c7d2fe' 
            }}>
              <h4 style={{ margin: '0 0 4px 0', color: '#3730a3', fontSize: '1rem' }}>Datos para el Bordado</h4>
              <p style={{ margin: '0 0 12px 0', color: '#4f46e5', fontSize: '0.85rem' }}>Obligatorio para cada unidad.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '6px', paddingBottom: '4px' }}>
                <AnimatePresence>
                  {Array.from({ length: qty }).map((_, i) => (
                    <motion.div 
                      key={`custom-detail-${i}`}
                      initial={{ opacity: 0, y: -20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9, height: 0, marginTop: 0, marginBottom: 0, overflow: 'hidden' }}
                      transition={{ duration: 0.2 }}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', padding: '12px 10px', borderRadius: '10px', border: '1px solid #a5b4fc', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}
                    >
                      <span style={{ fontWeight: '900', color: '#312e81', fontSize: '1rem', minWidth: '20px' }}>{i + 1}.</span>
                      
                      {needsNameAndRH && (
                        <>
                          <input 
                            type="text" 
                            placeholder="Nombre *" 
                            value={customDetails[i]?.name || ''}
                            onChange={(e) => updateCustomDetail(i, 'name', e.target.value)}
                            style={{ flex: 2, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem' }}
                          />
                          <input 
                            type="text" 
                            placeholder="RH *" 
                            value={customDetails[i]?.rh || ''}
                            onChange={(e) => updateCustomDetail(i, 'rh', e.target.value)}
                            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem', minWidth: '70px' }}
                          />
                        </>
                      )}
                      
                      {needsClub && (
                        <input 
                          type="text" 
                          placeholder="Nombre a bordar (Campo o Club) *" 
                          value={customDetails[i]?.club || ''}
                          onChange={(e) => updateCustomDetail(i, 'club', e.target.value)}
                          style={{ flex: needsNameAndRH ? 1.5 : 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem' }}
                        />
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              background: '#f1f5f9', 
              borderRadius: '16px', 
              padding: '6px' 
            }}>
              <button 
                onClick={() => setQty(Math.max(1, qty - 1))} 
                style={{ width: '50px', height: '50px', border: 'none', background: '#fff', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.4rem', color: '#64748b', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}
              >-</button>
              <span style={{ width: '60px', textAlign: 'center', fontWeight: 'bold', fontSize: '1.2rem', color: '#1e293b' }}>
                {qty}
              </span>
              <button 
                onClick={() => setQty(qty + 1)} 
                style={{ width: '50px', height: '50px', border: 'none', background: '#fff', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.4rem', color: '#10b981', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}
              >+</button>
            </div>
            
            <button 
              onClick={handleAddToCart}
              disabled={!isValid}
              style={{ 
                flex: 1, 
                padding: '20px', 
                background: isValid ? '#184a2c' : '#94a3b8', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '16px', 
                fontSize: '1.2rem', 
                fontWeight: 'bold', 
                cursor: isValid ? 'pointer' : 'not-allowed', 
                boxShadow: isValid ? '0 8px 25px rgba(24, 74, 44, 0.3)' : 'none',
                transition: 'all 0.2s',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              Añadir {(qty > 1) ? `(${qty})` : ''} al carrito
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"></path>
                <path d="M12 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
          
        </div>
      </div>
    </motion.div>
  );
}
