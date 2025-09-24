// routes/comentariosRoute.js
const express = require('express');
const router = express.Router();
const { 
  agregarComentario, 
  obtenerComentarios 
} = require('../controllers/comentariosController');

const { verificarToken } = require('../middleware/authMiddleware');

router.post('/:id/comentarios', verificarToken, agregarComentario);
router.get('/:id/comentarios', verificarToken, obtenerComentarios);

module.exports = router;