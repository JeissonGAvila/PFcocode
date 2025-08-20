// backend/routes/admin/zonasRoutes.js
const express = require('express');
const router = express.Router();
const {
  getZonas,
  getZonaById,
  createZona,
  updateZona,
  deleteZona,
  createSubCocode,
  getZonasStats
} = require('../../controllers/admin/zonasController');

// GET /api/admin/zonas - Obtener todas las zonas con información completa
router.get('/', getZonas);

// GET /api/admin/zonas/stats - Obtener estadísticas generales de zonas
router.get('/stats', getZonasStats);

// GET /api/admin/zonas/:id - Obtener una zona específica con detalles completos
router.get('/:id', getZonaById);

// POST /api/admin/zonas - Crear nueva zona (incluye COCODE principal automático)
router.post('/', createZona);

// PUT /api/admin/zonas/:id - Actualizar zona existente (incluye COCODE principal)
router.put('/:id', updateZona);

// DELETE /api/admin/zonas/:id - Desactivar zona (borrado lógico)
router.delete('/:id', deleteZona);

// POST /api/admin/zonas/:zonaId/subcocode - Crear sub-COCODE en una zona específica
router.post('/:zonaId/subcocode', createSubCocode);

module.exports = router;