import { useState } from 'react';
import { useOrders } from '../../hooks/useOrders';
import { useInvoices } from '../../hooks/useInvoices';
import { useConfirm } from '../../contexts/ConfirmContext';
import { doDownloadReceiptImage, doSendReceiptViaWhatsApp, doPrintAdvanceTicket, doCopyReceiptImage } from '../../utils/receiptGenerator';
import toast from 'react-hot-toast';

import OrderTable from './OrderTable';
import OrderDetailPanel from './OrderDetailPanel';

export default function OrderList({ ordersState }) {
  const { orders, updateOrderStatus, deleteOrder, loading } = ordersState;
  const { invoices, addInvoice } = useInvoices();
  const confirm = useConfirm();
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // We keep track of which row has which action open
  const [activeRowAction, setActiveRowAction] = useState({ orderId: null, action: null });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(price);
  };

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

    const numTotal = Number(order.total) || 0;
    const numShipping = Number(shippingCost) || 0;
    const numAdvance = Number(advanceAmount) || 0;

    const totalConEnvio = numTotal + (hasShipping ? numShipping : 0);
    const balance = totalConEnvio - numAdvance;

    let text = `*NUEVO PEDIDO RECIBIDO*\n*Casa de Modas Esperanza Laguna*\n\n¡Hola! Hemos recibido tu pedido con éxito por un valor de *${formatPrice(numTotal)}*.`;
    if (hasShipping && numShipping > 0) {
      text += `\nMás costo de envío: *${formatPrice(numShipping)}*.\n*Total a Pagar:* ${formatPrice(totalConEnvio)}.`;
    }
    text += `\n\nPara proceder con la confección, te solicitamos amablemente realizar un abono por el valor de *${formatPrice(numAdvance)}*.`;
    text += `\nEl saldo pendiente será de *${formatPrice(balance)}*.`;
    
    text += `\n\n*Puedes realizar tu pago de forma segura aquí:*\n ${window.location.origin}/pagar?amount=${numAdvance}&ref=${order.id}\n\n`;
    
    text += `O si prefieres, también recibimos transferencias a:\n- *Nequi*: 3215028653\n- *Bancolombia*: (Ingresa tu # de cuenta)\n\n_El pago se encuentra sujeto a verificación. ¡Quedamos muy atentos!_`;
    
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
    
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
    });
    
    if (isConfirmed) {
      deleteOrder(id);
      if (selectedOrder?.id === id) {
        setSelectedOrder(null);
      }
    }
  };

  const actions = {
    onConfirm: (order) => updateOrderStatus(order.id, 'confirmed'),
    onSendReceipt: (order, amount, format, hasShipping, shippingCost, paymentMethod, isDownload) => {
      registerInvoiceFromOrder(order, amount, paymentMethod, hasShipping, shippingCost);
      if (isDownload) {
        doDownloadReceiptImage(order, amount, format, hasShipping, shippingCost);
      } else {
        doSendReceiptViaWhatsApp(order, amount, format, hasShipping, shippingCost);
      }
    },
    onCopyReceiptImage: (order, amount, format, hasShipping, shippingCost, paymentMethod) => {
      registerInvoiceFromOrder(order, amount, paymentMethod, hasShipping, shippingCost);
      doCopyReceiptImage(order, amount, format, hasShipping, shippingCost);
    },
    onPrintTicket: (order, amount, format, hasShipping, shippingCost, paymentMethod) => {
      registerInvoiceFromOrder(order, amount, paymentMethod, hasShipping, shippingCost);
      doPrintAdvanceTicket(order, amount, format, hasShipping, shippingCost, "Comprobante de Anticipo");
    },
    onRequestAdvance: (order, amount, format, hasShipping, shippingCost, paymentMethod) => {
      doNotifyAdvanceViaWhatsApp(order, amount, hasShipping, shippingCost);
    },
    onNotifyReady: (order) => notifyReadyViaWhatsApp(order),
    onDelete: (id) => handleDelete(id),
    
    // State management for inline row forms
    activeRowAction,
    setActiveRowAction
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Cargando pedidos...</div>;
  }

  return (
    <div style={{ background: '#e8efe9', borderRadius: '24px', padding: '24px', display: 'flex', gap: '20px', minHeight: '100%', flexDirection: 'column' }}>
      <h2 style={{ margin: 0, color: '#184a2c', fontSize: '1.6rem' }}>Pedidos Recibidos</h2>
      
      <div style={{ display: 'flex', gap: '20px', flex: 1 }}>
        <OrderTable 
          orders={orders}
          selectedOrder={selectedOrder}
          setSelectedOrder={setSelectedOrder}
          invoices={invoices}
          actions={actions}
        />

        <OrderDetailPanel 
          selectedOrder={selectedOrder}
          updateOrderStatus={updateOrderStatus}
          onNotifyReady={notifyReadyViaWhatsApp}
          actions={actions}
          invoices={invoices}
        />
      </div>
    </div>
  );
}
