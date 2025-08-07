// backend/controllers/auth/authController.js
const pool = require('../../models/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Clave secreta para JWT (después la movemos a .env)
const JWT_SECRET = 'tu_clave_secreta_muy_segura_2025';

const login = async (req, res) => {
  const { correo, contrasena } = req.body;

  try {
    // Validar datos de entrada
    if (!correo || !contrasena) {
      return res.status(400).json({ 
        error: 'Email y contraseña son requeridos' 
      });
    }

    let usuario = null;
    let tipoUsuario = '';
    let panel = '';
    let permisos = {};

    // PASO 1: Buscar en tabla ADMINISTRADORES
    const adminQuery = `
      SELECT id, nombre, apellido, correo, contrasena, tipo_usuario, departamento, puede_asignar, rol
      FROM administradores 
      WHERE correo = $1 AND estado = TRUE
    `;
    const adminResult = await pool.query(adminQuery, [correo]);

    if (adminResult.rows.length > 0) {
      usuario = adminResult.rows[0];
      
      if (usuario.tipo_usuario === 'administrador') {
        tipoUsuario = 'administrador';
        panel = '/admin';
        permisos = {
          todoAcceso: true,
          gestionUsuarios: true,
          asignarReportes: true,
          configuraciones: true
        };
      } else if (usuario.tipo_usuario === 'tecnico') {
        tipoUsuario = 'tecnico';
        panel = '/tecnico';
        permisos = {
          verReportesDepartamento: true,
          cambiarEstados: true,
          subirEvidencia: true,
          departamento: usuario.departamento
        };
      }
    }

    // PASO 2: Si no es admin/técnico, buscar en tabla USUARIOS (Líderes COCODE)
    if (!usuario) {
      const liderQuery = `
        SELECT u.id, u.nombre, u.apellido, u.correo, u.contrasena, u.tipo_lider, 
               u.id_cocode_principal, u.id_subcocode, u.cargo,
               z.id as id_zona, z.nombre as nombre_zona
        FROM usuarios u
        LEFT JOIN cocode c ON u.id_cocode_principal = c.id
        LEFT JOIN zonas z ON c.id_zona = z.id
        WHERE u.correo = $1 AND u.estado = TRUE
      `;
      const liderResult = await pool.query(liderQuery, [correo]);

      if (liderResult.rows.length > 0) {
        usuario = liderResult.rows[0];
        tipoUsuario = 'liderCocode';
        panel = '/lider';
        permisos = {
          gestionZona: true,
          crearReportesComunitarios: true,
          validarCiudadanos: true,
          coordinarTecnicos: true,
          id_zona: usuario.id_zona,
          id_cocode: usuario.id_cocode_principal
        };
      }
    }

    // PASO 3: Si no es líder, buscar en tabla CIUDADANOS_COLABORADORES
    if (!usuario) {
      const ciudadanoQuery = `
        SELECT c.id, c.nombre, c.apellido, c.correo, c.contrasena, c.dpi,
               c.id_zona, c.id_subcocode_cercano, c.direccion_completa,
               z.nombre as nombre_zona
        FROM ciudadanos_colaboradores c
        LEFT JOIN zonas z ON c.id_zona = z.id
        WHERE c.correo = $1 AND c.estado = TRUE
      `;
      const ciudadanoResult = await pool.query(ciudadanoQuery, [correo]);

      if (ciudadanoResult.rows.length > 0) {
        usuario = ciudadanoResult.rows[0];
        tipoUsuario = 'ciudadano';
        panel = '/ciudadano';
        permisos = {
          crearReportes: true,
          verSusReportes: true,
          comentarReportes: true,
          actualizarPerfil: true,
          id_ciudadano: usuario.id
        };
      }
    }

    // Si no encontró el usuario en ninguna tabla
    if (!usuario) {
      return res.status(401).json({ 
        error: 'Usuario no encontrado' 
      });
    }

    // Verificar contraseña
    const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!contrasenaValida) {
      return res.status(401).json({ 
        error: 'Contraseña incorrecta' 
      });
    }

    // Crear payload del JWT
    const payload = {
      id: usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      correo: usuario.correo,
      tipo: tipoUsuario,
      panel: panel,
      permisos: permisos,
      departamento: usuario.departamento || null,
      zona: usuario.nombre_zona || null
    };

    // Generar token JWT
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

    // Actualizar último acceso (solo para administradores)
    if (tipoUsuario === 'administrador' || tipoUsuario === 'tecnico') {
      await pool.query(
        'UPDATE administradores SET ultimo_acceso = CURRENT_TIMESTAMP WHERE id = $1',
        [usuario.id]
      );
    }

    // Respuesta exitosa
    res.json({
      success: true,
      message: 'Login exitoso',
      token: token,
      usuario: {
        id: usuario.id,
        nombre: `${usuario.nombre} ${usuario.apellido}`,
        correo: usuario.correo,
        tipo: tipoUsuario,
        panel: panel,
        departamento: usuario.departamento || null,
        zona: usuario.nombre_zona || null
      },
      redirigir: panel
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor' 
    });
  }
};

const logout = async (req, res) => {
  // En un sistema JWT, el logout se maneja principalmente en el frontend
  // eliminando el token. Aquí podemos registrar la acción si es necesario.
  
  try {
    res.json({
      success: true,
      message: 'Sesión cerrada correctamente'
    });
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({ 
      error: 'Error al cerrar sesión' 
    });
  }
};

const verificarToken = async (req, res) => {
  try {
    // El middleware ya verificó el token, solo devolvemos la info del usuario
    res.json({
      success: true,
      usuario: req.user
    });
  } catch (error) {
    console.error('Error al verificar token:', error);
    res.status(500).json({ 
      error: 'Error al verificar token' 
    });
  }
};

module.exports = {
  login,
  logout,
  verificarToken
};