import { useState, useEffect } from 'react';
import OrderActionGroup from './actions/OrderActionGroup';
import { motion, AnimatePresence } from 'framer-motion';

export default function OrderTableRow({ order, hasInvoice, actions, invoices, isSelected, onSelect }) {
  const { activeRowAction, setActiveRowAction } = actions;
  const isActive = activeRowAction?.orderId === order.id;
  const activeMenu = isActive ? activeRowAction.action : null;

  const [subMenu, setSubMenu] = useState(null);

  // Form State
  const [amount, setAmount] = useState(order.total / 2);
  const [hasShipping, setHasShipping] = useState(false);
  const [shippingCost, setShippingCost] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');
  const [format, setFormat] = useState('80mm');

  // Reset form when opened
  useEffect(() => {
    if (isActive && invoices) {
      const existingInvoice = invoices.find(inv => inv.orderId === order.id);
      let initAmount = order.total / 2;
      let initMethod = 'Efectivo';
      
      if (existingInvoice && existingInvoice.amountPaid > 0) {
        initAmount = existingInvoice.amountPaid;
        if (existingInvoice.payments && existingInvoice.payments.length > 0) {
          initMethod = existingInvoice.payments[existingInvoice.payments.length - 1].method || 'Efectivo';
        }
      }
      setAmount(initAmount);
      setPaymentMethod(initMethod);
      setHasShipping(false);
      setShippingCost(0);
      setFormat('80mm');
    }
  }, [isActive, order.id, order.total, invoices]);

  useEffect(() => {
    setSubMenu(null);
  }, [activeMenu]);

  const toggleMenu = (menu) => {
    if (activeMenu === menu) {
      setActiveRowAction({ orderId: null, action: null });
    } else {
      setActiveRowAction({ orderId: order.id, action: menu });
    }
  };

  const closeMenu = () => {
    setActiveRowAction({ orderId: null, action: null });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(price);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span style={{ background: '#fef3c7', color: '#d97706', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>Pendiente</span>;
      case 'confirmed':
        return <span style={{ background: '#dcfce7', color: '#16a34a', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>Confirmado</span>;
      case 'cancelled':
        return <span style={{ background: '#fee2e2', color: '#ef4444', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>Cancelado</span>;
      default:
        return <span style={{ background: '#f1f5f9', color: '#64748b', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>{status}</span>;
    }
  };

  const {
    onSendReceipt,
    onPrintTicket,
    onRequestAdvance,
    onNotifyReady,
    onCopyReceiptImage,
  } = actions;

  const showSendReceipt = (order.status === 'confirmed' || hasInvoice) && order.customer_phone;
  const showRequestAdvance = order.customer_phone;
  const showNotifyReady = order.customer_phone;

  return (
    <div 
      className={`order-card ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
      style={{ 
        background: isSelected ? '#f8fafc' : '#fff', 
        borderRadius: '16px', 
        border: isSelected ? '2px solid #cbd5e1' : '1px solid #e2e8f0',
        padding: '20px', 
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        transition: 'all 0.2s ease-in-out',
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '500' }}>
          {new Date(order.created_at).toLocaleDateString()} {new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </span>
        {getStatusBadge(order.status)}
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '4px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 'bold' }}>Cliente</span>
          <span style={{ fontWeight: '900', color: '#1e293b', fontSize: '1.15rem' }}>
            {order.customer_name || 'Desconocido'}
          </span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 'bold', display: 'block' }}>Total</span>
          <span style={{ color: '#184a2c', fontWeight: '900', fontSize: '1.2rem' }}>
            {formatPrice(order.total)}
          </span>
        </div>
      </div>
      
      <div style={{ marginTop: '8px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
        <OrderActionGroup 
          order={order} 
          hasInvoice={hasInvoice} 
          actions={actions}
          activeMenu={activeMenu}
          onToggleMenu={toggleMenu}
        />
      </div>

      <AnimatePresence>
        {activeMenu && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden', margin: '0 -20px', padding: '0 20px' }}
          >
            
            {!subMenu && (
                  <div className="order-actions-container" style={{ padding: '24px', display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                    
                    {activeMenu === 'whatsapp' && (
                      <>
                        {showRequestAdvance && (
                          <button 
                            className="order-action-btn"
                            onClick={(e) => { e.stopPropagation(); setSubMenu('whatsapp_form'); }}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '12px 24px', background: '#e0f2fe', color: '#0284c7', border: '1px solid #7dd3fc', borderRadius: '12px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
                            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                            Solicitar Abono
                          </button>
                        )}
                        {showSendReceipt && (
                          <button 
                            className="order-action-btn"
                            onClick={(e) => { e.stopPropagation(); setSubMenu('sendReceipt_form'); }}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '12px 24px', background: '#fef9c3', color: '#ca8a04', border: '1px solid #fde047', borderRadius: '12px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
                            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                            Enviar Comprobante
                          </button>
                        )}
                        {showNotifyReady && (
                          <button 
                            className="order-action-btn"
                            onClick={(e) => { e.stopPropagation(); onNotifyReady(order); closeMenu(); }}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '12px 24px', background: '#d1fae5', color: '#059669', border: '1px solid #6ee7b7', borderRadius: '12px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
                            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                            Notificar Terminado
                          </button>
                        )}
                      </>
                    )}
                    
                    {activeMenu === 'print' && (
                      <button 
                        className="order-action-btn"
                        onClick={(e) => { e.stopPropagation(); setSubMenu('print_form'); }}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '12px 24px', background: '#f3e8ff', color: '#9333ea', border: '1px solid #d8b4fe', borderRadius: '12px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
                        onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><line x1="12" y1="4" x2="12" y2="20"></line></svg>
                        Imprimir Ticket
                      </button>
                    )}

                  </div>
                )}

                {/* Inline Forms */}
                {subMenu && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ padding: '24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'center' }}
                  >
                    <div style={{ width: '100%', maxWidth: '600px', background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0, color: '#184a2c', fontSize: '1.2rem' }}>
                          {subMenu === 'whatsapp_form' && 'Solicitar Abono por WhatsApp'}
                          {subMenu === 'print_form' && 'Registrar Abono en Ticket'}
                          {subMenu === 'sendReceipt_form' && 'Enviar Comprobante (WhatsApp)'}
                        </h3>
                        <button onClick={() => setSubMenu(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                      </div>

                      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                        {/* Left column: Amount and Shipping */}
                        <div style={{ flex: '1 1 250px' }}>
                          <label style={{ display: 'block', marginBottom: '8px', color: '#64748b', fontSize: '0.9rem', fontWeight: 'bold' }}>Valor del Abono:</label>
                          <div style={{ position: 'relative', marginBottom: '8px' }}>
                            <span style={{ position: 'absolute', left: '12px', top: '10px', color: '#64748b', fontWeight: 'bold' }}>$</span>
                            <input 
                              type="number" 
                              min="0"
                              step="1"
                              value={amount} 
                              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                              style={{ width: '100%', boxSizing: 'border-box', padding: '10px 10px 10px 25px', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '1.1rem', outline: 'none' }}
                              onFocus={(e) => e.target.style.borderColor = '#184a2c'}
                              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                            />
                          </div>
                          <p style={{ margin: '0 0 16px 0', fontSize: '0.8rem', color: '#64748b' }}>
                            Total del pedido: {formatPrice(order?.total)} (50% sugerido: {formatPrice((order?.total || 0) / 2)})
                          </p>

                          <div style={{ background: '#f1f5f9', padding: '12px', borderRadius: '8px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: hasShipping ? '12px' : '0' }}>
                              <input 
                                type="checkbox" 
                                checked={hasShipping}
                                onChange={(e) => setHasShipping(e.target.checked)}
                                style={{ accentColor: '#184a2c', width: '16px', height: '16px' }}
                              />
                              <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#1e293b' }}>Incluir Costo de Envío</span>
                            </label>
                            
                            {hasShipping && (
                              <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '12px', top: '10px', color: '#64748b', fontWeight: 'bold' }}>$</span>
                                <input 
                                  type="number" 
                                  min="0"
                                  step="1"
                                  placeholder="Valor del domicilio"
                                  value={shippingCost || ''} 
                                  onChange={(e) => setShippingCost(parseFloat(e.target.value) || 0)}
                                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px 10px 10px 25px', borderRadius: '8px', border: '2px solid #e2e8f0', fontSize: '1rem', outline: 'none' }}
                                  onFocus={(e) => e.target.style.borderColor = '#184a2c'}
                                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right column: Methods and Format */}
                        <div style={{ flex: '1 1 250px' }}>
                          {(subMenu === 'print_form' || subMenu === 'sendReceipt_form') && (
                            <div style={{ marginBottom: '16px' }}>
                              <label style={{ display: 'block', marginBottom: '8px', color: '#64748b', fontSize: '0.9rem', fontWeight: 'bold' }}>Medio de Pago:</label>
                              <select 
                                value={paymentMethod} 
                                onChange={e => setPaymentMethod(e.target.value)}
                                style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', outline: 'none' }}
                              >
                                <option value="Efectivo">Efectivo</option>
                                <option value="Transferencia">Transferencia Bancaria</option>
                                <option value="Tarjeta">Tarjeta (Datafono)</option>
                                <option value="Nequi/Daviplata">Nequi / Daviplata</option>
                                <option value="Otro">Otro</option>
                              </select>
                            </div>
                          )}

                          {subMenu === 'print_form' && (
                            <div>
                              <label style={{ display: 'block', marginBottom: '8px', color: '#64748b', fontSize: '0.9rem', fontWeight: 'bold' }}>Formato de Impresión:</label>
                              <div style={{ display: 'flex', gap: '10px' }}>
                                <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                                  <input type="radio" name="format" checked={format === '80mm'} onChange={() => setFormat('80mm')} style={{ accentColor: '#184a2c' }} />
                                  <span style={{ fontSize: '0.9rem' }}>Tirilla</span>
                                </label>
                                <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                                  <input type="radio" name="format" checked={format === 'carta'} onChange={() => setFormat('carta')} style={{ accentColor: '#184a2c' }} />
                                  <span style={{ fontSize: '0.9rem' }}>Carta</span>
                                </label>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ marginTop: '24px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                        {(subMenu === 'sendReceipt_form' || subMenu === 'print_form') ? (
                          <div style={{ display: 'flex', gap: '10px', flexDirection: 'column', width: '100%' }}>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                              <button 
                                onClick={() => { onCopyReceiptImage(order, amount, format, hasShipping, shippingCost, paymentMethod); closeMenu(); }} 
                                style={{ flex: 1, padding: '10px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                Solo Copiar
                              </button>
                              {subMenu === 'print_form' && (
                                <button 
                                  onClick={() => { onPrintTicket(order, amount, format, hasShipping, shippingCost, paymentMethod); closeMenu(); }} 
                                  style={{ flex: 1, padding: '10px', background: '#9333ea', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                                  Solo Imprimir
                                </button>
                              )}
                              <button 
                                onClick={() => { onSendReceipt(order, amount, format, hasShipping, shippingCost, paymentMethod, true); closeMenu(); }} 
                                style={{ flex: 1, padding: '10px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                                Descargar Imagen
                              </button>
                            </div>
                            <button 
                              onClick={() => { onSendReceipt(order, amount, format, hasShipping, shippingCost, paymentMethod, false); closeMenu(); }} 
                              style={{ width: '100%', padding: '12px', background: '#184a2c', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                              Copiar Imagen & Enviar a WhatsApp
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => setSubMenu(null)} style={{ flex: 1, padding: '12px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                              Cancelar
                            </button>
                            <button 
                              onClick={() => {
                                onRequestAdvance(order, amount, format, hasShipping, shippingCost, paymentMethod);
                                closeMenu();
                              }} 
                              style={{ flex: 2, padding: '12px', background: '#184a2c', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                              Confirmar y Continuar
                            </button>
                          </div>
                        )}
                      </div>

                    </div>
                  </motion.div>
                )}
                
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
