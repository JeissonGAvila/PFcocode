// testLogin.js - Script para probar todos los usuarios de la BD
const axios = require('axios');

const API_URL = 'http://localhost:3001';

// Función para probar el login
async function probarLogin(correo, contrasena, tipoEsperado, descripcion) {
  try {
    console.log(`\n🔐 ${descripcion}`);
    console.log(`📧 Email: ${correo}`);
    console.log(`🎭 Tipo esperado: ${tipoEsperado}`);
    
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      correo: correo,
      contrasena: contrasena
    });

    if (response.data.success) {
      console.log('✅ LOGIN EXITOSO!');
      console.log(`👤 Usuario: ${response.data.usuario.nombre}`);
      console.log(`🎭 Tipo: ${response.data.usuario.tipo}`);
      console.log(`🏠 Panel: ${response.data.redirigir}`);
      console.log(`🔑 Token generado: ${response.data.token.substring(0, 20)}...`);
      
      // Verificar que el token funciona
      await verificarToken(response.data.token);
      
    } else {
      console.log('❌ Login falló:', response.data);
    }
    
  } catch (error) {
    console.log('❌ ERROR EN LOGIN:');
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Error: ${error.response.data.error}`);
    } else {
      console.log('Error de conexión:', error.message);
    }
  }
  
  console.log('─'.repeat(60));
}

// Función para verificar token
async function verificarToken(token) {
  try {
    console.log('🔍 Verificando token...');
    
    const response = await axios.get(`${API_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.data.success) {
      console.log('✅ Token válido');
      console.log(`👤 Usuario verificado: ${response.data.usuario.nombre}`);
    }
    
  } catch (error) {
    console.log('❌ Error al verificar token:', error.response?.data?.error);
  }
}

// Función principal de pruebas
async function ejecutarPruebas() {
  console.log('🚀 INICIANDO PRUEBAS DE LOGIN CON USUARIOS DE LA BD');
  console.log('═'.repeat(60));
  
  // 1. ADMINISTRADOR PRINCIPAL
  await probarLogin(
    'admin@municipalidad.gob.gt', 
    'admin123', 
    'administrador',
    'ADMINISTRADOR PRINCIPAL'
  );

  // 2. TÉCNICOS ESPECIALIZADOS
  await probarLogin(
    'energia@municipalidad.gob.gt', 
    'tecnico123', 
    'tecnico',
    'TÉCNICO DE ENERGÍA ELÉCTRICA'
  );

  await probarLogin(
    'agua@municipalidad.gob.gt', 
    'tecnico123', 
    'tecnico',
    'TÉCNICO DE AGUA POTABLE'
  );

  await probarLogin(
    'drenajes@municipalidad.gob.gt', 
    'tecnico123', 
    'tecnico',
    'TÉCNICO DE DRENAJES'
  );

  await probarLogin(
    'vial@municipalidad.gob.gt', 
    'tecnico123', 
    'tecnico',
    'TÉCNICO VIAL'
  );

  await probarLogin(
    'basura@municipalidad.gob.gt', 
    'tecnico123', 
    'tecnico',
    'TÉCNICO DE RECOLECCIÓN'
  );

  // 3. LÍDER COCODE
  await probarLogin(
    'lider@cocode.gt', 
    'lider123', 
    'liderCocode',
    'LÍDER COCODE PRINCIPAL'
  );

  // 4. CIUDADANO COLABORADOR
  await probarLogin(
    'ciudadano@email.com', 
    'ciudadano123', 
    'ciudadano',
    'CIUDADANO COLABORADOR'
  );

  // 5. PRUEBAS DE ERROR (credenciales incorrectas)
  console.log('\n🔍 PROBANDO CREDENCIALES INCORRECTAS...');
  
  await probarLogin(
    'noexiste@email.com', 
    'password', 
    'ninguno',
    'USUARIO INEXISTENTE'
  );
  
  await probarLogin(
    'admin@municipalidad.gob.gt', 
    'passwordIncorrecto', 
    'ninguno',
    'CONTRASEÑA INCORRECTA'
  );
  
  console.log('\n✅ PRUEBAS COMPLETADAS');
  console.log('═'.repeat(60));
  
  console.log('\n📋 RESUMEN DE USUARIOS DISPONIBLES:');
  console.log('👨‍💼 Administrador: admin@municipalidad.gob.gt / admin123');
  console.log('⚡ Técnico Energía: energia@municipalidad.gob.gt / tecnico123');
  console.log('💧 Técnico Agua: agua@municipalidad.gob.gt / tecnico123');
  console.log('🚿 Técnico Drenajes: drenajes@municipalidad.gob.gt / tecnico123');
  console.log('🛣️ Técnico Vial: vial@municipalidad.gob.gt / tecnico123');
  console.log('🗑️ Técnico Basura: basura@municipalidad.gob.gt / tecnico123');
  console.log('👥 Líder COCODE: lider@cocode.gt / lider123');
  console.log('👤 Ciudadano: ciudadano@email.com / ciudadano123');
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  ejecutarPruebas().then(() => {
    console.log('\n🎯 Listo para usar en el frontend!');
    process.exit(0);
  }).catch(error => {
    console.error('\n💥 Error en las pruebas:', error.message);
    process.exit(1);
  });
}

module.exports = { probarLogin, verificarToken };