// backend/routes/ciudadano/reportesRoutes.js - ACTUALIZADO CON FIREBASE
const express = require('express');
const router = express.Router();
const {
  crearReporte,
  getMisReportes,
  agregarComentario,
  getTiposProblema,
  getDatosFormulario,
  guardarArchivosFirebase,
  getArchivosReporte
} = require('../../controllers/ciudadano/reportesController');

// IMPORTAR MIDDLEWARES DE AUTENTICACIÓN
const { verificarToken, verificarCiudadano } = require('../../middleware/authMiddleware');

// APLICAR MIDDLEWARES A TODAS LAS RUTAS
router.use(verificarToken);   // Verificar JWT en todas las rutas
router.use(verificarCiudadano); // Verificar que sea ciudadano

// ===================================
// RUTAS PROTEGIDAS PARA CIUDADANOS
// ===================================

// GET /api/ciudadano/reportes/datos - Obtener datos para formulario
router.get('/datos', getDatosFormulario);

// GET /api/ciudadano/reportes/tipos-problema - Obtener tipos de problema disponibles
router.get('/tipos-problema', getTiposProblema);

// GET /api/ciudadano/reportes - Obtener MIS reportes (solo los míos)
router.get('/', getMisReportes);

// POST /api/ciudadano/reportes - Crear nuevo reporte SIN fotos (método original)
router.post('/', crearReporte);

// POST /api/ciudadano/reportes/:id/comentario - Agregar comentario a MI reporte
router.post('/:id/comentario', agregarComentario);

// ===================================
// NUEVAS RUTAS FIREBASE
// ===================================

// POST /api/ciudadano/reportes/:id/archivos-firebase - Guardar URLs de Firebase en BD
router.post('/:id/archivos-firebase', guardarArchivosFirebase);

// GET /api/ciudadano/reportes/:id/archivos - Obtener archivos de un reporte
router.get('/:id/archivos', getArchivosReporte);

module.exports = router;