// frontend/src/services/usuariosService.js - SERVICIO DE USUARIOS
import { apiService, handleApiError } from './api.js';

export const usuariosService = {
  // 👨‍💼 ADMINISTRADORES
  administradores: {
    // Listar todos los administradores
    getAll: async () => {
      try {
        const response = await apiService.get('/api/admin/administradores');
        return response;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    // Crear nuevo administrador
    create: async (adminData) => {
      try {
        const response = await apiService.post('/api/admin/administradores', adminData);
        return response;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    // Actualizar administrador
    update: async (id, adminData) => {
      try {
        const response = await apiService.put(`/api/admin/administradores/${id}`, adminData);
        return response;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    // Desactivar administrador
    delete: async (id) => {
      try {
        const response = await apiService.delete(`/api/admin/administradores/${id}`);
        return response;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    }
  },

  // 👨‍🔧 TÉCNICOS
  tecnicos: {
    // Listar técnicos
    getAll: async () => {
      try {
        const response = await apiService.get('/api/admin/tecnicos');
        return response;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    // Técnicos por departamento
    getByDepartamento: async (departamento) => {
      try {
        const response = await apiService.get(`/api/admin/tecnicos/departamento/${departamento}`);
        return response;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    // Crear técnico
    create: async (tecnicoData) => {
      try {
        const response = await apiService.post('/api/admin/tecnicos', tecnicoData);
        return response;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    // Actualizar técnico
    update: async (id, tecnicoData) => {
      try {
        const response = await apiService.put(`/api/admin/tecnicos/${id}`, tecnicoData);
        return response;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    }
  },

  // 👥 LÍDERES COCODE
  lideres: {
    // Listar líderes
    getAll: async () => {
      try {
        const response = await apiService.get('/api/admin/lideres');
        return response;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    // Líderes por zona
    getByZona: async (zonaId) => {
      try {
        const response = await apiService.get(`/api/admin/lideres/zona/${zonaId}`);
        return response;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    // Crear líder
    create: async (liderData) => {
      try {
        const response = await apiService.post('/api/admin/lideres', liderData);
        return response;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    // Actualizar líder
    update: async (id, liderData) => {
      try {
        const response = await apiService.put(`/api/admin/lideres/${id}`, liderData);
        return response;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    }
  },

  // 👤 CIUDADANOS
  ciudadanos: {
    // Listar ciudadanos
    getAll: async () => {
      try {
        const response = await apiService.get('/api/admin/ciudadanos');
        return response;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    // Ciudadanos por zona
    getByZona: async (zonaId) => {
      try {
        const response = await apiService.get(`/api/admin/ciudadanos/zona/${zonaId}`);
        return response;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    // Registrar ciudadano
    register: async (ciudadanoData) => {
      try {
        const response = await apiService.post('/api/ciudadanos/register', ciudadanoData);
        return response;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    // Actualizar perfil (propio)
    updateProfile: async (profileData) => {
      try {
        const response = await apiService.put('/api/ciudadanos/profile', profileData);
        return response;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    // Verificar ciudadano (por líder)
    verificar: async (ciudadanoId, verificado = true) => {
      try {
        const response = await apiService.put(`/api/lider/ciudadanos/${ciudadanoId}/verificar`, {
          verificado: verificado
        });
        return response;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    }
  },

  // 🌍 ZONAS Y COCODE
  zonas: {
    // Listar todas las zonas
    getAll: async () => {
      try {
        const response = await apiService.get('/api/admin/zonas');
        return response;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    // Crear zona
    create: async (zonaData) => {
      try {
        const response = await apiService.post('/api/admin/zonas', zonaData);
        return response;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    // COCODE de una zona
    getCocode: async (zonaId) => {
      try {
        const response = await apiService.get(`/api/admin/zonas/${zonaId}/cocode`);
        return response;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    }
  }
};