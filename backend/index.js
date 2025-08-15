// backend/index.js - Solo rutas existentes
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

console.log('🔍 INICIANDO SERVIDOR...');

// Ruta de prueba básica
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// SOLO CARGAR RUTAS QUE EXISTEN

// 1. Auth (existe)
try {
  const authRoutes = require('./routes/auth/authRoutes');
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes cargadas');
} catch (error) {
  console.log('❌ Error en auth:', error.message);
}

// 2. Técnicos (existe)
try {
  const tecnicosRoutes = require('./routes/admin/tecnicosRoutes');
  app.use('/api/admin/tecnicos', tecnicosRoutes);
  console.log('✅ Técnicos routes cargadas');
} catch (error) {
  console.log('❌ Error en técnicos:', error.message);
}

// 3. Reportes (existe)
try {
  const reportesRoutes = require('./routes/admin/reportesRoutes');
  app.use('/api/admin/reportes', reportesRoutes);
  console.log('✅ Reportes routes cargadas');
} catch (error) {
  console.log('❌ Error en reportes:', error.message);
}

// 4. NUEVO: Líderes COCODE
try {
  const lideresRoutes = require('./routes/admin/lideresRoutes');
  app.use('/api/admin/lideres', lideresRoutes);
  console.log('✅ Líderes routes cargadas');
} catch (error) {
  console.log('❌ Error en líderes:', error.message);
}

// 5. Tipos problema (existe)
try {
  const tiposProblemaRoutes = require('./routes/tiposProblemaRoutes');
  app.use('/api/tipos-problema', tiposProblemaRoutes);
  console.log('✅ Tipos problema routes cargadas');
} catch (error) {
  console.log('❌ Error en tipos problema:', error.message);
}

// 6. Zonas (existe)
try {
  const zonasRoutes = require('./routes/zonasRoutes');
  app.use('/api/zonas', zonasRoutes);
  console.log('✅ Zonas routes cargadas');
} catch (error) {
  console.log('❌ Error en zonas:', error.message);
}

// Manejo de errores
app.use((error, req, res, next) => {
  console.error('💥 ERROR:', error);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: error.message
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`🌐 Prueba: http://localhost:${PORT}/api/test`);
  console.log('📋 Rutas disponibles:');
  console.log('   - /api/auth/*');
  console.log('   - /api/admin/tecnicos/*');
  console.log('   - /api/admin/reportes/*');
  console.log('   - /api/admin/lideres/*  ← NUEVA');
  console.log('   - /api/tipos-problema/*');
  console.log('   - /api/zonas/*');
  console.log('✅ SERVIDOR FUNCIONANDO');
});