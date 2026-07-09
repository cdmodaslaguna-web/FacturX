const originalFetch = window.fetch;

export const setupFetchInterceptor = () => {
  window.fetch = async (...args) => {
    const response = await originalFetch(...args);
    
    if (response.status === 401) {
      const url = typeof args[0] === 'string' ? args[0] : args[0]?.url;
      // No interceptar si es login o rutas publicas
      if (url && !url.includes('/auth/login') && !url.includes('/products') && !url.includes('/wompi') && !url.includes('/pago-link')) {
        const storedUser = sessionStorage.getItem('facturx_user');
        let isSettingUp = false;
        try {
          if (storedUser) {
            const userObj = JSON.parse(storedUser);
            if (userObj.mustchangepassword) isSettingUp = true;
          }
        } catch(e) {}

        if (isSettingUp) {
          console.warn('401 detectado, pero el usuario debe configurar credenciales. Ignorando logout forzado.');
          return response;
        }

        console.warn('Token expirado o inválido. Redirigiendo a login...');
        localStorage.removeItem('facturx_token');
        sessionStorage.removeItem('facturx_token');
        sessionStorage.removeItem('facturx_user');
        window.location.href = '/login';
      }
    }
    
    return response;
  };
};
