// frontend/src/services/admin/administradoresService.js
import { apiService } from '../api.js';

const administradoresService = {
  // Obtener todos los administradores
  getAll: async () => {
    try {
      const response = await apiService.get('/api/admin/administradores');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener administradores');
    }
  },

  // Crear nuevo administrador
  create: async (adminData) => {
    try {
      const response = await apiService.post('/api/admin/administradores', adminData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al crear administrador');
    }
  },

  // Actualizar administrador existente
  update: async (id, adminData) => {
    try {
      const response = await apiService.put(`/api/admin/administradores/${id}`, adminData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al actualizar administrador');
    }
  },

  // Cambiar contraseña del administrador
  updatePassword: async (id, nuevaContrasena) => {
    try {
      const response = await apiService.patch(`/api/admin/administradores/${id}/password`, {
        nueva_contrasena: nuevaContrasena
      });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al cambiar contraseña');
    }
  },

  // Desactivar administrador (borrado lógico)
  delete: async (id) => {
    try {
      const response = await apiService.delete(`/api/admin/administradores/${id}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al desactivar administrador');
    }
  },

  // Obtener datos para selects (roles, departamentos, etc.)
  getDatosSelect: async () => {
    try {
      const response = await apiService.get('/api/admin/administradores/datos');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener datos');
    }
  },

  // Probar conexión
  testConnection: async () => {
    try {
      const response = await apiService.get('/api/admin/administradores');
      return { 
        success: true, 
        message: 'Conexión exitosa',
        total: response.administradores?.length || 0
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
export const tiposUsuarioDisponibles = [
  { value: 'administrador', label: 'Administrador General' },
  { value: 'tecnico', label: 'Técnico Especialista' }
];

export const rolesDisponibles = [
  'Administrador General',
  'Supervisor',
  'Coordinador',
  'Asistente',
  'Técnico Especialista'
];

export const departamentosDisponibles = [
  'Administración General',
  'Energía Eléctrica',
  'Agua Potable',
  'Drenajes',
  'Obras Públicas',
  'Servicios Municipales',
  'Recursos Humanos',
  'Tecnología',
  'Planificación',
  'Finanzas',
  'Secretaría'
];

export default administradoresService;