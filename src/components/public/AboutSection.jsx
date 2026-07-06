export default function AboutSection() {
  return (
    <div style={{ background: '#e8efe9', padding: '80px 20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '40px', alignItems: 'center', textAlign: 'center' }}>
        <div>
          <h2 style={{ fontSize: '2.5rem', color: '#184a2c', margin: '0 0 20px 0', fontWeight: '900' }}>Sobre Nosotros</h2>
          <div style={{ width: '80px', height: '5px', background: '#10b981', margin: '0 auto', borderRadius: '3px' }}></div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', width: '100%' }}>
          <div style={{ background: '#fff', padding: '40px 30px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(24,74,44,0.05)' }}>
            <div style={{ width: '60px', height: '60px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#184a2c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <h3 style={{ margin: '0 0 15px 0', color: '#1e293b', fontSize: '1.3rem' }}>Calidad Garantizada</h3>
            <p style={{ color: '#64748b', lineHeight: '1.6', margin: 0 }}>
              Utilizamos los mejores materiales para asegurar que cada prenda resista el uso diario manteniendo su forma y color.
            </p>
          </div>

          <div style={{ background: '#fff', padding: '40px 30px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(24,74,44,0.05)' }}>
            <div style={{ width: '60px', height: '60px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#184a2c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <h3 style={{ margin: '0 0 15px 0', color: '#1e293b', fontSize: '1.3rem' }}>Atención Personalizada</h3>
            <p style={{ color: '#64748b', lineHeight: '1.6', margin: 0 }}>
              Entendemos las necesidades de tu empresa, colegio o institución para ofrecerte soluciones de dotación a medida.
            </p>
          </div>

          <div style={{ background: '#fff', padding: '40px 30px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(24,74,44,0.05)' }}>
            <div style={{ width: '60px', height: '60px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#184a2c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <h3 style={{ margin: '0 0 15px 0', color: '#1e293b', fontSize: '1.3rem' }}>Entregas Oportunas</h3>
            <p style={{ color: '#64748b', lineHeight: '1.6', margin: 0 }}>
              Cumplimos con los tiempos de entrega acordados porque sabemos lo importante que es tu dotación a tiempo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
