import React, { useEffect, useState } from 'react';
import WompiCheckout from './WompiCheckout';
import log2 from '../../assets/logos/log2.png';
import by2 from '../../assets/logos/by 2.png';

export default function PaymentPage() {
  const [amount, setAmount] = useState(0);
  const [reference, setReference] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const amt = params.get('amount');
    const ref = params.get('ref');
    
    if (amt) setAmount(parseFloat(amt));
    if (ref) setReference(ref);
  }, []);

  if (isSuccess) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f8fafc', padding: '20px' }}>
        <div style={{ background: '#fff', padding: '40px 30px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', textAlign: 'center', maxWidth: '400px' }}>
          <div style={{ background: '#dcfce7', color: '#16a34a', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <h2 style={{ color: '#184a2c', margin: '0 0 10px 0' }}>¡Pago Exitoso!</h2>
          <p style={{ color: '#64748b', marginBottom: '20px' }}>Tu pago por <strong>{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount)}</strong> ha sido procesado correctamente.</p>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '30px' }}>Referencia: {reference}</p>
          
          <img src={log2} alt="Logo" style={{ maxWidth: '120px', margin: '0 auto' }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', background: '#f8fafc', padding: '40px 20px' }}>
      <img src={log2} alt="Logo" style={{ maxWidth: '180px', marginBottom: '30px' }} />
      
      <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px', marginBottom: '30px', textAlign: 'center' }}>
        <h2 style={{ margin: '0 0 5px 0', color: '#64748b', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Total a Pagar</h2>
        <h1 style={{ margin: 0, color: '#184a2c', fontSize: '2.5rem' }}>
          {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount)}
        </h1>
        {reference && <p style={{ margin: '10px 0 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>Ref: {reference}</p>}
      </div>

      <WompiCheckout 
        amount={amount} 
        reference={reference} 
        onSuccess={() => setIsSuccess(true)}
      />

      <div style={{ marginTop: '40px', textAlign: 'center' }}>
        <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '0 0 10px 0' }}>Pagos procesados de forma 100% segura por Wompi</p>
        <img src={by2} alt="Powered By" style={{ maxWidth: '70px', opacity: 0.7 }} />
      </div>
    </div>
  );
}
