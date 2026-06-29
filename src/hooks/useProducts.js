import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { uploadImageToCloudinary } from '../utils/cloudinary'

export function useProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    setLoading(true)
    const { data, error } = await supabase.from('products').select('*')
    
    if (error) {
      console.error('Error fetching products:', error)
      setProducts([])
    } else if (data && data.length > 0) {
      setProducts(data)
    } else {
      setProducts([])
    }
    setLoading(false)
  }

  async function addProduct(product, imageFile = null) {
    try {
      let finalPhotoUrl = product.photoUrl || null;

      // 1. Subir a Cloudinary si hay archivo físico
      if (imageFile) {
        finalPhotoUrl = await uploadImageToCloudinary(imageFile);
      }

      // 2. Construir el objeto final, asegurando que usamos "photoUrl"
      // Se omite explícitamente "image" para evitar el error PGRST204
      const newProduct = {
        id: 'custom-' + Date.now().toString(36),
        name: product.name,
        price: product.price,
        category: product.category,
        variant: product.variant || null,
        description: product.description || null,
        photoUrl: finalPhotoUrl
      };
      
      // 3. Insertar en Supabase
      const { data, error } = await supabase.from('products').insert([newProduct]).select();
      
      if (error) {
        throw error;
      }
      
      // 4. Actualización optimista local
      setProducts(prev => [data?.[0] || newProduct, ...prev]);
      
      return data?.[0] || newProduct;
    } catch (error) {
      console.error('Error in addProduct:', error);
      throw error;
    }
  }

  async function updateProduct(id, updates, imageFile = null) {
    try {
      let finalPhotoUrl = updates.photoUrl;

      // 1. Subir nueva imagen si la hay
      if (imageFile) {
        finalPhotoUrl = await uploadImageToCloudinary(imageFile);
      }

      // Evitamos mandar "image" u otras llaves inválidas
      const cleanUpdates = {
        name: updates.name,
        price: updates.price,
        category: updates.category,
        variant: updates.variant || null,
        description: updates.description || null,
        ...(finalPhotoUrl !== undefined && { photoUrl: finalPhotoUrl })
      };

      // 2. Actualizar en Supabase
      const { error } = await supabase.from('products').update(cleanUpdates).eq('id', id);
      
      if (error) {
        throw error;
      }

      // 3. Actualización optimista local
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...cleanUpdates } : p));
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  async function deleteProduct(id) {
    // Actualización optimista
    setProducts(prev => prev.filter(p => p.id !== id))
    
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) {
      console.error('Error deleting product:', error)
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
