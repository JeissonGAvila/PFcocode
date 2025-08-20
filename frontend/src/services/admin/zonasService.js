// frontend/src/services/admin/zonasService.js
import { apiService } from '../api.js';

const zonasService = {
  // Obtener todas las zonas con información completa
  getAll: async () => {
    try {
      const response = await apiService.get('/api/admin/zonas');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener zonas');
    }
  },

  // Obtener una zona específica con detalles completos
  getById: async (id) => {
    try {
      const response = await apiService.get(`/api/admin/zonas/${id}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener zona');
    }
  },

  // Crear nueva zona (incluye COCODE principal automático)
  create: async (zonaData) => {
    try {
      const response = await apiService.post('/api/admin/zonas', zonaData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al crear zona');
    }
  },

  // Actualizar zona existente (incluye COCODE principal)
  update: async (id, zonaData) => {
    try {
      const response = await apiService.put(`/api/admin/zonas/${id}`, zonaData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al actualizar zona');
    }
  },

  // Desactivar zona (borrado lógico)
  delete: async (id) => {
    try {
      const response = await apiService.delete(`/api/admin/zonas/${id}`);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al desactivar zona');
    }
  },

  // Crear sub-COCODE en una zona específica
  createSubCocode: async (zonaId, subcocodeData) => {
    try {
      const response = await apiService.post(`/api/admin/zonas/${zonaId}/subcocode`, subcocodeData);
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al crear sub-COCODE');
    }
  },

  // Obtener estadísticas generales de zonas
  getStats: async () => {
    try {
      const response = await apiService.get('/api/admin/zonas/stats');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Error al obtener estadísticas');
    }
  },

  // Validar número de zona único
  validateNumeroZona: async (numero, zonaId = null) => {
    try {
      const zonas = await zonasService.getAll();
      if (zonas.success) {
        const existeNumero = zonas.zonas.some(zona => 
          zona.numero_zona === parseInt(numero) && 
          (zonaId ? zona.id !== parseInt(zonaId) : true)
        );
        return !existeNumero;
      }
      return true;
    } catch (error) {
      return true; // En caso de error, permitir continuar
    }
  },

  // Validar nombre de zona único
  validateNombreZona: async (nombre, zonaId = null) => {
    try {
      const zonas = await zonasService.getAll();
      if (zonas.success) {
        const existeNombre = zonas.zonas.some(zona => 
          zona.nombre.toLowerCase() === nombre.toLowerCase() && 
          (zonaId ? zona.id !== parseInt(zonaId) : true)
        );
        return !existeNombre;
      }
      return true;
    } catch (error) {
      return true; // En caso de error, permitir continuar
    }
  },

  // Probar conexión
  testConnection: async () => {
    try {
      const response = await apiService.get('/api/admin/zonas');
      return { 
        success: true, 
        message: 'Conexión exitosa',
        total: response.zonas?.length || 0
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
export const tiposCobertura = [
  'Urbana',
  'Rural',
  'Mixta',
  'Periférica',
  'Central'
];

export const sectoresComunes = [
  'Centro',
  'Norte',
  'Sur',
  'Este',
  'Oeste',
  'La Democracia',
  'El Calvario',
  'San José',
  'La Libertad',
  'Las Flores',
  'El Progreso',
  'Villa Nueva',
  'Los Eucaliptos'
];

export const validacionesZona = {
  nombre: {
    required: true,
    minLength: 3,
    maxLength: 100,
    pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-\.]+$/,
    message: 'El nombre debe tener entre 3 y 100 caracteres, solo letras, números, espacios, guiones y puntos'
  },
  numero_zona: {
    required: true,
    min: 1,
    max: 50,
    type: 'number',
    message: 'El número de zona debe estar entre 1 y 50'
  },
  poblacion_estimada: {
    required: false,
    min: 0,
    max: 200000,
    type: 'number',
    message: 'La población debe estar entre 0 y 200,000 habitantes'
  },
  area_km2: {
    required: false,
    min: 0,
    max: 1000,
    type: 'number',
    step: 0.01,
    message: 'El área debe estar entre 0 y 1,000 km²'
  }
};

export const validacionesCocode = {
  nombre: {
    required: true,
    minLength: 5,
    maxLength: 150,
    message: 'El nombre del COCODE debe tener entre 5 y 150 caracteres'
  },
  direccion_oficina: {
    required: false,
    maxLength: 255,
    message: 'La dirección no puede exceder 255 caracteres'
  },
  telefono: {
    required: false,
    pattern: /^[0-9\-\s\+\(\)]{7,20}$/,
    message: 'Formato de teléfono válido: 7712-3456 o +502 7712-3456'
  }
};

export default zonasService;