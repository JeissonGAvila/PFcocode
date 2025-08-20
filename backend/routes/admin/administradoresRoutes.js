// backend/routes/admin/administradoresRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAdministradores,
  createAdministrador,
  updateAdministrador,
  updateAdministradorPassword,
  deleteAdministrador,
  getDatosSelect
} = require('../../controllers/admin/administradoresController');

// GET /api/admin/administradores - Obtener todos los administradores
router.get('/', getAdministradores);

// GET /api/admin/administradores/datos - Obtener datos para selects (roles, departamentos, etc.)
router.get('/datos', getDatosSelect);

// POST /api/admin/administradores - Crear nuevo administrador
router.post('/', createAdministrador);

// PUT /api/admin/administradores/:id - Actualizar administrador existente
router.put('/:id', updateAdministrador);

// PATCH /api/admin/administradores/:id/password - Cambiar contraseña del administrador
router.patch('/:id/password', updateAdministradorPassword);

// DELETE /api/admin/administradores/:id - Desactivar administrador (borrado lógico)
router.delete('/:id', deleteAdministrador);

module.exports = router;