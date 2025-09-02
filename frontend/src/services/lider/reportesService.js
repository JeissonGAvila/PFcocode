// frontend/src/services/lider/reportesService.js - ACTUALIZADO
import { apiService, handleApiError } from '../api.js';

export const liderReportesService = {
  
  // 📋 VER REPORTES PENDIENTES DE APROBACIÓN (Estado "Nuevo")
  getPendientesAprobacion: async () => {
    try {
      const response = await apiService.get('/api/lider/reportes/pendientes');
      
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
      
      // Procesar datos
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

  // 📊 OBTENER ESTADÍSTICAS MEJORADAS
  getEstadisticasMejoradas: async () => {
    try {
      const [reportesResponse, pendientesResponse] = await Promise.all([
        liderReportesService.getReportesZona(),
        liderReportesService.getPendientesAprobacion()
      ]);

      const reportes = reportesResponse.success ? reportesResponse.reportes : [];
      const pendientes = pendientesResponse.success ? pendientesResponse.reportes : [];

      // Calcular estadísticas con información visual
      const estadisticas = {
        total_reportes: reportes.length,
        pendientes_aprobacion: pendientes.length,
        con_fotos: reportes.filter(r => r.tiene_fotos).length,
        con_ubicacion: reportes.filter(r => r.tiene_ubicacion_gps).length,
        reportes_por_estado: {},
        reportes_por_tipo: {}
      };

      return {
        success: true,
        estadisticas,
        reportes_sample: reportes.slice(0, 5) // Muestra de reportes para dashboard
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
};