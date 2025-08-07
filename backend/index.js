// backend/index.js - Versión debug para encontrar el problema
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

console.log('🔍 INICIANDO DEBUG DE RUTAS...');

// Ruta de prueba básica
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// CARGAR RUTAS UNA POR UNA PARA IDENTIFICAR EL PROBLEMA

// 1. Probar tipos-problema routes
console.log('1️⃣ Cargando tipos-problema routes...');
try {
  const tiposProblemaRoutes = require('./routes/tiposProblemaRoutes');
  app.use('/api/tipos-problema', tiposProblemaRoutes);
  console.log('✅ tipos-problema routes - OK');
} catch (error) {
  console.log('❌ tipos-problema routes - ERROR:', error.message);
}

// 2. Probar auth controller
console.log('2️⃣ Cargando auth controller...');
try {
  const authController = require('./controllers/auth/authController');
  console.log('✅ auth controller - OK');
} catch (error) {
  console.log('❌ auth controller - ERROR:', error.message);
}

// 3. Probar auth middleware
console.log('3️⃣ Cargando auth middleware...');
try {
  const authMiddleware = require('./middleware/authMiddleware');
  console.log('✅ auth middleware - OK');
} catch (error) {
  console.log('❌ auth middleware - ERROR:', error.message);
}

// 4. Probar auth routes (AQUÍ PUEDE ESTAR EL PROBLEMA)
console.log('4️⃣ Cargando auth routes...');
try {
  const authRoutes = require('./routes/auth/authRoutes');
  console.log('✅ auth routes cargadas - OK');
  
  console.log('5️⃣ Registrando auth routes en Express...');
  app.use('/api/auth', authRoutes);
  console.log('✅ auth routes registradas - OK');
  
} catch (error) {
  console.log('❌ auth routes - ERROR:', error.message);
  console.log('❌ Stack trace:', error.stack);
}

// Manejo de errores
app.use((error, req, res, next) => {
  console.error('💥 ERROR NO MANEJADO:', error);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: error.message
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3001;

console.log('6️⃣ Iniciando servidor...');
try {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(`🌐 Prueba: http://localhost:${PORT}/api/test`);
    console.log('✅ SERVIDOR INICIADO CORRECTAMENTE');
  });
} catch (error) {
  console.log('❌ ERROR AL INICIAR SERVIDOR:', error.message);
}