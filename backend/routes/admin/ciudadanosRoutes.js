// backend/routes/admin/ciudadanosRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getCiudadanos,
  getCiudadanosPorZona, 
  createCiudadano, 
  updateCiudadano,
  updatePassword,
  deleteCiudadano,
  getEstadisticasCiudadanos,
  verificarCiudadano
} = require('../../controllers/admin/ciudadanosController');

// GET: listar todos los ciudadanos
router.get('/', getCiudadanos);

// GET: obtener estadísticas de ciudadanos
router.get('/estadisticas', getEstadisticasCiudadanos);

// GET: obtener ciudadanos por zona
router.get('/zona/:zonaId', getCiudadanosPorZona);

// POST: crear nuevo ciudadano
router.post('/', createCiudadano);

// PUT: editar ciudadano existente
router.put('/:id', updateCiudadano);

// PATCH: cambiar contraseña
router.patch('/:id/password', updatePassword);

// PATCH: verificar/des-verificar ciudadano
router.patch('/:id/verificar', verificarCiudadano);

// DELETE: borrado lógico (desactivar)
router.delete('/:id', deleteCiudadano);

module.exports = router;