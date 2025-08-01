const express = require('express');
const router = express.Router();
const { 
  getEstadosReporte, 
  createEstadoReporte, 
  updateEstadoReporte, 
  deleteEstadoReporte 
} = require('../controllers/estadosReporteController');

// GET: listar todos los estados
router.get('/', getEstadosReporte);

// POST: crear nuevo estado
router.post('/', createEstadoReporte);

// PUT: editar estado existente
router.put('/:id', updateEstadoReporte);

// DELETE: borrado lógico (desactivar)
router.delete('/:id', deleteEstadoReporte);

module.exports = router;