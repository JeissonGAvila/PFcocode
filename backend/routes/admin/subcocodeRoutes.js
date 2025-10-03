// backend/routes/admin/subcocodeRoutes.js
const express = require('express');
const router = express.Router();
const { verificarToken, verificarAdmin } = require('../../middleware/authMiddleware');
const {
  getSubcocodes,
  getSubcocodesPorCocode,
  getSubcocodesPorZona,
  createSubcocode,
  updateSubcocode,
  deleteSubcocode
} = require('../../controllers/admin/subcocodeController');

// Aplicar middleware de autenticación a todas las rutas
router.use(verificarToken);
router.use(verificarAdmin);

// GET /api/admin/subcocode - Obtener todos los Sectores
router.get('/', getSubcocodes);

// GET /api/admin/subcocode/cocode/:cocodeId - Obtener Sectores por COCODE
router.get('/cocode/:cocodeId', getSubcocodesPorCocode);

// GET /api/admin/subcocode/zona/:zonaId - Obtener Sectores por zona
router.get('/zona/:zonaId', getSubcocodesPorZona);

// POST /api/admin/subcocode - Crear nuevo Sector
router.post('/', createSubcocode);

// PUT /api/admin/subcocode/:id - Actualizar Sector existente
router.put('/:id', updateSubcocode);

// DELETE /api/admin/subcocode/:id - Desactivar Sector (borrado lógico)
router.delete('/:id', deleteSubcocode);

module.exports = router;