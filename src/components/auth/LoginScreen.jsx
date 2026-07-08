import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import log2 from '../../assets/logos/log2.png'
import heroImage from '../../assets/hero/1.png'
import RecoveryModal from './RecoveryModal'
import './LoginScreen.css'

export default function LoginScreen() {
  const { login, rememberedUser, clearRememberedUser } = useAuth()
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showRecovery, setShowRecovery] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    
    try {
      if (rememberedUser) {
        const success = await login(null, password, true)
        if (!success) setError('PIN incorrecto')
      } else {
        const success = await login(username, password, false)
        if (!success) setError('Credenciales incorrectas')
      }
    } catch (err) {
      setError('Ocurrió un error al intentar iniciar sesión')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-wrapper">
      <motion.div 
        className="login-container"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="login-left" style={{ backgroundImage: `url(${heroImage})` }}>
          <div className="login-left-overlay">
            <div className="login-left-content">
              <h3>SISTEMA DE FACTURACIÓN</h3>
              <p>Control total sobre sus transacciones e inventario en tiempo real.</p>
            </div>
          </div>
        </div>
        
        <div className="login-right">
          <div className="login-header">
            <img src={log2} alt="Logo" className="login-logo" />
            <p className="login-subtitle">INGRESE A SU PANEL OPERATIVO</p>
          </div>

          <form className="login-form" onSubmit={handleLogin}>
            <AnimatePresence mode="wait">
              {rememberedUser ? (
                <motion.div 
                  key="remembered"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="remembered-user-profile"
                >
                  <div className="profile-pic-container">
                    <img src={rememberedUser.photoUrl} alt={rememberedUser.name} className="profile-pic" />
                  </div>
                  <h2 className="profile-name">{rememberedUser.name}</h2>
                  <p className="profile-role">{rememberedUser.role}</p>
                  
                  <div className="input-group">
                    <label>NUEVO MODO: PIN RÁPIDO</label>
                    <div className="password-input-wrapper">
                      <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                      <input 
                        type={showPassword ? "text" : "password"} 
                        value={password}
                        onChange={e => setPassword(e.target.value.replace(/\D/g, ''))}
                        placeholder="••••"
                        maxLength={6}
                        required
                        disabled={isLoading}
                        style={{ letterSpacing: '10px', textAlign: 'center' }}
                      />
                      <button type="button" className="btn-toggle-password" onClick={() => setShowPassword(!showPassword)} disabled={isLoading}>
                        {showPassword ? (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><line x1="3" y1="3" x2="21" y2="21"></line></svg>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <button type="button" className="btn-switch-account" onClick={clearRememberedUser} disabled={isLoading}>
                    INICIAR SESIÓN CON OTRA CUENTA (CLAVE)
                  </button>
                </motion.div>
              ) : (
                <motion.div 
                  key="standard"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="standard-login"
                >
                  <div className="input-group">
                    <label>IDENTIFICADOR</label>
                    <div className="password-input-wrapper">
                      <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                      <input 
                        type="text" 
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        placeholder="Nombre de usuario"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  
                  <div className="input-group">
                    <label>CONTRASEÑA SEGURA</label>
                    <div className="password-input-wrapper">
                      <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                      <input 
                        type={showPassword ? "text" : "password"} 
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        disabled={isLoading}
                      />
                      <button type="button" className="btn-toggle-password" onClick={() => setShowPassword(!showPassword)} disabled={isLoading}>
                        {showPassword ? (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><line x1="3" y1="3" x2="21" y2="21"></line></svg>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {error && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="login-error"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <button type="submit" className="btn-login" disabled={isLoading}>
              {isLoading ? 'ACCEDIENDO...' : 'ACCEDER AL SISTEMA'}
              {!isLoading && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>}
            </button>
          </form>

          <div className="login-footer">
            <button type="button" onClick={() => setShowRecovery(true)} style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', fontWeight: 'bold', marginBottom: '10px' }}>
              ¿Olvidaste tu contraseña o PIN?
            </button>
            <a href="/">Volver al Catálogo Público</a>
            <span>© {new Date().getFullYear()} FACTURX SYSTEM</span>
          </div>
        </div>
      </motion.div>
      
      {showRecovery && <RecoveryModal onClose={() => setShowRecovery(false)} />}
    </div>
  )
}

