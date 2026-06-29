import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import log2 from '../../assets/logos/log2.png'
import by2 from '../../assets/logos/by 2.png'
import './LoginScreen.css'

export default function LoginScreen() {
  const { login, rememberedUser, clearRememberedUser } = useAuth()
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = (e) => {
    e.preventDefault()
    setError('')
    
    if (rememberedUser) {
      const success = login(password, true)
      if (!success) setError('PIN o contraseña incorrecta')
    } else {
      // Dummy check just for the prototype
      const success = login(username || password, false)
      if (!success) setError('Credenciales incorrectas (Usa: admin / 1234)')
    }
  }

  return (
    <div className="login-wrapper">
      <motion.div 
        className="login-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="login-left">
          {/* Background image loaded via CSS */}
        </div>
        
        <div className="login-right">
          <div className="login-header">
            <img src={log2} alt="Logo" className="login-logo" />
            <p className="login-subtitle">ACCEDA A SU PANEL OPERATIVO</p>
          </div>

          <form className="login-form" onSubmit={handleLogin}>
            {rememberedUser ? (
              <div className="remembered-user-profile">
                <div className="profile-pic-container">
                  <img src={rememberedUser.photoUrl} alt={rememberedUser.name} className="profile-pic" />
                </div>
                <h2 className="profile-name">{rememberedUser.name}</h2>
                <p className="profile-role">{rememberedUser.role}</p>
                <button type="button" className="btn-switch-account" onClick={clearRememberedUser}>
                  INICIAR SESIÓN CON OTRA CUENTA
                </button>

                <div className="input-group">
                  <label>CONTRASEÑA O PIN</label>
                  <div className="password-input-wrapper">
                    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                    <button type="button" className="btn-toggle-password" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><line x1="3" y1="3" x2="21" y2="21"></line></svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="standard-login">
                <div className="input-group">
                  <label>USUARIO</label>
                  <div className="password-input-wrapper">
                    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    <input 
                      type="text" 
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      placeholder="Ingrese su usuario"
                      required
                    />
                  </div>
                </div>
                
                <div className="input-group">
                  <label>CONTRASEÑA</label>
                  <div className="password-input-wrapper">
                    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                    <button type="button" className="btn-toggle-password" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><line x1="3" y1="3" x2="21" y2="21"></line></svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {error && <p className="login-error">{error}</p>}

            <button type="submit" className="btn-login">
              ACCEDER AL SISTEMA
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
          </form>

          <div className="login-footer" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
            <a href="/" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
              Volver al Catálogo Público
            </a>
            <img src={by2} alt="System by" style={{ height: '24px', objectFit: 'contain', opacity: 0.8 }} />
          </div>
        </div>
      </motion.div>
    </div>
  )
}
