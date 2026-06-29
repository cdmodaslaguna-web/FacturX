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
import { supabase } from './supabaseClient'
import LoginScreen from './components/auth/LoginScreen'
import ChangePasswordScreen from './components/auth/ChangePasswordScreen'
import PublicCatalog from './components/products/PublicCatalog'
import './App.css'
import './PWA.css'

export default function App() {
  const { isAuthenticated, currentUser } = useAuth()
  const { invoices, editingInvoice, addInvoice, updateInvoice, deleteInvoice, getInvoice, addPayment, startEdit, clearEdit, peekNextNumber } = useInvoices()
  const confirm = useConfirm()
  const [view, setView] = useState('list') // 'list', 'form', 'products'
  const [previewInvoice, setPreviewInvoice] = useState(null)

  const isLoginRoute = window.location.pathname === '/login';

  const [playAlert] = useSound('https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg', { volume: 0.5 });

  useEffect(() => {
    if (!isAuthenticated) return;

    const channel = supabase
      .channel('public:orders')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, payload => {
        playAlert();
        toast.success(`¡Nuevo pedido de ${payload.new.customer_name || 'Alguien'}!`, {
          duration: 5000,
          position: 'top-right',
          style: {
            background: '#184a2c',
            color: '#fff',
            fontWeight: 'bold'
          },
          icon: '🛍️',
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    }
  }, [isAuthenticated, playAlert]);

  const isCatalogRoute = window.location.pathname === '/' || window.location.pathname === '/index.html' || window.location.pathname === '';

  // La raíz siempre es el catálogo público para todos (autenticados o no)
  if (isCatalogRoute) {
    return <PublicCatalog />;
  }

  if (!isAuthenticated) {
    return <LoginScreen />
  }

  if (currentUser?.mustChangePassword) {
    return <ChangePasswordScreen />
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
      
      supabase.from('orders').insert([orderData]).then(({ error }) => {
        if (error) {
          console.error("Error creating manual order:", error)
        } else {
          toast.success("Pedido creado y enviado a la sección de Pedidos Recibidos", {
            style: { background: '#184a2c', color: '#fff', fontWeight: 'bold' }
          })
        }
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
      <MainLayout 
        view={view} 
        setView={setView} 
        clearEdit={clearEdit} 
        editingInvoice={editingInvoice}
      >
        <AnimatePresence mode="wait">
          {view === 'form' ? (
            <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
              <InvoiceForm onSubmit={handleSubmit} editingInvoice={editingInvoice} onCancelEdit={() => { clearEdit(); setView('list') }} nextInvoiceNumber={peekNextNumber()} />
            </motion.div>
          ) : view === 'products' ? (
            <motion.div key="products" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              <ProductList />
            </motion.div>
          ) : view === 'orders' ? (
            <motion.div key="orders" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              <OrderList />
            </motion.div>
          ) : view === 'users' ? (
            <motion.div key="users" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              <UserList />
            </motion.div>
          ) : (
            <motion.div key="list" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
              <InvoiceList invoices={invoices} onSelect={setPreviewInvoice} onEdit={handleEdit} onDelete={handleDelete} onAddPayment={addPayment} />
            </motion.div>
          )}
        </AnimatePresence>
      </MainLayout>

      {previewInvoice && (
        <InvoicePreview invoice={previewInvoice} onClose={() => setPreviewInvoice(null)} />
      )}
    </>
  )
}
