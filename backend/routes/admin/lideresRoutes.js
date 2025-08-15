// backend/routes/admin/lideresRoutes.js
const express = require('express');
const router = express.Router();
const {
  getLideres,
  createLider,
  updateLider,
  updateLiderPassword,
  deleteLider,
  getDatosSelect
} = require('../../controllers/admin/lideresController');

// GET /api/admin/lideres - Obtener todos los líderes COCODE
router.get('/', getLideres);

// GET /api/admin/lideres/datos - Obtener datos para selects (COCODE, Sub-COCODE, etc.)
router.get('/datos', getDatosSelect);

// POST /api/admin/lideres - Crear nuevo líder COCODE
router.post('/', createLider);

// PUT /api/admin/lideres/:id - Actualizar líder existente
router.put('/:id', updateLider);

// PATCH /api/admin/lideres/:id/password - Cambiar contraseña del líder
router.patch('/:id/password', updateLiderPassword);

// DELETE /api/admin/lideres/:id - Desactivar líder (borrado lógico)
router.delete('/:id', deleteLider);

module.exports = router;