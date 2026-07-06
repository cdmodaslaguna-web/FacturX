import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import log2 from '../../assets/logos/log2.png';

export default function PublicHeader() {
  const { isAuthenticated } = useAuth();
  const { cartTotalItems, setIsCartOpen } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      style={{ 
        background: isScrolled ? 'rgba(255, 255, 255, 0.95)' : 'transparent', 
        backdropFilter: isScrolled ? 'blur(10px)' : 'none',
        padding: '12px 24px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        position: 'fixed', 
        top: 0, 
        left: 0,
        right: 0,
        zIndex: 50, 
        borderBottom: isScrolled ? '1px solid rgba(0,0,0,0.05)' : '1px solid transparent',
        boxShadow: isScrolled ? '0 4px 20px rgba(0,0,0,0.03)' : 'none',
        transition: 'all 0.3s ease-in-out'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <img 
          src={log2} 
          alt="Logo" 
          style={{ 
            height: '42px', 
            objectFit: 'contain',
            filter: isScrolled ? 'none' : 'brightness(0) invert(1)',
            transition: 'filter 0.3s'
          }} 
        />
        <nav style={{ display: 'none' /* We can show this on desktop later */ }}>
          {/* Espacio para enlaces de navegación: Inicio, Nosotros, Contacto */}
        </nav>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <button 
          onClick={() => setIsCartOpen(true)}
          style={{ 
            background: 'transparent', 
            border: 'none', 
            position: 'relative', 
            cursor: 'pointer',
            color: isScrolled ? '#184a2c' : '#fff',
            padding: '8px',
            transition: 'color 0.3s'
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <AnimatePresence>
            {cartTotalItems > 0 && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                style={{ 
                  position: 'absolute', 
                  top: '-2px', 
                  right: '-4px', 
                  background: '#ef4444', 
                  color: '#fff', 
                  width: '20px', 
                  height: '20px', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '0.75rem',
                  fontWeight: 'bold'
                }}
              >
                {cartTotalItems}
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        <a 
          href={isAuthenticated ? "/admin" : "/login"} 
          style={{ 
            textDecoration: 'none', 
            color: isScrolled ? '#fff' : '#184a2c', 
            background: isScrolled ? '#184a2c' : '#fff', 
            padding: '8px 16px', 
            borderRadius: '20px', 
            fontSize: '0.9rem', 
            fontWeight: '600', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            transition: 'all 0.3s'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
            <polyline points="10 17 15 12 10 7"></polyline>
            <line x1="15" y1="12" x2="3" y2="12"></line>
          </svg>
          <span style={{ display: 'none' /* Ocultar en móvil si es necesario */ }}>{isAuthenticated ? 'Panel' : 'Login'}</span>
        </a>
      </div>
    </header>
  );
}
