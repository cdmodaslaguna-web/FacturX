import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useConfirm } from '../../contexts/ConfirmContext'

export default function UserList() {
  const { users, createUser, deleteUser, currentUser, updateUserDetails, resetUserPassword } = useAuth()
  const confirm = useConfirm()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [role, setRole] = useState('EMPLEADO')
  const [createdUsername, setCreatedUsername] = useState(null)
  const [editingUserId, setEditingUserId] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!firstName.trim() || !lastName.trim()) return

    if (editingUserId) {
      updateUserDetails(editingUserId, role, `${firstName} ${lastName}`)
      setEditingUserId(null)
      setFirstName('')
      setLastName('')
      alert('Usuario actualizado con éxito')
    } else {
      const newUser = createUser(firstName, lastName, role)
      setCreatedUsername(newUser.username)
      setFirstName('')
      setLastName('')
      setTimeout(() => setCreatedUsername(null), 10000)
    }
  }

  const handleEdit = (user) => {
    const parts = user.name.split(' ')
    setFirstName(parts[0] || '')
    setLastName(parts.slice(1).join(' ') || '')
    setRole(user.role)
    setEditingUserId(user.id)
    setCreatedUsername(null)
  }

  const handleResetPassword = async (id, name) => {
    const isConfirmed = await confirm({
      title: 'Restablecer Clave',
      message: `¿Estás seguro de restablecer la clave de ${name} a "123456"? El usuario será forzado a cambiarla en su próximo inicio de sesión.`,
      confirmText: 'Restablecer'
    })
    if (isConfirmed) {
      resetUserPassword(id)
    }
  }

  const handleDelete = async (id, name) => {
    if (id === currentUser.id) {
      alert("No puedes eliminar tu propia cuenta.")
      return
    }

    const isConfirmed = await confirm({
      title: 'Eliminar Usuario',
      message: `¿Estás seguro de que deseas eliminar al usuario ${name}? Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      isDestructive: true
    })

    if (isConfirmed) {
      deleteUser(id)
    }
  }

  return (
    <div className="product-list-container" style={{ background: '#e8efe9', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', minHeight: '100%' }}>
      <h2 style={{ margin: 0, color: '#184a2c', fontSize: '1.4rem' }}>Gestión de Usuarios</h2>
      
      <form className="product-form" onSubmit={handleSubmit} style={{ background: '#fff', padding: '20px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', color: '#1e293b' }}>
          {editingUserId ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
        </h3>
        <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div className="form-group">
            <label style={{ fontSize: '0.85rem', color: '#4b5563', marginBottom: '6px', display: 'block' }}>Nombres</label>
            <input required value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Ej. Juan Carlos" style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none' }} />
          </div>
          <div className="form-group">
            <label style={{ fontSize: '0.85rem', color: '#4b5563', marginBottom: '6px', display: 'block' }}>Apellidos</label>
            <input required value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Ej. Perez" style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none' }} />
          </div>
          <div className="form-group">
            <label style={{ fontSize: '0.85rem', color: '#4b5563', marginBottom: '6px', display: 'block' }}>Rol</label>
            <select value={role} onChange={e => setRole(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none' }}>
              <option value="EMPLEADO">Empleado</option>
              <option value="DIRECTOR DE OPERACIONES">Director de Operaciones</option>
              <option value="ADMINISTRADOR">Administrador</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit" style={{ background: '#184a2c', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            {editingUserId ? 'Actualizar Usuario' : 'Generar Usuario'}
          </button>
          
          {editingUserId && (
            <button 
              type="button" 
              onClick={() => { setEditingUserId(null); setFirstName(''); setLastName(''); setRole('EMPLEADO'); }}
              style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Cancelar Edición
            </button>
          )}
        </div>

        {createdUsername && (
          <div style={{ marginTop: '15px', padding: '15px', background: '#dbeafe', color: '#1e40af', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
            <strong>¡Usuario Creado Exitosamente!</strong><br />
            Por favor, entrega las siguientes credenciales al empleado:<br /><br />
            Usuario: <strong style={{ fontSize: '1.1rem' }}>{createdUsername}</strong><br />
            Clave Temporal: <strong style={{ fontSize: '1.1rem' }}>123456</strong><br /><br />
            <small>El sistema le pedirá cambiar esta clave obligatoriamente en su primer ingreso.</small>
          </div>
        )}
      </form>

      <div className="table-responsive" style={{ background: '#fff', padding: '20px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', color: '#1e293b' }}>Usuarios Activos</h3>
        <table className="products-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
              <th style={{ padding: '12px', color: '#64748b' }}>Perfil</th>
              <th style={{ padding: '12px', color: '#64748b' }}>Nombre</th>
              <th style={{ padding: '12px', color: '#64748b' }}>Usuario</th>
              <th style={{ padding: '12px', color: '#64748b' }}>Rol</th>
              <th style={{ padding: '12px', color: '#64748b' }}>Estado</th>
              <th style={{ padding: '12px', color: '#64748b' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td data-label="Perfil" style={{ padding: '12px' }}>
                  <img src={u.photoUrl} alt={u.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                </td>
                <td data-label="Nombre" style={{ padding: '12px', fontWeight: 'bold', color: '#1e293b' }}>{u.name}</td>
                <td data-label="Usuario" style={{ padding: '12px', color: '#64748b' }}>{u.username}</td>
                <td data-label="Rol" style={{ padding: '12px' }}>
                  <span style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold' }}>{u.role}</span>
                </td>
                <td data-label="Estado" style={{ padding: '12px' }}>
                  {u.mustChangePassword ? (
                    <span style={{ color: '#d97706', fontSize: '0.85rem', fontWeight: 'bold' }}>Pendiente Cambio Clave</span>
                  ) : (
                    <span style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: 'bold' }}>Activo</span>
                  )}
                </td>
                <td data-label="Acciones" style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <button 
                      title="Editar Perfil"
                      onClick={() => handleEdit(u)}
                      style={{ background: '#e0f2fe', color: '#0ea5e9', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>

                    <button 
                      title="Restablecer Clave Temporal"
                      onClick={() => handleResetPassword(u.id, u.name)}
                      style={{ background: '#ffedd5', color: '#ea580c', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    </button>

                    {u.id !== currentUser.id && (
                      <button 
                        title="Eliminar"
                        onClick={() => handleDelete(u.id, u.name)}
                        style={{ background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '8px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No hay usuarios registrados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
