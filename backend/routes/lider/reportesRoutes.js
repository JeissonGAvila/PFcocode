// backend/routes/lider/reportesRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getReportesPendientesAprobacion,
  aprobarReporte,
  rechazarReporte,
  getReportesZona,
  validarResolucion
} = require('../../controllers/lider/reportesController');

const { verificarToken, verificarLider } = require('../../middleware/authMiddleware');

// Aplicar middleware de autenticación a todas las rutas
router.use(verificarToken);
router.use(verificarLider);

// ===================================
// RUTAS DE REPORTES PARA LÍDER COCODE
// ===================================

// GET /api/lider/reportes/pendientes - Ver reportes pendientes de aprobación (Estado "Nuevo")
router.get('/pendientes', getReportesPendientesAprobacion);

// GET /api/lider/reportes/zona - Ver todos los reportes de su zona (con filtros)
router.get('/zona', getReportesZona);

// PUT /api/lider/reportes/:reporteId/aprobar - Aprobar reporte (Nuevo → Aprobado por Líder)
router.put('/:reporteId/aprobar', aprobarReporte);

// PUT /api/lider/reportes/:reporteId/rechazar - Rechazar reporte (Nuevo → Rechazado por Líder)
router.put('/:reporteId/rechazar', rechazarReporte);

// PUT /api/lider/reportes/:reporteId/validar - Validar resolución (Resuelto → Cerrado/Reabierto)
router.put('/:reporteId/validar', validarResolucion);

module.exports = router;