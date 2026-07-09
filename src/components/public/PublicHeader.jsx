import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import log1 from '../../assets/logos/log1.png';
import log2 from '../../assets/logos/log2.png';
import AnnouncementBar from './AnnouncementBar';

export default function PublicHeader({ searchQuery, setSearchQuery, searchResults = [], onSelectResult }) {
  const { isAuthenticated } = useAuth();
  const { cartTotalItems, setIsCartOpen } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50 }}>
      <AnnouncementBar isScrolled={isScrolled} />
      <header 
        style={{ 
          background: isScrolled ? 'rgba(255, 255, 255, 0.95)' : 'transparent', 
          backdropFilter: isScrolled ? 'blur(10px)' : 'none',
          padding: '12px 24px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          position: 'relative', 
          borderBottom: isScrolled ? '1px solid rgba(0,0,0,0.05)' : '1px solid transparent',
          boxShadow: isScrolled ? '0 4px 20px rgba(0,0,0,0.03)' : 'none',
          transition: 'all 0.3s ease-in-out'
        }}
      >
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <img 
          src={isScrolled ? log2 : log1} 
          alt="Logo" 
          style={{ 
            height: '42px', 
            objectFit: 'contain',
            cursor: 'pointer',
            transition: 'transform 0.3s'
          }} 
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
        <nav style={{ display: 'none' /* We can show this on desktop later */ }}>
          {/* Espacio para enlaces de navegación: Inicio, Nosotros, Contacto */}
        </nav>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        
        <AnimatePresence>
          {isSearchOpen && (
            <div style={{ position: 'relative' }}>
              <motion.div
                key="search-container"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 250, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                style={{ overflow: 'hidden' }}
              >
                <input
                  type="text"
                  placeholder="Buscar ropa, ubicación, contacto..."
                  value={searchQuery || ''}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  autoFocus
                  style={{
                    padding: '8px 12px',
                    borderRadius: '20px',
                    border: isScrolled ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.3)',
                    background: isScrolled ? '#fff' : 'rgba(255,255,255,0.1)',
                    color: isScrolled ? '#1e293b' : '#fff',
                    outline: 'none',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                />
              </motion.div>

              {searchQuery && searchQuery.trim() && searchResults && searchResults.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  width: '300px',
                  marginTop: '12px',
                  background: '#fff',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  overflow: 'hidden',
                  maxHeight: '350px',
                  overflowY: 'auto',
                  zIndex: 1000
                }}>
                  {searchResults.map((res, i) => (
                    <div 
                      key={res.type + '-' + res.id}
                      onClick={() => {
                        setIsSearchOpen(false); // Cerramos barra
                        if (onSelectResult) onSelectResult(res);
                      }}
                      style={{
                        padding: '12px 16px',
                        borderBottom: i < searchResults.length - 1 ? '1px solid #f1f5f9' : 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        background: '#fff',
                        transition: 'background 0.2s',
                        fontFamily: "'Comfortaa', sans-serif"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                    >
                      <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#184a2c' }}>
                        {res.name}
                      </span>
                      {res.description && (
                        <span style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {res.description}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </AnimatePresence>

        <button 
          type="button"
          onClick={() => {
            setIsSearchOpen(!isSearchOpen);
            if (isSearchOpen && setSearchQuery) {
              setSearchQuery('');
            }
          }}
          style={{ 
            background: 'transparent', 
            border: 'none', 
            cursor: 'pointer',
            color: isScrolled ? '#184a2c' : '#fff',
            padding: '8px',
            transition: 'color 0.3s'
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>

        <button 
          type="button"
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
    </div>
  );
}
