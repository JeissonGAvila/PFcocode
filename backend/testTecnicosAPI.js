// testTecnicosAPI.js - Script para probar el CRUD de técnicos
const axios = require('axios');

const API_URL = 'http://localhost:3001';

// 🧪 FUNCIONES DE PRUEBA
async function probarCrearTecnico() {
  try {
    console.log('\n🔧 PROBANDO CREAR TÉCNICO...');
    
    const nuevoTecnico = {
      nombre: 'Pedro',
      apellido: 'García',
      correo: 'pedro.garcia@municipalidad.gob.gt',
      contrasena: 'tecnico123',
      telefono: '7766-1234',
      departamento: 'Energía Eléctrica',
      rol: 'Técnico Electricista Senior',
      puede_asignar: false,
      usuario_ingreso: 'admin_test'
    };

    const response = await axios.post(`${API_URL}/api/admin/tecnicos`, nuevoTecnico);
    
    if (response.data.success) {
      console.log('✅ Técnico creado exitosamente');
      console.log('👤 ID:', response.data.data.id);
      console.log('👤 Nombre:', response.data.data.nombre, response.data.data.apellido);
      console.log('📧 Email:', response.data.data.correo);
      console.log('🏢 Departamento:', response.data.data.departamento);
      return response.data.data.id;
    }
    
  } catch (error) {
    console.log('❌ Error al crear técnico:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data.error);
    } else {
      console.log('Error de conexión:', error.message);
    }
    return null;
  }
}

async function probarListarTecnicos() {
  try {
    console.log('\n📋 PROBANDO LISTAR TÉCNICOS...');
    
    const response = await axios.get(`${API_URL}/api/admin/tecnicos`);
    
    if (response.data.success) {
      console.log('✅ Lista obtenida exitosamente');
      console.log('📊 Total técnicos:', response.data.total);
      
      response.data.data.forEach((tecnico, index) => {
        console.log(`${index + 1}. ${tecnico.nombre} ${tecnico.apellido} - ${tecnico.departamento}`);
      });
    }
    
  } catch (error) {
    console.log('❌ Error al listar técnicos:', error.response?.data?.error || error.message);
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

    const response = await axios.put(`${API_URL}/api/admin/tecnicos/${id}`, datosActualizados);
    
    if (response.data.success) {
      console.log('✅ Técnico actualizado exitosamente');
      console.log('👤 Nuevo nombre:', response.data.data.nombre, response.data.data.apellido);
      console.log('🏢 Nuevo departamento:', response.data.data.departamento);
    }
    
  } catch (error) {
    console.log('❌ Error al actualizar técnico:', error.response?.data?.error || error.message);
  }
}

async function probarCambiarPassword(id) {
  try {
    console.log('\n🔑 PROBANDO CAMBIAR CONTRASEÑA...');
    
    const nuevaPassword = {
      nueva_contrasena: 'nuevaPassword123',
      usuario_modifica: 'admin_test'
    };

    const response = await axios.patch(`${API_URL}/api/admin/tecnicos/${id}/password`, nuevaPassword);
    
    if (response.data.success) {
      console.log('✅ Contraseña cambiada exitosamente');
    }
    
  } catch (error) {
    console.log('❌ Error al cambiar contraseña:', error.response?.data?.error || error.message);
  }
}

async function probarTecnicosPorDepartamento() {
  try {
    console.log('\n📊 PROBANDO TÉCNICOS POR DEPARTAMENTO...');
    
    const departamentos = ['Agua Potable', 'Energía Eléctrica'];
    
    for (const dept of departamentos) {
      const response = await axios.get(`${API_URL}/api/admin/tecnicos/departamento/${encodeURIComponent(dept)}`);
      
      if (response.data.success) {
        console.log(`✅ ${dept}: ${response.data.total} técnicos`);
        response.data.data.forEach(tecnico => {
          console.log(`  - ${tecnico.nombre} ${tecnico.apellido} (${tecnico.reportes_asignados} reportes)`);
        });
      }
    }
    
  } catch (error) {
    console.log('❌ Error al obtener técnicos por departamento:', error.response?.data?.error || error.message);
  }
}

async function probarDesactivarTecnico(id) {
  try {
    console.log('\n🗑️ PROBANDO DESACTIVAR TÉCNICO...');
    
    const response = await axios.delete(`${API_URL}/api/admin/tecnicos/${id}`, {
      data: { usuario_modifica: 'admin_test' }
    });
    
    if (response.data.success) {
      console.log('✅ Técnico desactivado exitosamente');
    }
    
  } catch (error) {
    console.log('❌ Error al desactivar técnico:', error.response?.data?.error || error.message);
  }
}

// 🚀 EJECUTAR TODAS LAS PRUEBAS
async function ejecutarTodasLasPruebas() {
  console.log('🧪 INICIANDO PRUEBAS DEL CRUD DE TÉCNICOS');
  console.log('==========================================');
  
  // Probar servidor
  try {
    const response = await axios.get(`${API_URL}/api/test`);
    console.log('✅ Servidor funcionando correctamente');
  } catch (error) {
    console.log('❌ Error: No se puede conectar al servidor. ¿Está corriendo en puerto 3001?');
    return;
  }
  
  // 1. Listar técnicos existentes
  await probarListarTecnicos();
  
  // 2. Crear nuevo técnico
  const nuevoId = await probarCrearTecnico();
  
  if (nuevoId) {
    // 3. Listar de nuevo para ver el cambio
    await probarListarTecnicos();
    
    // 4. Actualizar técnico
    await probarActualizarTecnico(nuevoId);
    
    // 5. Cambiar contraseña
    await probarCambiarPassword(nuevoId);
    
    // 6. Obtener por departamento
    await probarTecnicosPorDepartamento();
    
    // 7. Desactivar técnico (comentado para no eliminar datos de prueba)
    // await probarDesactivarTecnico(nuevoId);
    
    console.log('\n✅ TODAS LAS PRUEBAS COMPLETADAS');
    console.log(`💡 Técnico de prueba creado con ID: ${nuevoId}`);
    console.log('💡 Descomenta la línea de desactivar si quieres eliminarlo');
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  ejecutarTodasLasPruebas();
}

module.exports = { 
  probarCrearTecnico, 
  probarListarTecnicos, 
  probarActualizarTecnico,
  probarCambiarPassword,
  probarDesactivarTecnico 
};