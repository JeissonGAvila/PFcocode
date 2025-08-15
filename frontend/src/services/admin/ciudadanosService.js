// frontend/src/services/admin/ciudadanosService.js
import { apiService, handleApiError } from '../api.js';

export const ciudadanosService = {
  // 📋 LISTAR TODOS LOS CIUDADANOS
  getAll: async () => {
    try {
      const response = await apiService.get('/api/admin/ciudadanos');
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 📊 OBTENER ESTADÍSTICAS DE CIUDADANOS
  getEstadisticas: async () => {
    try {
      const response = await apiService.get('/api/admin/ciudadanos/estadisticas');
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 🌍 CIUDADANOS POR ZONA
  getByZona: async (zonaId) => {
    try {
      const response = await apiService.get(`/api/admin/ciudadanos/zona/${zonaId}`);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // ➕ CREAR NUEVO CIUDADANO
  create: async (ciudadanoData) => {
    try {
      const response = await apiService.post('/api/admin/ciudadanos', ciudadanoData);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // ✏️ ACTUALIZAR CIUDADANO
  update: async (id, ciudadanoData) => {
    try {
      const response = await apiService.put(`/api/admin/ciudadanos/${id}`, ciudadanoData);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 🔐 CAMBIAR CONTRASEÑA
  updatePassword: async (id, nuevaContrasena, usuarioModifica = 'admin') => {
    try {
      const response = await apiService.patch(`/api/admin/ciudadanos/${id}/password`, {
        nueva_contrasena: nuevaContrasena,
        usuario_modifica: usuarioModifica
      });
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // ✅ VERIFICAR CIUDADANO
  verificar: async (id, verificado = true, usuarioModifica = 'admin') => {
    try {
      const response = await apiService.patch(`/api/admin/ciudadanos/${id}/verificar`, {
        verificado: verificado,
        usuario_modifica: usuarioModifica
      });
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 🗑️ DESACTIVAR CIUDADANO (borrado lógico)
  delete: async (id, usuarioModifica = 'admin') => {
    try {
      const response = await apiService.delete(`/api/admin/ciudadanos/${id}`, {
        usuario_modifica: usuarioModifica
      });
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 🔍 BUSCAR CIUDADANOS
  buscar: async (termino, filtros = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (termino) {
        queryParams.append('busqueda', termino);
      }
      
      // Agregar filtros opcionales
      Object.keys(filtros).forEach(key => {
        if (filtros[key]) {
          queryParams.append(key, filtros[key]);
        }
      });
      
      const response = await apiService.get(`/api/admin/ciudadanos/buscar?${queryParams.toString()}`);
      return response;
      
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 📤 EXPORTAR CIUDADANOS (para futuro)
  exportar: async (formato = 'excel', filtros = {}) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('formato', formato);
      
      Object.keys(filtros).forEach(key => {
        if (filtros[key]) {
          queryParams.append(key, filtros[key]);
        }
      });
      
      const response = await apiService.get(`/api/admin/ciudadanos/exportar?${queryParams.toString()}`, {
        responseType: 'blob' // Para descargar archivos
      });
      
      return response;
      
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  },

  // 📊 REPORTES DE CIUDADANOS (para futuro)
  getReportes: async (filtros = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      Object.keys(filtros).forEach(key => {
        if (filtros[key]) {
          queryParams.append(key, filtros[key]);
        }
      });
      
      const response = await apiService.get(`/api/admin/ciudadanos/reportes?${queryParams.toString()}`);
      return response;
      
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
};