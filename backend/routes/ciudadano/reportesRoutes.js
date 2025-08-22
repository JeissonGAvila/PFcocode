// backend/routes/ciudadano/reportesRoutes.js
const express = require('express');
const router = express.Router();
const {
  crearReporte,
  getMisReportes,
  agregarComentario,
  getTiposProblema,
  getDatosFormulario
} = require('../../controllers/ciudadano/reportesController');

// IMPORTAR MIDDLEWARES DE AUTENTICACIÓN
const { verificarToken, verificarCiudadano } = require('../../middleware/authMiddleware');

// APLICAR MIDDLEWARES A TODAS LAS RUTAS
router.use(verificarToken);   // Verificar JWT en todas las rutas
router.use(verificarCiudadano); // Verificar que sea ciudadano

// ===================================
// RUTAS PROTEGIDAS PARA CIUDADANOS
// Orden específico: datos primero, acciones después
// ===================================

// GET /api/ciudadano/reportes/datos - Obtener datos para formulario (tipos problema, etc.)
router.get('/datos', getDatosFormulario);

// GET /api/ciudadano/reportes/tipos-problema - Obtener tipos de problema disponibles
router.get('/tipos-problema', getTiposProblema);

// GET /api/ciudadano/reportes - Obtener MIS reportes (solo los míos)
router.get('/', getMisReportes);

// POST /api/ciudadano/reportes - Crear nuevo reporte con geolocalización
router.post('/', crearReporte);

// POST /api/ciudadano/reportes/:id/comentario - Agregar comentario a MI reporte
router.post('/:id/comentario', agregarComentario);

module.exports = router;