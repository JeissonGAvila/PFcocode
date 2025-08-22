// frontend/src/services/ciudadano/ciudadanoService.js
import { apiService } from '../api.js';

const ciudadanoService = {
  // Crear nuevo reporte con geolocalización
  crearReporte: async (reporteData) => {
    try {
      const response = await apiService.post('/api/ciudadano/reportes', reporteData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al crear reporte');
    }
  },

  // Obtener MIS reportes (solo los míos)
  getMisReportes: async () => {
    try {
      const response = await apiService.get('/api/ciudadano/reportes');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener tus reportes');
    }
  },

  // Agregar comentario a MI reporte
  agregarComentario: async (reporteId, comentario) => {
    try {
      const response = await apiService.post(`/api/ciudadano/reportes/${reporteId}/comentario`, {
        comentario
      });
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al agregar comentario');
    }
  },

  // Obtener tipos de problema disponibles
  getTiposProblema: async () => {
    try {
      const response = await apiService.get('/api/ciudadano/reportes/tipos-problema');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener tipos de problema');
    }
  },

  // Obtener datos para formulario
  getDatosFormulario: async () => {
    try {
      const response = await apiService.get('/api/ciudadano/reportes/datos');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener datos del formulario');
    }
  },

  // Probar conexión
  testConnection: async () => {
    try {
      const response = await ciudadanoService.getMisReportes();
      return { 
        success: true, 
        message: 'Conexión exitosa con panel ciudadano',
        reportes_creados: response.total || 0
      };
    } catch (error) {
      return { 
        success: false, 
        message: error.message 
      };
    }
  }
};

// FUNCIONES DE GEOLOCALIZACIÓN
export const geoUtils = {
  // Obtener ubicación GPS del dispositivo
  obtenerUbicacionGPS: () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalización no soportada por este navegador'));
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 10000, // 10 segundos
        maximumAge: 300000 // 5 minutos de cache
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const ubicacion = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            precision: position.coords.accuracy,
            metodo: 'gps',
            timestamp: Date.now()
          };

          // Validar que esté en Guatemala
          if (geoUtils.validarCoordenadasGuatemala(ubicacion.lat, ubicacion.lng)) {
            resolve(ubicacion);
          } else {
            reject(new Error('La ubicación detectada está fuera de Guatemala'));
          }
        },
        (error) => {
          let mensaje = 'Error al obtener ubicación GPS';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              mensaje = 'Permiso de ubicación denegado por el usuario';
              break;
            case error.POSITION_UNAVAILABLE:
              mensaje = 'Información de ubicación no disponible';
              break;
            case error.TIMEOUT:
              mensaje = 'Tiempo de espera agotado para obtener ubicación';
              break;
          }
          reject(new Error(mensaje));
        },
        options
      );
    });
  },

  // Validar coordenadas de Guatemala
  validarCoordenadasGuatemala: (lat, lng) => {
    if (!lat || !lng) return false;
    
    // Rango de Guatemala: 13.5°N-18.5°N, 88°W-92.5°W
    const latValida = lat >= 13.5 && lat <= 18.5;
    const lngValida = lng >= -92.5 && lng <= -88.0;
    
    return latValida && lngValida;
  },

  // Convertir coordenadas a dirección aproximada (usando Nominatim - gratis)
  coordenadasADireccion: async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=es`
      );
      
      if (!response.ok) {
        throw new Error('Error en servicio de geocodificación');
      }
      
      const data = await response.json();
      
      if (data && data.display_name) {
        return {
          direccion_completa: data.display_name,
          ciudad: data.address?.city || data.address?.town || data.address?.village || '',
          departamento: data.address?.state || '',
          pais: data.address?.country || '',
          codigo_postal: data.address?.postcode || ''
        };
      } else {
        throw new Error('No se pudo obtener la dirección');
      }
    } catch (error) {
      console.warn('Error en geocodificación inversa:', error);
      return {
        direccion_completa: `Coordenadas: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        ciudad: '',
        departamento: '',
        pais: 'Guatemala'
      };
    }
  },

  // Verificar si el navegador soporta geolocalización
  soportaGeolocalizacion: () => {
    return 'geolocation' in navigator;
  },

  // Calcular distancia entre dos puntos (en metros)
  calcularDistancia: (lat1, lng1, lat2, lng2) => {
    const R = 6371e3; // Radio de la Tierra en metros
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lng2-lng1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distancia en metros
  }
};

// Estados de reportes para ciudadanos
export const estadosReporteCiudadano = {
  'Nuevo': {
    color: 'info',
    descripcion: 'Tu reporte ha sido creado y está esperando revisión del líder COCODE',
    progreso: 10
  },
  'Aprobado por Líder': {
    color: 'success',
    descripcion: 'Tu reporte fue aprobado por el líder de tu comunidad',
    progreso: 30
  },
  'Rechazado por Líder': {
    color: 'error',
    descripcion: 'Tu reporte fue rechazado. Puedes contactar al líder para más información',
    progreso: 0
  },
  'Asignado': {
    color: 'primary',
    descripcion: 'Tu reporte fue asignado a un técnico especializado',
    progreso: 50
  },
  'En Proceso': {
    color: 'warning',
    descripcion: 'El técnico está trabajando en resolver tu problema',
    progreso: 80
  },
  'Pendiente Materiales': {
    color: 'secondary',
    descripcion: 'El técnico está esperando materiales para completar la reparación',
    progreso: 70
  },
  'Resuelto': {
    color: 'success',
    descripcion: 'Tu problema ha sido resuelto por el técnico',
    progreso: 100
  },
  'Cerrado': {
    color: 'success',
    descripcion: 'El reporte ha sido cerrado exitosamente',
    progreso: 100
  },
  'Reabierto': {
    color: 'warning',
    descripcion: 'El reporte fue reabierto porque el problema persiste',
    progreso: 60
  }
};

// Prioridades de reportes
export const prioridadesReporte = [
  { value: 'Baja', label: 'Baja - No urgente', color: 'success' },
  { value: 'Media', label: 'Media - Atención normal', color: 'warning' },
  { value: 'Alta', label: 'Alta - Urgente', color: 'error' }
];

// Tipos de problemas más comunes
export const tiposProblemaComunes = [
  'Energía Eléctrica',
  'Agua Potable', 
  'Drenajes',
  'Alumbrado Público',
  'Recolección de Basura',
  'Mantenimiento Vial'
];

export default ciudadanoService;