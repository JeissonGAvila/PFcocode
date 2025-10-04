// backend/index.js - PRODUCCIÓN CON FIREBASE Y CORS
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// 🔥 INICIALIZAR FIREBASE ADMIN SDK
const { initializeFirebase } = require('./config/firebase');
initializeFirebase();

// ========================================
// 🌐 CONFIGURACIÓN CORS PARA PRODUCCIÓN
// ========================================
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:3000', 'http://localhost:5173'];

const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requests sin origin (como mobile apps o curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`⚠️ Origen bloqueado por CORS: ${origin}`);
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Aplicar CORS y middlewares
app.use(cors(corsOptions));
app.use(express.json());

console.log('🔐 CORS configurado para:', allowedOrigins);
console.log('📍 Modo:', process.env.NODE_ENV || 'development');
console.log('🔗 URL Base:', process.env.BASE_URL || 'http://localhost:3003');

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
    firebase: 'enabled',
    environment: process.env.NODE_ENV || 'development',
    baseUrl: process.env.BASE_URL || 'http://localhost:3003'
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
      files: files.slice(0, 10),
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

// ===================================
// 🔐 RUTAS DE AUTENTICACIÓN
// ===================================
try {
  const authRoutes = require('./routes/auth/authRoutes');
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes cargadas');
} catch (error) {
  console.log('❌ Error en auth:', error.message);
}

// ===================================
// 🔧 RUTAS DE ADMINISTRACIÓN
// ===================================
try {
  const administradoresRoutes = require('./routes/admin/administradoresRoutes');
  app.use('/api/admin/administradores', administradoresRoutes);
  console.log('✅ Administradores routes cargadas');
} catch (error) {
  console.log('❌ Error en administradores:', error.message);
}

try {
  const tecnicosRoutes = require('./routes/admin/tecnicosRoutes');
  app.use('/api/admin/tecnicos', tecnicosRoutes);
  console.log('✅ Técnicos routes cargadas');
} catch (error) {
  console.log('❌ Error en técnicos:', error.message);
}

try {
  const reportesRoutes = require('./routes/admin/reportesRoutes');
  app.use('/api/admin/reportes', reportesRoutes);
  console.log('✅ Reportes routes cargadas');
} catch (error) {
  console.log('❌ Error en reportes:', error.message);
}

try {
  const lideresRoutes = require('./routes/admin/lideresRoutes');
  app.use('/api/admin/lideres', lideresRoutes);
  console.log('✅ Líderes routes cargadas');
} catch (error) {
  console.log('❌ Error en líderes:', error.message);
}

try {
  const ciudadanosRoutes = require('./routes/admin/ciudadanosRoutes');
  app.use('/api/admin/ciudadanos', ciudadanosRoutes);
  console.log('✅ Ciudadanos routes cargadas');
} catch (error) {
  console.log('❌ Error en ciudadanos:', error.message);
}

try {
  const zonasAdminRoutes = require('./routes/admin/zonasRoutes');
  app.use('/api/admin/zonas', zonasAdminRoutes);
  console.log('✅ Zonas Admin routes cargadas');
} catch (error) {
  console.log('❌ Error en zonas admin:', error.message);
}

try {
  const cocodeRoutes = require('./routes/admin/cocodeRoutes');
  app.use('/api/admin/cocode', cocodeRoutes);
  console.log('✅ COCODE routes cargadas');
} catch (error) {
  console.log('❌ Error en cocode:', error.message);
}

try {
  const subcocodeRoutes = require('./routes/admin/subcocodeRoutes');
  app.use('/api/admin/subcocode', subcocodeRoutes);
  console.log('✅ SUBCOCODE routes cargadas');
} catch (error) {
  console.log('❌ Error en subcocode:', error.message);
}

// ===================================
// 👥 RUTAS POR PANEL DE USUARIO
// ===================================

// PANEL LÍDER COCODE
try {
  const liderReportesRoutes = require('./routes/lider/reportesRoutes');
  app.use('/api/lider/reportes', liderReportesRoutes);
  console.log('✅ Líder Reportes routes - PANEL LÍDER ACTIVO');
} catch (error) {
  console.log('❌ Error en líder reportes:', error.message);
}

// PANEL TÉCNICO
try {
  const tecnicoReportesRoutes = require('./routes/tecnico/reportesRoutes');
  app.use('/api/tecnico/reportes', tecnicoReportesRoutes);
  console.log('✅ Técnico Reportes routes - PANEL TÉCNICO ACTIVO');
} catch (error) {
  console.log('❌ Error en técnico reportes:', error.message);
  console.log('❌ Stack trace:', error.stack);
}

// PANEL CIUDADANO
try {
  const ciudadanoReportesRoutes = require('./routes/ciudadano/reportesRoutes');
  app.use('/api/ciudadano/reportes', ciudadanoReportesRoutes);
  console.log('✅ Ciudadano Reportes routes - PANEL CIUDADANO CON GPS Y FIREBASE');
} catch (error) {
  console.log('❌ Error en ciudadano reportes:', error.message);
  console.log('❌ Stack trace:', error.stack);
}

// ===================================
// 💬 SISTEMA DE COMENTARIOS
// ===================================
try {
  const comentariosRoutes = require('./routes/comentariosRoute');
  app.use('/api/reportes', comentariosRoutes);
  console.log('✅ Comentarios routes - SISTEMA UNIVERSAL DE COMENTARIOS');
} catch (error) {
  console.log('❌ Error en comentarios:', error.message);
}

// ===================================
// ⚠️ MANEJO DE ERRORES GLOBAL
// ===================================
app.use((error, req, res, next) => {
  console.error('💥 ERROR NO MANEJADO:', error);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: error.message
  });
});

// ===================================
// 🚀 INICIAR SERVIDOR
// ===================================
const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 SERVIDOR COCODE FUNCIONANDO EN PUERTO ${PORT}`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`${'='.repeat(60)}\n`);
  
  console.log('🌐 ENDPOINTS DISPONIBLES:\n');
  
  console.log('🔍 PRUEBAS:');
  console.log(`   → ${process.env.BASE_URL || `http://localhost:${PORT}`}/api/test`);
  console.log(`   → ${process.env.BASE_URL || `http://localhost:${PORT}`}/api/debug/firebase`);
  console.log(`   → ${process.env.BASE_URL || `http://localhost:${PORT}`}/api/debug/files\n`);
  
  console.log('🔐 AUTENTICACIÓN:');
  console.log('   → POST   /api/auth/login');
  console.log('   → POST   /api/auth/logout');
  console.log('   → GET    /api/auth/verify');
  console.log('   → GET    /api/auth/me\n');
  
  console.log('🔧 ADMINISTRACIÓN:');
  console.log('   → GET    /api/admin/administradores');
  console.log('   → GET    /api/admin/tecnicos');
  console.log('   → GET    /api/admin/reportes');
  console.log('   → GET    /api/admin/lideres');
  console.log('   → GET    /api/admin/ciudadanos');
  console.log('   → GET    /api/admin/zonas\n');
  
  console.log('👥 PANELES DE USUARIO:');
  console.log('   → /api/lider/reportes/*     ← Panel Líder COCODE');
  console.log('   → /api/tecnico/reportes/*   ← Panel Técnico');
  console.log('   → /api/ciudadano/reportes/* ← Panel Ciudadano + GPS\n');
  
  console.log('💬 SISTEMA:');
  console.log('   → GET/POST /api/reportes/:id/comentarios');
  console.log('   → /uploads/*  ← Archivos estáticos (legacy)\n');
  
  console.log(`${'='.repeat(60)}`);
  console.log('✅ SERVIDOR LISTO - 4 PANELES + FIREBASE + COMENTARIOS');
  console.log(`${'='.repeat(60)}\n`);
});