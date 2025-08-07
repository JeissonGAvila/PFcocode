// frontend/src/services/api.js - SERVICIO BASE CENTRAL
const API_URL = 'http://localhost:3001';

// Configuración base para todas las peticiones
const defaultOptions = {
  headers: {
    'Content-Type': 'application/json',
  },
};

// Función helper para manejar respuestas
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
  }
  
  return data;
};

// Función helper para hacer peticiones con token
const makeAuthenticatedRequest = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  if (token) {
    options.headers = {
      ...defaultOptions.headers,
      ...options.headers,
      'Authorization': `Bearer ${token}`
    };
  } else {
    options.headers = {
      ...defaultOptions.headers,
      ...options.headers
    };
  }
  
  const response = await fetch(`${API_URL}${url}`, {
    ...defaultOptions,
    ...options
  });
  
  return handleResponse(response);
};

// Servicio API base - TODOS los otros servicios usan esto
export const apiService = {
  // GET request
  get: async (url, options = {}) => {
    return makeAuthenticatedRequest(url, {
      method: 'GET',
      ...options
    });
  },

  // POST request  
  post: async (url, data = null, options = {}) => {
    return makeAuthenticatedRequest(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : null,
      ...options
    });
  },

  // PUT request
  put: async (url, data = null, options = {}) => {
    return makeAuthenticatedRequest(url, {
      method: 'PUT', 
      body: data ? JSON.stringify(data) : null,
      ...options
    });
  },

  // DELETE request
  delete: async (url, options = {}) => {
    return makeAuthenticatedRequest(url, {
      method: 'DELETE',
      ...options
    });
  },

  // Función especial para login (sin token)
  loginRequest: async (url, data) => {
    const response = await fetch(`${API_URL}${url}`, {
      method: 'POST',
      headers: defaultOptions.headers,
      body: JSON.stringify(data)
    });
    
    return handleResponse(response);
  }
};

// Helper para manejar errores de manera consistente
export const handleApiError = (error) => {
  console.error('API Error:', error);
  
  // Errores específicos
  if (error.message.includes('401')) {
    // Token expirado o inválido
    localStorage.removeItem('token');
    window.location.href = '/login';
    return 'Sesión expirada. Por favor inicia sesión nuevamente.';
  }
  
  if (error.message.includes('403')) {
    return 'No tienes permisos para realizar esta acción.';
  }
  
  if (error.message.includes('404')) {
    return 'Recurso no encontrado.';
  }
  
  if (error.message.includes('500')) {
    return 'Error interno del servidor. Intenta más tarde.';
  }
  
  // Error por defecto
  return error.message || 'Error de conexión. Verifica tu internet.';
};