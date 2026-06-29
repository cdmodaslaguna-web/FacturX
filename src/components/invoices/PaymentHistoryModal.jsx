import { motion } from 'framer-motion'

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

export default function PaymentHistoryModal({ invoice, onClose }) {
  if (!invoice) return null;

  const payments = invoice.payments || [];

  return (
    <div className="modal-overlay glass-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
      <motion.div 
        className="modal-content premium-modal" 
        style={{ maxWidth: '500px', width: '90%', padding: '24px', borderRadius: '20px', background: '#fff', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }} 
        onClick={e => e.stopPropagation()} 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }}
      >
        <div className="modal-header" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ color: '#184a2c', margin: 0, fontSize: '1.2rem' }}>Historial de Abonos - {invoice.number}</h2>
          <button className="btn-close" onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' }}>✕</button>
        </div>
        
        <div style={{ padding: '0' }}>
          <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
            <p style={{ margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.05rem' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              <span style={{ color: '#475569' }}>Cliente:</span> <strong style={{ color: '#1e293b' }}>{invoice.clientName || 'Desconocido'}</strong>
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', textAlign: 'center' }}>
              <div style={{ background: '#fff', padding: '12px 8px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 'bold' }}>Total Factura</div>
                <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{formatPrice(invoice.total || 0)}</div>
              </div>
              <div style={{ background: '#fff', padding: '12px 8px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 'bold' }}>Abonado</div>
                <div style={{ fontWeight: 'bold', color: '#10b981' }}>{formatPrice(invoice.amountPaid || 0)}</div>
              </div>
              <div style={{ background: '#fff', padding: '12px 8px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(231,76,60,0.1)' }}>
                <div style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 'bold' }}>Saldo</div>
                <div style={{ fontWeight: 'bold', color: '#e74c3c' }}>{formatPrice((invoice.total || 0) - (invoice.amountPaid || 0))}</div>
              </div>
            </div>
          </div>
          
          <div style={{ marginTop: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#184a2c', marginBottom: '12px' }}>Abonos Realizados</h3>
            
            {payments.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#64748b', padding: '30px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '12px' }}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                <p style={{ margin: 0 }}>No hay abonos registrados para esta factura.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '350px', overflowY: 'auto', paddingRight: '4px' }}>
                {payments.map((payment, idx) => (
                  <div key={payment.id || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#64748b', marginBottom: '4px' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        {new Date(payment.date).toLocaleDateString()} &bull; {new Date(payment.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                      <div style={{ fontWeight: '900', fontSize: '1.25rem', color: '#184a2c', marginBottom: '6px' }}>
                        {formatPrice(payment.amount)}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                        <strong>Medio:</strong> {payment.method}
                      </div>
                      {payment.notes && (
                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '8px', fontStyle: 'italic', background: '#f1f5f9', padding: '8px 12px', borderRadius: '8px', borderLeft: '3px solid #cbd5e1' }}>
                          "{payment.notes}"
                        </div>
                      )}
                    </div>
                    
                    {payment.receiptUrl && (
                      <div style={{ textAlign: 'center', marginLeft: '16px' }}>
                        <a href={payment.receiptUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', color: '#184a2c', background: '#e8efe9', padding: '12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold', transition: 'all 0.2s' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '6px' }}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                          Ver Archivo
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="modal-footer premium-footer" style={{ marginTop: '24px', padding: '0', justifyContent: 'center', display: 'flex' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} style={{ borderRadius: '24px', padding: '10px 24px', background: '#184a2c', color: '#fff', fontWeight: 'bold', width: '100%' }}>Cerrar Historial</button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
