import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export function useOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()

    const channel = supabase
      .channel('orders_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, payload => {
        fetchOrders()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function fetchOrders() {
    setLoading(true)
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching orders:', error)
      setOrders([])
    } else if (data) {
      setOrders(data)
    }
    setLoading(false)
  }

  async function addOrder(orderData) {
    const newOrder = {
      ...orderData,
      id: 'ord-' + Date.now().toString(36),
      created_at: new Date().toISOString(),
      status: 'pending'
    }
    
    // Optimistic update
    setOrders(prev => [newOrder, ...prev])
    
    const { error } = await supabase.from('orders').insert([newOrder])
    if (error) {
      console.error('Error inserting order:', error)
    }
    return newOrder
  }

  async function updateOrderStatus(id, status) {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
    
    const { error } = await supabase.from('orders').update({ status }).eq('id', id)
    if (error) {
      console.error('Error updating order:', error)
    }
  }

  async function deleteOrder(id) {
    setOrders(prev => prev.filter(o => o.id !== id))
    
    const { error } = await supabase.from('orders').delete().eq('id', id)
    if (error) {
      console.error('Error deleting order:', error)
    }
  }

  return { orders, addOrder, updateOrderStatus, deleteOrder, loading, fetchOrders }
}
