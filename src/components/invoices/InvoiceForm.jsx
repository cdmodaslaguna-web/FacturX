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
        <form className="pos-cart-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem' }}>{editingInvoice ? 'Editar' : 'Nueva Factura'}</h2>
              <div style={{ color: '#7f8c8d', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <strong>{form.number}</strong>
                <span>|</span>
                <input type="date" value={form.date} onChange={e => handleChange('date', e.target.value)} style={{ border: 'none', background: 'transparent', color: '#7f8c8d', fontSize: '0.8rem', outline: 'none', padding: 0 }} title="Fecha de Factura" />
              </div>
            </div>
            
            <div>
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                onChange={handleScanInvoice} 
              />
              <button type="button" className="btn-secondary" style={{ padding: '6px 10px', fontSize: '0.8rem', borderRadius: '15px' }} onClick={() => fileInputRef.current?.click()} disabled={isScanning}>
                {isScanning ? '⏳...' : '📷 Escanear'}
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div className="form-group">
              <label>Cliente / Empresa</label>
              <input value={form.clientName} onChange={e => handleChange('clientName', e.target.value)} placeholder="Ej: Juan Pérez" required />
            </div>
            <div className="form-group">
              <label>NIT / C.C.</label>
              <input value={form.clientId} onChange={e => handleChange('clientId', e.target.value)} placeholder="Documento de identidad" />
            </div>
            <div className="form-group">
              <label>Teléfono (WhatsApp)</label>
              <input value={form.clientPhone} onChange={e => handleChange('clientPhone', e.target.value)} placeholder="Ej: 3001234567" type="tel" />
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
                    ${((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)).toFixed(2)}
                  </div>
                  <button type="button" className="btn-remove" onClick={() => removeItem(i)}>✕</button>
                </div>
              ))
            )}
          </div>

          <div className="totals" style={{ marginTop: 'auto', marginBottom: '15px' }}>
            <div className="total-row total-final">
              <span>Total a Cobrar:</span>
              <span style={{ color: '#184a2c' }}>${total.toFixed(2)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            {editingInvoice && (
              <button type="button" className="btn-secondary" onClick={onCancelEdit} style={{ flex: 1, padding: '14px', borderRadius: '40px' }}>Cancelar</button>
            )}
            <button type="submit" onClick={() => setSubmitType('order')} className="btn-secondary" style={{ flex: 1, padding: '14px', borderRadius: '40px', border: '2px solid #184a2c', color: '#184a2c', background: 'transparent', fontWeight: 'bold' }}>
              Generar Prefactura y Pedido
            </button>
            <button type="submit" onClick={() => setSubmitType('invoice')} className="btn-primary" style={{ flex: 1, padding: '14px', borderRadius: '40px', background: '#184a2c', color: '#fff', fontWeight: 'bold', border: 'none' }}>
              {editingInvoice ? 'Actualizar Factura' : 'Generar Factura'}
            </button>
          </div>
        </form>
      }
    />
  )
}
