// frontend/src/services/reportesService.js - SERVICIO DE REPORTES
import { apiService, handleApiError } from './api.js';

export const reportesService = {
  // 📋 OBTENER REPORTES - Filtrados según el tipo de usuario
  getReportes: async (filtros = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Agregar filtros como query parameters
      Object.keys(filtros).forEach(key => {
        if (filtros[key] !== null && filtros[key] !== undefined && filtros[key] !== '') {
          queryParams.append(key, filtros[key]);
        }
      });
      
      const url = queryParams.toString() 
        ? `/api/reportes?${queryParams.toString()}`
        : '/api/reportes';
        
      const response = await apiService.get(url);
      return response;
      
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 📝 CREAR REPORTE - Para ciudadanos y líderes
  createReporte: async (reporteData) => {
    try {
      const response = await apiService.post('/api/reportes', reporteData);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 📄 OBTENER REPORTE POR ID
  getReporteById: async (id) => {
    try {
      const response = await apiService.get(`/api/reportes/${id}`);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // ✏️ ACTUALIZAR REPORTE - Para técnicos y admins
  updateReporte: async (id, datos) => {
    try {
      const response = await apiService.put(`/api/reportes/${id}`, datos);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 🔄 CAMBIAR ESTADO - Para técnicos y admins
  cambiarEstado: async (id, nuevoEstado, comentario = '') => {
    try {
      const response = await apiService.put(`/api/reportes/${id}/estado`, {
        estado: nuevoEstado,
        comentario: comentario
      });
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 👨‍🔧 ASIGNAR TÉCNICO - Solo para admins
  asignarTecnico: async (reporteId, tecnicoId) => {
    try {
      const response = await apiService.put(`/api/reportes/${reporteId}/asignar`, {
        tecnico_id: tecnicoId
      });
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 💬 AGREGAR COMENTARIO - Para seguimiento
  agregarComentario: async (reporteId, comentario) => {
    try {
      const response = await apiService.post(`/api/reportes/${reporteId}/comentarios`, {
        comentario: comentario
      });
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 📸 SUBIR ARCHIVO - Para evidencias
  subirArchivo: async (reporteId, file) => {
    try {
      const formData = new FormData();
      formData.append('archivo', file);
      formData.append('reporte_id', reporteId);
      
      // Para archivos, no usar el apiService normal
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/reportes/${reporteId}/archivos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // NO incluir Content-Type para FormData
        },
        body: formData
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al subir archivo');
      }
      
      return await response.json();
      
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 📊 ESTADÍSTICAS - Para dashboards
  getEstadisticas: async () => {
    try {
      const response = await apiService.get('/api/reportes/estadisticas');
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 🔍 BÚSQUEDA AVANZADA
  buscarReportes: async (termino, filtros = {}) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('busqueda', termino);
      
      Object.keys(filtros).forEach(key => {
        if (filtros[key]) {
          queryParams.append(key, filtros[key]);
        }
      });
      
      const response = await apiService.get(`/api/reportes/buscar?${queryParams.toString()}`);
      return response;
      
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
};