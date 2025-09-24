// backend/index.js - ACTUALIZADO CON FIREBASE Y SERVICIO DE ARCHIVOS ESTÁTICOS
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// 🔥 INICIALIZAR FIREBASE ADMIN SDK
const { initializeFirebase } = require('./config/firebase');
initializeFirebase();

// Middlewares globales
app.use(cors());
app.use(express.json());

console.log('🔍 INICIANDO SERVIDOR CON FIREBASE...');

// ===================================
// SERVIR ARCHIVOS ESTÁTICOS (FOTOS) - LEGACY PARA MIGRACIÓN
// ===================================
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/public', express.static(path.join(__dirname, 'public')));

console.log('📁 Servidor de archivos estáticos configurado (legacy)');
console.log('📸 Ruta de uploads:', path.join(__dirname, 'uploads'));
console.log('🔥 Firebase Storage configurado para nuevos archivos');

// Ruta de prueba básica
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Servidor funcionando correctamente con Firebase',
    timestamp: new Date().toISOString(),
    firebase: 'enabled'
  });
});

// Ruta de prueba para verificar archivos locales (legacy)
app.get('/api/debug/files', (req, res) => {
  const fs = require('fs');
  const uploadsDir = path.join(__dirname, 'uploads/reportes');
  
  try {
    if (!fs.existsSync(uploadsDir)) {
      return res.json({
        success: false,
        error: 'Directorio no existe',
        message: `El directorio ${uploadsDir} no existe`,
        note: 'Los nuevos archivos se guardan en Firebase Storage'
      });
    }

    const files = fs.readdirSync(uploadsDir);
    res.json({
      success: true,
      message: `Archivos locales en uploads/reportes: ${files.length}`,
      files: files.slice(0, 10), // Primeros 10 archivos
      note: 'Los nuevos archivos se guardan en Firebase Storage'
    });
  } catch (error) {
    res.json({
      success: false,
      error: error.message,
      message: 'Error al leer directorio de uploads',
      note: 'Los nuevos archivos se guardan en Firebase Storage'
    });
  }
});

// 🔥 NUEVA RUTA DE PRUEBA FIREBASE
app.get('/api/debug/firebase', (req, res) => {
  const { getBucket } = require('./config/firebase');
  
  try {
    const bucket = getBucket();
    res.json({
      success: true,
      message: 'Firebase Storage conectado correctamente',
      bucket: bucket.name,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.json({
      success: false,
      error: error.message,
      message: 'Error al conectar con Firebase Storage'
    });
  }
});

// RUTAS EXISTENTES
// 1. Auth (existe)
try {
  const authRoutes = require('./routes/auth/authRoutes');
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes cargadas');
} catch (error) {
  console.log('❌ Error en auth:', error.message);
}

// 2. Administradores
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

// 7. Zonas Admin (gestión completa)
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

// Estados de reporte (ruta común)
try {
  const estadosReporteRoutes = require('./routes/estadosReporteRoutes');
  app.use('/api/estados-reporte', estadosReporteRoutes);
  console.log('✅ Estados Reporte routes cargadas');
} catch (error) {
  console.log('❌ Error en estados reporte:', error.message);
}

// ===================================
// 🆕 PANELES ESPECÍFICOS POR USUARIO
// ===================================

// 10. PANEL LÍDER COCODE
try {
  const liderReportesRoutes = require('./routes/lider/reportesRoutes');
  app.use('/api/lider/reportes', liderReportesRoutes);
  console.log('✅ Líder Reportes routes cargadas - PANEL LÍDER ACTIVO');
} catch (error) {
  console.log('❌ Error en líder reportes:', error.message);
}

// 11. PANEL TÉCNICO - CORREGIDO CON AUTENTICACIÓN
try {
  const tecnicoReportesRoutes = require('./routes/tecnico/reportesRoutes');
  app.use('/api/tecnico/reportes', tecnicoReportesRoutes);
  console.log('✅ Técnico Reportes routes cargadas - PANEL TÉCNICO CON AUTENTICACIÓN');
} catch (error) {
  console.log('❌ Error en técnico reportes:', error.message);
  console.log('❌ Stack trace completo:', error.stack);
}

// 12. PANEL CIUDADANO - NUEVO CON GEOLOCALIZACIÓN Y FIREBASE
try {
  const ciudadanoReportesRoutes = require('./routes/ciudadano/reportesRoutes');
  app.use('/api/ciudadano/reportes', ciudadanoReportesRoutes);
  console.log('✅ Ciudadano Reportes routes cargadas - PANEL CIUDADANO CON GPS Y FIREBASE');
} catch (error) {
  console.log('❌ Error en ciudadano reportes:', error.message);
  console.log('❌ Stack trace completo:', error.stack);
}

// 13. COMENTARIOS - NUEVO SISTEMA UNIVERSAL
try {
  const comentariosRoutes = require('./routes/comentariosRoute');
  app.use('/api/reportes', comentariosRoutes);
  console.log('✅ Comentarios routes cargadas - SISTEMA UNIVERSAL DE COMENTARIOS');
} catch (error) {
  console.log('❌ Error en comentarios:', error.message);
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
  console.log(`🔥 Firebase Test: http://localhost:${PORT}/api/debug/firebase`);
  console.log('📋 Rutas disponibles:');
  console.log('   - /api/auth/*');
  console.log('   - /api/admin/administradores/*');
  console.log('   - /api/admin/tecnicos/*');
  console.log('   - /api/admin/reportes/*');
  console.log('   - /api/admin/lideres/*');
  console.log('   - /api/admin/ciudadanos/*');
  console.log('   - /api/admin/zonas/*');
  console.log('   - /api/tipos-problema/*');
  console.log('   - /api/zonas/*');
  console.log('   - /api/estados-reporte/*');
  console.log('   ✅ - /api/lider/reportes/* ← PANEL LÍDER');
  console.log('   🔧 - /api/tecnico/reportes/* ← PANEL TÉCNICO CORREGIDO');
  console.log('   📍 - /api/ciudadano/reportes/* ← PANEL CIUDADANO CON GPS + FIREBASE');
  console.log('   💬 - /api/reportes/*/comentarios ← SISTEMA DE COMENTARIOS UNIVERSAL');
  console.log('   📁 - /uploads/* ← SERVICIO DE ARCHIVOS ESTÁTICOS (LEGACY)');
  console.log('   🐛 - /api/debug/files ← DEBUG DE ARCHIVOS LOCALES');
  console.log('   🔥 - /api/debug/firebase ← DEBUG DE FIREBASE');
  console.log('✅ SERVIDOR FUNCIONANDO - 4 PANELES COMPLETOS + FIREBASE + ARCHIVOS + COMENTARIOS');
});