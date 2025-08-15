// backend/index.js - VERSIÓN DEFINITIVA BASADA EN LO QUE FUNCIONA
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

console.log('🚀 INICIANDO SERVIDOR DEFINITIVO...');

// ======================================
// RUTA DE PRUEBA BÁSICA
// ======================================
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Servidor definitivo funcionando correctamente',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ======================================
// CARGAR TODAS LAS RUTAS (IGUAL QUE EN STEP-BY-STEP QUE FUNCIONÓ)
// ======================================
try {
  console.log('📦 Cargando todas las rutas...');
  
  // Auth
  const authRoutes = require('./routes/auth/authRoutes');
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth');
  
  // Técnicos
  const tecnicosRoutes = require('./routes/admin/tecnicosRoutes');
  app.use('/api/admin/tecnicos', tecnicosRoutes);
  console.log('✅ Técnicos');
  
  // Administradores
  const administradoresRoutes = require('./routes/administradoresRoutes');
  app.use('/api/admin/administradores', administradoresRoutes);
  console.log('✅ Administradores');
  
  // Tipos de problema
  const tiposProblemaRoutes = require('./routes/tiposProblemaRoutes');
  app.use('/api/configuraciones/tipos-problema', tiposProblemaRoutes);
  console.log('✅ Tipos problema');
  
  // Estados de reporte
  const estadosReporteRoutes = require('./routes/estadosReporteRoutes');
  app.use('/api/configuraciones/estados-reporte', estadosReporteRoutes);
  console.log('✅ Estados reporte');
  
  // Categorías
  const categoriasProblemaRoutes = require('./routes/categoriasProblemaRoutes');
  app.use('/api/configuraciones/categorias-problema', categoriasProblemaRoutes);
  console.log('✅ Categorías');
  
  // Zonas
  const zonasRoutes = require('./routes/zonasRoutes');
  app.use('/api/configuraciones/zonas', zonasRoutes);
  console.log('✅ Zonas');
  
  console.log('🎉 Todas las rutas cargadas exitosamente');
  
} catch (error) {
  console.error('❌ Error al cargar rutas:', error.message);
  process.exit(1);
}

// ======================================
// MANEJO DE ERRORES
// ======================================
app.use((error, req, res, next) => {
  console.error('💥 ERROR:', error.message);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: error.message
  });
});

// Ruta no encontrada
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    ruta: req.originalUrl,
    metodo: req.method
  });
});

// ======================================
// INICIAR SERVIDOR
// ======================================
const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log('🎉 ¡SERVIDOR FUNCIONANDO!');
  console.log(`🌐 Puerto: ${PORT}`);
  console.log(`🔧 API: http://localhost:${PORT}/api`);
  console.log('✅ Listo para usar');
});

server.on('error', (error) => {
  console.error('❌ Error del servidor:', error.message);
});

module.exports = app;