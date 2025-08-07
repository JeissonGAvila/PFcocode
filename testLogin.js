// testLogin.js - Script para probar el login

const axios = require('axios');

const API_URL = 'http://localhost:3001';

// Función para probar el login
async function probarLogin(correo, contrasena, tipoEsperado) {
  try {
    console.log(`\n🔐 Probando login: ${correo}`);
    console.log(`Tipo esperado: ${tipoEsperado}`);
    
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      correo: correo,
      contrasena: contrasena
    });

    if (response.data.success) {
      console.log('✅ Login exitoso!');
      console.log('👤 Usuario:', response.data.usuario.nombre);
      console.log('🎭 Tipo:', response.data.usuario.tipo);
      console.log('🏠 Panel:', response.data.redirigir);
      console.log('🔑 Token generado');
      
      // Probar verificación de token
      await probarVerificarToken(response.data.token);
      
    } else {
      console.log('❌ Login falló:', response.data);
    }
    
  } catch (error) {
    console.log('❌ Error en login:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data.error);
    } else {
      console.log('Error de conexión:', error.message);
    }
  }
}

// Función para probar verificación de token
async function probarVerificarToken(token) {
  try {
    console.log('🔍 Verificando token...');
    
    const response = await axios.get(`${API_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.data.success) {
      console.log('✅ Token válido');
      console.log('👤 Datos del usuario verificados');
    }
    
  } catch (error) {
    console.log('❌ Error al verificar token:', error.response?.data?.error);
  }
}

// Función principal de pruebas
async function ejecutarPruebas() {
  console.log('🚀 INICIANDO PRUEBAS DE LOGIN');
  console.log('=====================================');
  
  // Nota: Estas contraseñas necesitan estar hasheadas en la BD
  // Para las pruebas, necesitamos crear usuarios con contraseñas hasheadas
  
  // Probar cada tipo de usuario
  await probarLogin('admin@municipalidad.gob.gt', 'admin123', 'administrador');
  await probarLogin('energia@municipalidad.gob.gt', 'tecnico123', 'tecnico');
  await probarLogin('lider@cocode.gt', 'lider123', 'liderCocode');  
  await probarLogin('ciudadano@email.com', 'ciudadano123', 'ciudadano');
  
  // Probar credenciales incorrectas
  await probarLogin('noexiste@email.com', 'password', 'ninguno');
  await probarLogin('admin@municipalidad.gob.gt', 'passwordIncorrecto', 'ninguno');
  
  console.log('\n✅ PRUEBAS COMPLETADAS');
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  ejecutarPruebas();
}

module.exports = { probarLogin, probarVerificarToken };