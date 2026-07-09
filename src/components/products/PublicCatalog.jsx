import { useState, useMemo } from 'react';
import { useProducts } from '../../hooks/useProducts';
import Fuse from 'fuse.js';

// Modulos
import PublicHeader from '../public/PublicHeader';
import CatalogHero from '../public/CatalogHero';
import ProductGrid from '../public/ProductGrid';
import ProductDetailView from '../public/ProductDetailView';
import CartDrawer from '../public/CartDrawer';
import AboutSection from '../public/AboutSection';
import FAQSection from '../public/FAQSection';
import ContactSection from '../public/ContactSection';
import Footer from '../public/Footer';

export default function PublicCatalog() {
  const { products, loading, hasMore, loadMore } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('TODOS');
  const [searchQuery, setSearchQuery] = useState('');

  const searchableItems = useMemo(() => {
    const sections = [
      { type: 'section', id: 'about-section', name: 'Sobre Nosotros', description: 'Conoce nuestra historia y misión' },
      { type: 'section', id: 'faq-section', name: 'Preguntas Frecuentes', description: 'Respuestas a dudas comunes' },
      { type: 'section', id: 'contact-section', name: 'Ubicación y Contacto', description: 'Dónde encontrarnos, mapa, ubicación, teléfono y redes' },
      { type: 'section', id: 'catalog-section', name: 'Catálogo de Productos', description: 'Nuestra colección completa de ropa y vestidos' }
    ];
    
    const productItems = products.map(p => ({
      type: 'product',
      id: p.id,
      name: p.name,
      description: p.description,
      category: p.category,
      item: p
    }));

    return [...sections, ...productItems];
  }, [products]);

  const fuse = useMemo(() => {
    return new Fuse(searchableItems, {
      keys: ['name', 'description'],
      threshold: 0.4, // Tolerancia a errores de ortografía
      ignoreLocation: true,
      includeScore: true,
    });
  }, [searchableItems]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return fuse.search(searchQuery).map(res => res.item);
  }, [searchQuery, fuse]);

  // Filter products based on category and search query
  const filteredProducts = useMemo(() => {
    let result = products;

    if (searchQuery.trim()) {
      result = searchResults.filter(r => r.type === 'product').map(r => r.item);
    }

    if (selectedCategory !== 'TODOS') {
      result = result.filter(p => p.category === selectedCategory);
    }

    return result;
  }, [products, searchQuery, selectedCategory, searchResults]);

  if (loading && products.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc' }}>
        <div style={{ 
          width: '50px', 
          height: '50px', 
          border: '5px solid #e8efe9', 
          borderTopColor: '#184a2c', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite' 
        }}></div>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}} />
      </div>
    );
  }

  return (
    <div className="public-catalog-wrapper" style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      <PublicHeader 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        searchResults={searchResults}
        onSelectResult={(result) => {
          if (result.type === 'section') {
            document.getElementById(result.id)?.scrollIntoView({ behavior: 'smooth' });
            setSearchQuery(''); // Limpia la búsqueda para cerrar el panel
          } else if (result.type === 'product') {
            setSelectedProduct(result.item);
            setSearchQuery(''); // Limpia la búsqueda
          }
        }}
      />
      
      <main style={{ flex: 1 }}>
        <CatalogHero />
        
        {!selectedProduct ? (
          <ProductGrid 
            products={filteredProducts} 
            onOpenModal={(prod) => {
              setSelectedProduct(prod);
              setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }, 50);
            }} 
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            hasMore={hasMore}
            loadMore={loadMore}
            loadingMore={loading}
          />
        ) : (
          <div id="product-detail-section">
            <ProductDetailView 
              product={selectedProduct} 
              onBack={() => {
                setSelectedProduct(null);
                setTimeout(() => {
                  document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
                }, 50);
              }} 
            />
          </div>
        )}
        
        <AboutSection />
        <FAQSection />
        <ContactSection />
      </main>

      <Footer />

      {/* Overlays / Modales */}
      <CartDrawer />

    </div>
  );
}
