// frontend/src/services/admin/subcocodeService.js
import { apiService } from '../api.js';

const subcocodeService = {
  // Obtener todos los Sectores
  getAll: async () => {
    try {
      const response = await apiService.get('/api/admin/subcocode');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener Sectores');
    }
  },

  // Obtener Sectores por COCODE
  getByCocode: async (cocodeId) => {
    try {
      const response = await apiService.get(`/api/admin/subcocode/cocode/${cocodeId}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener Sectores por COCODE');
    }
  },

  // Obtener Sectores por zona
  getByZona: async (zonaId) => {
    try {
      const response = await apiService.get(`/api/admin/subcocode/zona/${zonaId}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener Sectores por zona');
    }
  },

  // Crear nuevo Sector
  create: async (subcocodeData) => {
    try {
      const response = await apiService.post('/api/admin/subcocode', subcocodeData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al crear Sector');
    }
  },

  // Actualizar Sector existente
  update: async (id, subcocodeData) => {
    try {
      const response = await apiService.put(`/api/admin/subcocode/${id}`, subcocodeData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al actualizar Sector');
    }
  },

  // Desactivar Sector (borrado lógico)
  delete: async (id) => {
    try {
      const response = await apiService.delete(`/api/admin/subcocode/${id}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al desactivar Sector');
    }
  }
};

export default subcocodeService;