// frontend/src/services/admin/tecnicosService.js
const API_BASE_URL = 'https://jason.hopitalbarillas.cloud/api';

// 🛠️ Helper function para manejar respuestas
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Error de conexión' }));
    throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
  }
  return await response.json();
};

// 🛠️ Helper function para headers
const getHeaders = () => {
  return {
    'Content-Type': 'application/json'
    // TODO: Agregar Authorization cuando implementemos auth
  };
};

// 🔧 SERVICIO DE TÉCNICOS
export const tecnicosService = {
  
  // 📋 LISTAR TODOS LOS TÉCNICOS
  getAll: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/tecnicos`, {
        method: 'GET',
        headers: getHeaders()
      });
      
      const data = await handleResponse(response);
      return {
        success: true,
        tecnicos: data.data || [],
        total: data.total || 0
      };
      
    } catch (error) {
      console.error('Error al obtener técnicos:', error);
      throw new Error(error.message || 'Error al obtener la lista de técnicos');
    }
  },

  // ➕ CREAR NUEVO TÉCNICO
  create: async (tecnicoData) => {
    try {
      // Validaciones básicas
      if (!tecnicoData.nombre || !tecnicoData.apellido || !tecnicoData.correo || !tecnicoData.contrasena) {
        throw new Error('Nombre, apellido, correo y contraseña son obligatorios');
      }

      if (!tecnicoData.departamento) {
        throw new Error('El departamento es obligatorio');
      }

      const response = await fetch(`${API_BASE_URL}/admin/tecnicos`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          ...tecnicoData,
          usuario_ingreso: 'admin' // TODO: obtener del contexto de auth
        })
      });
      
      const data = await handleResponse(response);
      return {
        success: true,
        tecnico: data.data,
        message: data.message || 'Técnico creado exitosamente'
      };
      
    } catch (error) {
      console.error('Error al crear técnico:', error);
      throw new Error(error.message || 'Error al crear el técnico');
    }
  },

  // ✏️ ACTUALIZAR TÉCNICO
  update: async (id, tecnicoData) => {
    try {
      if (!id) {
        throw new Error('ID del técnico es requerido');
      }

      if (!tecnicoData.nombre || !tecnicoData.apellido || !tecnicoData.correo) {
        throw new Error('Nombre, apellido y correo son obligatorios');
      }

      if (!tecnicoData.departamento) {
        throw new Error('El departamento es obligatorio');
      }

      const response = await fetch(`${API_BASE_URL}/admin/tecnicos/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          ...tecnicoData,
          usuario_modifica: 'admin' // TODO: obtener del contexto de auth
        })
      });
      
      const data = await handleResponse(response);
      return {
        success: true,
        tecnico: data.data,
        message: data.message || 'Técnico actualizado exitosamente'
      };
      
    } catch (error) {
      console.error('Error al actualizar técnico:', error);
      throw new Error(error.message || 'Error al actualizar el técnico');
    }
  },

  // 🔑 CAMBIAR CONTRASEÑA
  updatePassword: async (id, nuevaContrasena) => {
    try {
      if (!id) {
        throw new Error('ID del técnico es requerido');
      }

      if (!nuevaContrasena) {
        throw new Error('Nueva contraseña es requerida');
      }

      if (nuevaContrasena.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      const response = await fetch(`${API_BASE_URL}/admin/tecnicos/${id}/password`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({
          nueva_contrasena: nuevaContrasena,
          usuario_modifica: 'admin' // TODO: obtener del contexto de auth
        })
      });
      
      const data = await handleResponse(response);
      return {
        success: true,
        message: data.message || 'Contraseña actualizada exitosamente'
      };
      
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      throw new Error(error.message || 'Error al cambiar la contraseña');
    }
  },

  // 🗑️ DESACTIVAR TÉCNICO
  delete: async (id) => {
    try {
      if (!id) {
        throw new Error('ID del técnico es requerido');
      }

      const response = await fetch(`${API_BASE_URL}/admin/tecnicos/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
        body: JSON.stringify({
          usuario_modifica: 'admin' // TODO: obtener del contexto de auth
        })
      });
      
      const data = await handleResponse(response);
      return {
        success: true,
        message: data.message || 'Técnico desactivado exitosamente'
      };
      
    } catch (error) {
      console.error('Error al desactivar técnico:', error);
      throw new Error(error.message || 'Error al desactivar el técnico');
    }
  },

  // 📊 OBTENER TÉCNICOS POR DEPARTAMENTO
  getByDepartamento: async (departamento) => {
    try {
      const encodedDept = encodeURIComponent(departamento);
      const response = await fetch(`${API_BASE_URL}/admin/tecnicos/departamento/${encodedDept}`, {
        method: 'GET',
        headers: getHeaders()
      });
      
      const data = await handleResponse(response);
      return {
        success: true,
        tecnicos: data.data || [],
        departamento: data.departamento,
        total: data.total || 0
      };
      
    } catch (error) {
      console.error('Error al obtener técnicos por departamento:', error);
      throw new Error(error.message || 'Error al obtener técnicos del departamento');
    }
  },

  // 🧪 PROBAR CONEXIÓN
  testConnection: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/test`);
      const data = await handleResponse(response);
      return {
        success: true,
        message: data.message,
        timestamp: data.timestamp
      };
    } catch (error) {
      console.error('Error de conexión:', error);
      throw new Error('No se puede conectar con el servidor');
    }
  }
};

// 📋 DATOS AUXILIARES PARA EL CRUD
export const departamentosTecnicos = [
  'Energía Eléctrica',
  'Agua Potable', 
  'Drenajes',
  'Alumbrado Público',
  'Recolección de Basura',
  'Mantenimiento Vial'
];

export const rolesTecnicos = [
  'Técnico Junior',
  'Técnico Senior', 
  'Técnico Especialista',
  'Supervisor Técnico',
  'Jefe de Departamento'
];

// Export default para facilitar importación
export default tecnicosService;