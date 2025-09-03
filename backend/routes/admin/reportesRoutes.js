// backend/routes/admin/reportesRoutes.js - ACTUALIZADO CON RUTA DE DETALLE
const express = require('express');
const router = express.Router();
const {
  getReportes,
  getReporteDetalle, // NUEVO
  asignarReporte,
  cambiarEstado,
  cambiarPrioridad,
  getDatosSelect
} = require('../../controllers/admin/reportesController');

// GET /api/admin/reportes - Obtener todos los reportes CON FOTOS Y UBICACIÓN
router.get('/', getReportes);

// GET /api/admin/reportes/datos - Obtener datos para selects (técnicos, estados, etc.)
router.get('/datos', getDatosSelect);

// NUEVO: GET /api/admin/reportes/:id/detalle - Obtener detalles completos de un reporte
router.get('/:id/detalle', getReporteDetalle);

// PUT /api/admin/reportes/:id/asignar - Asignar reporte a técnico
router.put('/:id/asignar', asignarReporte);

// PUT /api/admin/reportes/:id/estado - Cambiar estado del reporte
router.put('/:id/estado', cambiarEstado);

// PUT /api/admin/reportes/:id/prioridad - Cambiar prioridad del reporte
router.put('/:id/prioridad', cambiarPrioridad);

module.exports = router;