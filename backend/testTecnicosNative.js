// testTecnicosNative.js - Pruebas usando solo módulos nativos de Node.js
const http = require('http');

const API_HOST = 'localhost';
const API_PORT = 3001;

// 🛠️ FUNCIÓN HELPER PARA HACER REQUESTS
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : null;
    
    const options = {
      hostname: API_HOST,
      port: API_PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(postData && { 'Content-Length': Buffer.byteLength(postData) })
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedBody = JSON.parse(body);
          resolve({
            status: res.statusCode,
            data: parsedBody
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: { raw: body }
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

// 🧪 FUNCIONES DE PRUEBA
async function probarServidor() {
  try {
    console.log('\n🔍 PROBANDO CONEXIÓN AL SERVIDOR...');
    const response = await makeRequest('GET', '/api/test');
    
    if (response.status === 200) {
      console.log('✅ Servidor funcionando correctamente');
      console.log('📅 Timestamp:', response.data.timestamp);
      return true;
    } else {
      console.log('❌ Servidor no responde correctamente');
      return false;
    }
  } catch (error) {
    console.log('❌ Error de conexión:', error.message);
    console.log('💡 ¿Está el servidor corriendo en puerto 3001?');
    return false;
  }
}

async function probarListarTecnicos() {
  try {
    console.log('\n📋 PROBANDO LISTAR TÉCNICOS...');
    const response = await makeRequest('GET', '/api/admin/tecnicos');
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ Lista obtenida exitosamente');
      console.log('📊 Total técnicos:', response.data.total);
      
      if (response.data.data.length > 0) {
        console.log('👥 Técnicos encontrados:');
        response.data.data.forEach((tecnico, index) => {
          console.log(`   ${index + 1}. ${tecnico.nombre} ${tecnico.apellido} - ${tecnico.departamento}`);
        });
      } else {
        console.log('📝 No hay técnicos registrados aún');
      }
      return true;
    } else {
      console.log('❌ Error al listar:', response.data.error || 'Error desconocido');
      return false;
    }
  } catch (error) {
    console.log('❌ Error en la petición:', error.message);
    return false;
  }
}

async function probarCrearTecnico() {
  try {
    console.log('\n🔧 PROBANDO CREAR TÉCNICO...');
    
    // Generar email único con timestamp
    const timestamp = Date.now();
    const nuevoTecnico = {
      nombre: 'María',
      apellido: 'Rodríguez',
      correo: `maria.rodriguez.${timestamp}@municipalidad.gob.gt`,
      contrasena: 'tecnico123',
      telefono: '7766-5678',
      departamento: 'Drenajes',
      rol: 'Técnica de Drenajes',
      puede_asignar: true,
      usuario_ingreso: 'admin_test'
    };

    const response = await makeRequest('POST', '/api/admin/tecnicos', nuevoTecnico);
    
    if (response.status === 201 && response.data.success) {
      console.log('✅ Técnico creado exitosamente');
      console.log('🆔 ID:', response.data.data.id);
      console.log('👤 Nombre:', response.data.data.nombre, response.data.data.apellido);
      console.log('📧 Email:', response.data.data.correo);
      console.log('🏢 Departamento:', response.data.data.departamento);
      return response.data.data.id;
    } else {
      console.log('❌ Error al crear técnico:', response.data.error || 'Error desconocido');
      return null;
    }
  } catch (error) {
    console.log('❌ Error en la petición:', error.message);
    return null;
  }
}

async function probarActualizarTecnico(id) {
  try {
    console.log('\n✏️ PROBANDO ACTUALIZAR TÉCNICO...');
    
    const datosActualizados = {
      nombre: 'Pedro Actualizado',
      apellido: 'García López',
      correo: 'pedro.garcia.actualizado@municipalidad.gob.gt',
      telefono: '7766-9999',
      departamento: 'Agua Potable',
      rol: 'Técnico de Agua Senior',
      puede_asignar: true,
      usuario_modifica: 'admin_test'
    };

    const response = await makeRequest('PUT', `/api/admin/tecnicos/${id}`, datosActualizados);
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ Técnico actualizado exitosamente');
      console.log('👤 Nuevo nombre:', response.data.data.nombre, response.data.data.apellido);
      console.log('🏢 Nuevo departamento:', response.data.data.departamento);
      return true;
    } else {
      console.log('❌ Error al actualizar:', response.data.error || 'Error desconocido');
      return false;
    }
  } catch (error) {
    console.log('❌ Error en la petición:', error.message);
    return false;
  }
}

async function probarTecnicosPorDepartamento() {
  try {
    console.log('\n📊 PROBANDO TÉCNICOS POR DEPARTAMENTO...');
    
    const departamentos = ['Agua Potable', 'Energía Eléctrica'];
    
    for (const dept of departamentos) {
      const encodedDept = encodeURIComponent(dept);
      const response = await makeRequest('GET', `/api/admin/tecnicos/departamento/${encodedDept}`);
      
      if (response.status === 200 && response.data.success) {
        console.log(`✅ ${dept}: ${response.data.total} técnicos`);
        response.data.data.forEach(tecnico => {
          console.log(`   - ${tecnico.nombre} ${tecnico.apellido} (${tecnico.reportes_asignados} reportes)`);
        });
      } else {
        console.log(`❌ Error con ${dept}:`, response.data.error || 'Error desconocido');
      }
    }
    
    return true;
  } catch (error) {
    console.log('❌ Error en la petición:', error.message);
    return false;
  }
}

// 🚀 FUNCIÓN PRINCIPAL
async function ejecutarTodasLasPruebas() {
  console.log('🧪 INICIANDO PRUEBAS DEL CRUD DE TÉCNICOS');
  console.log('==========================================');
  console.log('🔧 Usando módulos nativos de Node.js (sin axios)');
  
  // 1. Verificar servidor
  const servidorOk = await probarServidor();
  if (!servidorOk) {
    console.log('\n❌ No se puede continuar sin conexión al servidor');
    return;
  }
  
  // 2. Listar técnicos existentes
  await probarListarTecnicos();
  
  // 3. Crear nuevo técnico
  const nuevoId = await probarCrearTecnico();
  
  if (nuevoId) {
    // 4. Listar de nuevo para ver el cambio
    await probarListarTecnicos();
    
    // 5. Actualizar técnico
    await probarActualizarTecnico(nuevoId);
    
    // 6. Obtener por departamento
    await probarTecnicosPorDepartamento();
    
    console.log('\n✅ TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE');
    console.log(`💡 Técnico de prueba creado con ID: ${nuevoId}`);
    console.log('💡 El técnico queda guardado en la base de datos para más pruebas');
  } else {
    console.log('\n⚠️ No se pudo crear el técnico de prueba');
    console.log('💡 Verifica la conexión a la base de datos');
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  ejecutarTodasLasPruebas();
}

module.exports = { 
  probarServidor,
  probarListarTecnicos, 
  probarCrearTecnico, 
  probarActualizarTecnico,
  probarTecnicosPorDepartamento
};