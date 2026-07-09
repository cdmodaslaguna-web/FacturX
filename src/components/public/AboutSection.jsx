import './AboutSection.css';

export default function AboutSection() {
  return (
    <div id="about-section" className="about-section-container">
      <div className="about-background"></div>
      <div className="about-overlay"></div>
      <div className="about-content-wrapper">
        <div>
          <h2 className="about-title">Sobre Nosotros</h2>
          <div className="about-divider"></div>
        </div>
        
        <div className="about-grid">
          <div className="about-card">
            <div className="about-icon-wrapper">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#047857" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <h3 className="about-card-title">Calidad Garantizada</h3>
            <p className="about-card-text">
              Utilizamos los mejores materiales para asegurar que cada prenda resista el uso diario manteniendo su forma y color.
            </p>
          </div>

          <div className="about-card">
            <div className="about-icon-wrapper">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#047857" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <h3 className="about-card-title">Atención Personalizada</h3>
            <p className="about-card-text">
              Entendemos las necesidades de tu empresa, colegio o institución para ofrecerte soluciones de dotación a medida.
            </p>
          </div>

          <div className="about-card">
            <div className="about-icon-wrapper">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#047857" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <h3 className="about-card-title">Entregas Oportunas</h3>
            <p className="about-card-text">
              Cumplimos con los tiempos de entrega acordados porque sabemos lo importante que es tu dotación a tiempo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
