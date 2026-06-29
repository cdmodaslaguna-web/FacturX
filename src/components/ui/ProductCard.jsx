export default function ProductCard({ product, onClick, isSelected }) {

  return (
    <div
      onClick={() => onClick(product)}
      className={`premium-product-card ${isSelected ? 'selected' : ''}`}
    >
      {/* Contenedor de Imagen */}
      <div className="ppc-image-container">
        {product.photoUrl ? (
          <img src={product.photoUrl} alt={product.name} className="ppc-image" />
        ) : (
          <div className="ppc-image-placeholder">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
          </div>
        )}
      </div>

      <div className="ppc-body">
        {/* Encabezado: Título y Variante */}
        <div className="ppc-header">
          <h4 className="ppc-title">{product.name}</h4>
          {product.variant && (
            <span className="ppc-variant">{product.variant}</span>
          )}
        </div>

      <div className="ppc-footer">
        <p className="ppc-price">${Number(product.price).toFixed(2)}</p>
      </div>
      </div>
    </div>
  );
}