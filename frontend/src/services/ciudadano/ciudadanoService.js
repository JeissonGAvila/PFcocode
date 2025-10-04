// frontend/src/services/ciudadano/ciudadanoService.js - 100% FIREBASE + COMENTARIOS UNIVERSALES
import { apiService } from '../api.js';

const ciudadanoService = {
  // Crear nuevo reporte SIN fotos
  crearReporte: async (reporteData) => {
    try {
      const response = await apiService.post('/api/ciudadano/reportes', reporteData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al crear reporte');
    }
  },

  // NUEVO: Crear reporte CON fotos - 100% FIREBASE
  crearReporteConFotos: async (reporteData, fotosArray) => {
    try {
      const { subirArchivoFirebase } = await import('../firebaseUploadService.js');
      
      if (!reporteData || !fotosArray || fotosArray.length === 0) {
        throw new Error('Datos del reporte y fotos son requeridos');
      }

      console.log('Firebase: Creando reporte con', fotosArray.length, 'fotos...');

      // 1. Crear reporte base
      const reporteCreado = await ciudadanoService.crearReporte(reporteData);
      
      if (!reporteCreado.success) {
        throw new Error(reporteCreado.message || 'Error al crear reporte base');
      }

      const reporteId = reporteCreado.reporte.id;
      
      // 2. Subir fotos a Firebase
      const fotosFirebase = [];
      for (let i = 0; i < fotosArray.length; i++) {
        const foto = fotosArray[i];
        console.log(`Subiendo foto ${i + 1}/${fotosArray.length} a Firebase...`);
        
        const resultadoFirebase = await subirArchivoFirebase(foto.file, reporteId, 'ciudadano');
        fotosFirebase.push(resultadoFirebase);
      }

      // 3. Guardar URLs de Firebase en BD
      await ciudadanoService.guardarArchivosFirebase(reporteId, fotosFirebase);
      
      return {
        success: true,
        message: `Reporte ${reporteCreado.numero_reporte} creado con ${fotosFirebase.length} fotos en Firebase`,
        reporte: reporteCreado.reporte,
        numero_reporte: reporteCreado.numero_reporte,
        fotos_firebase: fotosFirebase,
        fotos_subidas: fotosFirebase.length
      };
      
    } catch (error) {
      console.error('Error Firebase:', error);
      throw new Error(error.message || 'Error al crear reporte con fotos');
    }
  },

  // Guardar URLs de Firebase en base de datos
  guardarArchivosFirebase: async (reporteId, fotosFirebase) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:3003/api/ciudadano/reportes/${reporteId}/archivos-firebase`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          archivos: fotosFirebase.map(foto => ({
            nombre_archivo: foto.originalName,
            url_archivo: foto.url,
            tipo_archivo: foto.type,
            tamano_kb: Math.round(foto.size / 1024),
            firebase_path: foto.path,
            es_evidencia_inicial: true,
            subido_por_tipo: 'ciudadano'
          }))
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar archivos Firebase');
      }

      return await response.json();
      
    } catch (error) {
      console.error('Error guardando Firebase URLs:', error);
      throw error;
    }
  },

  // Obtener mis reportes
  getMisReportes: async () => {
    try {
      const response = await apiService.get('/api/ciudadano/reportes');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener tus reportes');
    }
  },

  // 💬 AGREGAR COMENTARIO - Sistema universal actualizado
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

  // 📖 OBTENER COMENTARIOS - Nueva función universal
  obtenerComentarios: async (reporteId) => {
    try {
      const response = await apiService.get(`/api/reportes/${reporteId}/comentarios`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener comentarios');
    }
  },

  // Obtener tipos de problema
  getTiposProblema: async () => {
    try {
      const response = await apiService.get('/api/ciudadano/reportes/tipos-problema');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener tipos de problema');
    }
  },

  // Obtener datos del formulario
  getDatosFormulario: async () => {
    try {
      const response = await apiService.get('/api/ciudadano/reportes/datos');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener datos del formulario');
    }
  }
};

// Geo utils
export const geoUtils = {
  obtenerUbicacionGPS: () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalización no soportada'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const ubicacion = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            precision: position.coords.accuracy,
            metodo: 'gps',
            timestamp: Date.now()
          };

          if (geoUtils.validarCoordenadasGuatemala(ubicacion.lat, ubicacion.lng)) {
            resolve(ubicacion);
          } else {
            reject(new Error('Ubicación fuera de Guatemala'));
          }
        },
        (error) => reject(new Error('Error GPS: ' + error.message)),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 300000 }
      );
    });
  },

  validarCoordenadasGuatemala: (lat, lng) => {
    if (!lat || !lng) return false;
    return lat >= 13.5 && lat <= 18.5 && lng >= -92.5 && lng <= -88.0;
  },

  coordenadasADireccion: async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=es&zoom=18`
      );
      const data = await response.json();
      
      return {
        direccion_completa: data.display_name || `${lat}, ${lng}`,
        direccion_resumida: data.display_name || `${lat}, ${lng}`
      };
    } catch (error) {
      return {
        direccion_completa: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        direccion_resumida: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      };
    }
  }
};

// Estados de reporte para ciudadano
export const estadosReporteCiudadano = {
  'Nuevo': { color: 'info', descripcion: 'Esperando revisión del líder', progreso: 10 },
  'Aprobado por Líder': { color: 'success', descripcion: 'Aprobado por líder', progreso: 30 },
  'Asignado': { color: 'primary', descripcion: 'Asignado a técnico', progreso: 50 },
  'En Proceso': { color: 'warning', descripcion: 'Técnico trabajando', progreso: 80 },
  'Resuelto': { color: 'success', descripcion: 'Problema resuelto', progreso: 100 }
};

// Prioridades de reporte
export const prioridadesReporte = [
  { value: 'Baja', label: 'Baja - No urgente', color: 'success' },
  { value: 'Media', label: 'Media - Normal', color: 'warning' },
  { value: 'Alta', label: 'Alta - Urgente', color: 'error' }
];

export default ciudadanoService;