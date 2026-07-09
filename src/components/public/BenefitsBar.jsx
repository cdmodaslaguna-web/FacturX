import { motion } from 'framer-motion';

const benefits = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13"></rect>
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
        <circle cx="5.5" cy="18.5" r="2.5"></circle>
        <circle cx="18.5" cy="18.5" r="2.5"></circle>
      </svg>
    ),
    title: 'Entrega Inmediata',
    description: 'Envíos rápidos a todo el país en nuestras líneas generales.'
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2"></rect>
        <line x1="2" y1="10" x2="22" y2="10"></line>
      </svg>
    ),
    title: 'Pagos Seguros Wompi',
    description: 'Aceptamos todas las tarjetas, PSE y efectivo con 100% de seguridad.'
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
      </svg>
    ),
    title: 'Garantía de Calidad',
    description: 'Confección premium y materiales de alta durabilidad.'
  }
];

export default function BenefitsBar() {
  return (
    <div style={{
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      padding: '0 20px',
      marginTop: '-50px', // Creates an overlapping effect with the hero
      marginBottom: '60px', // Space before ProductGrid
      position: 'relative',
      zIndex: 10
    }}>
      <div style={{
        background: '#fff',
        boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
        borderRadius: '16px',
        padding: '30px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '30px',
        maxWidth: '1200px',
        width: '100%'
      }}>
        {benefits.map((benefit, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '12px'
            }}
          >
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: '#f0fdf4',
              color: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '8px'
            }}>
              {benefit.icon}
            </div>
            <h3 style={{ 
              fontSize: '1.1rem', 
              color: '#1e293b', 
              margin: 0, 
              fontWeight: '700',
              fontFamily: "'Comfortaa', sans-serif"
            }}>
              {benefit.title}
            </h3>
            <p style={{ 
              fontSize: '0.85rem', 
              color: '#64748b', 
              margin: 0, 
              lineHeight: '1.5' 
            }}>
              {benefit.description}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
