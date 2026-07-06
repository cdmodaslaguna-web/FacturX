export default function ActionDropdownItem({ icon, label, onClick, color = '#475569', hoverBg = '#f1f5f9' }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        border: 'none',
        background: 'transparent',
        color: color,
        fontWeight: '600',
        fontSize: '0.9rem',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'background 0.2s',
        outline: 'none',
        width: '100%'
      }}
      onMouseEnter={e => e.currentTarget.style.background = hoverBg}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px' }}>
        {icon}
      </div>
      {label}
    </button>
  );
}
