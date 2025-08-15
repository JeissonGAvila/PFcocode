// backend/index-step-by-step.js - Cargar rutas paso a paso para encontrar el error
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

console.log('🔍 DEBUG PASO A PASO - Encontrando la ruta problemática...');

// ======================================
// RUTA DE PRUEBA BÁSICA
// ======================================
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

console.log('✅ Ruta básica registrada');

// ======================================
// PASO 1: SOLO AUTH
// ======================================
console.log('\n🔐 PASO 1: Cargando SOLO auth...');
try {
  const authRoutes = require('./routes/auth/authRoutes');
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth cargado - PROBANDO INICIAR SERVIDOR...');
  
  testServer(app, 'AUTH');
  
} catch (error) {
  console.log('❌ Error en auth:', error.message);
  process.exit(1);
}

function testServer(appInstance, stepName) {
  const PORT = 3001;
  
  try {
    const server = appInstance.listen(PORT, () => {
      console.log(`✅ ${stepName} - Servidor OK en puerto ${PORT}`);
      server.close(() => {
        console.log(`✅ ${stepName} - Servidor cerrado correctamente`);
        
        // Continuar con el siguiente paso
        if (stepName === 'AUTH') {
          loadTecnicos(appInstance);
        } else if (stepName === 'TECNICOS') {
          loadAdministradores(appInstance);
        } else if (stepName === 'ADMINISTRADORES') {
          loadTiposProblema(appInstance);
        } else if (stepName === 'TIPOS_PROBLEMA') {
          loadEstadosReporte(appInstance);
        } else if (stepName === 'ESTADOS_REPORTE') {
          loadCategorias(appInstance);
        } else if (stepName === 'CATEGORIAS') {
          loadZonas(appInstance);
        } else if (stepName === 'ZONAS') {
          console.log('\n🎉 TODAS LAS RUTAS FUNCIONAN INDIVIDUALMENTE');
          loadAllTogether();
        }
      });
    });
    
    server.on('error', (error) => {
      console.log(`❌ ${stepName} - Error al iniciar servidor:`, error.message);
      if (error.message.includes('Missing parameter name')) {
        console.log(`💥 PROBLEMA ENCONTRADO EN: ${stepName}`);
        process.exit(1);
      }
    });
    
  } catch (error) {
    console.log(`❌ ${stepName} - Error crítico:`, error.message);
    if (error.message.includes('Missing parameter name')) {
      console.log(`💥 PROBLEMA ENCONTRADO EN: ${stepName}`);
    }
    process.exit(1);
  }
}

function loadTecnicos(appInstance) {
  console.log('\n🔧 PASO 2: Agregando TECNICOS...');
  try {
    const tecnicosRoutes = require('./routes/admin/tecnicosRoutes');
    appInstance.use('/api/admin/tecnicos', tecnicosRoutes);
    console.log('✅ Técnicos cargados - PROBANDO SERVIDOR...');
    
    testServer(appInstance, 'TECNICOS');
    
  } catch (error) {
    console.log('❌ Error en técnicos:', error.message);
    process.exit(1);
  }
}

function loadAdministradores(appInstance) {
  console.log('\n👑 PASO 3: Agregando ADMINISTRADORES...');
  try {
    const administradoresRoutes = require('./routes/administradoresRoutes');
    appInstance.use('/api/admin/administradores', administradoresRoutes);
    console.log('✅ Administradores cargados - PROBANDO SERVIDOR...');
    
    testServer(appInstance, 'ADMINISTRADORES');
    
  } catch (error) {
    console.log('❌ Error en administradores:', error.message);
    process.exit(1);
  }
}

function loadTiposProblema(appInstance) {
  console.log('\n📋 PASO 4: Agregando TIPOS PROBLEMA...');
  try {
    const tiposProblemaRoutes = require('./routes/tiposProblemaRoutes');
    appInstance.use('/api/configuraciones/tipos-problema', tiposProblemaRoutes);
    console.log('✅ Tipos problema cargados - PROBANDO SERVIDOR...');
    
    testServer(appInstance, 'TIPOS_PROBLEMA');
    
  } catch (error) {
    console.log('❌ Error en tipos problema:', error.message);
    process.exit(1);
  }
}

function loadEstadosReporte(appInstance) {
  console.log('\n📊 PASO 5: Agregando ESTADOS REPORTE...');
  try {
    const estadosReporteRoutes = require('./routes/estadosReporteRoutes');
    appInstance.use('/api/configuraciones/estados-reporte', estadosReporteRoutes);
    console.log('✅ Estados reporte cargados - PROBANDO SERVIDOR...');
    
    testServer(appInstance, 'ESTADOS_REPORTE');
    
  } catch (error) {
    console.log('❌ Error en estados reporte:', error.message);
    process.exit(1);
  }
}

function loadCategorias(appInstance) {
  console.log('\n🏷️ PASO 6: Agregando CATEGORIAS...');
  try {
    const categoriasProblemaRoutes = require('./routes/categoriasProblemaRoutes');
    appInstance.use('/api/configuraciones/categorias-problema', categoriasProblemaRoutes);
    console.log('✅ Categorías cargadas - PROBANDO SERVIDOR...');
    
    testServer(appInstance, 'CATEGORIAS');
    
  } catch (error) {
    console.log('❌ Error en categorías:', error.message);
    process.exit(1);
  }
}

function loadZonas(appInstance) {
  console.log('\n🗺️ PASO 7: Agregando ZONAS...');
  try {
    const zonasRoutes = require('./routes/zonasRoutes');
    appInstance.use('/api/configuraciones/zonas', zonasRoutes);
    console.log('✅ Zonas cargadas - PROBANDO SERVIDOR...');
    
    testServer(appInstance, 'ZONAS');
    
  } catch (error) {
    console.log('❌ Error en zonas:', error.message);
    process.exit(1);
  }
}

function loadAllTogether() {
  console.log('\n🚀 PASO FINAL: Cargando TODAS las rutas juntas...');
  
  const finalApp = express();
  finalApp.use(cors());
  finalApp.use(express.json());
  
  finalApp.get('/api/test', (req, res) => {
    res.json({ message: 'Todas las rutas funcionando' });
  });
  
  // Cargar todas las rutas
  try {
    const authRoutes = require('./routes/auth/authRoutes');
    const tecnicosRoutes = require('./routes/admin/tecnicosRoutes');
    const administradoresRoutes = require('./routes/administradoresRoutes');
    const tiposProblemaRoutes = require('./routes/tiposProblemaRoutes');
    const estadosReporteRoutes = require('./routes/estadosReporteRoutes');
    const categoriasProblemaRoutes = require('./routes/categoriasProblemaRoutes');
    const zonasRoutes = require('./routes/zonasRoutes');
    
    finalApp.use('/api/auth', authRoutes);
    finalApp.use('/api/admin/tecnicos', tecnicosRoutes);
    finalApp.use('/api/admin/administradores', administradoresRoutes);
    finalApp.use('/api/configuraciones/tipos-problema', tiposProblemaRoutes);
    finalApp.use('/api/configuraciones/estados-reporte', estadosReporteRoutes);
    finalApp.use('/api/configuraciones/categorias-problema', categoriasProblemaRoutes);
    finalApp.use('/api/configuraciones/zonas', zonasRoutes);
    
    console.log('✅ Todas las rutas cargadas');
    
    // Intentar iniciar servidor final
    const PORT = 3001;
    finalApp.listen(PORT, () => {
      console.log('🎉 ¡ÉXITO! Servidor completo funcionando en puerto', PORT);
      console.log('✅ Todas las rutas están OK');
    });
    
  } catch (error) {
    console.log('❌ Error al cargar todas las rutas:', error.message);
    console.log('💡 El problema aparece cuando se combinan las rutas');
  }
}

// Manejo de errores
process.on('uncaughtException', (error) => {
  console.error('💥 EXCEPCIÓN NO CAPTURADA:', error.message);
  if (error.message.includes('Missing parameter name')) {
    console.error('💥 Esta es la causa del error de path-to-regexp');
  }
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 RECHAZO NO MANEJADO:', reason);
  process.exit(1);
});