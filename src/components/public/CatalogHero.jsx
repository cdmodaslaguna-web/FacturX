import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import hero1 from '../../assets/hero/1.png';
import hero2 from '../../assets/hero/2.png';
import hero3 from '../../assets/hero/3.png';
import hero5 from '../../assets/hero/5.png';

const heroImages = [hero1, hero2, hero3, hero5];

export default function CatalogHero() {
  const [currentHeroImage, setCurrentHeroImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroImage(prev => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ 
      position: 'relative', 
      width: '100%', 
      height: '100vh', 
      overflow: 'hidden', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center'
    }}>
      <AnimatePresence>
        <motion.img 
          key={currentHeroImage}
          src={heroImages[currentHeroImage]}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover' }}
          alt="Hero Background"
        />
      </AnimatePresence>
      
      {/* Gradient Overlay for better readability */}
      <div style={{ 
        position: 'absolute', 
        inset: 0, 
        background: 'linear-gradient(135deg, rgba(24,74,44,0.85) 0%, rgba(24,74,44,0.4) 100%)' 
      }}></div>
      
      <div style={{ 
        position: 'relative', 
        zIndex: 2, 
        textAlign: 'center', 
        color: '#fff', 
        padding: '0 20px', 
        maxWidth: '800px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ 
            background: 'rgba(255,255,255,0.2)', 
            backdropFilter: 'blur(5px)',
            padding: '8px 16px',
            borderRadius: '30px',
            fontSize: '0.9rem',
            fontWeight: '600',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            marginBottom: '16px',
            border: '1px solid rgba(255,255,255,0.3)'
          }}
        >
          Nueva Colección
        </motion.div>
        
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ 
            margin: 0, 
            fontSize: '3.5rem', 
            fontWeight: '900', 
            textShadow: '0 4px 15px rgba(0,0,0,0.4)',
            lineHeight: '1.1'
          }}
        >
          Calidad que se nota
        </motion.h1>
        
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{ 
            fontSize: '1.2rem', 
            marginTop: '20px', 
            textShadow: '0 2px 8px rgba(0,0,0,0.4)', 
            opacity: 0.95,
            maxWidth: '600px',
            lineHeight: '1.6'
          }}
        >
          Uniformes y prendas diseñadas para brindar comodidad y resistencia en todo momento. Explora nuestro catálogo.
        </motion.p>
        
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          onClick={() => {
            document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
          }}
          style={{
            marginTop: '30px',
            background: '#fff',
            color: '#184a2c',
            border: 'none',
            padding: '14px 32px',
            borderRadius: '30px',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
            transition: 'transform 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          Ver Catálogo
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </motion.button>
      </div>
      
      {/* Decoración de borde inferior redondeado para conectar con el body */}
      <div style={{
        position: 'absolute',
        bottom: '-1px',
        left: 0,
        right: 0,
        height: '40px',
        background: '#f8fafc',
        borderTopLeftRadius: '30px',
        borderTopRightRadius: '30px',
        zIndex: 3
      }}></div>
    </div>
  );
}
