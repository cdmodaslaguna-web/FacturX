import { useState, useEffect } from 'react'
import { uploadImageToCloudinary } from '../utils/cloudinary'

const API_URL = 'http://localhost:3000';

export function useProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/products`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        console.error('Error fetching products from backend');
        setProducts([]);
      }
    } catch (error) {
      console.error('Network error fetching products:', error);
      setProducts([]);
    }
    setLoading(false)
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
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
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
      await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
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

  return { products, addProduct, updateProduct, deleteProduct, getByCategory, resetToBase, loading }
}
