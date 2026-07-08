export const uploadImageToCloudinary = async (file) => {
  if (!file) return null;

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'facturx_preset'; 

  if (!cloudName) {
    throw new Error('Cloud Name de Cloudinary no configurado en .env');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error?.message || 'Error al subir la imagen a Cloudinary');
  }

  const data = await res.json();
  return data.secure_url;
};

export const optimizeCloudinaryUrl = (url, width = 400) => {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('cloudinary.com') || !url.includes('/upload/')) return url;
  
  // Intercept the URL and inject transformation parameters
  const parts = url.split('/upload/');
  return `${parts[0]}/upload/w_${width},c_scale,f_webp,q_auto/${parts[1]}`;
};
