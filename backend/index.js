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

// 2. NUEVO: Administradores
try {
  const administradoresRoutes = require('./routes/admin/administradoresRoutes');
  app.use('/api/admin/administradores', administradoresRoutes);
  console.log('✅ Administradores routes cargadas');
} catch (error) {
  console.log('❌ Error en administradores:', error.message);
}

// 3. Técnicos (existe)
try {
  const tecnicosRoutes = require('./routes/admin/tecnicosRoutes');
  app.use('/api/admin/tecnicos', tecnicosRoutes);
  console.log('✅ Técnicos routes cargadas');
} catch (error) {
  console.log('❌ Error en técnicos:', error.message);
}

// 4. Reportes (existe)
try {
  const reportesRoutes = require('./routes/admin/reportesRoutes');
  app.use('/api/admin/reportes', reportesRoutes);
  console.log('✅ Reportes routes cargadas');
} catch (error) {
  console.log('❌ Error en reportes:', error.message);
}

// 5. Líderes COCODE (existe)
try {
  const lideresRoutes = require('./routes/admin/lideresRoutes');
  app.use('/api/admin/lideres', lideresRoutes);
  console.log('✅ Líderes routes cargadas');
} catch (error) {
  console.log('❌ Error en líderes:', error.message);
}

// 6. Ciudadanos (existe)
try {
  const ciudadanosRoutes = require('./routes/admin/ciudadanosRoutes');
  app.use('/api/admin/ciudadanos', ciudadanosRoutes);
  console.log('✅ Ciudadanos routes cargadas');
} catch (error) {
  console.log('❌ Error en ciudadanos:', error.message);
}

// 7. NUEVO: Zonas Admin (gestión completa)
try {
  const zonasAdminRoutes = require('./routes/admin/zonasRoutes');
  app.use('/api/admin/zonas', zonasAdminRoutes);
  console.log('✅ Zonas Admin routes cargadas');
} catch (error) {
  console.log('❌ Error en zonas admin:', error.message);
}

// 8. Tipos problema (existe)
try {
  const tiposProblemaRoutes = require('./routes/tiposProblemaRoutes');
  app.use('/api/tipos-problema', tiposProblemaRoutes);
  console.log('✅ Tipos problema routes cargadas');
} catch (error) {
  console.log('❌ Error en tipos problema:', error.message);
}

// 9. Zonas (existe - ruta original)
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
  console.log('   - /api/admin/administradores/*');
  console.log('   - /api/admin/tecnicos/*');
  console.log('   - /api/admin/reportes/*');
  console.log('   - /api/admin/lideres/*');
  console.log('   - /api/admin/ciudadanos/*');
  console.log('   - /api/admin/zonas/*  ← NUEVA GESTIÓN COMPLETA');
  console.log('   - /api/tipos-problema/*');
  console.log('   - /api/zonas/*  ← ORIGINAL');
  console.log('✅ SERVIDOR FUNCIONANDO');
});