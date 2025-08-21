// frontend/src/services/lider/reportesService.js
import { apiService, handleApiError } from '../api.js';

export const liderReportesService = {
  
  // 📋 VER REPORTES PENDIENTES DE APROBACIÓN (Estado "Nuevo")
  getPendientesAprobacion: async () => {
    try {
      const response = await apiService.get('/api/lider/reportes/pendientes');
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 🏘️ VER TODOS LOS REPORTES DE SU ZONA (con filtros opcionales)
  getReportesZona: async (filtros = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Agregar filtros si existen
      if (filtros.estado) queryParams.append('estado', filtros.estado);
      if (filtros.page) queryParams.append('page', filtros.page);
      if (filtros.limit) queryParams.append('limit', filtros.limit);
      
      const url = `/api/lider/reportes/zona${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiService.get(url);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // ✅ APROBAR REPORTE (Nuevo → Aprobado por Líder)
  aprobarReporte: async (reporteId, comentarioLider = '') => {
    try {
      const response = await apiService.put(`/api/lider/reportes/${reporteId}/aprobar`, {
        comentario_lider: comentarioLider
      });
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // ❌ RECHAZAR REPORTE (Nuevo → Rechazado por Líder)
  rechazarReporte: async (reporteId, motivoRechazo, comentarioLider = '') => {
    try {
      if (!motivoRechazo.trim()) {
        throw new Error('El motivo de rechazo es requerido');
      }

      const response = await apiService.put(`/api/lider/reportes/${reporteId}/rechazar`, {
        motivo_rechazo: motivoRechazo,
        comentario_lider: comentarioLider
      });
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 🔍 VALIDAR RESOLUCIÓN DE TÉCNICO (Resuelto → Cerrado/Reabierto)
  validarResolucion: async (reporteId, aprobado, comentarioValidacion = '') => {
    try {
      const response = await apiService.put(`/api/lider/reportes/${reporteId}/validar`, {
        aprobado: aprobado,
        comentario_validacion: comentarioValidacion
      });
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 📊 ESTADÍSTICAS DE REPORTES DE LA ZONA
  getEstadisticasZona: async () => {
    try {
      const response = await apiService.get('/api/lider/reportes/estadisticas');
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 🔍 BUSCAR REPORTES EN LA ZONA
  buscarReportes: async (termino, filtros = {}) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('busqueda', termino);
      
      Object.keys(filtros).forEach(key => {
        if (filtros[key]) {
          queryParams.append(key, filtros[key]);
        }
      });
      
      const response = await apiService.get(`/api/lider/reportes/buscar?${queryParams.toString()}`);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 📈 REPORTE DE ACTIVIDAD DE LA ZONA
  getReporteActividad: async (fechaInicio, fechaFin) => {
    try {
      const queryParams = new URLSearchParams();
      if (fechaInicio) queryParams.append('fecha_inicio', fechaInicio);
      if (fechaFin) queryParams.append('fecha_fin', fechaFin);
      
      const response = await apiService.get(`/api/lider/reportes/actividad?${queryParams.toString()}`);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
};