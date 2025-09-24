// frontend/src/services/tecnico/tecnicoService.js - ACTUALIZADO CON COMENTARIOS UNIVERSALES
import { apiService } from '../api.js';

const tecnicoService = {
  // Obtener reportes asignados al técnico CON FOTOS Y UBICACIÓN
  getMisReportes: async (tecnicoId = null) => {
    try {
      const url = tecnicoId ? `/api/tecnico/reportes/${tecnicoId}` : '/api/tecnico/reportes';
      const response = await apiService.get(url);
      
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
      throw new Error(error.message || 'Error al obtener reportes asignados');
    }
  },

  // NUEVO: Obtener detalles completos de un reporte específico
  getReporteDetalle: async (reporteId) => {
    try {
      const response = await apiService.get(`/api/tecnico/reportes/${reporteId}/detalle`);
      
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

  // 💬 AGREGAR COMENTARIO - Sistema universal
  agregarComentario: async (reporteId, comentario) => {
    try {
      const response = await apiService.post(`/api/reportes/${reporteId}/comentarios`, {
        comentario
      });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al agregar comentario');
    }
  },

  // 📖 OBTENER COMENTARIOS - Sistema universal
  obtenerComentarios: async (reporteId) => {
    try {
      const response = await apiService.get(`/api/reportes/${reporteId}/comentarios`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener comentarios');
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
        con_fotos: response.reportes?.filter(r => r.tiene_fotos).length || 0,
        con_ubicacion: response.reportes?.filter(r => r.tiene_ubicacion_gps).length || 0,
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
  { valor: 'reparacion', label: 'Reparación', icon: '⚙️' },
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

// NUEVA: Función para validar si un reporte tiene evidencia visual completa
export const validarEvidenciaVisual = (reporte) => {
  const validacion = {
    esCompleto: false,
    tieneUbicacion: !!(reporte.latitud && reporte.longitud),
    tieneFotos: !!(reporte.fotos && reporte.fotos.length > 0),
    tieneDireccion: !!(reporte.direccion && reporte.direccion.length >= 10),
    puntuacion: 0,
    recomendaciones: []
  };

  // Calcular puntuación de evidencia visual
  if (validacion.tieneUbicacion) validacion.puntuacion += 50;
  if (validacion.tieneFotos) validacion.puntuacion += 40;
  if (validacion.tieneDireccion) validacion.puntuacion += 10;

  // Generar recomendaciones para técnico
  if (!validacion.tieneUbicacion) {
    validacion.recomendaciones.push('Sin coordenadas GPS - usa la dirección para localizar');
  }
  if (!validacion.tieneFotos) {
    validacion.recomendaciones.push('Sin fotos - solicita evidencia visual al ciudadano');
  }
  if (!validacion.tieneDireccion) {
    validacion.recomendaciones.push('Dirección incompleta - confirma ubicación exacta');
  }

  validacion.esCompleto = validacion.puntuacion >= 80;

  return validacion;
};

// NUEVA: Función para obtener enlaces de navegación
export const getEnlacesNavegacion = (latitud, longitud) => {
  if (!latitud || !longitud) return {};
  
  return {
    googleMaps: `https://www.google.com/maps?q=${latitud},${longitud}`,
    waze: `https://www.waze.com/ul?ll=${latitud}%2C${longitud}&navigate=yes`,
    appleMaps: `http://maps.apple.com/?ll=${latitud},${longitud}`,
    coordenadas: `${latitud.toFixed(6)}, ${longitud.toFixed(6)}`
  };
};

export default tecnicoService;