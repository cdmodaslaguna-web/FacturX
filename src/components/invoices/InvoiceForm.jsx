import { useState, useEffect, useRef } from 'react'
import { useProducts } from '../../hooks/useProducts'
import ProductCard from '../ui/ProductCard'
import ProductGrid from '../ui/ProductGrid'
import PosLayout from '../ui/PosLayout'
import Tesseract from 'tesseract.js'

const emptyItem = { description: '', quantity: 1, unitPrice: 0 }

const emptyInvoice = {
  number: '',
  date: new Date().toISOString().split('T')[0],
  clientName: '',
  clientId: '',
  clientAddress: '',
  clientPhone: '',
  items: [],
  notes: '',
  amountPaid: 0,
}

function calculateSubtotal(items) {
  return items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0), 0)
}

export default function InvoiceForm({ onSubmit, editingInvoice, onCancelEdit, nextInvoiceNumber }) {
  const { products } = useProducts()
  const [form, setForm] = useState({ ...emptyInvoice, number: nextInvoiceNumber || '' })
  const [isScanning, setIsScanning] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [submitType, setSubmitType] = useState('invoice')
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (editingInvoice) {
      setForm({
        number: editingInvoice.number || '',
        date: editingInvoice.date || new Date().toISOString().split('T')[0],
        clientName: editingInvoice.clientName || '',
        clientId: editingInvoice.clientId || '',
        clientAddress: editingInvoice.clientAddress || '',
        clientPhone: editingInvoice.clientPhone || '',
        items: editingInvoice.items?.length ? editingInvoice.items.map(i => ({ ...i })) : [],
        notes: editingInvoice.notes || '',
        amountPaid: editingInvoice.amountPaid || 0,
      })
    } else {
      setForm({ ...emptyInvoice, number: nextInvoiceNumber || '' })
    }
  }, [editingInvoice, nextInvoiceNumber])

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function handleItemChange(index, field, value) {
    setForm(prev => {
      const items = [...prev.items]
      items[index] = { ...items[index], [field]: field === 'quantity' || field === 'unitPrice' ? Number(value) || 0 : value }
      return { ...prev, items }
    })
  }

  function addManualItem() {
    setForm(prev => ({ ...prev, items: [...prev.items, { ...emptyItem }] }))
  }

  function handleProductSelect(product) {
    const desc = `${product.name} ${product.variant || ''}`.trim()
    setForm(prev => {
      const items = [...prev.items]
      const existingIndex = items.findIndex(i => i.description === desc && i.unitPrice === product.price)
      
      if (existingIndex >= 0) {
        items[existingIndex].quantity += 1
      } else {
        items.push({
          description: desc,
          quantity: 1,
          unitPrice: product.price || 0
        })
      }
      return { ...prev, items }
    })
  }

  function removeItem(index) {
    setForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (form.items.length === 0) {
      alert('Debes agregar al menos un ítem a la factura.')
      return
    }
    const subtotal = calculateSubtotal(form.items)
    const total = subtotal
    const invoiceData = { ...form, subtotal, tax: 0, total, isOrder: submitType === 'order' }
    onSubmit(invoiceData)
    setForm(emptyInvoice)
  }

  async function handleScanInvoice(e) {
    const file = e.target.files[0]
    if (!file) return
    setIsScanning(true)
    
    try {
      const { data: { text } } = await Tesseract.recognize(file, 'spa')
      const lines = text.split('\n').filter(l => l.trim() !== '')
      let newForm = { ...form }
      
      for (const line of lines) {
        const lowerLine = line.toLowerCase()
        if (lowerLine.includes('nombre') || lowerLine.includes('cliente')) {
          const parts = line.split(':')
          if (parts.length > 1) newForm.clientName = parts[1].trim()
        }
        if (lowerLine.includes('nit') || lowerLine.includes('cedula') || lowerLine.includes('cédula')) {
          const parts = line.split(':')
          if (parts.length > 1) newForm.clientId = parts[1].trim()
        }
        if (lowerLine.includes('teléfono') || lowerLine.includes('telefono') || lowerLine.includes('celular') || lowerLine.includes('whatsapp')) {
          const parts = line.split(':')
          if (parts.length > 1) newForm.clientPhone = parts[1].trim()
        }
      }
      
      newForm.notes = (newForm.notes ? newForm.notes + '\n\n' : '') + '--- Texto Escaneado ---\n' + text
      setForm(newForm)
      alert('Escaneo completado. Revisa las notas y corrige los campos necesarios.')
    } catch (error) {
      console.error('Error en OCR:', error)
      alert('Hubo un error al procesar la imagen.')
    } finally {
      setIsScanning(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const total = calculateSubtotal(form.items)

  const groupedProducts = products.reduce((acc, product) => {
    const cat = product.category || 'Sin Categoría'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(product)
    return acc
  }, {})

  const filteredCategories = Object.keys(groupedProducts).reduce((acc, cat) => {
    const filtered = groupedProducts[cat].filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (p.variant && p.variant.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    if (filtered.length > 0) acc[cat] = filtered
    return acc
  }, {})

  return (
    <PosLayout 
      catalogPane={
        <>
          <div className="pos-catalog-header">
            <h2>Catálogo de Productos</h2>
            <input 
              type="text" 
              placeholder="Buscar producto..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="pos-catalog-body">
            {Object.keys(filteredCategories).length === 0 ? (
              <p className="empty-state">No se encontraron productos.</p>
            ) : (
              Object.entries(filteredCategories).map(([category, items]) => (
                <div key={category} className="catalog-category">
                  <h3>{category}</h3>
                  <ProductGrid>
                    {items.map(product => (
                      <ProductCard 
                        key={product.id} 
                        product={product} 
                        onClick={handleProductSelect} 
                      />
                    ))}
                  </ProductGrid>
                </div>
              ))
            )}
          </div>
        </>
      }
      cartPane={
        <form className="pos-cart-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
          <div className="invoice-form-header">
            <div className="invoice-title-date">
              <h2 style={{ margin: 0, fontSize: '1.2rem' }}>{editingInvoice ? 'Editar' : 'Factura'}</h2>
              <div className="invoice-meta">
                <strong>{form.number}</strong>
                <span>|</span>
                <input type="date" value={form.date} onChange={e => handleChange('date', e.target.value)} title="Fecha de Factura" />
              </div>
            </div>
            
            <div className="invoice-actions-top">
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                onChange={handleScanInvoice} 
              />
              <button type="button" className="btn-secondary btn-scan" onClick={() => fileInputRef.current?.click()} disabled={isScanning} title="Escanear Documento">
                {isScanning ? '⏳' : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                )}
              </button>
            </div>
          </div>

          <div className="invoice-form-grid">
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                Cliente
              </label>
              <input value={form.clientName} onChange={e => handleChange('clientName', e.target.value)} placeholder="Nombre" required />
            </div>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                NIT/CC
              </label>
              <input value={form.clientId} onChange={e => handleChange('clientId', e.target.value)} placeholder="Documento" />
            </div>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
                Teléfono
              </label>
              <input value={form.clientPhone} onChange={e => handleChange('clientPhone', e.target.value)} placeholder="Número" type="tel" />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0 10px 0' }}>
            <h3 style={{ margin: 0 }}>Conceptos a Cobrar</h3>
            <button type="button" className="btn-secondary" onClick={addManualItem} style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
              + Cobro Libre
            </button>
          </div>

          <div className="cart-items">
            {form.items.length === 0 ? (
              <p className="empty-state">Agrega ítems del catálogo o crea un cobro libre.</p>
            ) : (
              form.items.map((item, i) => (
                <div key={i} className="cart-item-compact">
                  <input className="cart-item-desc" type="text" value={item.description} onChange={e => handleItemChange(i, 'description', e.target.value)} placeholder="Descripción" required />
                  <input className="cart-item-qty" type="number" min="0" step="1" value={item.quantity} onChange={e => handleItemChange(i, 'quantity', e.target.value)} required />
                  <input className="cart-item-price" type="number" min="0" step="0.01" value={item.unitPrice} onChange={e => handleItemChange(i, 'unitPrice', e.target.value)} required />
                  <div className="cart-item-total">
                    ${((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)).toLocaleString('es-CO')}
                  </div>
                  <button type="button" className="btn-remove" onClick={() => removeItem(i)}>✕</button>
                </div>
              ))
            )}
          </div>

          <div className="totals" style={{ marginTop: 'auto', marginBottom: '15px' }}>
            <div className="total-row total-final">
              <span>Total a Cobrar:</span>
              <span style={{ color: '#184a2c' }}>${total.toLocaleString('es-CO')}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {editingInvoice && (
              <button type="button" className="btn-secondary" onClick={onCancelEdit} style={{ flex: 1, padding: '10px 8px', borderRadius: '20px', fontSize: '0.85rem' }}>Cancelar</button>
            )}
            <button type="submit" onClick={() => setSubmitType('order')} className="btn-secondary" style={{ flex: 1, padding: '10px 8px', borderRadius: '20px', border: '2px solid #184a2c', color: '#184a2c', background: 'transparent', fontWeight: 'bold', fontSize: '0.85rem' }}>
              Generar Prefactura
            </button>
            <button type="submit" onClick={() => setSubmitType('invoice')} className="btn-primary" style={{ flex: 1, padding: '10px 8px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.85rem' }}>
              {editingInvoice ? 'Actualizar Factura' : 'Generar Factura'}
            </button>
          </div>
        </form>
      }
    />
  )
}
