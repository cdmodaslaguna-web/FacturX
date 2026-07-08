import { useState, useRef } from 'react'
import { CATEGORIES } from '../../data/products'
import { useConfirm } from '../../contexts/ConfirmContext'

export default function ProductList({ productsState }) {
  const { products, addProduct, updateProduct, deleteProduct, resetToBase } = productsState
  const confirm = useConfirm()
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ name: '', variant: '', isVariantInfo: false, category: 'PN', price: '', imagePreviews: [], description: '', photoUrl: '' })
  const [imageFiles, setImageFiles] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])
  const fileInputRef = useRef(null)

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function handleCategoryToggle(catId) {
    let currentCats = form.category ? form.category.split(',') : [];
    if (currentCats.includes(catId)) {
      currentCats = currentCats.filter(id => id !== catId);
    } else {
      currentCats.push(catId);
    }
    if (currentCats.length === 0) currentCats = ['PN']; // default fallback
    handleChange('category', currentCats.join(','));
  }

  // --- Lógica de Manejo de Imagen ---
  function handleImageUpload(e) {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setImageFiles(files)
    
    // Generar previews locales
    const previews = []
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (event) => {
        previews.push(event.target.result)
        if (previews.length === files.length) {
          handleChange('imagePreviews', previews)
        }
      }
      reader.readAsDataURL(file)
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setIsUploading(true)
    
    try {
      const finalVariant = form.isVariantInfo && form.variant 
        ? `[INFO]${form.variant.replace(/^\[INFO\]/, '')}` 
        : form.variant.replace(/^\[INFO\]/, '');

      const productData = {
        name: form.name,
        variant: finalVariant,
        category: form.category,
        price: form.price === '' ? null : Number(form.price),
        description: form.description,
        photoUrl: form.photoUrl // url previa si está editando
      }

      if (editingId) {
        await updateProduct(editingId, productData, imageFiles)
        setEditingId(null)
      } else {
        await addProduct(productData, imageFiles)
      }
      
      setForm({ name: '', variant: '', isVariantInfo: false, category: 'PN', price: '', imagePreviews: [], description: '', photoUrl: '' })
      setImageFiles([])
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (error) {
      alert("Ocurrió un error al guardar el producto:\n" + error.message)
    } finally {
      setIsUploading(false)
    }
  }

  function handleEdit(product) {
    setEditingId(product.id)
    const isInfo = product.variant?.startsWith('[INFO]');
    const rawVariant = product.variant ? product.variant.replace(/^\[INFO\]/, '') : '';
    const existingPhotos = product.photoUrl ? product.photoUrl.split(',') : [];

    setForm({
      name: product.name || '',
      variant: rawVariant,
      isVariantInfo: isInfo,
      category: product.category || 'PN',
      price: product.price === null ? '' : product.price,
      imagePreviews: existingPhotos,
      photoUrl: product.photoUrl || '',
      description: product.description || ''
    })
    setImageFiles([])
  }

  async function handleDelete(id) {
    const isConfirmed = await confirm({
      title: 'Eliminar Producto',
      message: '¿Estás seguro de que deseas eliminar este producto?',
      confirmText: 'Eliminar',
      isDestructive: true
    })
    if (isConfirmed) {
      deleteProduct(id)
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id))
    }
  }

  async function handleBulkDelete() {
    const isConfirmed = await confirm({
      title: 'Eliminar Productos',
      message: `¿Estás seguro de que deseas eliminar ${selectedIds.length} producto(s) seleccionado(s)?`,
      confirmText: 'Eliminar Todos',
      isDestructive: true
    })
    
    if (isConfirmed) {
      selectedIds.forEach(id => deleteProduct(id))
      setSelectedIds([])
    }
  }

  function toggleSelectAll() {
    if (selectedIds.length === products.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(products.map(p => p.id))
    }
  }

  function toggleSelect(id) {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(selectedId => selectedId !== id) : [...prev, id])
  }

  function handleCancel() {
    setEditingId(null)
    setForm({ name: '', variant: '', isVariantInfo: false, category: 'PN', price: '', imagePreviews: [], description: '', photoUrl: '' })
    setImageFiles([])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleShareCatalog = () => {
    const catalogUrl = `${window.location.origin}?public_catalog=true`;
    const text = `¡Hola! Conoce nuestro catálogo de productos y haz tu pedido en línea aquí: %0A%0A${catalogUrl}`;
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }

  return (
    <div className="product-list-container" style={{ background: '#e8efe9', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', minHeight: '100%' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, color: '#184a2c', fontSize: '1.4rem' }}>Gestión de Productos</h2>
        <button 
          onClick={handleShareCatalog}
          style={{ background: '#25D366', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center', boxShadow: '0 4px 10px rgba(37, 211, 102, 0.3)' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
          Compartir Catálogo
        </button>
      </div>
      
      <form className="product-form" onSubmit={handleSubmit} style={{ background: '#fff', padding: '20px', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div className="product-form-row">
          <div className="form-group">
            <label style={{ fontSize: '0.85rem', color: '#4b5563', marginBottom: '6px', display: 'block', fontWeight: '600' }}>Producto</label>
            <input required value={form.name} onChange={e => handleChange('name', e.target.value)} placeholder="Ej. Camisa" style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none' }} />
          </div>
          <div className="form-group">
            <label style={{ fontSize: '0.85rem', color: '#4b5563', marginBottom: '6px', display: 'block', fontWeight: '600' }}>Variante o Talla</label>
            <input value={form.variant} onChange={e => handleChange('variant', e.target.value)} placeholder="Ej. S, M, L" style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none' }} />
            <label style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.isVariantInfo} onChange={e => handleChange('isVariantInfo', e.target.checked)} style={{ accentColor: '#184a2c', width: 'auto', margin: 0 }} />
              Solo informativa (no requiere selección)
            </label>
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '0.85rem', color: '#4b5563', marginBottom: '6px', display: 'block', fontWeight: '600' }}>Categorías (Multi-selección)</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {CATEGORIES.map(cat => {
              const isSelected = form.category && form.category.split(',').includes(cat.id);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryToggle(cat.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: isSelected ? '2px solid #184a2c' : '1px solid #cbd5e1',
                    background: isSelected ? '#e8efe9' : '#fff',
                    color: isSelected ? '#184a2c' : '#64748b',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                  }}
                >
                  {cat.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="product-form-row">
          <div className="form-group">
            <label style={{ fontSize: '0.85rem', color: '#4b5563', marginBottom: '6px', display: 'block', fontWeight: '600' }}>Precio</label>
            <input type="number" min="0" step="0.01" value={form.price} onChange={e => handleChange('price', e.target.value)} placeholder="Opcional (Ej. 15000)" style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none' }} />
          </div>
          <div className="form-group">
            <label style={{ fontSize: '0.85rem', color: '#4b5563', marginBottom: '6px', display: 'block', fontWeight: '600' }}>Fotos</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <input type="file" accept="image/*" multiple ref={fileInputRef} onChange={handleImageUpload} style={{ display: 'none' }} />
              <button type="button" onClick={() => fileInputRef.current?.click()} style={{ background: '#f1f5f9', color: '#3b82f6', border: 'none', borderRadius: '12px', padding: '10px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }} disabled={isUploading}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                {isUploading ? 'Procesando...' : 'Subir Fotos'}
              </button>
              {form.imagePreviews && form.imagePreviews.map((preview, i) => (
                <img key={i} src={preview} alt="Preview" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #e2e8f0' }} />
              ))}
            </div>
          </div>
        </div>
        
        <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginBottom: '20px' }}>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '0.85rem', color: '#4b5563', marginBottom: '6px', display: 'block', fontWeight: '600' }}>Descripción</label>
            <textarea value={form.description} onChange={e => handleChange('description', e.target.value)} placeholder="Breve descripción para el catálogo público..." style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none', minHeight: '80px', resize: 'vertical' }} />
          </div>
        </div>

        <div className="form-actions" style={{ display: 'flex', gap: '12px' }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px', borderRadius: '40px', background: '#184a2c', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>{editingId ? 'Actualizar' : 'Agregar'}</button>
          {editingId && <button type="button" className="btn btn-secondary" onClick={handleCancel} style={{ padding: '10px 24px', borderRadius: '40px', background: '#e2e8f0', color: '#4b5563', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Cancelar</button>}
        </div>
      </form>

      {selectedIds.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fee2e2', padding: '12px 20px', borderRadius: '12px', border: '1px solid #fca5a5' }}>
          <span style={{ color: '#991b1b', fontWeight: 'bold' }}>{selectedIds.length} producto(s) seleccionado(s)</span>
          <button onClick={handleBulkDelete} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: 'bold', cursor: 'pointer' }}>
            Eliminar Seleccionados
          </button>
        </div>
      )}

      <div className="table-responsive">
        <table className="products-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>
                <input type="checkbox" checked={products.length > 0 && selectedIds.length === products.length} onChange={toggleSelectAll} style={{ width: '16px', height: '16px', accentColor: '#184a2c' }} />
              </th>
              <th>Img</th>
              <th>Categoría</th>
              <th>Nombre</th>
              <th>Variante</th>
              <th>Precio Defecto</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td className="td-checkbox">
                  <input type="checkbox" checked={selectedIds.includes(product.id)} onChange={() => toggleSelect(product.id)} style={{ width: '16px', height: '16px', accentColor: '#184a2c' }} />
                </td>
                <td className="td-img" data-label="Imagen" style={{ width: '50px' }}>
                  {product.photoUrl ? (
                    <img src={product.photoUrl.split(',')[0]} alt="Img" style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                    </div>
                  )}
                </td>
                <td className="td-category" data-label="Categoría">
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {(product.category || '').split(',').map(catId => (
                      <span key={catId} style={{ background: '#e2e8f0', color: '#475569', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                        {CATEGORIES.find(c => c.id === catId)?.label || catId}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="td-name" data-label="Nombre">{product.name}</td>
                <td className="td-variant" data-label="Variante">{product.variant || '-'}</td>
                <td className="td-price" data-label="Precio Defecto">{product.price !== null ? `$${product.price.toLocaleString('es-CO')}` : 'Variable'}</td>
                <td className="td-actions actions-cell" data-label="Acciones" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button className="btn-icon btn-edit" onClick={() => handleEdit(product)} title="Editar" style={{ background: '#f1f5f9', color: '#3b82f6', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', display: 'flex' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  </button>
                  <button className="btn-icon btn-delete" onClick={() => handleDelete(product.id)} title="Eliminar" style={{ background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', display: 'flex' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center' }}>No hay productos en el catálogo.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 'auto', textAlign: 'right' }}>
        <button className="btn btn-secondary" onClick={async () => {
          const isConfirmed = await confirm({
            title: 'Restaurar Catálogo Base',
            message: 'Esto restaurará los productos originales y borrará todos tus cambios actuales. ¿Continuar?',
            confirmText: 'Restaurar',
            isDestructive: true
          })
          if (isConfirmed) {
            resetToBase()
            setSelectedIds([])
          }
        }} style={{ padding: '8px 16px', borderRadius: '20px', background: 'transparent', border: '1px solid #184a2c', color: '#184a2c', cursor: 'pointer', fontSize: '0.85rem' }}>Restaurar Catálogo Base</button>
      </div>
    </div>
  )
}
