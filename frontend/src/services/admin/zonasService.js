// frontend/src/services/admin/zonasService.js
import { apiService } from '../api.js';

const zonasService = {
  getAll: async () => {
    try {
      const response = await apiService.get('/api/admin/zonas');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener zonas');
    }
  },

  getById: async (id) => {
    try {
      const response = await apiService.get(`/api/admin/zonas/${id}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener zona');
    }
  },

  create: async (zonaData) => {
    try {
      const response = await apiService.post('/api/admin/zonas', zonaData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al crear zona');
    }
  },

  update: async (id, zonaData) => {
    try {
      const response = await apiService.put(`/api/admin/zonas/${id}`, zonaData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al actualizar zona');
    }
  },

  delete: async (id) => {
    try {
      const response = await apiService.delete(`/api/admin/zonas/${id}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al desactivar zona');
    }
  },

  getStats: async () => {
    try {
      const response = await apiService.get('/api/admin/zonas/stats');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener estadísticas');
    }
  },

  validateNumeroZona: async (numero, zonaId = null) => {
    try {
      const zonas = await zonasService.getAll();
      if (zonas.success) {
        const existeNumero = zonas.zonas.some(zona => 
          zona.numero_zona === parseInt(numero) && 
          (zonaId ? zona.id !== parseInt(zonaId) : true)
        );
        return !existeNumero;
      }
      return true;
    } catch (error) {
      return true;
    }
  },

  validateNombreZona: async (nombre, zonaId = null) => {
    try {
      const zonas = await zonasService.getAll();
      if (zonas.success) {
        const existeNombre = zonas.zonas.some(zona => 
          zona.nombre.toLowerCase() === nombre.toLowerCase() && 
          (zonaId ? zona.id !== parseInt(zonaId) : true)
        );
        return !existeNombre;
      }
      return true;
    } catch (error) {
      return true;
    }
  }
};

export const validacionesZona = {
  nombre: {
    required: true,
    minLength: 3,
    maxLength: 100,
    pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-\.]+$/,
    message: 'El nombre debe tener entre 3 y 100 caracteres'
  },
  numero_zona: {
    required: true,
    min: 1,
    max: 50,
    type: 'number',
    message: 'El número de zona debe estar entre 1 y 50'
  },
  poblacion_estimada: {
    required: false,
    min: 0,
    max: 200000,
    type: 'number',
    message: 'La población debe estar entre 0 y 200,000 habitantes'
  },
  area_km2: {
    required: false,
    min: 0,
    max: 1000,
    type: 'number',
    step: 0.01,
    message: 'El área debe estar entre 0 y 1,000 km²'
  }
};

export default zonasService;