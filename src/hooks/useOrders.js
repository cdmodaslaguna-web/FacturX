import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'

const API_URL = `http://${window.location.hostname}:3000`;

export function useOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()

    const socket = io(API_URL);

    socket.on('new_order', (newOrder) => {
      setOrders(prev => {
        // Evitar duplicados si ya lo agregamos optimísticamente
        if (prev.some(o => o.id === newOrder.id)) return prev;
        return [newOrder, ...prev];
      });
    });

    socket.on('order_status_changed', (updatedOrder) => {
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    });

    return () => {
      socket.disconnect()
    }
  }, [])

  async function fetchOrders() {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/orders`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        console.error('Error fetching orders from backend');
        setOrders([]);
      }
    } catch (error) {
      console.error('Network error fetching orders:', error);
      setOrders([]);
    }
    setLoading(false)
  }

  async function addOrder(orderData) {
    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      if (!response.ok) throw new Error('Error creating order');
      const newOrder = await response.json();
      return newOrder;
    } catch (error) {
      console.error('Error in addOrder:', error);
    }
  }

  async function updateOrderStatus(id, status) {
    // Actualización optimista
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    
    try {
      await fetch(`${API_URL}/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
    } catch (error) {
      console.error('Error updating order:', error)
    }
  }

  async function deleteOrder(id) {
    setOrders(prev => prev.filter(o => o.id !== id))
    try {
      await fetch(`${API_URL}/orders/${id}`, { method: 'DELETE' });
    } catch (error) {
      console.error('Error deleting order:', error)
    }
  }

  return { orders, addOrder, updateOrderStatus, deleteOrder, loading, fetchOrders }
}
