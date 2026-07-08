import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3000`;

export default function ServerWakeupLoader() {
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let intervalId;
    let timeoutId;

    const pingServer = async () => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        
        const res = await fetch(`${API_URL}/`, { signal: controller.signal });
        clearTimeout(timeout);
        
        if (res.ok) {
          setIsReady(true);
          setIsWakingUp(false);
          clearInterval(intervalId);
          clearTimeout(timeoutId);
          // Opcional: Recargar datos globales si se despertó
          window.dispatchEvent(new Event('server_awake'));
        }
      } catch (err) {
        // Si hay error de red o timeout, asumimos que está dormido
        setIsWakingUp(true);
      }
    };

    // Hacer el primer ping inmediatamente
    pingServer();

    // Si después de 2 segundos no está listo, asume que está despertando
    timeoutId = setTimeout(() => {
      if (!isReady) setIsWakingUp(true);
    }, 2000);

    // Intentar cada 5 segundos
    intervalId = setInterval(pingServer, 5000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [isReady]);

  return (
    <AnimatePresence>
      {isWakingUp && !isReady && (
        <motion.div 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(30, 41, 59, 0.95)',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '0.9rem',
            backdropFilter: 'blur(5px)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <svg style={{ width: 24, height: 24, animation: 'spin 2s linear infinite' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="2" x2="12" y2="6"></line>
            <line x1="12" y1="18" x2="12" y2="22"></line>
            <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
            <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
            <line x1="2" y1="12" x2="6" y2="12"></line>
            <line x1="18" y1="12" x2="22" y2="12"></line>
            <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
            <line x1="16.24" y1="4.93" x2="19.07" y2="7.76"></line>
          </svg>
          <style>
            {`
              @keyframes spin { 100% { transform: rotate(360deg); } }
            `}
          </style>
          <div>
            <strong style={{ display: 'block', color: '#10b981' }}>El servidor se está despertando...</strong>
            <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>Por favor espera unos segundos. No es necesario recargar.</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
