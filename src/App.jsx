import { useState, useEffect } from 'react'
import { useInvoices } from './hooks/useInvoices'
import InvoiceForm from './components/invoices/InvoiceForm'
import InvoiceList from './components/invoices/InvoiceList'
import InvoicePreview from './components/invoices/InvoicePreview'
import ProductList from './components/products/ProductList'
import UserList from './components/users/UserList'
import OrderList from './components/orders/OrderList'
import MainLayout from './components/ui/MainLayout'
import { motion, AnimatePresence } from 'framer-motion'
import { useConfirm } from './contexts/ConfirmContext'
import { useAuth } from './contexts/AuthContext'
import useSound from 'use-sound'
import toast, { Toaster } from 'react-hot-toast'
import { socket, connectSocket, disconnectSocket } from './utils/socketManager'
import LoginScreen from './components/auth/LoginScreen'
import ChangePasswordScreen from './components/auth/ChangePasswordScreen'
import PublicCatalog from './components/products/PublicCatalog'
import './App.css'
import './PWA.css'
import PaymentPage from './components/payments/PaymentPage'
import SetupCredentialsModal from './components/auth/SetupCredentialsModal'
import ServerWakeupLoader from './components/shared/ServerWakeupLoader'

import { useProducts } from './hooks/useProducts'
import { useOrders } from './hooks/useOrders'

export default function App() {
  const { isAuthenticated, currentUser } = useAuth()
  const { invoices, editingInvoice, addInvoice, updateInvoice, deleteInvoice, addPayment, startEdit, clearEdit, peekNextNumber } = useInvoices()
  const productsState = useProducts()
  const ordersState = useOrders()
  const confirm = useConfirm()
  const [view, setView] = useState('list') // 'list', 'form', 'products'
  const [previewInvoice, setPreviewInvoice] = useState(null)

  const [playAlert] = useSound('/sounds/new-order-alert.ogg', { volume: 0.5 });

  useEffect(() => {
    // Solicitar permisos de notificación nativa al cargar
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    if (!isAuthenticated) return;

    const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3000`;
    
    connectSocket();

    // Limpiamos los listeners antes de agregarlos para evitar duplicados
    socket.off('new_order');

    socket.on('new_order', (newOrder) => {
      // Reproducir sonido
      playAlert().catch(e => console.log('Autoplay bloqueado', e));
      
      // Notificación nativa (OS)
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🛒 ¡Nuevo Pedido en Línea!', {
          body: `Recibiste un pedido de ${newOrder.customer_name || 'Alguien'}. Total: $${newOrder.total}`,
          icon: '/src/assets/ico/ico1.png'
        });
      }

      // Toast en pantalla
      toast.success(`¡Nuevo pedido de ${newOrder.customer_name || 'Alguien'}!`, {
        duration: 5000,
        position: 'top-right',
        style: {
          background: '#184a2c',
          color: '#fff',
          fontWeight: 'bold'
        },
        icon: '🛍️',
      });
    });

    return () => {
      socket.off('new_order');
      // No desconectamos el socket completo aquí para evitar el error de conexión interrumpida en StrictMode
    }
  }, [isAuthenticated, playAlert]);

  const isCatalogRoute = window.location.pathname === '/' || window.location.pathname === '/index.html' || window.location.pathname === '';

  // La raíz siempre es el catálogo público para todos (autenticados o no)
  if (isCatalogRoute) {
    return <PublicCatalog />;
  }

  const isPayRoute = window.location.pathname.startsWith('/pagar');
  if (isPayRoute) {
    return <PaymentPage />;
  }

  if (!isAuthenticated) {
    return <LoginScreen />
  }

  if (currentUser?.mustchangepassword) {
    // The SetupCredentialsModal handles the password change over the layout
  }

  function handleSubmit(invoiceData) {
    let savedInvoice
    
    if (invoiceData.isOrder) {
      const newOrderId = 'ord-' + Date.now().toString(36)
      invoiceData.orderId = newOrderId
      
      const orderItems = invoiceData.items.map(item => ({
        id: 'manual-' + Date.now().toString(36),
        name: item.description,
        qty: item.quantity,
        price: item.unitPrice
      }))
      
      const orderData = {
        id: newOrderId,
        total: invoiceData.total,
        items: orderItems,
        customer_name: invoiceData.clientName || 'Cliente en mostrador',
        customer_phone: invoiceData.clientPhone || '', 
        status: 'confirmed'
      }
      
      const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3000`;
      fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      }).then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        toast.success("Pedido creado y enviado a la sección de Pedidos Recibidos", {
          style: { background: '#184a2c', color: '#fff', fontWeight: 'bold' }
        })
      }).catch(error => {
        console.error("Error creating manual order:", error)
      })
    }

    if (editingInvoice) {
      updateInvoice(editingInvoice.id, invoiceData)
      savedInvoice = { ...invoiceData, id: editingInvoice.id }
      clearEdit()
    } else {
      savedInvoice = addInvoice(invoiceData)
    }
    setPreviewInvoice(savedInvoice)
    // No cambiamos a 'list', nos quedamos donde estamos para que al cerrar el modal siga en Nueva Factura (o lo mandamos a list si prefieres, lo mandaré a list pero por detrás del modal)
    setView('list')
  }

  function handleEdit(invoice) {
    startEdit(invoice)
    setView('form')
  }

  async function handleDelete(id) {
    const isConfirmed = await confirm({
      title: 'Eliminar Factura',
      message: '¿Estás seguro de que deseas eliminar esta factura de forma permanente?',
      confirmText: 'Eliminar',
      isDestructive: true
    })
    
    if (isConfirmed) {
      deleteInvoice(id)
    }
  }

  return (
    <>
      <Toaster />
      <ServerWakeupLoader />
      <div className="app-container">
      <SetupCredentialsModal />
      <MainLayout 
        view={view} 
        setView={setView} 
        clearEdit={clearEdit} 
        editingInvoice={editingInvoice}
      >
        <AnimatePresence mode="wait">
          {view === 'form' ? (
            <motion.div key="form" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.15 }}>
              <InvoiceForm onSubmit={handleSubmit} editingInvoice={editingInvoice} onCancelEdit={() => { clearEdit(); setView('list') }} nextInvoiceNumber={peekNextNumber()} />
            </motion.div>
          ) : view === 'products' ? (
            <motion.div key="products" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>
              <ProductList productsState={productsState} />
            </motion.div>
          ) : view === 'orders' ? (
            <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>
              <OrderList ordersState={ordersState} />
            </motion.div>
          ) : view === 'users' ? (
            <motion.div key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>
              <UserList />
            </motion.div>
          ) : (
            <motion.div key="list" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.15 }}>
              <InvoiceList invoices={invoices} onSelect={setPreviewInvoice} onEdit={handleEdit} onDelete={handleDelete} onAddPayment={addPayment} />
            </motion.div>
          )}
        </AnimatePresence>
      </MainLayout>

      {previewInvoice && (
        <InvoicePreview invoice={previewInvoice} onClose={() => setPreviewInvoice(null)} />
      )}
      </div>
    </>
  )
}
