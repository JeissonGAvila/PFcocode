// backend/routes/admin/cocodeRoutes.js
const express = require('express');
const router = express.Router();
const { verificarToken, verificarAdmin } = require('../../middleware/authMiddleware');
const {
  getCocodes,
  getCocodesPorZona,
  createCocode,
  updateCocode,
  deleteCocode
} = require('../../controllers/admin/cocodeController');

// Aplicar middleware de autenticación a todas las rutas
router.use(verificarToken);
router.use(verificarAdmin);

// GET /api/admin/cocode - Obtener todos los COCODEs
router.get('/', getCocodes);

// GET /api/admin/cocode/zona/:zonaId - Obtener COCODEs por zona
router.get('/zona/:zonaId', getCocodesPorZona);

// POST /api/admin/cocode - Crear nuevo COCODE
router.post('/', createCocode);

// PUT /api/admin/cocode/:id - Actualizar COCODE existente
router.put('/:id', updateCocode);

// DELETE /api/admin/cocode/:id - Desactivar COCODE (borrado lógico)
router.delete('/:id', deleteCocode);

module.exports = router;