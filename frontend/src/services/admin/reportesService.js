// frontend/src/services/admin/reportesService.js
import { apiService } from '../api.js';

const reportesService = {
  // Obtener todos los reportes
  getAll: async () => {
    try {
      const response = await apiService.get('/api/admin/reportes');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener reportes');
    }
  },

  // Obtener datos para selects (técnicos, estados, prioridades)
  getDatosSelect: async () => {
    try {
      const response = await apiService.get('/api/admin/reportes/datos');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener datos');
    }
  },

  // Asignar reporte a técnico
  asignar: async (reporteId, tecnicoId) => {
    try {
      const response = await apiService.put(`/api/admin/reportes/${reporteId}/asignar`, {
        id_tecnico: tecnicoId
      });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al asignar reporte');
    }
  },

  // Cambiar estado del reporte
  cambiarEstado: async (reporteId, estadoId) => {
    try {
      const response = await apiService.put(`/api/admin/reportes/${reporteId}/estado`, {
        id_estado: estadoId
      });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al cambiar estado');
    }
  },

  // Cambiar prioridad del reporte
  cambiarPrioridad: async (reporteId, prioridad) => {
    try {
      const response = await apiService.put(`/api/admin/reportes/${reporteId}/prioridad`, {
        prioridad: prioridad
      });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al cambiar prioridad');
    }
  },

  // Probar conexión
  testConnection: async () => {
    try {
      const response = await apiService.get('/api/admin/reportes');
      return { 
        success: true, 
        message: 'Conexión exitosa',
        total: response.reportes?.length || 0
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
export const estadosDisponibles = [
  { id: 1, nombre: 'Nuevo', color: '#3B82F6' },
  { id: 2, nombre: 'En Revisión', color: '#F59E0B' },
  { id: 3, nombre: 'Asignado', color: '#8B5CF6' },
  { id: 4, nombre: 'En Proceso', color: '#EF4444' },
  { id: 5, nombre: 'Resuelto', color: '#10B981' }
];

export const prioridadesDisponibles = ['Alta', 'Media', 'Baja'];

export const tiposProblemaDisponibles = [
  'Energía Eléctrica',
  'Agua Potable', 
  'Mantenimiento Vial',
  'Drenajes',
  'Alumbrado Público',
  'Recolección de Basura'
];

export default reportesService;