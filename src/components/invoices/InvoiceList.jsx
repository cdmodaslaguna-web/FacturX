import { useState, useRef, useMemo } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, LineChart, Line, CartesianGrid, Legend } from 'recharts'
import { Printer, MapPin, Receipt, ArrowRight, Wallet, TrendingUp, Filter, Phone, Calendar, Hash, FileText } from 'lucide-react'
import PaymentHistoryModal from './PaymentHistoryModal'
import { useOrders } from '../../hooks/useOrders'
import { useInvoices } from '../../hooks/useInvoices'
import { useConfirm } from '../../contexts/ConfirmContext'

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

export default function InvoiceList({ invoices, onSelect, onAddPayment }) {
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('Efectivo')
  const [paymentNotes, setPaymentNotes] = useState('')
  const [paymentReceipt, setPaymentReceipt] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  
  const [payingInvoice, setPayingInvoice] = useState(null)
  const [historyInvoice, setHistoryInvoice] = useState(null)
  
  const fileInputRef = useRef(null)

  const totalOwed = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0)
  const totalPaid = invoices.reduce((sum, inv) => sum + (inv.amountPaid || 0), 0)
  const totalPending = totalOwed - totalPaid

  async function handleReceiptUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const reader = new FileReader()
    reader.onload = (event) => {
      setPaymentReceipt(event.target.result)
      setIsUploading(false)
    }
    reader.readAsDataURL(file)
  }

  function handlePaymentSubmit(e) {
    e.preventDefault()
    if (payingInvoice && paymentAmount) {
      onAddPayment(payingInvoice.id, {
        amount: Number(paymentAmount),
        method: paymentMethod,
        notes: paymentNotes,
        receiptUrl: paymentReceipt
      })
      setPayingInvoice(null)
      setPaymentAmount('')
      setPaymentMethod('Efectivo')
      setPaymentNotes('')
      setPaymentReceipt('')
    }
  }

  function getStatus(inv) {
    const total = inv.total || 0
    const paid = inv.amountPaid || 0
    if (paid >= total && total > 0) return { label: 'Pagado', color: '#27ae60' }
    if (paid > 0) return { label: 'Parcial', color: '#f39c12' }
    return { label: 'Pendiente', color: '#e74c3c' }
  }

  const { orders } = useOrders();
  const { addInvoice, clearAllInvoices } = useInvoices();
  const confirm = useConfirm();

  const handleClearList = async () => {
    const isConfirmed = await confirm({
      title: 'Vaciar Lista de Deudores',
      message: '¿Estás seguro de que deseas eliminar todas las facturas y saldos de prueba? Esto no se puede deshacer y es útil para limpiar pruebas.',
      confirmText: 'Sí, Eliminar Todo'
    });
    if (isConfirmed) {
      clearAllInvoices();
    }
  };

  const syncOldOrders = async () => {
    const isConfirmed = await confirm({
      title: 'Sincronizar Pedidos Antiguos',
      message: '¿Estás seguro de que deseas convertir los pedidos en Cuentas por Cobrar? Esto te ayudará a registrar los saldos pendientes.',
      confirmText: 'Sincronizar'
    });
    if (!isConfirmed) return;
    
    // Sincronizar todos los pedidos que no estén cancelados
    const validOrdersToSync = orders.filter(o => o.status !== 'cancelled');
    let synced = 0;
    validOrdersToSync.forEach(order => {
      if (!invoices.some(inv => inv.orderId === order.id)) {
        addInvoice({
          clientName: order.customer_name || 'Desconocido',
          document: '',
          date: new Date(order.created_at).toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 15*86400000).toISOString().split('T')[0],
          items: order.items || [],
          subtotal: order.total,
          discount: 0,
          tax: 0,
          total: order.total,
          amountPaid: order.total / 2, // Asumimos 50% abonado
          status: 'pendiente',
          notes: 'Migrado de pedidos antiguos',
          orderId: order.id,
          payments: [{
            amount: order.total / 2,
            method: 'Efectivo',
            date: new Date(order.created_at).toISOString(),
            notes: 'Abono inicial asumido'
          }]
        });
        synced++;
      }
    });
    
    await confirm({
      title: '¡Sincronización Exitosa!',
      message: `Se añadieron ${synced} registros antiguos a la lista de Cuentas por Cobrar. ¡Ahora ya puedes ver la lista de deudores abajo!`,
      confirmText: 'Entendido'
    });
  };

  const topItems = useMemo(() => {
    const itemSales = {};
    const validOrders = orders.filter(o => o.status !== 'cancelled');
    validOrders.forEach(order => {
      (order.items || []).forEach(item => {
        itemSales[item.name] = (itemSales[item.name] || 0) + item.qty;
      });
    });
    return Object.entries(itemSales)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [orders]);

  const revenueByMonth = useMemo(() => {
    const validOrders = orders.filter(o => o.status !== 'cancelled');
    const monthly = {};
    validOrders.forEach(o => {
      const d = new Date(o.created_at);
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthly[monthStr] = (monthly[monthStr] || 0) + o.total;
    });
    return Object.entries(monthly)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, total]) => {
        const [year, m] = date.split('-');
        const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        return { date: `${monthNames[parseInt(m)-1]} ${year}`, total };
      });
  }, [orders]);

  const statusData = useMemo(() => {
    let pending = 0, confirmed = 0, cancelled = 0;
    orders.forEach(o => {
      if (o.status === 'pending') pending++;
      if (o.status === 'confirmed') confirmed++;
      if (o.status === 'cancelled') cancelled++;
    });
    return [
      { name: 'Pendientes', value: pending, color: '#f59e0b' },
      { name: 'Confirmados', value: confirmed, color: '#10b981' },
      { name: 'Cancelados', value: cancelled, color: '#ef4444' }
    ].filter(s => s.value > 0);
  }, [orders]);

  const COLORS = ['#184a2c', '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'];

  return (
    <div className="invoice-list-container" style={{ background: '#e8efe9', borderRadius: '24px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px', minHeight: '100%', width: '100%', boxSizing: 'border-box', margin: '0 auto' }}>
      <div className="dashboard-stats" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', width: '100%', boxSizing: 'border-box' }}>
        <div className="stat-card" style={{ minWidth: 0, gridColumn: 'span 2', background: '#fff', padding: '16px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', textAlign: 'center', borderBottom: '4px solid #3b82f6' }}>
          <h3 style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Total por Cobrar</h3>
          <p style={{ fontSize: '2rem', fontWeight: '900', color: '#1e293b', margin: 0 }}>{formatPrice(totalOwed)}</p>
        </div>
        <div className="stat-card" style={{ minWidth: 0, background: '#fff', padding: '16px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', textAlign: 'center', borderBottom: '4px solid #10b981' }}>
          <h3 style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Recaudado</h3>
          <p style={{ fontSize: '1.4rem', fontWeight: '900', color: '#1e293b', margin: 0 }}>{formatPrice(totalPaid)}</p>
        </div>
        <div className="stat-card highlight" style={{ minWidth: 0, background: '#fff', padding: '16px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', textAlign: 'center', borderBottom: '4px solid #ef4444' }}>
          <h3 style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Pendiente</h3>
          <p style={{ fontSize: '1.4rem', fontWeight: '900', color: '#ef4444', margin: 0 }}>{formatPrice(totalPending)}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginTop: '10px', width: '100%', boxSizing: 'border-box', justifyContent: 'center' }}>
        
        <div style={{ background: '#fff', padding: '16px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#184a2c', fontSize: '1.1rem', textAlign: 'center' }}>Top 5 Productos (Unidades)</h3>
          <div style={{ width: '100%', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {topItems.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topItems} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={90} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={15}>
                    {topItems.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No hay datos suficientes</span>
            )}
          </div>
        </div>

        <div style={{ background: '#fff', padding: '16px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#3b82f6', fontSize: '1.1rem', textAlign: 'center' }}>Ingresos Mensuales</h3>
          <div style={{ width: '100%', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {revenueByMonth.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueByMonth} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`} width={45} tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString('es-CO')}`, 'Ingresos']} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No hay datos suficientes</span>
            )}
          </div>
        </div>

        <div style={{ background: '#fff', padding: '16px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#f59e0b', fontSize: '1.1rem', textAlign: 'center' }}>Distribución de Pedidos</h3>
          <div style={{ width: '100%', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Legend verticalAlign="bottom" height={24} iconType="circle" wrapperStyle={{ fontSize: '10px', color: '#64748b' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No hay datos suficientes</span>
            )}
          </div>
        </div>

      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#184a2c', fontSize: '1.4rem' }}>Listado de Deudores y Facturas</h2>
          <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '500' }}>{invoices.length} registros</span>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button onClick={handleClearList} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: 'bold', cursor: 'pointer' }}>
            Vaciar Lista
          </button>
          <button onClick={syncOldOrders} style={{ background: '#fef3c7', color: '#d97706', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: 'bold', cursor: 'pointer' }}>
            Sincronizar Pedidos Antiguos
          </button>
        </div>
      </div>
      
      <div className="table-responsive">
        <table className="products-table">
          <thead>
            <tr>
              <th>Estado</th>
              <th>N° / Cliente</th>
              <th>Total</th>
              <th>Abonado</th>
              <th>Saldo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr><td colSpan="6" style={{textAlign: 'center', padding: '20px'}}>No hay facturas registradas. Crea una nueva para comenzar.</td></tr>
            ) : invoices.map(inv => {
              const status = getStatus(inv)
              const balance = (inv.total || 0) - (inv.amountPaid || 0)
              return (
                <tr key={inv.id}>
                  <td>
                    <span style={{ backgroundColor: status.color, color: 'white', padding: '4px 8px', borderRadius: '12px', fontSize: '0.85em', fontWeight: 'bold' }}>
                      {status.label}
                    </span>
                  </td>
                  <td>
                    <strong>{inv.number || '—'}</strong><br/>
                    <small style={{ fontWeight: 'bold' }}>{inv.clientName || 'Sin Cliente'}</small><br/>
                    <small style={{ color: '#64748b' }}>{inv.customer_phone || inv.clientPhone || 'Sin teléfono'}</small>
                  </td>
                  <td>{formatPrice(inv.total || 0)}</td>
                  <td>{formatPrice(inv.amountPaid || 0)}</td>
                  <td style={{ fontWeight: balance > 0 ? 'bold' : 'normal', color: balance > 0 ? '#e74c3c' : 'inherit' }}>
                    {formatPrice(balance)}
                  </td>
                  <td className="actions-cell" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {balance > 0 && (
                      <button className="btn-icon" title="Abonar" style={{ background: '#fef3c7', color: '#d97706', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', display: 'flex' }} onClick={() => { setPayingInvoice(inv); setPaymentAmount(balance) }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                      </button>
                    )}
                    {balance <= 0 && (
                      <button className="btn-icon" title="Comprobante Pago Total" style={{ background: '#dcfce7', color: '#16a34a', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', display: 'flex' }} onClick={() => onSelect(inv)}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                      </button>
                    )}
                    {inv.amountPaid > 0 && (
                      <button className="btn-icon" title="Historial" style={{ background: '#dbeafe', color: '#2563eb', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', display: 'flex' }} onClick={() => setHistoryInvoice(inv)}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                      </button>
                    )}
                    <button className="btn-icon" title="Ver Factura" style={{ background: '#f1f5f9', color: '#3b82f6', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', display: 'flex' }} onClick={() => onSelect(inv)}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {payingInvoice && (
        <div className="modal-overlay glass-overlay" onClick={() => setPayingInvoice(null)}>
          <motion.div className="modal-content premium-modal" style={{ maxWidth: '400px', width: '90%', padding: '24px', borderRadius: '20px', background: '#fff', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }} onClick={e => e.stopPropagation()} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <div className="modal-header" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ color: '#184a2c', margin: 0, fontSize: '1.2rem' }}>Abonar a Factura {payingInvoice.number || ''}</h2>
              <button className="btn-close" onClick={() => setPayingInvoice(null)} style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>
            <form onSubmit={handlePaymentSubmit} style={{ padding: '0' }}>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
                <p style={{ margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  <span style={{ color: '#475569' }}>Cliente:</span> <strong style={{ color: '#1e293b' }}>{payingInvoice.clientName || 'Desconocido'}</strong>
                </p>
                <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  <span style={{ color: '#475569' }}>Saldo Pendiente:</span> <strong style={{ color: '#e74c3c', fontSize: '1.1rem' }}>{formatPrice((payingInvoice.total || 0) - (payingInvoice.amountPaid || 0))}</strong>
                </p>
              </div>
              
              <div className="form-group" style={{ marginTop: '15px' }}>
                <label style={{ fontSize: '0.85rem', color: '#4b5563', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                  Monto a Abonar
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontWeight: 'bold' }}>$</span>
                  <input 
                    type="number" 
                    min="0.01" 
                    step="0.01" 
                    max={(payingInvoice.total || 0) - (payingInvoice.amountPaid || 0)} 
                    required 
                    value={paymentAmount} 
                    onChange={e => setPaymentAmount(e.target.value)}
                    style={{ width: '100%', padding: '12px 14px 12px 30px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#fff', outline: 'none', fontSize: '1rem', transition: 'border-color 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '20px' }}>
                <label style={{ fontSize: '0.85rem', color: '#4b5563', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                  Medio de Pago
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  <button 
                    type="button" 
                    onClick={() => setPaymentMethod('Transferencia')}
                    style={{ padding: '12px 8px', borderRadius: '12px', border: paymentMethod === 'Transferencia' ? '2px solid #184a2c' : '1px solid #cbd5e1', background: paymentMethod === 'Transferencia' ? '#e8efe9' : '#fff', color: paymentMethod === 'Transferencia' ? '#184a2c' : '#475569', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>🏦</span> Transferencia
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setPaymentMethod('Efectivo')}
                    style={{ padding: '12px 8px', borderRadius: '12px', border: paymentMethod === 'Efectivo' ? '2px solid #184a2c' : '1px solid #cbd5e1', background: paymentMethod === 'Efectivo' ? '#e8efe9' : '#fff', color: paymentMethod === 'Efectivo' ? '#184a2c' : '#475569', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>💵</span> Efectivo
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setPaymentMethod('Tarjeta')}
                    style={{ padding: '12px 8px', borderRadius: '12px', border: paymentMethod === 'Tarjeta' ? '2px solid #184a2c' : '1px solid #cbd5e1', background: paymentMethod === 'Tarjeta' ? '#e8efe9' : '#fff', color: paymentMethod === 'Tarjeta' ? '#184a2c' : '#475569', fontWeight: 'bold', fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>💳</span> Tarjeta
                  </button>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '20px' }}>
                <label style={{ fontSize: '0.85rem', color: '#4b5563', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                  Comprobante (Opcional)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handleReceiptUpload} style={{ display: 'none' }} />
                  <button type="button" onClick={() => fileInputRef.current?.click()} style={{ flex: 1, background: '#f8fafc', color: '#184a2c', border: '1px dashed #cbd5e1', borderRadius: '12px', padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold', transition: 'all 0.2s' }} disabled={isUploading}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                    {isUploading ? 'Subiendo...' : (paymentReceipt ? 'Cambiar Comprobante' : 'Adjuntar Imagen / Archivo')}
                  </button>
                  {paymentReceipt && (
                    <img src={paymentReceipt} alt="Preview" style={{ width: '45px', height: '45px', borderRadius: '8px', objectFit: 'cover', border: '2px solid #10b981' }} />
                  )}
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '20px' }}>
                <label style={{ fontSize: '0.85rem', color: '#4b5563', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  Notas (Opcional)
                </label>
                <input 
                  type="text" 
                  value={paymentNotes} 
                  onChange={e => setPaymentNotes(e.target.value)} 
                  placeholder="Ej. Abono realizado por transferencia..."
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#fff', outline: 'none', fontSize: '1rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                />
              </div>
              
              <div className="modal-footer premium-footer" style={{ marginTop: '24px', padding: '0', justifyContent: 'space-between', gap: '12px', display: 'flex' }}>
                <button type="button" onClick={() => setPayingInvoice(null)} style={{ border: 'none', borderRadius: '24px', flex: 1, padding: '12px', background: '#f1f5f9', color: '#475569', fontWeight: 'bold', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" style={{ border: 'none', backgroundColor: '#184a2c', borderRadius: '24px', flex: 1, padding: '12px', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>Registrar Pago</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {historyInvoice && (
        <PaymentHistoryModal invoice={historyInvoice} onClose={() => setHistoryInvoice(null)} />
      )}
    </div>
  )
}
