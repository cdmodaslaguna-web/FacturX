import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import CategoryFilter from './CategoryFilter';

export default function ProductGrid({ products, onOpenModal, selectedCategory, onSelectCategory, hasMore, loadMore, loadingMore }) {
  // Reset to first page when category changes is handled by the backend typically, 
  // but since we filter locally for categories right now, we just map over all loaded products.

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
        {products.map((p, index) => (
          <ProductCard 
            key={p.id} 
            product={p} 
            index={index} 
            onOpenModal={onOpenModal} 
          />
        ))}
      </div>
      
      {products.length === 0 && !loadingMore && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          No hay productos disponibles en esta categoría.
        </div>
      )}

      {hasMore && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          marginTop: '40px' 
        }}>
          <button 
            onClick={loadMore}
            disabled={loadingMore}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              background: '#184a2c',
              color: '#fff',
              cursor: loadingMore ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.2s',
              opacity: loadingMore ? 0.7 : 1
            }}
          >
            {loadingMore ? 'Cargando...' : 'Cargar más productos'}
          </button>
        </div>
      )}
    </div>
  );
}
