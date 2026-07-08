import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'

const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3000`;

export function useOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()

    const token = sessionStorage.getItem('facturx_token');
    const socket = io(API_URL, {
      auth: { token }
    });

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

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const getHeaders = () => {
    const token = sessionStorage.getItem('facturx_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  };

  async function fetchOrders(pageNumber = 1, isInitial = false) {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/orders?page=${pageNumber}&limit=20`, { headers: getHeaders() });
      if (response.ok) {
        const responseData = await response.json();
        const newData = responseData.data || [];
        
        if (isInitial) {
          setOrders(newData);
        } else {
          // Merge avoiding duplicates (since sockets might have added them)
          setOrders(prev => {
            const newFiltered = newData.filter(n => !prev.some(p => p.id === n.id));
            return [...prev, ...newFiltered];
          });
        }
        
        if (responseData.meta) {
          setHasMore(pageNumber < responseData.meta.totalPages);
          setPage(pageNumber);
        } else {
          setHasMore(newData.length === 20);
          setPage(pageNumber);
        }
      } else {
        console.error('Error fetching orders from backend');
        if (isInitial) setOrders([]);
      }
    } catch (error) {
      console.error('Network error fetching orders:', error);
      if (isInitial) setOrders([]);
    }
    setLoading(false)
  }

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchOrders(page + 1, false);
    }
  }

  async function addOrder(orderData) {
    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: getHeaders(),
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
        headers: getHeaders(),
        body: JSON.stringify({ status })
      });
    } catch (error) {
      console.error('Error updating order:', error)
    }
  }

  async function deleteOrder(id) {
    setOrders(prev => prev.filter(o => o.id !== id))
    try {
      await fetch(`${API_URL}/orders/${id}`, { 
        method: 'DELETE',
        headers: getHeaders() 
      });
    } catch (error) {
      console.error('Error deleting order:', error)
    }
  }

  return { orders, addOrder, updateOrderStatus, deleteOrder, loading, fetchOrders, hasMore, loadMore }
}
