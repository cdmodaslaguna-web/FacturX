import { useState, useEffect } from 'react'

const STORAGE_KEY = 'facturx_invoices'
const COUNTER_KEY = 'facturx_invoice_counter'

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

function loadInvoices() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function getNextNumber() {
  try {
    const current = parseInt(localStorage.getItem(COUNTER_KEY) || '0', 10)
    const next = current + 1
    localStorage.setItem(COUNTER_KEY, String(next))
    return `F-${String(next).padStart(4, '0')}`
  } catch {
    return `F-${Date.now()}`
  }
}

export function useInvoices() {
  const [invoices, setInvoices] = useState(loadInvoices)
  const [editingInvoice, setEditingInvoice] = useState(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices))
  }, [invoices])

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === STORAGE_KEY) {
        try {
          const newData = e.newValue ? JSON.parse(e.newValue) : []
          setInvoices(newData)
        } catch (err) {
          console.error("Error parsing invoices from storage", err)
        }
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  function peekNextNumber() {
    try {
      const current = parseInt(localStorage.getItem(COUNTER_KEY) || '0', 10)
      return `F-${String(current + 1).padStart(4, '0')}`
    } catch {
      return 'F-0001'
    }
  }

  function addInvoice(invoice) {
    const number = invoice.number && invoice.number.trim() ? invoice.number.trim() : getNextNumber()
    const newInvoice = { ...invoice, number, id: generateId(), createdAt: new Date().toISOString(), amountPaid: invoice.amountPaid || 0, payments: invoice.payments || [] }
    setInvoices(prev => [newInvoice, ...prev])
    return newInvoice
  }

  function updateInvoice(id, updates) {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, ...updates } : inv))
  }

  function deleteInvoice(id) {
    setInvoices(prev => prev.filter(inv => inv.id !== id))
  }

  function clearAllInvoices() {
    setInvoices([])
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(COUNTER_KEY)
  }

  function getInvoice(id) {
    return invoices.find(inv => inv.id === id) || null
  }

  function addPayment(id, paymentData) {
    setInvoices(prev => prev.map(inv => {
      if (inv.id === id) {
        const newPayment = {
          id: generateId(),
          date: new Date().toISOString(),
          amount: Number(paymentData.amount || 0),
          method: paymentData.method || 'Efectivo',
          notes: paymentData.notes || '',
          receiptUrl: paymentData.receiptUrl || null
        }
        const currentPayments = inv.payments || []
        const newPaid = (inv.amountPaid || 0) + newPayment.amount
        
        return { 
          ...inv, 
          amountPaid: newPaid > inv.total ? inv.total : newPaid,
          payments: [...currentPayments, newPayment]
        }
      }
      return inv
    }))
  }

  function startEdit(invoice) {
    setEditingInvoice(invoice)
  }

  function clearEdit() {
    setEditingInvoice(null)
  }

  return {
    invoices,
    editingInvoice,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    clearAllInvoices,
    getInvoice,
    addPayment,
    startEdit,
    clearEdit,
    peekNextNumber,
  }
}
