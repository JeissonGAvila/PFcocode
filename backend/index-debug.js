// backend/index-debug.js - Versión mínima para encontrar el error
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

console.log('🔍 MODO DEBUG - Cargando rutas una por una...');

// ======================================
// RUTA DE PRUEBA BÁSICA
// ======================================
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

console.log('✅ Ruta de prueba cargada');

// ======================================
// PROBAR SOLO TÉCNICOS
// ======================================
console.log('🔧 Probando cargar SOLO rutas de técnicos...');
try {
  const tecnicosRoutes = require('./routes/admin/tecnicosRoutes');
  console.log('✅ Módulo de técnicos importado correctamente');
  
  console.log('🔧 Registrando rutas de técnicos...');
  app.use('/api/admin/tecnicos', tecnicosRoutes);
  console.log('✅ Rutas de técnicos registradas exitosamente');
  
} catch (error) {
  console.log('❌ ERROR en técnicos:', error.message);
  console.log('Stack:', error.stack);
  process.exit(1);
}

// ======================================
// INICIAR SERVIDOR
// ======================================
const PORT = process.env.PORT || 3001;

console.log('🚀 Intentando iniciar servidor...');

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
  console.log(`🌐 Prueba: http://localhost:${PORT}/api/test`);
  console.log(`🔧 Técnicos: http://localhost:${PORT}/api/admin/tecnicos`);
  console.log('✅ TODO FUNCIONANDO CORRECTAMENTE');
});

// Manejo de errores
app.use((error, req, res, next) => {
  console.error('💥 ERROR:', error.message);
  res.status(500).json({ error: error.message });
});

process.on('uncaughtException', (error) => {
  console.error('💥 EXCEPCIÓN NO CAPTURADA:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 RECHAZO NO MANEJADO:', reason);
  process.exit(1);
});