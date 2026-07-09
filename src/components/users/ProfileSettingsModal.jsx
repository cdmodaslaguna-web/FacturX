import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function ProfileSettingsModal({ onClose }) {
  const { currentUser, updateUserDetails, updatePassword } = useAuth()
  const [name, setName] = useState(currentUser?.name || '')
  const [pin, setPin] = useState(currentUser?.pin || '')
  const [photoUrl, setPhotoUrl] = useState(currentUser?.photoUrl || '')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    // Si tuvieras Cloudinary con Upload Preset sin firma (Unsigned Upload):
    // const formData = new FormData();
    // formData.append('file', file);
    // formData.append('upload_preset', 'TU_UPLOAD_PRESET_AQUI'); // Reemplaza esto con tu preset
    // fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, {
    //   method: 'POST', body: formData
    // }).then(res => res.json()).then(data => {
    //   setPhotoUrl(data.secure_url);
    //   setIsUploading(false);
    // }).catch(err => {
    //   console.error(err);
    //   setIsUploading(false);
    // });

    // Por ahora, simulamos con Base64 para que sea 100% funcional sin depender de keys
    const reader = new FileReader()
    reader.onload = (event) => {
      setPhotoUrl(event.target.result)
      setIsUploading(false)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Actualizar nombre, foto y PIN (opcional) usando updateUserDetails
    const newPin = (pin && pin !== currentUser.pin) ? pin : undefined;
    updateUserDetails(currentUser.id, currentUser.role, name, photoUrl, newPin);

    toast.success('Perfil actualizado correctamente', { style: { background: '#184a2c', color: '#fff' } })
    onClose()
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        style={{ background: '#fff', borderRadius: '24px', width: '100%', maxWidth: '400px', padding: '30px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, color: '#184a2c', fontSize: '1.4rem' }}>Ajustes de Perfil</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', color: '#64748b', cursor: 'pointer' }}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative' }}>
              <img src={photoUrl || currentUser?.photoUrl} alt="Perfil" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #e8efe9' }} />
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                style={{ position: 'absolute', bottom: '0', right: '0', background: '#184a2c', color: '#fff', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              </button>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" style={{ display: 'none' }} />
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{isUploading ? 'Subiendo...' : 'Cambiar foto (Cloudinary)'}</span>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#4b5563', fontWeight: 'bold' }}>Nombre Completo</label>
            <input 
              required
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: '#4b5563', fontWeight: 'bold' }}>Cambiar PIN (Opcional)</label>
            <input 
              type="text" 
              value={pin} 
              onChange={e => setPin(e.target.value)} 
              style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: '40px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: 'bold', cursor: 'pointer' }}>Cancelar</button>
            <button type="submit" style={{ flex: 1, padding: '12px', borderRadius: '40px', border: 'none', background: '#184a2c', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>Guardar Cambios</button>
          </div>

        </form>
      </motion.div>
    </div>
  )
}
