/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect } from 'react'

const AuthContext = createContext()
const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3000`;

// Helper para headers autenticados
const getAuthHeaders = () => {
  const token = sessionStorage.getItem('facturx_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [rememberedUser, setRememberedUser] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [users, setUsers] = useState([])

  useEffect(() => {
    // Recuperar usuario recordado del último login
    const savedRememberedUser = localStorage.getItem('facturx_remembered_user')
    if (savedRememberedUser) {
      try { setRememberedUser(JSON.parse(savedRememberedUser)) } catch {}
    }

    // Restaurar sesión activa desde sessionStorage (se limpia al cerrar pestaña)
    const token = sessionStorage.getItem('facturx_token')
    const savedUser = sessionStorage.getItem('facturx_user')
    if (token && savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser))
        setIsAuthenticated(true)
      } catch {}
    }
  }, [])

  // Cargar lista de usuarios desde el backend cuando el admin está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      fetch(`${API_URL}/users`, { headers: getAuthHeaders() })
        .then(res => res.ok ? res.json() : [])
        .then(data => setUsers(Array.isArray(data) ? data : []))
        .catch(() => setUsers([]))
    }
  }, [isAuthenticated])

  const login = async (username, credential, isPinOnly = false) => {
    try {
      let payload = { username, credential, type: 'password' };
      if (isPinOnly && rememberedUser) {
        payload = { username: rememberedUser.username, credential, type: 'pin' };
      }

      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        const foundUser = data.user;

        setCurrentUser(foundUser)
        setIsAuthenticated(true)

        // Recordar usuario (sin pin, sin datos sensibles)
        const rememberObj = {
          username: foundUser.username,
          name: foundUser.name,
          role: foundUser.role,
          photoUrl: foundUser.photoUrl
        }
        setRememberedUser(rememberObj)
        localStorage.setItem('facturx_remembered_user', JSON.stringify(rememberObj))

        // Token en sessionStorage (más seguro que localStorage — se borra al cerrar pestaña)
        sessionStorage.setItem('facturx_token', data.access_token)
        sessionStorage.setItem('facturx_user', JSON.stringify(foundUser))

        return true;
      }
      return false;
    } catch (error) {
      console.error('Error in login:', error);
      return false;
    }
  }

  const logout = () => {
    setIsAuthenticated(false)
    setCurrentUser(null)
    setUsers([])
    sessionStorage.removeItem('facturx_token')
    sessionStorage.removeItem('facturx_user')
    // localStorage solo guarda el "recuerda quién soy" — no el token
  }

  const clearRememberedUser = () => {
    setRememberedUser(null)
    localStorage.removeItem('facturx_remembered_user')
  }

  const createUser = async (firstName, lastName, role) => {
    const username = `${firstName.toLowerCase().trim()}.${lastName.toLowerCase().trim()}`
    const defaultPin = '123456'
    try {
      const res = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: `${firstName} ${lastName}`,
          username,
          pin: defaultPin,
          role: role || 'EMPLEADO',
        })
      })
      if (!res.ok) throw new Error('Error creando usuario')
      const newUser = await res.json()
      setUsers(prev => [...prev, newUser])
      return { ...newUser, tempPin: defaultPin }
    } catch (err) {
      console.error('Error creating user:', err)
      return null
    }
  }

  const updateUserDetails = async (id, newRole, newName, newPhotoUrl) => {
    try {
      const res = await fetch(`${API_URL}/users/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ role: newRole, name: newName, photourl: newPhotoUrl })
      })
      if (!res.ok) throw new Error('Error actualizando usuario')
      const updated = await res.json()
      setUsers(prev => prev.map(u => u.id === id ? updated : u))
      if (currentUser?.id === id) setCurrentUser(updated)
    } catch (err) {
      console.error('Error updating user:', err)
    }
  }

  const deleteUser = async (id) => {
    try {
      await fetch(`${API_URL}/users/${id}`, { method: 'DELETE', headers: getAuthHeaders() })
      setUsers(prev => prev.filter(u => u.id !== id))
    } catch (err) {
      console.error('Error deleting user:', err)
    }
  }

  const resetUserPassword = async (id) => {
    try {
      await fetch(`${API_URL}/users/${id}/reset-pin`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ newPin: '123456' })
      })
    } catch (err) {
      console.error('Error resetting pin:', err)
    }
  }

  const updatePassword = async (newPassword, newPin, securityQuestion, securityAnswer) => {
    if (!currentUser) return
    try {
      const res = await fetch(`${API_URL}/users/${currentUser.id}/setup-credentials`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ newPassword, newPin, securityQuestion, securityAnswer })
      })
      if (!res.ok) throw new Error('Error')
      const updatedUser = { ...currentUser, mustchangepassword: false }
      setCurrentUser(updatedUser)
      sessionStorage.setItem('facturx_user', JSON.stringify(updatedUser))
    } catch (err) {
      console.error('Error updating credentials:', err)
      throw err;
    }
  }

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      rememberedUser,
      currentUser,
      users,
      login,
      logout,
      clearRememberedUser,
      createUser,
      updatePassword,
      deleteUser,
      updateUserDetails,
      resetUserPassword
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
