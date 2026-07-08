import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

export default function SetupCredentialsModal() {
  const { updatePassword, currentUser } = useAuth();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPin, setNewPin] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Validación de seguridad básica
  const validatePassword = (pass) => {
    if (pass.length < 8) return "La contraseña debe tener al menos 8 caracteres";
    if (!/\d/.test(pass)) return "La contraseña debe contener al menos un número";
    if (!/[a-zA-Z]/.test(pass)) return "La contraseña debe contener al menos una letra";
    return null;
  };

  const validatePin = (pin) => {
    if (!/^\d{4,6}$/.test(pin)) return "El PIN debe tener 4 a 6 dígitos numéricos";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (newPassword !== confirmPassword) {
      return setError('Las contraseñas no coinciden');
    }

    const passError = validatePassword(newPassword);
    if (passError) return setError(passError);

    const pinError = validatePin(newPin);
    if (pinError) return setError(pinError);

    setIsLoading(true);
    try {
      await updatePassword(newPassword, newPin, securityQuestion, securityAnswer);
    } catch (err) {
      setError('Ocurrió un error al actualizar las credenciales');
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser?.mustchangepassword) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', 
      alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)'
    }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: '#fff', padding: '40px', borderRadius: '24px', 
          width: '100%', maxWidth: '400px', boxShadow: '0 25px 50px rgba(0,0,0,0.15)'
        }}
      >
        <h2 style={{ margin: '0 0 10px 0', color: '#1e293b', fontSize: '1.5rem', textAlign: 'center' }}>
          Protege tu cuenta
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '30px', textAlign: 'center', lineHeight: '1.5' }}>
          Para continuar, debes establecer una contraseña segura y un PIN rápido de acceso.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontSize: '0.85rem', fontWeight: 'bold' }}>NUEVA CONTRASEÑA</label>
            <input 
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres (letras y números)"
              style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box' }}
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontSize: '0.85rem', fontWeight: 'bold' }}>CONFIRMAR CONTRASEÑA</label>
            <input 
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Repite la contraseña"
              style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box' }}
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontSize: '0.85rem', fontWeight: 'bold' }}>NUEVO PIN RÁPIDO</label>
            <input 
              type="password"
              value={newPin}
              onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
              placeholder="4 a 6 dígitos numéricos"
              maxLength={6}
              style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box', textAlign: 'center', letterSpacing: '10px' }}
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#475569', fontSize: '0.85rem', fontWeight: 'bold' }}>PREGUNTA DE SEGURIDAD</label>
            <select 
              value={securityQuestion}
              onChange={e => setSecurityQuestion(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box', marginBottom: '10px' }}
              required
              disabled={isLoading}
            >
              <option value="">Selecciona una pregunta...</option>
              <option value="¿Cuál es el nombre de tu primera mascota?">¿Cuál es el nombre de tu primera mascota?</option>
              <option value="¿En qué ciudad naciste?">¿En qué ciudad naciste?</option>
              <option value="¿Cuál es el nombre de soltera de tu madre?">¿Cuál es el nombre de soltera de tu madre?</option>
              <option value="¿Cuál es tu película favorita?">¿Cuál es tu película favorita?</option>
            </select>
            <input 
              type="text"
              value={securityAnswer}
              onChange={e => setSecurityAnswer(e.target.value)}
              placeholder="Escribe tu respuesta secreta"
              style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box' }}
              required
              disabled={isLoading}
            />
          </div>

          {error && (
            <div style={{ padding: '12px', background: '#fef2f2', color: '#ef4444', borderRadius: '8px', fontSize: '0.85rem', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            style={{
              background: '#10b981', color: '#fff', padding: '14px', border: 'none', borderRadius: '12px', 
              fontSize: '1rem', fontWeight: 'bold', cursor: isLoading ? 'not-allowed' : 'pointer', marginTop: '10px'
            }}
          >
            {isLoading ? 'GUARDANDO...' : 'GUARDAR Y CONTINUAR'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
