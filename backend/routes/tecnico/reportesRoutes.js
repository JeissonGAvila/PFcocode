// backend/routes/tecnico/reportesRoutes.js - ACTUALIZADO CON RUTA DE DETALLE
const express = require('express');
const router = express.Router();
const {
  getMisReportes,
  getReporteDetalle,     // NUEVO
  cambiarEstadoReporte,
  agregarSeguimiento,
  getHistorialReporte,
  getEstadisticasTecnico
} = require('../../controllers/tecnico/reportesController');

// IMPORTAR MIDDLEWARES DE AUTENTICACIÓN
const { verificarToken, verificarTecnico } = require('../../middleware/authMiddleware');

// APLICAR MIDDLEWARES A TODAS LAS RUTAS
router.use(verificarToken);  // Verificar JWT en todas las rutas
router.use(verificarTecnico); // Verificar que sea técnico

// ===================================
// RUTAS PROTEGIDAS PARA TÉCNICOS
// ORDEN IMPORTANTE: Específicas primero, genéricas después
// ===================================

// ESTADÍSTICAS (debe ir antes de las rutas con :id)
router.get('/stats/personal', getEstadisticasTecnico);
router.get('/stats/:tecnicoId', getEstadisticasTecnico);

// RUTAS PRINCIPALES
router.get('/', getMisReportes);
router.get('/:tecnicoId', getMisReportes);

// NUEVO: DETALLE COMPLETO DE REPORTE (debe ir antes de las rutas genéricas :id)
router.get('/:id/detalle', getReporteDetalle);

// ACCIONES SOBRE REPORTES ESPECÍFICOS
router.put('/:id/estado', cambiarEstadoReporte);
router.post('/:id/seguimiento', agregarSeguimiento);
router.get('/:id/historial', getHistorialReporte);

module.exports = router;