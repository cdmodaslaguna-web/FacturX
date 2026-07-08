import { useState, useEffect } from 'react'
import { uploadImageToCloudinary } from '../utils/cloudinary'

const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3000`;

export function useProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchProducts(1, true);
  }, [])

  const getHeaders = () => {
    const token = localStorage.getItem('facturx_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  };

  async function fetchProducts(pageNumber = 1, isInitial = false) {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/products?page=${pageNumber}&limit=20`, { headers: getHeaders() });
      if (response.ok) {
        const responseData = await response.json();
        // Backend returns { data, meta }
        const newData = responseData.data || [];
        
        if (isInitial) {
          setProducts(newData);
        } else {
          setProducts(prev => [...prev, ...newData]);
        }
        
        if (responseData.meta) {
          setHasMore(pageNumber < responseData.meta.totalPages);
          setPage(pageNumber);
        } else {
          // Fallback if backend doesn't return meta (for some reason)
          setHasMore(newData.length === 20);
          setPage(pageNumber);
        }
      } else {
        console.error('Error fetching products from backend');
        if (isInitial) setProducts([]);
      }
    } catch (error) {
      console.error('Network error fetching products:', error);
      if (isInitial) setProducts([]);
    }
    setLoading(false)
  }

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchProducts(page + 1, false);
    }
  }


  async function addProduct(product, imageFiles = []) {
    try {
      let finalPhotoUrl = product.photoUrl || null;

      if (imageFiles && imageFiles.length > 0) {
        const urls = await Promise.all(imageFiles.map(f => uploadImageToCloudinary(f)));
        finalPhotoUrl = urls.join(',');
      }

      const newProduct = {
        name: product.name,
        price: product.price,
        category: product.category,
        variant: product.variant || null,
        description: product.description || null,
        photoUrl: finalPhotoUrl
      };
      
      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(newProduct)
      });
      
      if (!response.ok) throw new Error('Error creating product in backend');
      
      const data = await response.json();
      setProducts(prev => [data, ...prev]);
      
      return data;
    } catch (error) {
      console.error('Error in addProduct:', error);
      throw error;
    }
  }

  async function updateProduct(id, updates, imageFiles = []) {
    try {
      let finalPhotoUrl = updates.photoUrl;

      if (imageFiles && imageFiles.length > 0) {
        const urls = await Promise.all(imageFiles.map(f => uploadImageToCloudinary(f)));
        finalPhotoUrl = urls.join(',');
      }

      const cleanUpdates = {
        name: updates.name,
        price: updates.price,
        category: updates.category,
        variant: updates.variant || null,
        description: updates.description || null,
        ...(finalPhotoUrl !== undefined && { photoUrl: finalPhotoUrl })
      };

      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(cleanUpdates)
      });
      
      if (!response.ok) throw new Error('Error updating product in backend');

      await response.json();
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...cleanUpdates } : p));
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  async function deleteProduct(id) {
    setProducts(prev => prev.filter(p => p.id !== id))
    
    try {
      await fetch(`${API_URL}/products/${id}`, { 
        method: 'DELETE',
        headers: getHeaders()
      });
    } catch (error) {
      console.error('Error deleting product in backend:', error);
    }
  }

  function getByCategory(category) {
    if (!category || category === 'PN') return []
    return products.filter(p => p.category === category)
  }

  async function resetToBase() {
    setProducts([])
  }

  return { products, addProduct, updateProduct, deleteProduct, getByCategory, resetToBase, loading, hasMore, loadMore }
}
