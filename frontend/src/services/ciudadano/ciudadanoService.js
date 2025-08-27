// frontend/src/services/ciudadano/ciudadanoService.js - FINAL COMPLETO
import { apiService } from '../api.js';

const ciudadanoService = {
  // Crear nuevo reporte SIN fotos (método original)
  crearReporte: async (reporteData) => {
    try {
      const response = await apiService.post('/api/ciudadano/reportes', reporteData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al crear reporte');
    }
  },

  // NUEVO: Crear reporte CON fotos usando FormData
  crearReporteConFotos: async (formData) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      const response = await fetch('http://localhost:3001/api/ciudadano/reportes/con-fotos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // NO incluir Content-Type para FormData - el navegador lo establece automáticamente
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || `HTTP ${response.status}: Error al crear reporte`);
      }

      const result = await response.json();
      return result;
      
    } catch (error) {
      console.error('Error en crearReporteConFotos:', error);
      throw new Error(error.message || 'Error al crear reporte con fotos');
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
        timeout: 15000, // 15 segundos
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
              mensaje = 'Permiso de ubicación denegado por el usuario. Ve a configuración del navegador para habilitarlo.';
              break;
            case error.POSITION_UNAVAILABLE:
              mensaje = 'Información de ubicación no disponible. Intenta desde un lugar con mejor señal GPS.';
              break;
            case error.TIMEOUT:
              mensaje = 'Tiempo de espera agotado para obtener ubicación. Verifica tu conexión y señal GPS.';
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
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=es&zoom=18`
      );
      
      if (!response.ok) {
        throw new Error('Error en servicio de geocodificación');
      }
      
      const data = await response.json();
      
      if (data && data.display_name) {
        // Extraer partes relevantes de la dirección para Guatemala
        const address = data.address || {};
        const partesDireccion = [];
        
        // Agregar elementos en orden de relevancia
        if (address.house_number && address.road) {
          partesDireccion.push(`${address.road} ${address.house_number}`);
        } else if (address.road) {
          partesDireccion.push(address.road);
        }
        
        if (address.neighbourhood || address.suburb) {
          partesDireccion.push(address.neighbourhood || address.suburb);
        }
        
        if (address.city || address.town || address.village) {
          partesDireccion.push(address.city || address.town || address.village);
        }
        
        if (address.state) {
          partesDireccion.push(address.state);
        }

        return {
          direccion_completa: data.display_name,
          direccion_resumida: partesDireccion.join(', ') || data.display_name,
          ciudad: address.city || address.town || address.village || '',
          departamento: address.state || '',
          pais: address.country || 'Guatemala',
          codigo_postal: address.postcode || '',
          barrio: address.neighbourhood || address.suburb || ''
        };
      } else {
        throw new Error('No se pudo obtener la dirección');
      }
    } catch (error) {
      console.warn('Error en geocodificación inversa:', error);
      return {
        direccion_completa: `Coordenadas: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        direccion_resumida: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        ciudad: '',
        departamento: '',
        pais: 'Guatemala',
        barrio: ''
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
  },

  // Obtener ubicación aproximada por IP (fallback)
  obtenerUbicacionPorIP: async () => {
    try {
      const response = await fetch('http://ip-api.com/json/?fields=status,country,countryCode,region,regionName,city,lat,lon,timezone');
      const data = await response.json();
      
      if (data.status === 'success') {
        return {
          lat: data.lat,
          lng: data.lon,
          ciudad: data.city,
          region: data.regionName,
          pais: data.country,
          metodo: 'ip',
          precision: 50000 // Precisión muy baja para IP
        };
      } else {
        throw new Error('No se pudo obtener ubicación por IP');
      }
    } catch (error) {
      throw new Error('Error al obtener ubicación por IP: ' + error.message);
    }
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