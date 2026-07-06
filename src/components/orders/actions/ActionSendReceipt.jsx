export default function ActionSendReceipt({ onSendReceipt }) {
  return (
    <button 
      onClick={(e) => { e.stopPropagation(); onSendReceipt(); }} 
      title="Enviar Comprobante por WhatsApp" 
      style={{ 
        background: '#fef9c3', 
        color: '#ca8a04', 
        border: 'none', 
        borderRadius: '8px', 
        padding: '8px', 
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'transform 0.1s'
      }}
      onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
      onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13"></line>
        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
      </svg>
    </button>
  );
}
