// testLoginSimple.js - Sin dependencias externas
async function probarLogin() {
    console.log('🔐 PROBANDO LOGIN...\n');
    
    const loginData = {
      correo: "admin@municipalidad.gob.gt",
      contrasena: "admin123"
    };
  
    try {
      console.log('📤 Enviando petición de login...');
      console.log('Email:', loginData.correo);
      console.log('Password:', loginData.contrasena);
      
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData)
      });
  
      console.log('\n📥 Respuesta recibida:');
      console.log('Status:', response.status);
      
      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ LOGIN EXITOSO!');
        console.log('👤 Usuario:', data.usuario?.nombre);
        console.log('🎭 Tipo:', data.usuario?.tipo);
        console.log('🏠 Panel:', data.redirigir);
        console.log('🔑 Token generado ✅');
        
        // Probar verificación de token
        if (data.token) {
          await probarToken(data.token);
        }
        
      } else {
        console.log('❌ LOGIN FALLÓ');
        console.log('Error:', data.error || data.message);
      }
      
    } catch (error) {
      console.log('💥 ERROR DE CONEXIÓN:');
      console.log('Mensaje:', error.message);
      console.log('\n🔍 POSIBLES CAUSAS:');
      console.log('1. El servidor backend no está corriendo');
      console.log('2. El servidor está en otro puerto');
      console.log('3. Problema de conectividad');
    }
  }
  
  async function probarToken(token) {
    try {
      console.log('\n🔍 Verificando token...');
      
      const response = await fetch('http://localhost:3001/api/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Token válido');
        console.log('👤 Usuario verificado:', data.usuario?.nombre);
      } else {
        const data = await response.json();
        console.log('❌ Error verificando token:', data.error);
      }
      
    } catch (error) {
      console.log('❌ Error al verificar token:', error.message);
    }
  }
  
  // Ejecutar las pruebas
  probarLogin().then(() => {
    console.log('\n✅ PRUEBAS COMPLETADAS');
  }).catch(error => {
    console.log('\n💥 ERROR EN PRUEBAS:', error.message);
  });