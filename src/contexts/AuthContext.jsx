/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect } from 'react'

const AuthContext = createContext()

const DEFAULT_ADMIN = {
  id: 'u1',
  name: 'Carlos Miranda',
  role: 'DIRECTOR DE OPERACIONES',
  username: 'admin',
  pin: '1234',
  photoUrl: 'https://ui-avatars.com/api/?name=Carlos+Miranda&background=10b981&color=fff',
  mustChangePassword: false
}

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [rememberedUser, setRememberedUser] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [users, setUsers] = useState([])

  useEffect(() => {
    // Load users or init default admin
    const storedUsers = localStorage.getItem('facturx_users')
    let usersList = []
    if (storedUsers) {
      usersList = JSON.parse(storedUsers)
      setUsers(usersList)
    } else {
      usersList = [DEFAULT_ADMIN]
      setUsers(usersList)
      localStorage.setItem('facturx_users', JSON.stringify(usersList))
    }

    // Check if we have a remembered user
    const savedRememberedUser = localStorage.getItem('facturx_remembered_user')
    if (savedRememberedUser) {
      setRememberedUser(JSON.parse(savedRememberedUser))
    }

    // Restore active session if exists
    const activeSessionId = sessionStorage.getItem('facturx_session') || localStorage.getItem('facturx_session')
    if (activeSessionId) {
      const activeUser = usersList.find(u => u.id === activeSessionId)
      if (activeUser) {
        setCurrentUser(activeUser)
        setIsAuthenticated(true)
      }
    }
  }, [])

  const saveUsers = (newUsers) => {
    setUsers(newUsers)
    localStorage.setItem('facturx_users', JSON.stringify(newUsers))
  }

  const login = async (username, pin, isPinOnly = false) => {
    try {
      let payload = { username, pin };
      if (isPinOnly && rememberedUser) {
        payload.username = rememberedUser.username;
        payload.pin = username; // username parameter actually receives the pin in this case
      }

      const response = await fetch(`http://${window.location.hostname}:3000/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        const foundUser = data.user;
        
        setCurrentUser(foundUser)
        setIsAuthenticated(true)
        
        const rememberObj = {
          username: foundUser.username,
          name: foundUser.name,
          role: foundUser.role,
          photoUrl: foundUser.photoUrl
        }
        setRememberedUser(rememberObj)
        localStorage.setItem('facturx_remembered_user', JSON.stringify(rememberObj))
        
        localStorage.setItem('facturx_session', foundUser.id)
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
    localStorage.removeItem('facturx_session')
    sessionStorage.removeItem('facturx_session')
  }

  const clearRememberedUser = () => {
    setRememberedUser(null)
    localStorage.removeItem('facturx_remembered_user')
  }

  const createUser = (firstName, lastName, role) => {
    const username = `${firstName.toLowerCase().trim()}.${lastName.toLowerCase().trim()}`
    const newUser = {
      id: Date.now().toString(),
      name: `${firstName} ${lastName}`,
      role: role || 'EMPLEADO',
      username: username,
      pin: '123456', // Default password/pin
      photoUrl: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=0f172a&color=fff`,
      mustChangePassword: true
    }
    saveUsers([...users, newUser])
    return newUser
  }

  const updatePassword = (newPassword) => {
    if (!currentUser) return
    
    const updatedUsers = users.map(u => {
      if (u.id === currentUser.id) {
        return { ...u, pin: newPassword, mustChangePassword: false }
      }
      return u
    })
    
    saveUsers(updatedUsers)
    setCurrentUser({ ...currentUser, pin: newPassword, mustChangePassword: false })
  }

  const deleteUser = (id) => {
    saveUsers(users.filter(u => u.id !== id))
  }

  const updateUserDetails = (id, newRole, newName, newPhotoUrl) => {
    const updatedUsers = users.map(u => {
      if (u.id === id) {
        return { ...u, role: newRole, name: newName, photoUrl: newPhotoUrl || u.photoUrl }
      }
      return u
    })
    saveUsers(updatedUsers)
    if (currentUser?.id === id) {
      setCurrentUser(updatedUsers.find(u => u.id === id))
    }
  }

  const resetUserPassword = (id) => {
    const updatedUsers = users.map(u => {
      if (u.id === id) {
        return { ...u, pin: '123456', mustChangePassword: true }
      }
      return u
    })
    saveUsers(updatedUsers)
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
