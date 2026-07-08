const originalFetch = window.fetch;

export const setupFetchInterceptor = () => {
  window.fetch = async (...args) => {
    const response = await originalFetch(...args);
    
    if (response.status === 401) {
      const url = typeof args[0] === 'string' ? args[0] : args[0]?.url;
      // No interceptar si es login o rutas publicas
      if (url && !url.includes('/auth/login') && !url.includes('/products') && !url.includes('/wompi') && !url.includes('/pago-link')) {
        console.warn('Token expirado o inválido. Redirigiendo a login...');
        localStorage.removeItem('facturx_token');
        window.location.href = '/login';
      }
    }
    
    return response;
  };
};
