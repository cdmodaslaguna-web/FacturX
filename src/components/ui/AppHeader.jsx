import log1 from '../../assets/logos/log1.png';
import log2 from '../../assets/logos/log2.png';
import { useAuth } from '../../contexts/AuthContext';
import ProfileSettingsModal from '../users/ProfileSettingsModal';
import { useState } from 'react';

export default function AppHeader({ view, setView, clearEdit, editingInvoice }) {
  const { logout, currentUser } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="app-header">
      <div className="header-brand" style={{ display: 'flex', alignItems: 'center' }}>
        <img src={log1} alt="Logo" className="header-logo desktop-logo" style={{ height: '36px', objectFit: 'contain' }} />
        <img src={log2} alt="Logo" className="header-logo mobile-logo" style={{ height: '36px', objectFit: 'contain' }} />
      </div>
      
      {/* Navegación de Escritorio (Oculta en móvil) */}
      <nav className="desktop-nav" style={{ display: 'flex', gap: '15px' }}>
        <button 
          className={view === 'list' ? 'active' : ''} 
          onClick={() => { setView('list'); clearEdit(); }}
          title="Facturas"
          style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
        </button>
        <button 
          className={view === 'form' ? 'active' : ''} 
          onClick={() => { setView('form'); clearEdit(); }}
          title={editingInvoice ? 'Editar' : 'Nueva Factura'}
          style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
        </button>
        <button 
          className={view === 'products' ? 'active' : ''} 
          onClick={() => { setView('products'); clearEdit(); }}
          title="Productos"
          style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
        </button>
        <button 
          className={view === 'orders' ? 'active' : ''} 
          onClick={() => { setView('orders'); clearEdit(); }}
          title="Pedidos"
          style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
        </button>
        <button 
          className={view === 'users' ? 'active' : ''} 
          onClick={() => { setView('users'); clearEdit(); }}
          title="Usuarios"
          style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
        </button>
        <button 
          onClick={logout}
          title="Salir"
          style={{ background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', cursor: 'pointer' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
        </button>
        <button
          onClick={() => setIsProfileOpen(true)}
          title="Perfil"
          style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <img src={currentUser?.photoUrl} alt="Perfil" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0' }} />
        </button>
      </nav>

      {isProfileOpen && <ProfileSettingsModal onClose={() => setIsProfileOpen(false)} />}

      {/* Botones para Móvil (Ocultos en escritorio) */}
      <div className="mobile-actions" style={{ alignItems: 'center', gap: '10px' }}>
        <button
          onClick={() => setIsProfileOpen(true)}
          title="Perfil"
          style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <img src={currentUser?.photoUrl} alt="Perfil" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0' }} />
        </button>
        <button 
          className="btn-logout-icon" 
          onClick={logout}
          title="Cerrar Sesión"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
        </button>
      </div>
    </header>
  );
}
