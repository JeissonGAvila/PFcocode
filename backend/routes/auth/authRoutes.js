// backend/routes/auth/authRoutes.js
const express = require('express');
const router = express.Router();
const { login, logout, verificarToken } = require('../../controllers/auth/authController');
const { verificarToken: verificarTokenMiddleware } = require('../../middleware/authMiddleware');

// POST /api/auth/login - Iniciar sesión
router.post('/login', login);

// POST /api/auth/logout - Cerrar sesión  
router.post('/logout', logout);

// GET /api/auth/verify - Verificar si el token es válido
router.get('/verify', verificarTokenMiddleware, verificarToken);

// GET /api/auth/me - Obtener información del usuario actual
router.get('/me', verificarTokenMiddleware, (req, res) => {
  try {
    res.json({
      success: true,
      usuario: {
        id: req.user.id,
        nombre: req.user.nombre,
        apellido: req.user.apellido,
        correo: req.user.correo,
        tipo: req.user.tipo,
        panel: req.user.panel,
        departamento: req.user.departamento,
        zona: req.user.zona,
        permisos: req.user.permisos
      }
    });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ 
      error: 'Error al obtener información del usuario' 
    });
  }
});

module.exports = router;