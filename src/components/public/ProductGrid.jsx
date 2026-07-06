import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import CategoryFilter from './CategoryFilter';

export default function ProductGrid({ products, onOpenModal, selectedCategory, onSelectCategory }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Reset to first page when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  const totalPages = Math.ceil(products.length / itemsPerPage);
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = products.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      // Opcional: hacer scroll suave hacia arriba al cambiar de página
      document.getElementById('catalog-section').scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div 
      id="catalog-section"
      style={{ 
        padding: '0 20px 60px', 
        maxWidth: '1200px', 
        margin: '0 auto' 
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{ 
          margin: 0, 
          color: '#184a2c', 
          fontSize: '2rem', 
          fontWeight: '900' 
        }}>
          Nuestros Productos
        </h2>
        <div style={{
          width: '60px',
          height: '4px',
          background: '#10b981',
          margin: '15px auto 30px',
          borderRadius: '2px'
        }}></div>
        
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={onSelectCategory}
        />
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', 
        gap: '24px' 
      }}>
        {currentProducts.map((p, index) => (
          <ProductCard 
            key={p.id} 
            product={p} 
            index={startIndex + index} 
            onOpenModal={onOpenModal} 
          />
        ))}
      </div>
      
      {products.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          No hay productos disponibles en esta categoría.
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          gap: '8px', 
          marginTop: '40px' 
        }}>
          <button 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: currentPage === 1 ? '#f1f5f9' : '#fff',
              color: currentPage === 1 ? '#94a3b8' : '#1e293b',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.2s'
            }}
          >
            Anterior
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                border: 'none',
                background: currentPage === page ? '#184a2c' : '#f8fafc',
                color: currentPage === page ? '#fff' : '#64748b',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: currentPage === page ? '0 4px 6px rgba(24, 74, 44, 0.2)' : 'none'
              }}
            >
              {page}
            </button>
          ))}

          <button 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: currentPage === totalPages ? '#f1f5f9' : '#fff',
              color: currentPage === totalPages ? '#94a3b8' : '#1e293b',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.2s'
            }}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
