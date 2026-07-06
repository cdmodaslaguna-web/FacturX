import { useState } from 'react';
import { motion } from 'framer-motion';
import { useCart } from '../../contexts/CartContext';

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(price);
};

export default function ProductCard({ product, index, onOpenModal }) {
  const { getProductQtyInCart } = useCart();
  const qty = getProductQtyInCart(product.id);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        cursor: 'pointer',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onOpenModal(product)}
    >
      {/* Contenedor de la Imagen */}
      <div style={{ 
        width: '100%',
        aspectRatio: '3/4', // Proporción ideal para ropa (más alto que ancho)
        background: '#f1f5f9', 
        borderRadius: '16px', // Borde redondeado solicitado
        overflow: 'hidden', 
        position: 'relative',
        marginBottom: '16px'
      }}>
        
        {/* Imagen principal o secundaria */}
        {product.photoUrl ? (
          <img 
            src={(isHovered && product.photoUrl2) ? product.photoUrl2 : product.photoUrl} 
            alt={product.name} 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover', // Cubre todo el espacio
              transform: (isHovered && !product.photoUrl2) ? 'scale(1.06)' : 'scale(1)', // Zoom si no hay 2da imagen
              transition: 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)'
            }} 
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
          </div>
        )}

        {/* Etiqueta NUEVO - Estilo limpio y moderno */}
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          fontWeight: '900',
          fontSize: '0.75rem',
          color: '#111',
          letterSpacing: '1.5px',
          background: 'rgba(255,255,255,0.7)',
          padding: '4px 10px',
          borderRadius: '4px',
          backdropFilter: 'blur(4px)'
        }}>
          NUEVO
        </div>

        {/* Indicador de cantidad en carrito */}
        {qty > 0 && (
          <div style={{ 
            position: 'absolute', 
            top: '12px', 
            right: '12px', 
            background: '#184a2c', 
            color: '#fff', 
            width: '32px', 
            height: '32px', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontWeight: 'bold', 
            fontSize: '0.9rem', 
            boxShadow: '0 4px 10px rgba(24, 74, 44, 0.4)',
            zIndex: 10
          }}>
            {qty}
          </div>
        )}

        {/* Overlay Botón Comprar */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          padding: '16px',
          background: 'linear-gradient(to top, rgba(0,0,0,0.15), transparent)',
          opacity: isHovered ? 1 : 0,
          transform: isHovered ? 'translateY(0)' : 'translateY(10px)',
          transition: 'all 0.3s ease-out',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <button style={{
            width: '100%',
            background: '#fff',
            color: '#111',
            border: 'none',
            padding: '12px',
            fontWeight: '900',
            fontSize: '0.9rem',
            letterSpacing: '1px',
            borderRadius: '8px',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
          >
            COMPRAR
          </button>
        </div>
      </div>
      
      {/* Detalles de Texto (Título y Precio) */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '0 4px' }}>
        <h3 style={{ 
          margin: '0 0 4px 0', 
          fontSize: '1.05rem', 
          color: '#1e293b', 
          fontWeight: '700'
        }}>
          {product.name}
        </h3>
        <div style={{ 
          fontWeight: '900', 
          color: '#475569', 
          fontSize: '1rem'
        }}>
          {formatPrice(product.price)} COP
        </div>
      </div>
    </motion.div>
  );
}
