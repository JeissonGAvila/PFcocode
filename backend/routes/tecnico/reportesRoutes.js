// backend/routes/tecnico/reportesRoutes.js - CORREGIDO sin conflictos de rutas
const express = require('express');
const router = express.Router();
const {
  getMisReportes,
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

// ACCIONES SOBRE REPORTES ESPECÍFICOS
router.put('/:id/estado', cambiarEstadoReporte);
router.post('/:id/seguimiento', agregarSeguimiento);
router.get('/:id/historial', getHistorialReporte);

module.exports = router;