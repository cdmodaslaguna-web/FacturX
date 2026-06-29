import { motion } from 'framer-motion';

export default function AppBottomNav({ view, setView, clearEdit }) {
  
  const handleNav = (targetView) => {
    setView(targetView);
    clearEdit();
  };

  return (
    <div className="bottom-nav-wrapper">
      <nav className="bottom-nav-container">
        
        {/* Lado Izquierdo */}
        <div className="nav-side left-side">
          <button 
            className={`nav-item ${view === 'list' ? 'active' : ''}`}
            onClick={() => handleNav('list')}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <span>Facturas</span>
          </button>
          
          <button 
            className={`nav-item ${view === 'products' ? 'active' : ''}`}
            onClick={() => handleNav('products')}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
            <span>Productos</span>
          </button>
        </div>

        {/* Hueco Central + FAB */}
        <div className="nav-center-cutout">
          <motion.button 
            className="fab-main"
            onClick={() => handleNav(view === 'form' ? 'list' : 'form')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{ 
              rotate: view === 'form' ? 45 : 0,
              backgroundColor: view === 'form' ? '#ef4444' : '#184a2c'
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </motion.button>
        </div>

        {/* Lado Derecho */}
        <div className="nav-side right-side">
          <button 
            className={`nav-item ${view === 'orders' ? 'active' : ''}`}
            onClick={() => { setView('orders'); clearEdit(); }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
            <span>Pedidos</span>
          </button>
          <button 
            className={`nav-item ${view === 'users' ? 'active' : ''}`}
            onClick={() => handleNav('users')}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span>Equipo</span>
          </button>
        </div>

      </nav>
    </div>
  );
}
