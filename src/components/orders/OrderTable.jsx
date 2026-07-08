import OrderActionGroup from './actions/OrderActionGroup';
import OrderTableRow from './OrderTableRow';
export default function OrderTable({ orders, selectedOrder, setSelectedOrder, invoices, actions, hasMore, loadMore, loadingMore }) {
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
    <div style={{ flex: 1, background: 'transparent', display: 'flex', flexDirection: 'column', minHeight: '400px' }}>
      <div className="orders-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', width: '100%', alignItems: 'start' }}>
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
        {orders.length === 0 && !loadingMore && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#64748b', background: '#fff', borderRadius: '16px' }}>
            No se han recibido pedidos aún. Comparte tu catálogo público para comenzar.
          </div>
        )}
      </div>

      {hasMore && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px', paddingBottom: '20px' }}>
          <button 
            onClick={loadMore}
            disabled={loadingMore}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              background: '#e2e8f0',
              color: '#334155',
              cursor: loadingMore ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.2s',
              opacity: loadingMore ? 0.7 : 1
            }}
          >
            {loadingMore ? 'Cargando...' : 'Cargar más pedidos'}
          </button>
        </div>
      )}
    </div>
  );
}
