const express = require('express');
const router = express.Router();
const { 
  getZonas, 
  createZona, 
  updateZona, 
  deleteZona 
} = require('../controllers/zonasController');

// GET: listar todas las zonas
router.get('/', getZonas);

// POST: crear nueva zona
router.post('/', createZona);

// PUT: editar zona existente
router.put('/:id', updateZona);

// DELETE: borrado lógico (desactivar)
router.delete('/:id', deleteZona);

module.exports = router;