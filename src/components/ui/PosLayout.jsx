import { useState, useEffect } from 'react'

export default function PosLayout({ catalogPane, cartPane }) {
  const [activeTab, setActiveTab] = useState('catalog')
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (isMobile) {
    return (
      <div className="pos-layout-mobile">
        <div className="mobile-tab-bar">
          <button 
            className={`tab-btn ${activeTab === 'catalog' ? 'active' : ''}`}
            onClick={() => setActiveTab('catalog')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
            Catálogo
          </button>
          <button 
            className={`tab-btn ${activeTab === 'cart' ? 'active' : ''}`}
            onClick={() => setActiveTab('cart')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            Factura
          </button>
        </div>
        <div className="pos-mobile-content">
          <div className="pos-catalog" style={{ display: activeTab === 'catalog' ? 'flex' : 'none' }}>
            {catalogPane}
          </div>
          <div className="pos-cart" style={{ display: activeTab === 'cart' ? 'flex' : 'none' }}>
            {cartPane}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pos-layout">
      <div className="pos-catalog">
        {catalogPane}
      </div>
      <div className="pos-cart">
        {cartPane}
      </div>
    </div>
  )
}
