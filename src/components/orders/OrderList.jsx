import { useState } from 'react'
import { useOrders } from '../../hooks/useOrders'
import { useInvoices } from '../../hooks/useInvoices'
import { useConfirm } from '../../contexts/ConfirmContext'
import { motion, AnimatePresence } from 'framer-motion'
import { generateTicketCanvas, doDownloadReceiptImage, doSendReceiptViaWhatsApp, doPrintAdvanceTicket } from '../../utils/receiptGenerator'
import toast from 'react-hot-toast'

export default function OrderList() {
  const { orders, updateOrderStatus, deleteOrder, loading } = useOrders()
  const { invoices, addInvoice } = useInvoices()
  const confirm = useConfirm()
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [advanceModal, setAdvanceModal] = useState({ isOpen: false, order: null, action: null, amount: 0, format: '80mm', hasShipping: false, shippingCost: 0, paymentMethod: 'Efectivo' });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(price);
  }

  const handleStatusChange = async (id, newStatus) => {
    updateOrderStatus(id, newStatus)
  }

  const notifyReadyViaWhatsApp = (order) => {
    const customerPhone = order.customer_phone || '';
    
    let phone = customerPhone.replace(/\D/g, '');
    if (phone.length === 10) {
      phone = '57' + phone;
    }

    const text = `¡Hola! Te informamos que tu pedido ya está terminado y listo para ser recogido en nuestro negocio. ¡Te esperamos!`;
    
    if (phone) {
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
    } else {
      toast.error("El cliente no proporcionó número de teléfono.");
    }
  }

  const openAdvanceModal = (order, action) => {
    const existingInvoice = invoices.find(inv => inv.orderId === order.id);
    let amount = order.total / 2;
    let method = 'Efectivo';
    
    if (existingInvoice && existingInvoice.amountPaid > 0) {
      amount = existingInvoice.amountPaid;
      if (existingInvoice.payments && existingInvoice.payments.length > 0) {
        method = existingInvoice.payments[existingInvoice.payments.length - 1].method || 'Efectivo';
      }
    }

    setAdvanceModal({
      isOpen: true,
      order,
      action,
      amount,
      format: '80mm',
      hasShipping: false,
      shippingCost: 0,
      paymentMethod: method
    });
  };

  const registerInvoiceFromOrder = (order, advanceAmount, method, hasShipping, shippingCost) => {
    if (invoices.some(inv => inv.orderId === order.id)) return;
    
    const totalConEnvio = order.total + (hasShipping ? shippingCost : 0);
    const invoiceData = {
      clientName: order.customer_name || 'Desconocido',
      document: '',
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 15*86400000).toISOString().split('T')[0],
      items: order.items || [],
      subtotal: order.total,
      discount: 0,
      tax: 0,
      total: totalConEnvio,
      amountPaid: advanceAmount,
      status: 'pendiente',
      notes: hasShipping ? `Incluye costo de envío: ${formatPrice(shippingCost)}` : '',
      orderId: order.id,
      payments: [{
        amount: advanceAmount,
        method: method,
        date: new Date().toISOString(),
        notes: 'Abono inicial'
      }]
    };
    addInvoice(invoiceData);
  };

  const doNotifyAdvanceViaWhatsApp = (order, advanceAmount, hasShipping, shippingCost) => {
    const customerPhone = order.customer_phone || '';
    if (!customerPhone) {
      toast.error("Sin número registrado. Selecciona el contacto en WhatsApp.");
    }
    
    let phone = customerPhone.replace(/\D/g, '');
    if (phone.length === 10) {
      phone = '57' + phone;
    }

    const totalConEnvio = order.total + (hasShipping ? shippingCost : 0);
    const balance = totalConEnvio - advanceAmount;

    let text = `¡Hola! Hemos recibido tu pedido con éxito por un valor de ${formatPrice(order.total)}.`;
    if (hasShipping && shippingCost > 0) {
      text += `%0AMás costo de envío: ${formatPrice(shippingCost)}.%0A*Total a Pagar:* ${formatPrice(totalConEnvio)}.`;
    }
    text += `%0A%0APara proceder con la confección, te solicitamos amablemente realizar un abono por el valor de *${formatPrice(advanceAmount)}*.`;
    text += `%0AEl saldo pendiente será de ${formatPrice(balance)}.`;
    text += `%0A%0APuedes realizar el pago a:%0A- *Nequi*: 3215028653%0A- *Bancolombia*: (Ingresa tu # de cuenta)%0A%0A_El pago se encuentra sujeto a verificación una vez enviado el comprobante por este medio._ ¡Quedamos muy atentos!`;
    
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
    
    if (order.status === 'pending') {
      updateOrderStatus(order.id, 'confirmed');
    }
  };

  const handleDelete = async (id) => {
    const isConfirmed = await confirm({
      title: 'Eliminar Pedido',
      message: '¿Estás seguro de que deseas eliminar este pedido? Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      isDestructive: true
    })
    
    if (isConfirmed) {
      deleteOrder(id)
      if (selectedOrder?.id === id) {
        setSelectedOrder(null)
      }
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span style={{ background: '#fef3c7', color: '#d97706', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>Pendiente</span>
      case 'confirmed':
        return <span style={{ background: '#dcfce7', color: '#16a34a', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>Confirmado</span>
      case 'cancelled':
        return <span style={{ background: '#fee2e2', color: '#ef4444', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>Cancelado</span>
      default:
        return <span style={{ background: '#f1f5f9', color: '#64748b', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>{status}</span>
    }
  }

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Cargando pedidos...</div>
  }

  return (
    <div style={{ background: '#e8efe9', borderRadius: '24px', padding: '24px', display: 'flex', gap: '20px', minHeight: '100%', flexDirection: 'column' }}>
      <h2 style={{ margin: 0, color: '#184a2c', fontSize: '1.6rem' }}>Pedidos Recibidos</h2>
      
      <div style={{ display: 'flex', gap: '20px', flex: 1 }}>
        {/* Tabla de Pedidos */}
        <div style={{ flex: 1, background: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div className="table-responsive" style={{ flex: 1 }}>
            <table className="products-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '12px', borderBottom: '2px solid #f1f5f9', color: '#64748b' }}>Fecha</th>
                  <th style={{ textAlign: 'left', padding: '12px', borderBottom: '2px solid #f1f5f9', color: '#64748b' }}>Cliente</th>
                  <th style={{ textAlign: 'left', padding: '12px', borderBottom: '2px solid #f1f5f9', color: '#64748b' }}>Total</th>
                  <th style={{ textAlign: 'left', padding: '12px', borderBottom: '2px solid #f1f5f9', color: '#64748b' }}>Estado</th>
                  <th style={{ textAlign: 'center', padding: '12px', borderBottom: '2px solid #f1f5f9', color: '#64748b' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer', background: selectedOrder?.id === order.id ? '#f8fafc' : 'transparent' }} onClick={() => setSelectedOrder(order)}>
                    <td style={{ padding: '12px' }}>{new Date(order.created_at).toLocaleDateString()} {new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#1e293b' }}>{order.customer_name || 'Desconocido'}</td>
                    <td style={{ padding: '12px', color: '#184a2c', fontWeight: 'bold' }}>{formatPrice(order.total)}</td>
                    <td style={{ padding: '12px' }}>{getStatusBadge(order.status)}</td>
                    <td style={{ padding: '12px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                      {order.status !== 'confirmed' && (
                        <button onClick={(e) => { e.stopPropagation(); handleStatusChange(order.id, 'confirmed'); }} title="Confirmar Pedido" style={{ background: '#dcfce7', color: '#16a34a', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </button>
                      )}
                      {(order.status === 'confirmed' || invoices.some(inv => inv.orderId === order.id && inv.amountPaid > 0)) && order.customer_phone && (
                        <button onClick={(e) => { e.stopPropagation(); openAdvanceModal(order, 'sendReceipt'); }} title="Enviar Comprobante por WhatsApp" style={{ background: '#fef9c3', color: '#ca8a04', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"></path><path d="M22 2L15 22L11 13L2 9L22 2z"></path></svg>
                        </button>
                      )}
                      <button onClick={(e) => { e.stopPropagation(); openAdvanceModal(order, 'ticket'); }} title="Imprimir Ticket de Abono" style={{ background: '#f3e8ff', color: '#9333ea', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                      </button>
                      {order.customer_phone && (
                        <>
                          <button onClick={(e) => { e.stopPropagation(); openAdvanceModal(order, 'whatsapp'); }} title="Solicitar Abono por WhatsApp" style={{ background: '#e0f2fe', color: '#0284c7', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); notifyReadyViaWhatsApp(order); }} title="Notificar por WhatsApp que está listo" style={{ background: '#d1fae5', color: '#059669', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                          </button>
                        </>
                      )}
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(order.id); }} title="Eliminar" style={{ background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                      No se han recibido pedidos aún. Comparte tu catálogo público para comenzar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Panel de Detalles */}
        {selectedOrder && (
          <div style={{ width: '350px', background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px 0', color: '#1e293b' }}>Detalles del Pedido</h3>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{new Date(selectedOrder.created_at).toLocaleString()}</span>
              </div>
              {getStatusBadge(selectedOrder.status)}
            </div>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#64748b' }}>Cliente</p>
              <p style={{ margin: 0, fontWeight: 'bold', color: '#1e293b', fontSize: '1.1rem' }}>{selectedOrder.customer_name || 'Desconocido'}</p>
              {selectedOrder.customer_phone && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                  <p style={{ margin: 0, color: '#3b82f6', fontWeight: 'bold' }}>{selectedOrder.customer_phone}</p>
                  <button onClick={() => notifyReadyViaWhatsApp(selectedOrder)} style={{ background: '#25D366', color: '#fff', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    Avisar Listo
                  </button>
                </div>
              )}
            </div>

            <h4 style={{ margin: '0 0 12px 0', color: '#1e293b' }}>Artículos ({selectedOrder.items?.length || 0})</h4>
            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '20px', paddingRight: '10px' }}>
              {selectedOrder.items?.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', color: '#1e293b' }}>{item.name}</p>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>{item.qty} x {formatPrice(item.price)}</p>
                  </div>
                  <div style={{ fontWeight: 'bold', color: '#184a2c' }}>
                    {formatPrice(item.price * item.qty)}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '2px solid #f1f5f9', paddingTop: '16px', marginTop: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.1rem', color: '#64748b', fontWeight: 'bold' }}>Total a Pagar</span>
                <span style={{ fontSize: '1.4rem', color: '#184a2c', fontWeight: 'bold' }}>{formatPrice(selectedOrder.total)}</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
              <button onClick={() => updateOrderStatus(selectedOrder.id, 'cancelled')} style={{ flex: 1, minWidth: '120px', padding: '12px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Cancelar</button>
              
              {selectedOrder.status !== 'confirmed' && (
                <button onClick={() => updateOrderStatus(selectedOrder.id, 'confirmed')} style={{ flex: 1, minWidth: '120px', padding: '12px', background: '#dcfce7', color: '#16a34a', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Confirmar</button>
              )}

              {selectedOrder.status === 'confirmed' && selectedOrder.customer_phone && (
                <button onClick={() => openAdvanceModal(selectedOrder, 'sendReceipt')} style={{ flex: 1, minWidth: '120px', padding: '12px', background: '#fef9c3', color: '#ca8a04', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"></path><path d="M22 2L15 22L11 13L2 9L22 2z"></path></svg>
                  Enviar Comprobante
                </button>
              )}
              
              <button onClick={() => openAdvanceModal(selectedOrder, 'ticket')} style={{ flex: 1, minWidth: '120px', padding: '12px', background: '#f3e8ff', color: '#9333ea', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                Ticket Abono
              </button>

              {selectedOrder.customer_phone && (
                <button onClick={() => openAdvanceModal(selectedOrder, 'whatsapp')} style={{ flex: 1, minWidth: '120px', padding: '12px', background: '#e0f2fe', color: '#0284c7', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                  Pedir Abono
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal estético para el Abono con Animaciones Orgánicas */}
      <AnimatePresence>
        {advanceModal.isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{ background: '#fff', padding: '24px', borderRadius: '16px', width: '90%', maxWidth: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}
            >
              <h3 style={{ margin: '0 0 16px 0', color: '#184a2c', fontSize: '1.2rem' }}>
                {advanceModal.action === 'whatsapp' && 'Solicitar Abono por WhatsApp'}
                {advanceModal.action === 'ticket' && 'Registrar Abono en Ticket'}
                {advanceModal.action === 'sendReceipt' && 'Enviar Comprobante (WhatsApp)'}
              </h3>
            
            <label style={{ display: 'block', marginBottom: '8px', color: '#64748b', fontSize: '0.9rem', fontWeight: 'bold' }}>Valor del Abono:</label>
            <div style={{ position: 'relative', marginBottom: '16px' }}>
              <span style={{ position: 'absolute', left: '12px', top: '10px', color: '#64748b', fontWeight: 'bold' }}>$</span>
              <input 
                type="number" 
                min="0"
                step="1"
                value={advanceModal.amount} 
                onChange={(e) => setAdvanceModal(prev => ({...prev, amount: parseFloat(e.target.value) || 0}))}
                style={{ width: '100%', boxSizing: 'border-box', padding: '10px 10px 10px 25px', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '1.1rem', outline: 'none' }}
                onFocus={(e) => e.target.style.borderColor = '#184a2c'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
              <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                Total del pedido: {formatPrice(advanceModal.order?.total)} (50% sugerido: {formatPrice((advanceModal.order?.total || 0) / 2)})
              </p>
            </div>

            {/* Opciones Adicionales */}
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '24px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: advanceModal.hasShipping ? '12px' : '0' }}>
                <input 
                  type="checkbox" 
                  checked={advanceModal.hasShipping}
                  onChange={(e) => setAdvanceModal(prev => ({...prev, hasShipping: e.target.checked}))}
                  style={{ accentColor: '#184a2c', width: '16px', height: '16px' }}
                />
                <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#1e293b' }}>Incluir Costo de Envío</span>
              </label>
              
              {advanceModal.hasShipping && (
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '10px', color: '#64748b', fontWeight: 'bold' }}>$</span>
                  <input 
                    type="number" 
                    min="0"
                    step="1"
                    placeholder="Valor del domicilio"
                    value={advanceModal.shippingCost || ''} 
                    onChange={(e) => setAdvanceModal(prev => ({...prev, shippingCost: parseFloat(e.target.value) || 0}))}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '10px 10px 10px 25px', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '1rem', outline: 'none' }}
                    onFocus={(e) => e.target.style.borderColor = '#184a2c'}
                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  />
                </div>
              )}
              {advanceModal.action === 'ticket' && (
                <div style={{ marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#64748b', fontSize: '0.9rem', fontWeight: 'bold' }}>Medio de Pago:</label>
                  <select 
                    value={advanceModal.paymentMethod} 
                    onChange={e => setAdvanceModal(prev => ({...prev, paymentMethod: e.target.value}))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', outline: 'none', marginBottom: '16px' }}
                  >
                    <option value="Efectivo">Efectivo</option>
                    <option value="Transferencia">Transferencia Bancaria</option>
                    <option value="Tarjeta">Tarjeta (Datafono)</option>
                    <option value="Nequi/Daviplata">Nequi / Daviplata</option>
                    <option value="Otro">Otro</option>
                  </select>

                  <label style={{ display: 'block', marginBottom: '8px', color: '#64748b', fontSize: '0.9rem', fontWeight: 'bold' }}>Formato de Impresión:</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                      <input type="radio" name="format" checked={advanceModal.format === '80mm'} onChange={() => setAdvanceModal(prev => ({...prev, format: '80mm'}))} style={{ accentColor: '#184a2c' }} />
                      <span style={{ fontSize: '0.9rem' }}>Tirilla (80mm)</span>
                    </label>
                    <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                      <input type="radio" name="format" checked={advanceModal.format === 'carta'} onChange={() => setAdvanceModal(prev => ({...prev, format: 'carta'}))} style={{ accentColor: '#184a2c' }} />
                      <span style={{ fontSize: '0.9rem' }}>Carta (PDF)</span>
                    </label>
                  </div>
                </div>
              )}

              {advanceModal.action === 'sendReceipt' && (
                <div style={{ marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#64748b', fontSize: '0.9rem', fontWeight: 'bold' }}>Medio de Pago:</label>
                  <select 
                    value={advanceModal.paymentMethod} 
                    onChange={e => setAdvanceModal(prev => ({...prev, paymentMethod: e.target.value}))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', outline: 'none' }}
                  >
                    <option value="Efectivo">Efectivo</option>
                    <option value="Transferencia">Transferencia Bancaria</option>
                    <option value="Tarjeta">Tarjeta (Datafono)</option>
                    <option value="Nequi/Daviplata">Nequi / Daviplata</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
              )}
            </div>
            
            {advanceModal.action === 'sendReceipt' ? (
              <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => setAdvanceModal({ isOpen: false, order: null, action: null, amount: 0, format: '80mm', hasShipping: false, shippingCost: 0, paymentMethod: 'Efectivo' })} style={{ flex: 1, padding: '10px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                    Cancelar
                  </button>
                  <button 
                    onClick={() => {
                      const { order, amount, hasShipping, shippingCost, paymentMethod } = advanceModal;
                      registerInvoiceFromOrder(order, amount, paymentMethod, hasShipping, shippingCost);
                      doDownloadReceiptImage(order, amount, hasShipping, shippingCost);
                    }} 
                    style={{ flex: 1, padding: '10px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                    Descargar Imagen
                  </button>
                </div>
                <button 
                  onClick={() => {
                    const { order, amount, hasShipping, shippingCost, paymentMethod } = advanceModal;
                    registerInvoiceFromOrder(order, amount, paymentMethod, hasShipping, shippingCost);
                    doSendReceiptViaWhatsApp(order, amount, hasShipping, shippingCost);
                    setAdvanceModal({ isOpen: false, order: null, action: null, amount: 0, format: '80mm', hasShipping: false, shippingCost: 0, paymentMethod: 'Efectivo' });
                  }} 
                  style={{ width: '100%', padding: '10px', background: '#184a2c', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Copiar & Enviar a WhatsApp
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setAdvanceModal({ isOpen: false, order: null, action: null, amount: 0, format: '80mm', hasShipping: false, shippingCost: 0, paymentMethod: 'Efectivo' })} style={{ flex: 1, padding: '10px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button 
                  onClick={() => {
                    const { order, action, amount, format, hasShipping, shippingCost, paymentMethod } = advanceModal;
                    setAdvanceModal({ isOpen: false, order: null, action: null, amount: 0, format: '80mm', hasShipping: false, shippingCost: 0, paymentMethod: 'Efectivo' });
                    if (action === 'whatsapp') doNotifyAdvanceViaWhatsApp(order, amount, hasShipping, shippingCost);
                    else if (action === 'ticket') {
                      registerInvoiceFromOrder(order, amount, paymentMethod, hasShipping, shippingCost);
                      doPrintAdvanceTicket(order, amount, format, hasShipping, shippingCost, "Comprobante de Anticipo");
                    }
                  }} 
                  style={{ flex: 1, padding: '10px', background: '#184a2c', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Aceptar
                </button>
              </div>
            )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
