// frontend/src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService.js';

// Crear el contexto
const AuthContext = createContext();

// Hook para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

// Provider del contexto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar autenticación al cargar la app
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      
      // Verificar si hay datos en localStorage
      const storedUser = authService.getStoredUser();
      const storedToken = authService.getStoredToken();
      
      if (storedToken && storedUser) {
        // Verificar que el token siga siendo válido
        try {
          const response = await authService.verifyToken();
          
          if (response.success) {
            setUser(storedUser);
            setIsAuthenticated(true);
          } else {
            // Token inválido, limpiar datos
            logout();
          }
        } catch (error) {
          console.warn('Token inválido:', error.message);
          logout();
        }
      } else {
        // No hay datos de autenticación
        setUser(null);
        setIsAuthenticated(false);
      }
      
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (correo, contrasena) => {
    try {
      setLoading(true);
      
      const response = await authService.login(correo, contrasena);
      
      if (response.success) {
        setUser(response.usuario);
        setIsAuthenticated(true);
        return response;
      } else {
        throw new Error(response.error || 'Error en el login');
      }
      
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      
      // Llamar al servicio de logout
      await authService.logout();
      
    } catch (error) {
      console.warn('Error en logout:', error);
    } finally {
      // Limpiar estado local siempre
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      
      // Redirigir al login
      window.location.href = '/login';
    }
  };

  const refreshUser = async () => {
    try {
      const response = await authService.getCurrentUser();
      
      if (response.success && response.usuario) {
        setUser(response.usuario);
        return response.usuario;
      }
      
    } catch (error) {
      console.error('Error refrescando usuario:', error);
      // Si falla, hacer logout
      logout();
    }
  };

  // Verificar permisos
  const hasPermission = (permission) => {
    if (!isAuthenticated || !user) return false;
    
    if (user.tipo === 'administrador') {
      return true; // Admin tiene todos los permisos
    }
    
    return user.permisos && user.permisos[permission] === true;
  };

  // Verificar tipo de usuario
  const isUserType = (tipo) => {
    return isAuthenticated && user && user.tipo === tipo;
  };

  // Obtener panel del usuario
  const getUserPanel = () => {
    if (!isAuthenticated || !user) return '/login';
    
    const panels = {
      'administrador': '/admin',
      'tecnico': '/tecnico',
      'liderCocode': '/lider',
      'ciudadano': '/ciudadano'
    };
    
    return panels[user.tipo] || '/login';
  };

  const value = {
    // Estados
    user,
    loading,
    isAuthenticated,
    
    // Acciones
    login,
    logout,
    refreshUser,
    
    // Helpers
    hasPermission,
    isUserType,
    getUserPanel,
    
    // Verificaciones específicas
    isAdmin: () => isUserType('administrador'),
    isTecnico: () => isUserType('tecnico'),
    isLider: () => isUserType('liderCocode'),
    isCiudadano: () => isUserType('ciudadano'),
    
    // Datos del usuario
    userName: user ? `${user.nombre}` : '',
    userEmail: user ? user.correo : '',
    userType: user ? user.tipo : null,
    userDepartamento: user ? user.departamento : null,
    userZona: user ? user.zona : null
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};