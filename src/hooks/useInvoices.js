import { useState, useEffect, useCallback } from 'react'

const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3000`;

const getHeaders = () => {
  const token = sessionStorage.getItem('facturx_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export function useInvoices() {
  const [invoices, setInvoices] = useState([])
  const [editingInvoice, setEditingInvoice] = useState(null)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const fetchInvoices = useCallback(async (pageNumber = 1) => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/invoices?page=${pageNumber}&limit=20`, {
        headers: getHeaders()
      })
      if (!res.ok) throw new Error('Error fetching invoices')
      const result = await res.json()
      const newData = result.data || []

      if (pageNumber === 1) {
        setInvoices(newData)
      } else {
        setInvoices(prev => {
          const unique = newData.filter(n => !prev.some(p => p.id === n.id))
          return [...prev, ...unique]
        })
      }

      if (result.meta) {
        setHasMore(pageNumber < result.meta.totalPages)
        setPage(pageNumber)
      }
    } catch (err) {
      console.error('Error loading invoices:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const token = sessionStorage.getItem('facturx_token');
    if (!token) return;
    fetchInvoices(1)
  }, [fetchInvoices])

  function peekNextNumber() {
    // Estimado local hasta que el backend responda; el backend genera el número real
    const lastF = invoices.find(i => i.number?.startsWith('F-'))
    if (!lastF) return 'F-0001'
    const match = lastF.number.match(/F-(\d+)/)
    if (match) return `F-${String(parseInt(match[1], 10) + 1).padStart(4, '0')}`
    return 'F-0001'
  }

  async function addInvoice(invoiceData) {
    try {
      const res = await fetch(`${API_URL}/invoices`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          number: invoiceData.number || undefined,
          clientName: invoiceData.clientName || invoiceData.client || 'Cliente',
          clientId: invoiceData.clientId || invoiceData.document,
          clientAddress: invoiceData.clientAddress,
          clientPhone: invoiceData.clientPhone,
          date: invoiceData.date,
          notes: invoiceData.notes,
          amountPaid: invoiceData.amountPaid || 0,
          items: (invoiceData.items || []).map(item => ({
            description: item.description || item.name || '',
            quantity: Number(item.quantity) || 1,
            unitPrice: Number(item.unitPrice || item.price) || 0,
          }))
        })
      })
      if (!res.ok) throw new Error('Error creating invoice')
      const newInvoice = await res.json()
      setInvoices(prev => [newInvoice, ...prev])
      return newInvoice
    } catch (err) {
      console.error('Error adding invoice:', err)
      return null
    }
  }

  async function updateInvoice(id, updates) {
    try {
      const res = await fetch(`${API_URL}/invoices/${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(updates)
      })
      if (!res.ok) throw new Error('Error updating invoice')
      const updated = await res.json()
      setInvoices(prev => prev.map(inv => inv.id === id ? updated : inv))
    } catch (err) {
      console.error('Error updating invoice:', err)
    }
  }

  async function deleteInvoice(id) {
    try {
      await fetch(`${API_URL}/invoices/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      })
      setInvoices(prev => prev.filter(inv => inv.id !== id))
    } catch (err) {
      console.error('Error deleting invoice:', err)
    }
  }

  async function addPayment(id, paymentData) {
    try {
      const res = await fetch(`${API_URL}/invoices/${id}/payment`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          amount: Number(paymentData.amount || 0),
          method: paymentData.method || 'Efectivo',
          notes: paymentData.notes || '',
        })
      })
      if (!res.ok) throw new Error('Error adding payment')
      const updated = await res.json()
      setInvoices(prev => prev.map(inv => inv.id === id ? updated : inv))
    } catch (err) {
      console.error('Error adding payment:', err)
    }
  }

  const loadMore = () => {
    if (!loading && hasMore) fetchInvoices(page + 1)
  }

  function startEdit(invoice) { setEditingInvoice(invoice) }
  function clearEdit() { setEditingInvoice(null) }

  return {
    invoices,
    editingInvoice,
    loading,
    hasMore,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    addPayment,
    startEdit,
    clearEdit,
    peekNextNumber,
    loadMore,
    refetch: () => fetchInvoices(1),
  }
}
