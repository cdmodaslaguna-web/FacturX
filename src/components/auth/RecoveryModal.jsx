import { useState } from 'react';
import { motion } from 'framer-motion';

export default function RecoveryModal({ onClose }) {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3000`;

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!username) return;
    setIsLoading(true);
    setError('');
    
    try {
      const res = await fetch(`${API_URL}/auth/security-question/${username}`);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Usuario no encontrado o sin pregunta configurada');
      }
      
      setSecurityQuestion(data.question);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!answer) return;
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/auth/recover-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, answer })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Respuesta incorrecta');
      }
      
      // Establecemos la sesión temporal
      sessionStorage.setItem('facturx_token', data.access_token);
      sessionStorage.setItem('facturx_user', JSON.stringify(data.user));
      
      // Recargamos para que App.jsx capture el estado y muestre el SetupCredentialsModal
      window.location.href = '/';
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', 
      alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)'
    }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          background: '#fff', padding: '40px', borderRadius: '24px', 
          width: '100%', maxWidth: '400px', boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
          position: 'relative'
        }}
      >
        <button 
          onClick={onClose}
          type="button"
          style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}
        >×</button>
        
        <h2 style={{ margin: '0 0 10px 0', color: '#1e293b', fontSize: '1.5rem', textAlign: 'center' }}>
          Recuperar Cuenta
        </h2>
        
        {step === 1 && (
          <>
            <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '30px', textAlign: 'center', lineHeight: '1.5' }}>
              Ingresa tu nombre de usuario para buscar tu pregunta de seguridad.
            </p>
            <form onSubmit={handleLookup} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontSize: '0.85rem', fontWeight: 'bold' }}>USUARIO</label>
                <input 
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Ej: admin"
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box' }}
                  required
                  disabled={isLoading}
                />
              </div>
              
              {error && <div style={{ padding: '12px', background: '#fef2f2', color: '#ef4444', borderRadius: '8px', fontSize: '0.85rem', textAlign: 'center' }}>{error}</div>}
              
              <button 
                type="submit" 
                disabled={isLoading}
                style={{ background: '#10b981', color: '#fff', padding: '14px', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: 'bold', cursor: isLoading ? 'not-allowed' : 'pointer', marginTop: '10px' }}
              >
                {isLoading ? 'BUSCANDO...' : 'BUSCAR PREGUNTA'}
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '30px', textAlign: 'center', lineHeight: '1.5' }}>
              Responde correctamente a tu pregunta de seguridad.
            </p>
            <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontSize: '0.85rem', fontWeight: 'bold' }}>PREGUNTA</label>
                <div style={{ padding: '12px 16px', borderRadius: '12px', background: '#f1f5f9', color: '#0f172a', fontWeight: '500', marginBottom: '15px' }}>
                  {securityQuestion}
                </div>

                <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontSize: '0.85rem', fontWeight: 'bold' }}>TU RESPUESTA</label>
                <input 
                  type="text"
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  placeholder="Respuesta secreta"
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box' }}
                  required
                  disabled={isLoading}
                />
              </div>
              
              {error && <div style={{ padding: '12px', background: '#fef2f2', color: '#ef4444', borderRadius: '8px', fontSize: '0.85rem', textAlign: 'center' }}>{error}</div>}
              
              <button 
                type="submit" 
                disabled={isLoading}
                style={{ background: '#10b981', color: '#fff', padding: '14px', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: 'bold', cursor: isLoading ? 'not-allowed' : 'pointer', marginTop: '10px' }}
              >
                {isLoading ? 'VERIFICANDO...' : 'VERIFICAR Y RECUPERAR'}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
