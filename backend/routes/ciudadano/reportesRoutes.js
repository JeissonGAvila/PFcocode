// routes/ciudadano/reportesRoutes.js
const express = require('express');
const router = express.Router();
const { 
  crearReporte,
  getMisReportes,
  getTiposProblema,
  getDatosFormulario,  // ← ESTA FUNCIÓN EXISTE EN EL CONTROLADOR
  guardarArchivosFirebase,
  getArchivosReporte
} = require('../../controllers/ciudadano/reportesController');

const { verificarToken, verificarCiudadano } = require('../../middleware/authMiddleware');

// Rutas existentes
router.post('/', verificarToken, verificarCiudadano, crearReporte);
router.get('/', verificarToken, verificarCiudadano, getMisReportes);
router.get('/tipos-problema', verificarToken, verificarCiudadano, getTiposProblema);

// ✅ AGREGAR ESTA RUTA FALTANTE:
router.get('/datos', verificarToken, verificarCiudadano, getDatosFormulario);

// Rutas de archivos Firebase
router.post('/:id/archivos-firebase', verificarToken, verificarCiudadano, guardarArchivosFirebase);
router.get('/:id/archivos', verificarToken, verificarCiudadano, getArchivosReporte);

module.exports = router;