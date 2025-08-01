const express = require('express');
const router = express.Router();
const { 
  getCategoriasProblema, 
  createCategoriaProblema, 
  updateCategoriaProblema, 
  deleteCategoriaProblema 
} = require('../controllers/categoriasProblemaController');

// GET: listar todas las categorías
router.get('/', getCategoriasProblema);

// POST: crear nueva categoría
router.post('/', createCategoriaProblema);

// PUT: editar categoría existente
router.put('/:id', updateCategoriaProblema);

// DELETE: borrado lógico (desactivar)
router.delete('/:id', deleteCategoriaProblema);

module.exports = router;