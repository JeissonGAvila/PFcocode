const express = require('express');
const router = express.Router();
const { getTiposProblema, createTipoProblema, updateTipoProblema, deleteTipoProblema } = require('../controllers/tiposProblemaController');

// GET: listar todos
router.get('/', getTiposProblema);

// POST: crear nuevo
router.post('/', createTipoProblema);

// PUT: editar existente
router.put('/:id', updateTipoProblema);

// DELETE: borrado lógico (desactivar)
router.delete('/:id', deleteTipoProblema);

module.exports = router;