// frontend/src/services/admin/cocodeService.js
import { apiService } from '../api.js';

const cocodeService = {
  // Obtener todos los COCODEs
  getAll: async () => {
    try {
      const response = await apiService.get('/api/admin/cocode');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener COCODEs');
    }
  },

  // Obtener COCODEs por zona
  getByZona: async (zonaId) => {
    try {
      const response = await apiService.get(`/api/admin/cocode/zona/${zonaId}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener COCODEs por zona');
    }
  },

  // Crear nuevo COCODE
  create: async (cocodeData) => {
    try {
      const response = await apiService.post('/api/admin/cocode', cocodeData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al crear COCODE');
    }
  },

  // Actualizar COCODE existente
  update: async (id, cocodeData) => {
    try {
      const response = await apiService.put(`/api/admin/cocode/${id}`, cocodeData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al actualizar COCODE');
    }
  },

  // Desactivar COCODE (borrado lógico)
  delete: async (id) => {
    try {
      const response = await apiService.delete(`/api/admin/cocode/${id}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al desactivar COCODE');
    }
  }
};

export default cocodeService;