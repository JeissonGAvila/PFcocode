// frontend/src/services/admin/reportesService.js - ACTUALIZADO CON DETALLES
import { apiService } from '../api.js';

const reportesService = {
  // Obtener todos los reportes CON FOTOS Y UBICACIÓN
  getAll: async () => {
    try {
      const response = await apiService.get('/api/admin/reportes');
      
      // Procesar datos para asegurar estructura consistente
      if (response.success && response.reportes) {
        response.reportes = response.reportes.map(reporte => ({
          ...reporte,
          fotos: Array.isArray(reporte.fotos) ? reporte.fotos : [],
          tiene_fotos: (reporte.total_fotos || 0) > 0,
          tiene_ubicacion_gps: !!(reporte.latitud && reporte.longitud)
        }));
      }
      
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener reportes');
    }
  },

  // NUEVO: Obtener detalles completos de un reporte específico
  getDetalle: async (reporteId) => {
    try {
      const response = await apiService.get(`/api/admin/reportes/${reporteId}/detalle`);
      
      // Procesar datos del reporte detallado
      if (response.success && response.reporte) {
        response.reporte = {
          ...response.reporte,
          fotos: Array.isArray(response.reporte.fotos) ? response.reporte.fotos : [],
          tiene_fotos: !!(response.reporte.fotos && response.reporte.fotos.length > 0),
          tiene_ubicacion_gps: !!(response.reporte.latitud && response.reporte.longitud)
        };
      }
      
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener detalle del reporte');
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
        message: 'Conexión exitosa con reportes admin',
        total: response.reportes?.length || 0,
        con_fotos: response.reportes?.filter(r => r.tiene_fotos).length || 0,
        con_ubicacion: response.reportes?.filter(r => r.tiene_ubicacion_gps).length || 0
      };
    } catch (error) {
      return { 
        success: false, 
        message: error.message 
      };
    }
  }
};

// Datos estáticos útiles (sin cambios)
export const estadosDisponibles = [
  { id: 1, nombre: 'Nuevo', color: '#3B82F6' },
  { id: 2, nombre: 'Aprobado por Líder', color: '#10B981' },
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

// NUEVA: Función para validar si el reporte tiene evidencia completa
export const validarEvidenciaCompleta = (reporte) => {
  const validacion = {
    esCompleto: false,
    tieneUbicacion: !!(reporte.latitud && reporte.longitud),
    tieneFotos: !!(reporte.fotos && reporte.fotos.length > 0),
    tieneDireccion: !!(reporte.direccion && reporte.direccion.length >= 10),
    puntuacion: 0
  };

  // Calcular puntuación de evidencia
  if (validacion.tieneUbicacion) validacion.puntuacion += 40;
  if (validacion.tieneFotos) validacion.puntuacion += 40;
  if (validacion.tieneDireccion) validacion.puntuacion += 20;

  validacion.esCompleto = validacion.puntuacion >= 80;

  return validacion;
};

export default reportesService;