import OrderActionGroup from './actions/OrderActionGroup';
import OrderTableRow from './OrderTableRow';
export default function OrderTable({ orders, selectedOrder, setSelectedOrder, invoices, actions }) {
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
    <div style={{ flex: 1, background: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', minHeight: '400px', overflow: 'visible' }}>
      <div style={{ flex: 1, overflow: 'visible' }}>
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
            {orders.map(order => {
              const hasInvoice = invoices.some(inv => inv.orderId === order.id && inv.amountPaid > 0);
              
              return (
                <OrderTableRow 
                  key={order.id} 
                  order={order} 
                  hasInvoice={hasInvoice} 
                  actions={actions} 
                  isSelected={selectedOrder?.id === order.id}
                  onSelect={() => setSelectedOrder(order)}
                />
              );
            })}
            {orders.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  No se han recibido pedidos aún. Comparte tu catálogo público para comenzar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
