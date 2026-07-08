import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ConfirmProvider } from './contexts/ConfirmContext'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import { setupFetchInterceptor } from './utils/api'

setupFetchInterceptor();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <ConfirmProvider>
          <App />
        </ConfirmProvider>
      </CartProvider>
    </AuthProvider>
  </StrictMode>,
)
