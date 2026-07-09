import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const messages = [
  "Entregas inmediatas, para insignias en la ciudad de Medellín",
  "Aceptamos Todos los Medios de Pago vía Wompi",
  "Confección Premium y Calidad Garantizada"
];

const particles = Array.from({ length: 20 }).map((_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  animationDuration: `${Math.random() * 3 + 2}s`,
  animationDelay: `${Math.random() * 2}s`,
  size: `${Math.random() * 3 + 1}px`,
}));

export default function AnnouncementBar({ isScrolled }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      width: '100%',
      height: isScrolled ? '0px' : '36px',
      opacity: isScrolled ? 0 : 1,
      transition: 'all 0.3s ease-in-out',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 60,
      background: 'linear-gradient(90deg, #184a2c, #19540cff, #184a2c)',
      backgroundSize: '200% 200%',
      animation: 'gradientMove 5s ease infinite',
      color: '#fff',
      fontSize: '0.75rem',
      fontWeight: 'bold',
      letterSpacing: '1px',
      fontFamily: "'Comfortaa', sans-serif"
    }}>
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes floatParticle {
          0% { transform: translateY(36px) scale(0); opacity: 0; }
          20% { opacity: 0.8; }
          80% { opacity: 0.5; }
          100% { transform: translateY(-10px) scale(1.5); opacity: 0; }
        }
      `}} />

      {/* Gold Particles */}
      {particles.map((p) => (
        <div key={p.id} style={{
          position: 'absolute',
          left: p.left,
          width: p.size,
          height: p.size,
          background: '#ffd700',
          borderRadius: '50%',
          boxShadow: '0 0 4px #ffd700',
          opacity: 0,
          animation: `floatParticle ${p.animationDuration} linear infinite`,
          animationDelay: p.animationDelay,
          pointerEvents: 'none'
        }}></div>
      ))}

      {/* Text Carousel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          style={{ position: 'absolute' }}
        >
          {messages[currentIndex]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
