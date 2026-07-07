import React, { useState } from 'react';

const WOMPI_SANDBOX_URL = 'https://sandbox.wompi.co/v1';

export default function WompiCheckout({ amount, reference, onSuccess, onError }) {
  const [cardData, setCardData] = useState({
    number: '',
    cvc: '',
    exp_month: '',
    exp_year: '',
    card_holder: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Llave pública de Wompi (Debe venir de variables de entorno)
  const publicKey = import.meta.env.VITE_WOMPI_PUBLIC_KEY;

  const handleChange = (e) => {
    setCardData({
      ...cardData,
      [e.target.name]: e.target.value
    });
  };

  const handleTokenizeAndPay = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Tokenización Segura de la Tarjeta (Llamada directa a Wompi, no pasa por nuestro backend)
      const tokenResponse = await fetch(`${WOMPI_SANDBOX_URL}/tokens/cards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicKey}`
        },
        body: JSON.stringify({
          number: cardData.number.replace(/\s/g, ''),
          cvc: cardData.cvc,
          exp_month: cardData.exp_month,
          exp_year: cardData.exp_year.length === 2 ? `20${cardData.exp_year}` : cardData.exp_year,
          card_holder: cardData.card_holder
        })
      });

      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok) {
        throw new Error(tokenData.error?.messages?.join(', ') || 'Error al tokenizar la tarjeta');
      }

      const cardToken = tokenData.data.id;

      // 2. Enviar el token a nuestro backend para firmar y crear la transacción
      // Nota: Aquí llamamos a nuestro propio backend de NestJS
      const backendResponse = await fetch(`http://${window.location.hostname}:3000/wompi/transaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          payment_source_id: cardToken,
          amount_in_cents: amount * 100, // Wompi requiere montos en centavos
          reference: reference,
          customer_email: 'cliente@ejemplo.com' // Idealmente pasarlo como prop
        })
      });

      const backendData = await backendResponse.json();

      if (!backendResponse.ok) {
        throw new Error(backendData.message || 'Error procesando el pago en el servidor');
      }

      if (onSuccess) onSuccess(backendData);

    } catch (err) {
      console.error('Error en el pago Wompi:', err);
      setError(err.message);
      if (onError) onError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#fff', maxWidth: '400px' }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#1e293b' }}>Pago Seguro con Wompi</h3>
      
      {error && (
        <div style={{ background: '#fee2e2', color: '#ef4444', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleTokenizeAndPay} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold' }}>Titular de la tarjeta</label>
          <input 
            type="text" 
            name="card_holder" 
            required 
            value={cardData.card_holder}
            onChange={handleChange}
            placeholder="Ej. Juan Perez"
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold' }}>Número de Tarjeta</label>
          <input 
            type="text" 
            name="number" 
            required 
            maxLength="19"
            value={cardData.number}
            onChange={handleChange}
            placeholder="0000 0000 0000 0000"
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold' }}>Mes (MM)</label>
            <input 
              type="text" 
              name="exp_month" 
              required 
              maxLength="2"
              value={cardData.exp_month}
              onChange={handleChange}
              placeholder="01"
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold' }}>Año (YY/YYYY)</label>
            <input 
              type="text" 
              name="exp_year" 
              required 
              maxLength="4"
              value={cardData.exp_year}
              onChange={handleChange}
              placeholder="25"
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold' }}>CVC</label>
            <input 
              type="password" 
              name="cvc" 
              required 
              maxLength="4"
              value={cardData.cvc}
              onChange={handleChange}
              placeholder="***"
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading || !publicKey}
          style={{ 
            background: loading ? '#94a3b8' : '#184a2c', 
            color: '#fff', 
            border: 'none', 
            padding: '12px', 
            borderRadius: '8px', 
            fontWeight: 'bold', 
            cursor: loading ? 'not-allowed' : 'pointer',
            marginTop: '10px'
          }}
        >
          {loading ? 'Procesando...' : `Pagar $${amount?.toLocaleString('es-CO') || '0'}`}
        </button>

        {!publicKey && (
          <p style={{ fontSize: '0.8rem', color: '#ef4444', margin: 0, textAlign: 'center' }}>
            ⚠️ Falta VITE_WOMPI_PUBLIC_KEY en .env
          </p>
        )}
      </form>
    </div>
  );
}
