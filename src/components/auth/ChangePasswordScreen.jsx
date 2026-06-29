import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import log2 from '../../assets/logos/log2.png'
import './LoginScreen.css'

export default function ChangePasswordScreen() {
  const { currentUser, updatePassword, logout } = useAuth()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (newPassword.length < 4) {
      setError('La clave debe tener al menos 4 caracteres.')
      return
    }

    if (newPassword === '123456') {
      setError('La nueva clave no puede ser la clave por defecto.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Las claves no coinciden.')
      return
    }

    updatePassword(newPassword)
  }

  return (
    <div className="login-wrapper">
      <motion.div 
        className="login-container"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="login-right" style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}>
          <div className="login-header">
            <img src={log2} alt="Logo" className="login-logo" style={{ maxWidth: '120px' }} />
            <h2 style={{ color: '#184a2c', margin: '15px 0 5px 0' }}>Cambio de Clave Obligatorio</h2>
            <p className="login-subtitle">Por seguridad, actualiza tu clave temporal</p>
          </div>

          <div className="remembered-user-profile" style={{ marginBottom: '20px' }}>
            <div className="profile-pic-container" style={{ width: '80px', height: '80px' }}>
              <img src={currentUser?.photoUrl} alt={currentUser?.name} className="profile-pic" />
            </div>
            <h3 className="profile-name" style={{ fontSize: '1.2rem' }}>{currentUser?.name}</h3>
            <p className="profile-role" style={{ marginBottom: 0 }}>{currentUser?.username}</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label>NUEVA CLAVE (O PIN)</label>
              <div className="password-input-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Mínimo 4 caracteres"
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label>CONFIRMAR CLAVE</label>
              <div className="password-input-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repita su nueva clave"
                  required
                />
              </div>
            </div>

            {error && <p className="login-error">{error}</p>}

            <button type="submit" className="btn-login">
              ACTUALIZAR Y ENTRAR
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </button>
            <button type="button" className="btn-switch-account" style={{ marginTop: '20px' }} onClick={logout}>
              CANCELAR Y SALIR
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
