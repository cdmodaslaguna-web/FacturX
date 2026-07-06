import log2 from '../../assets/logos/log2.png';

export default function Footer() {
  return (
    <footer style={{ background: '#093425ff', color: '#fff', padding: '60px 20px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '40px', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '40px', marginBottom: '20px' }}>

        <div style={{ flex: '1 1 300px' }}>
          <img src={log2} alt="Logo" style={{ height: '50px', objectFit: 'contain', marginBottom: '20px', filter: 'brightness(0) invert(1)' }} />
          <p style={{ color: '#ffffffff', lineHeight: '1.6', margin: 0 }}>
            Somos especialistas en uniformes y Ropa de alta calidad. Diseñamos pensando en tu comodidad y durabilidad.
          </p>
        </div>

        <div style={{ flex: '1 1 200px' }}>
          <h4 style={{ margin: '0 0 20px 0', fontSize: '1.1rem', fontWeight: 'bold' }}>Navegación</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li><a href="#" style={{ color: '#ffffffff', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#10b981'} onMouseOut={e => e.target.style.color = '#ffffffff'}>Inicio</a></li>
            <li><a href="#catalog-section" style={{ color: '#ffffffff', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#10b981'} onMouseOut={e => e.target.style.color = '#ffffffff'}>Catálogo</a></li>
            <li><a href="/login" style={{ color: '#ffffffff', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#10b981'} onMouseOut={e => e.target.style.color = '#ffffffff'}>Ingreso Administradores</a></li>
          </ul>
        </div>

      </div>

      <div style={{ textAlign: 'center', color: '#ffffffff', fontSize: '0.9rem' }}>
        <p style={{ margin: 0 }}>&copy; {new Date().getFullYear()} Esperanza Laguna. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
