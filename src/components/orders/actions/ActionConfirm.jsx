export default function ActionConfirm({ onConfirm }) {
  return (
    <button 
      onClick={(e) => { e.stopPropagation(); onConfirm(); }} 
      title="Confirmar Pedido" 
      style={{ 
        background: '#dcfce7', 
        color: '#16a34a', 
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
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    </button>
  );
}
