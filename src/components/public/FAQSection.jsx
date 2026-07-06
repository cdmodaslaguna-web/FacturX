import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    question: '¿Tienen servicio a domicilio?',
    answer: 'No, por el momento todos los pedidos deben ser recogidos presencialmente en nuestro local físico una vez te confirmemos que están listos.'
  },
  {
    question: '¿Qué información necesitan para los bordados?',
    answer: 'Al momento de realizar tu pedido en el carrito, se te solicitará el nombre a bordar, tu tipo de sangre (RH) y, si aplica, el nombre de tu club para las medialunas.'
  },
  {
    question: '¿Cuánto tiempo tarda en estar listo un pedido?',
    answer: 'Depende de la cantidad y si incluye bordados personalizados. Por lo general, te confirmaremos el tiempo exacto vía WhatsApp al recibir tu pedido.'
  },
  {
    question: '¿Cómo puedo pagar?',
    answer: 'Puedes realizar el pago de manera presencial al recoger tu pedido. Para tu comodidad, aceptamos efectivo, transferencias directas y cualquier otro método de pago digital mediante nuestra pasarela Wompi (incluye tarjetas y pagos por PSE).'
  }
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div style={{ padding: '80px 20px', background: '#fff' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h2 style={{ fontSize: '2.5rem', color: '#184a2c', margin: '0 0 20px 0', fontWeight: '900' }}>Preguntas Frecuentes</h2>
          <div style={{ width: '80px', height: '5px', background: '#10b981', margin: '0 auto', borderRadius: '3px' }}></div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {faqs.map((faq, index) => (
            <div
              key={index}
              style={{
                background: '#f8fafc',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid #e2e8f0',
                transition: 'all 0.3s'
              }}
            >
              <button
                onClick={() => toggleFaq(index)}
                style={{
                  width: '100%',
                  padding: '20px 24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  color: openIndex === index ? '#184a2c' : '#1e293b'
                }}
              >
                {faq.question}
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </motion.div>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div style={{ padding: '0 24px 24px 24px', color: '#64748b', lineHeight: '1.6' }}>
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
