// backend/routes/admin/zonasRoutes.js
const express = require('express');
const router = express.Router();
const {
  getZonas,
  getZonaById,
  createZona,
  updateZona,
  deleteZona,
  getZonasStats
} = require('../../controllers/admin/zonasController');

// GET /api/admin/zonas/stats
router.get('/stats', getZonasStats);

// GET /api/admin/zonas
router.get('/', getZonas);

// GET /api/admin/zonas/:id
router.get('/:id', getZonaById);

// POST /api/admin/zonas
router.post('/', createZona);

// PUT /api/admin/zonas/:id
router.put('/:id', updateZona);

// DELETE /api/admin/zonas/:id
router.delete('/:id', deleteZona);

module.exports = router;