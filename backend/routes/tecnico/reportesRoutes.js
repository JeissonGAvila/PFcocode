// backend/routes/tecnico/reportesRoutes.js
const express = require('express');
const router = express.Router();
const {
  getMisReportes,
  cambiarEstadoReporte,
  agregarSeguimiento,
  getHistorialReporte,
  getEstadisticasTecnico
} = require('../../controllers/tecnico/reportesController');

// GET /api/tecnico/reportes - Obtener reportes asignados al técnico
router.get('/', getMisReportes);

// GET /api/tecnico/reportes/:tecnicoId - Obtener reportes de técnico específico (para pruebas)
router.get('/:tecnicoId', getMisReportes);

// PUT /api/tecnico/reportes/:id/estado - Cambiar estado del reporte
router.put('/:id/estado', cambiarEstadoReporte);

// POST /api/tecnico/reportes/:id/seguimiento - Agregar seguimiento/comentario
router.post('/:id/seguimiento', agregarSeguimiento);

// GET /api/tecnico/reportes/:id/historial - Obtener historial del reporte
router.get('/:id/historial', getHistorialReporte);

// GET /api/tecnico/reportes/:tecnicoId/historial - Obtener historial por técnico
router.get('/:tecnicoId/historial', getHistorialReporte);

// GET /api/tecnico/estadisticas - Obtener estadísticas del técnico
router.get('/stats/personal', getEstadisticasTecnico);

// GET /api/tecnico/estadisticas/:tecnicoId - Estadísticas de técnico específico
router.get('/stats/:tecnicoId', getEstadisticasTecnico);

module.exports = router;