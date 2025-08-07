// frontend/src/services/authService.js - SERVICIO DE AUTENTICACIÓN
import { apiService, handleApiError } from './api.js';

export const authService = {
  // 🚪 LOGIN - Iniciar sesión
  login: async (correo, contrasena) => {
    try {
      const response = await apiService.loginRequest('/api/auth/login', {
        correo,
        contrasena
      });
      
      // Si el login es exitoso, guardar token
      if (response.success && response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('usuario', JSON.stringify(response.usuario));
      }
      
      return response;
      
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 🚪 LOGOUT - Cerrar sesión
  logout: async () => {
    try {
      await apiService.post('/api/auth/logout');
      
      // Limpiar datos locales
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      
      return { success: true, message: 'Sesión cerrada correctamente' };
      
    } catch (error) {
      // Aunque falle la petición, limpiamos los datos locales
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      
      throw new Error(handleApiError(error));
    }
  },

  // 🔍 VERIFICAR TOKEN - Comprobar si el token es válido
  verifyToken: async () => {
    try {
      const response = await apiService.get('/api/auth/verify');
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 👤 OBTENER USUARIO ACTUAL - Info del usuario logueado
  getCurrentUser: async () => {
    try {
      const response = await apiService.get('/api/auth/me');
      
      // Actualizar datos locales
      if (response.success && response.usuario) {
        localStorage.setItem('usuario', JSON.stringify(response.usuario));
      }
      
      return response;
      
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 💾 HELPERS LOCALES - Para trabajar con datos guardados
  getStoredToken: () => {
    return localStorage.getItem('token');
  },

  getStoredUser: () => {
    const user = localStorage.getItem('usuario');
    return user ? JSON.parse(user) : null;
  },

  isLoggedIn: () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('usuario');
    return !!(token && user);
  },

  getUserType: () => {
    const user = authService.getStoredUser();
    return user ? user.tipo : null;
  },

  getUserPanel: () => {
    const user = authService.getStoredUser();
    return user ? user.panel : '/login';
  },

  // 🔄 REFRESH TOKEN (para futuro)
  refreshToken: async () => {
    try {
      const response = await apiService.post('/api/auth/refresh');
      
      if (response.success && response.token) {
        localStorage.setItem('token', response.token);
      }
      
      return response;
      
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
};

// 🛡️ GUARD HELPER - Para proteger rutas
export const authGuard = {
  // Verificar si puede acceder a una ruta
  canAccess: (requiredType) => {
    if (!authService.isLoggedIn()) {
      return false;
    }
    
    const userType = authService.getUserType();
    
    // Si requiredType es un array, verificar si el usuario está incluido
    if (Array.isArray(requiredType)) {
      return requiredType.includes(userType);
    }
    
    // Si requiredType es un string, verificar coincidencia exacta
    return userType === requiredType;
  },

  // Verificar permisos específicos
  hasPermission: (permission) => {
    const user = authService.getStoredUser();
    
    if (!user || !user.permisos) {
      return false;
    }
    
    return user.permisos[permission] === true;
  },

  // Redirigir según el tipo de usuario
  redirectToUserPanel: () => {
    const panel = authService.getUserPanel();
    window.location.href = panel;
  }
};