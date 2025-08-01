const express = require('express');
const router = express.Router();
const { 
  getAdministradores, 
  createAdministrador, 
  updateAdministrador, 
  updatePassword,
  deleteAdministrador 
} = require('../controllers/administradoresController');

// GET: listar todos los administradores
router.get('/', getAdministradores);

// POST: crear nuevo administrador
router.post('/', createAdministrador);

// PUT: editar administrador existente
router.put('/:id', updateAdministrador);

// PATCH: cambiar contraseña
router.patch('/:id/password', updatePassword);

// DELETE: borrado lógico (desactivar)
router.delete('/:id', deleteAdministrador);

module.exports = router;