// frontend/src/services/admin/lideresService.js
import { apiService } from '../api.js';

const lideresService = {
  // Obtener todos los líderes COCODE
  getAll: async () => {
    try {
      const response = await apiService.get('/api/admin/lideres');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener líderes');
    }
  },

  // Crear nuevo líder COCODE
  create: async (liderData) => {
    try {
      const response = await apiService.post('/api/admin/lideres', liderData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al crear líder');
    }
  },

  // Actualizar líder existente
  update: async (id, liderData) => {
    try {
      const response = await apiService.put(`/api/admin/lideres/${id}`, liderData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al actualizar líder');
    }
  },

  // Cambiar contraseña del líder
  updatePassword: async (id, nuevaContrasena) => {
    try {
      const response = await apiService.patch(`/api/admin/lideres/${id}/password`, {
        nueva_contrasena: nuevaContrasena
      });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al cambiar contraseña');
    }
  },

  // Desactivar líder (borrado lógico)
  delete: async (id) => {
    try {
      const response = await apiService.delete(`/api/admin/lideres/${id}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al desactivar líder');
    }
  },

  // Obtener datos para selects (COCODE, Sub-COCODE, etc.)
  getDatosSelect: async () => {
    try {
      const response = await apiService.get('/api/admin/lideres/datos');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener datos');
    }
  },

  // Probar conexión
  testConnection: async () => {
    try {
      const response = await apiService.get('/api/admin/lideres');
      return { 
        success: true, 
        message: 'Conexión exitosa',
        total: response.lideres?.length || 0
      };
    } catch (error) {
      return { 
        success: false, 
        message: error.message 
      };
    }
  }
};

// Datos estáticos útiles
export const tiposLiderDisponibles = [
  { value: 'principal', label: 'Líder Principal COCODE' },
  { value: 'subcocode', label: 'Líder Sub-COCODE' }
];

export const cargosDisponibles = [
  'Presidente/a',
  'Vicepresidente/a', 
  'Secretario/a',
  'Tesorero/a',
  'Vocal I',
  'Vocal II',
  'Vocal III'
];

export const departamentosLideres = [
  'Organización Comunitaria',
  'Desarrollo Social',
  'Proyectos Comunitarios',
  'Coordinación Municipal',
  'Gestión de Recursos'
];

export default lideresService;