export default function OrderDetailPanel({ 
  selectedOrder, 
  updateOrderStatus, 
  onNotifyReady, 
  openAdvanceModal 
}) {
  if (!selectedOrder) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(price);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span style={{ background: '#fef3c7', color: '#d97706', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>Pendiente</span>;
      case 'confirmed':
        return <span style={{ background: '#dcfce7', color: '#16a34a', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>Confirmado</span>;
      case 'cancelled':
        return <span style={{ background: '#fee2e2', color: '#ef4444', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>Cancelado</span>;
      default:
        return <span style={{ background: '#f1f5f9', color: '#64748b', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>{status}</span>;
    }
  };

  return (
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
            <button onClick={() => onNotifyReady(selectedOrder)} style={{ background: '#25D366', color: '#fff', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              Avisar Listo
            </button>
          </div>
        )}
      </div>

      <h4 style={{ margin: '0 0 12px 0', color: '#1e293b' }}>Artículos ({selectedOrder.items?.length || 0})</h4>
      <div style={{ flex: 1, overflowY: 'auto', marginBottom: '20px', paddingRight: '10px' }}>
        {selectedOrder.items?.map((item, idx) => (
          <div key={idx} style={{ padding: '12px 0', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', color: '#1e293b' }}>{item.name}</p>
                
                {(item.shirtSize || item.pantsSize) && (
                  <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: '#64748b' }}>
                    {item.shirtSize && `Camisa: ${item.shirtSize} `}
                    {item.pantsSize && `Pantalón: ${item.pantsSize}`}
                  </p>
                )}

                {item.customDetails && item.customDetails.length > 0 && (
                  <div style={{ marginTop: '6px', marginBottom: '8px', padding: '6px 10px', background: '#e0e7ff', borderRadius: '8px', fontSize: '0.8rem', color: '#3730a3' }}>
                    <p style={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>Detalles de Bordado:</p>
                    {item.customDetails.map((detail, dIdx) => (
                      <div key={dIdx} style={{ marginBottom: '2px' }}>
                        <strong>{dIdx + 1}.</strong> {detail.name && `Nombre: ${detail.name} `}
                        {detail.rh && `(RH: ${detail.rh}) `}
                        {detail.club && `[Club: ${detail.club}]`}
                      </div>
                    ))}
                  </div>
                )}
                
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>{item.qty} x {formatPrice(item.price)}</p>
              </div>
              <div style={{ fontWeight: 'bold', color: '#184a2c', marginLeft: '10px' }}>
                {formatPrice(item.price * item.qty)}
              </div>
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
  );
}
