// backend/routes/admin/tecnicosRoutes.js
const express = require('express');
const router = express.Router();
const { 
  getTecnicos, 
  createTecnico, 
  updateTecnico,
  updateTecnicoPassword, 
  deleteTecnico,
  getTecnicosByDepartamento
} = require('../../controllers/admin/tecnicosController');

// Middleware de autenticación (comentado por ahora para testing)
// const { verificarToken, soloAdmin } = require('../../middleware/authMiddleware');
// router.use(verificarToken); // Todas las rutas requieren autenticación
// router.use(soloAdmin);      // Solo administradores pueden gestionar técnicos

// 📋 GET /api/admin/tecnicos - Listar todos los técnicos
router.get('/', getTecnicos);

// 📊 GET /api/admin/tecnicos/departamento/:departamento - Técnicos por departamento
router.get('/departamento/:departamento', getTecnicosByDepartamento);

// 📝 POST /api/admin/tecnicos - Crear nuevo técnico
router.post('/', createTecnico);

// ✏️ PUT /api/admin/tecnicos/:id - Actualizar técnico
router.put('/:id', updateTecnico);

// 🔑 PATCH /api/admin/tecnicos/:id/password - Cambiar contraseña
router.patch('/:id/password', updateTecnicoPassword);

// 🗑️ DELETE /api/admin/tecnicos/:id - Desactivar técnico (borrado lógico)
router.delete('/:id', deleteTecnico);

module.exports = router;