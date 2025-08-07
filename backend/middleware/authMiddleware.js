// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'tu_clave_secreta_muy_segura_2025'; // Después mover a .env

// Middleware principal para verificar JWT
const verificarToken = (req, res, next) => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ 
        error: 'Token de acceso requerido' 
      });
    }

    // El formato esperado es: "Bearer TOKEN_AQUI"
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Formato de token inválido' 
      });
    }

    // Verificar y decodificar el token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Agregar información del usuario al request
    req.user = decoded;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expirado. Por favor inicia sesión nuevamente.' 
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Token inválido' 
      });
    } else {
      console.error('Error al verificar token:', error);
      return res.status(500).json({ 
        error: 'Error interno del servidor' 
      });
    }
  }
};

// Middleware para verificar que sea ADMINISTRADOR
const verificarAdmin = (req, res, next) => {
  if (req.user.tipo !== 'administrador') {
    return res.status(403).json({ 
      error: 'Acceso denegado. Se requieren permisos de administrador.' 
    });
  }
  next();
};

// Middleware para verificar que sea TÉCNICO
const verificarTecnico = (req, res, next) => {
  if (req.user.tipo !== 'tecnico') {
    return res.status(403).json({ 
      error: 'Acceso denegado. Se requieren permisos de técnico.' 
    });
  }
  next();
};

// Middleware para verificar que sea LÍDER COCODE
const verificarLider = (req, res, next) => {
  if (req.user.tipo !== 'liderCocode') {
    return res.status(403).json({ 
      error: 'Acceso denegado. Se requieren permisos de líder COCODE.' 
    });
  }
  next();
};

// Middleware para verificar que sea CIUDADANO
const verificarCiudadano = (req, res, next) => {
  if (req.user.tipo !== 'ciudadano') {
    return res.status(403).json({ 
      error: 'Acceso denegado. Se requieren permisos de ciudadano.' 
    });
  }
  next();
};

// Middleware para verificar que sea ADMIN O TÉCNICO
const verificarAdminOTecnico = (req, res, next) => {
  if (req.user.tipo !== 'administrador' && req.user.tipo !== 'tecnico') {
    return res.status(403).json({ 
      error: 'Acceso denegado. Se requieren permisos administrativos.' 
    });
  }
  next();
};

// Middleware para verificar que el técnico solo vea reportes de su departamento
const verificarDepartamentoTecnico = (req, res, next) => {
  if (req.user.tipo === 'tecnico') {
    // Agregar filtro de departamento para consultas
    req.filtroDepartamento = req.user.permisos.departamento;
  }
  next();
};

// Middleware para verificar que el líder solo vea reportes de su zona
const verificarZonaLider = (req, res, next) => {
  if (req.user.tipo === 'liderCocode') {
    // Agregar filtros de zona para consultas
    req.filtroZona = req.user.permisos.id_zona;
    req.filtroCocode = req.user.permisos.id_cocode;
  }
  next();
};

// Middleware para verificar que el ciudadano solo vea sus propios reportes
const verificarPropiosReportes = (req, res, next) => {
  if (req.user.tipo === 'ciudadano') {
    // Agregar filtro para que solo vea sus reportes
    req.filtroCiudadano = req.user.permisos.id_ciudadano;
  }
  next();
};

// Middleware flexible para múltiples tipos de usuario
const verificarTipos = (...tiposPermitidos) => {
  return (req, res, next) => {
    if (!tiposPermitidos.includes(req.user.tipo)) {
      return res.status(403).json({ 
        error: `Acceso denegado. Tipos permitidos: ${tiposPermitidos.join(', ')}` 
      });
    }
    next();
  };
};

module.exports = {
  verificarToken,
  verificarAdmin,
  verificarTecnico,
  verificarLider,
  verificarCiudadano,
  verificarAdminOTecnico,
  verificarDepartamentoTecnico,
  verificarZonaLider,
  verificarPropiosReportes,
  verificarTipos
};