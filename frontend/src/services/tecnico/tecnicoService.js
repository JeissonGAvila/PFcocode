// frontend/src/services/tecnico/tecnicoService.js
import { apiService } from '../api.js';

const tecnicoService = {
  // Obtener reportes asignados al técnico
  getMisReportes: async (tecnicoId = null) => {
    try {
      const url = tecnicoId ? `/api/tecnico/reportes/${tecnicoId}` : '/api/tecnico/reportes';
      const response = await apiService.get(url);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener reportes asignados');
    }
  },

  // Cambiar estado de reporte
  cambiarEstado: async (reporteId, nuevoEstado, comentario = '') => {
    try {
      const response = await apiService.put(`/api/tecnico/reportes/${reporteId}/estado`, {
        nuevo_estado: nuevoEstado,
        comentario: comentario
      });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al cambiar estado del reporte');
    }
  },

  // Agregar seguimiento/comentario
  agregarSeguimiento: async (reporteId, seguimientoData) => {
    try {
      const response = await apiService.post(`/api/tecnico/reportes/${reporteId}/seguimiento`, {
        comentario: seguimientoData.comentario,
        tiempo_invertido_horas: seguimientoData.tiempo_invertido_horas,
        accion_tomada: seguimientoData.accion_tomada
      });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al agregar seguimiento');
    }
  },

  // Obtener historial de un reporte
  getHistorialReporte: async (reporteId) => {
    try {
      const response = await apiService.get(`/api/tecnico/reportes/${reporteId}/historial`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener historial');
    }
  },

  // Obtener estadísticas del técnico
  getEstadisticas: async (tecnicoId = null) => {
    try {
      const url = tecnicoId ? `/api/tecnico/reportes/stats/${tecnicoId}` : '/api/tecnico/reportes/stats/personal';
      const response = await apiService.get(url);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener estadísticas');
    }
  },

  // Probar conexión específica del técnico
  testConnection: async (tecnicoId) => {
    try {
      const response = await tecnicoService.getMisReportes(tecnicoId);
      return { 
        success: true, 
        message: 'Conexión exitosa con panel técnico',
        reportes_asignados: response.reportes?.length || 0,
        departamento: response.tecnico?.departamento || 'No especificado'
      };
    } catch (error) {
      return { 
        success: false, 
        message: error.message 
      };
    }
  }
};

// Estados permitidos para técnicos
export const estadosPermitidosTecnico = {
  'Asignado': ['En Proceso'],
  'En Proceso': ['Pendiente Materiales', 'Resuelto'],
  'Pendiente Materiales': ['En Proceso', 'Resuelto']
};

// Colores para estados
export const coloresEstados = {
  'Asignado': '#8B5CF6',
  'En Proceso': '#EF4444',
  'Pendiente Materiales': '#F97316',
  'Resuelto': '#10B981'
};

// Iconos para tipos de seguimiento
export const tiposSeguimiento = [
  { valor: 'revision', label: 'Revisión inicial', icon: '🔍' },
  { valor: 'diagnostico', label: 'Diagnóstico', icon: '🔧' },
  { valor: 'reparacion', label: 'Reparación', icon: '⚒️' },
  { valor: 'mantenimiento', label: 'Mantenimiento', icon: '🛠️' },
  { valor: 'solicitud_materiales', label: 'Solicitud de materiales', icon: '📦' },
  { valor: 'finalizacion', label: 'Finalización', icon: '✅' },
  { valor: 'observacion', label: 'Observación', icon: '📝' }
];

// Departamentos técnicos disponibles
export const departamentosTecnicos = [
  'Energía Eléctrica',
  'Agua Potable',
  'Drenajes',
  'Alumbrado Público',
  'Recolección de Basura',
  'Mantenimiento Vial'
];

export default tecnicoService;