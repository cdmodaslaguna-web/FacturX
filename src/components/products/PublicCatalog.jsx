import { useState } from 'react';
import { useProducts } from '../../hooks/useProducts';

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
  const { products, loading } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('TODOS');

  // Filter products based on category
  const filteredProducts = selectedCategory === 'TODOS' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  if (loading) {
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
      
      <PublicHeader />
      
      <main style={{ flex: 1 }}>
        <CatalogHero />
        
        <ProductGrid 
          products={filteredProducts} 
          onOpenModal={(prod) => setSelectedProduct(prod)} 
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {selectedProduct && (
          <div id="product-detail-section">
            <ProductDetailView 
              product={selectedProduct} 
              onBack={() => {
                setSelectedProduct(null);
                document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
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
