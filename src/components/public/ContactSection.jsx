export default function ContactSection() {
  const businessWhatsAppNumber = import.meta.env.VITE_BUSINESS_WHATSAPP || "3215028653";

  return (
    <div id="contact-section" style={{ background: '#f8fafc', padding: '80px 20px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h2 style={{ fontSize: '2.5rem', color: '#184a2c', margin: '0 0 20px 0', fontWeight: '900' }}>Contacto & Ubicación</h2>
          <div style={{ width: '80px', height: '5px', background: '#10b981', margin: '0 auto', borderRadius: '3px' }}></div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', background: '#fff', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 15px 40px rgba(0,0,0,0.04)' }}>

          <div style={{ padding: '40px' }}>
            <h3 style={{ fontSize: '1.5rem', color: '#1e293b', marginBottom: '20px' }}>Visítanos o Escríbenos</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                <div style={{ width: '40px', height: '40px', background: '#e8efe9', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#184a2c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                </div>
                <div>
                  <h4 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>Ubicación</h4>
                  <p style={{ margin: 0, color: '#64748b', lineHeight: '1.5' }}>Calle 32 B #85-24, Barrio Las Mercedes<br />Medellin , Colombia</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                <div style={{ width: '40px', height: '40px', background: '#e8efe9', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#184a2c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                </div>
                <div>
                  <h4 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>WhatsApp</h4>
                  <p style={{ margin: 0, color: '#64748b' }}>+57 {businessWhatsAppNumber}</p>
                  <a href={`https://wa.me/57${businessWhatsAppNumber}`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: '8px', color: '#10b981', fontWeight: 'bold', textDecoration: 'none' }}>
                    Enviar mensaje →
                  </a>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                <div style={{ width: '40px', height: '40px', background: '#e8efe9', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#184a2c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                </div>
                <div>
                  <h4 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>Horarios</h4>
                  <p style={{ margin: 0, color: '#64748b', lineHeight: '1.5' }}>Lunes - Jueves: 9:00 AM - 6:00 PM</p>
                  <p style={{ margin: 0, color: '#64748b', lineHeight: '1.5' }}>Viernes: 9:00 AM - 7:00 PM</p>
                  <p style={{ margin: 0, color: '#64748b', lineHeight: '1.5' }}>Sábados y Domingos: Cerrado</p>
                </div>
              </div>
            </div>
          </div>

          <div style={{ background: '#e2e8f0', minHeight: '350px' }}>
            {/* Mapa de Google embebido con la ubicación real */}
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.2085714091827!2d-75.61053292524926!3d6.2362159937520225!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e442991c913bf19%3A0x4b5d0b7c3de203a1!2zQ2wuIDMyQiAjIDg1LTI0LCBNZWRlbGzDrW4sIEJlbMOpbiwgTWVkZWxsw61uLCBBbnRpb3F1aWE!5e0!3m2!1ses-419!2sco!4v1783557930208!5m2!1ses-419!2sco"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              title="Mapa de Ubicación"
            ></iframe>
          </div>

        </div>
      </div>
    </div>
  );
}
