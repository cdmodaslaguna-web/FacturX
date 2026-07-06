import ActionConfirm from './ActionConfirm';
import ActionDelete from './ActionDelete';

export default function OrderActionGroup({ order, hasInvoice, actions, activeMenu, onToggleMenu }) {
  const { onConfirm, onDelete } = actions;
  
  const showConfirm = order.status !== 'confirmed';
  const showSendReceipt = (order.status === 'confirmed' || hasInvoice) && order.customer_phone;
  const showPrintTicket = true; 
  const showRequestAdvance = order.customer_phone;
  const showNotifyReady = order.customer_phone;
  const showDelete = true;

  const hasWhatsAppActions = showSendReceipt || showRequestAdvance || showNotifyReady;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
      
      {showConfirm && <ActionConfirm onConfirm={() => onConfirm(order)} />}
      
      {hasWhatsAppActions && (
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleMenu('whatsapp'); }} 
          title="Opciones de WhatsApp" 
          style={{ 
            background: activeMenu === 'whatsapp' ? '#bae6fd' : '#e0f2fe', 
            color: '#0284c7', 
            border: activeMenu === 'whatsapp' ? '2px solid #38bdf8' : '2px solid transparent', 
            borderRadius: '8px', 
            padding: '6px', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            outline: 'none'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
          </svg>
        </button>
      )}

      {showPrintTicket && (
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleMenu('print'); }} 
          title="Opciones de Impresión" 
          style={{ 
            background: activeMenu === 'print' ? '#e9d5ff' : '#f3e8ff', 
            color: '#9333ea', 
            border: activeMenu === 'print' ? '2px solid #c084fc' : '2px solid transparent', 
            borderRadius: '8px', 
            padding: '6px', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            outline: 'none'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 6 2 18 2 18 9"></polyline>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
            <rect x="6" y="14" width="12" height="8"></rect>
          </svg>
        </button>
      )}

      {showDelete && <ActionDelete onDelete={() => onDelete(order.id)} />}
    </div>
  );
}
