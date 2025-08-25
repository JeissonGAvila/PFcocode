// verificarPasswords.js - Diagnosticar y corregir contraseñas
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
require('dotenv').config();

// Configuración de la BD
const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT,
});

// Contraseñas que queremos que funcionen
const passwordsEsperados = {
  'admin@municipalidad.gob.gt': 'admin123',
  'energia@municipalidad.gob.gt': 'tecnico123',
  'agua@municipalidad.gob.gt': 'tecnico123',
  'drenajes@municipalidad.gob.gt': 'tecnico123',
  'vial@municipalidad.gob.gt': 'tecnico123',
  'basura@municipalidad.gob.gt': 'tecnico123',
  'lider@cocode.gt': 'lider123',
  'ciudadano@email.com': 'ciudadano123'
};

async function verificarYCorregirPasswords() {
  try {
    console.log('🔍 VERIFICANDO CONTRASEÑAS EN LA BASE DE DATOS');
    console.log('='.repeat(60));

    // 1. Verificar administradores
    console.log('\n👨‍💼 VERIFICANDO ADMINISTRADORES:');
    const adminResult = await pool.query(`
      SELECT id, nombre, apellido, correo, contrasena, tipo_usuario 
      FROM administradores 
      WHERE estado = TRUE
    `);

    for (const admin of adminResult.rows) {
      const passwordEsperado = passwordsEsperados[admin.correo];
      if (passwordEsperado) {
        const esValida = await bcrypt.compare(passwordEsperado, admin.contrasena);
        console.log(`${admin.correo}: ${esValida ? '✅ VÁLIDA' : '❌ INVÁLIDA'}`);
        console.log(`  Hash actual: ${admin.contrasena}`);
        console.log(`  Password esperado: ${passwordEsperado}`);
        
        if (!esValida) {
          console.log(`  🔄 Generando hash correcto...`);
          const nuevoHash = await bcrypt.hash(passwordEsperado, 10);
          console.log(`  Nuevo hash: ${nuevoHash}`);
        }
        console.log('');
      }
    }

    // 2. Verificar líderes
    console.log('\n👥 VERIFICANDO LÍDERES COCODE:');
    const liderResult = await pool.query(`
      SELECT id, nombre, apellido, correo, contrasena 
      FROM usuarios 
      WHERE estado = TRUE
    `);

    for (const lider of liderResult.rows) {
      const passwordEsperado = passwordsEsperados[lider.correo];
      if (passwordEsperado) {
        const esValida = await bcrypt.compare(passwordEsperado, lider.contrasena);
        console.log(`${lider.correo}: ${esValida ? '✅ VÁLIDA' : '❌ INVÁLIDA'}`);
        console.log(`  Hash actual: ${lider.contrasena}`);
        console.log(`  Password esperado: ${passwordEsperado}`);
        
        if (!esValida) {
          console.log(`  🔄 Generando hash correcto...`);
          const nuevoHash = await bcrypt.hash(passwordEsperado, 10);
          console.log(`  Nuevo hash: ${nuevoHash}`);
        }
        console.log('');
      }
    }

    // 3. Verificar ciudadanos
    console.log('\n👤 VERIFICANDO CIUDADANOS:');
    const ciudadanoResult = await pool.query(`
      SELECT id, nombre, apellido, correo, contrasena 
      FROM ciudadanos_colaboradores 
      WHERE estado = TRUE AND activo = TRUE
    `);

    for (const ciudadano of ciudadanoResult.rows) {
      const passwordEsperado = passwordsEsperados[ciudadano.correo];
      if (passwordEsperado) {
        const esValida = await bcrypt.compare(passwordEsperado, ciudadano.contrasena);
        console.log(`${ciudadano.correo}: ${esValida ? '✅ VÁLIDA' : '❌ INVÁLIDA'}`);
        console.log(`  Hash actual: ${ciudadano.contrasena}`);
        console.log(`  Password esperado: ${passwordEsperado}`);
        
        if (!esValida) {
          console.log(`  🔄 Generando hash correcto...`);
          const nuevoHash = await bcrypt.hash(passwordEsperado, 10);
          console.log(`  Nuevo hash: ${nuevoHash}`);
        }
        console.log('');
      }
    }

  } catch (error) {
    console.error('💥 Error:', error);
  }
}

async function generarHashsCorrectos() {
  console.log('\n🔧 GENERANDO HASHES CORRECTOS:');
  console.log('='.repeat(60));
  
  for (const [email, password] of Object.entries(passwordsEsperados)) {
    const hash = await bcrypt.hash(password, 10);
    console.log(`${email}:`);
    console.log(`  Password: ${password}`);
    console.log(`  Hash: ${hash}`);
    console.log('');
  }
}

async function actualizarPasswords() {
  console.log('\n🔄 ¿QUIERES ACTUALIZAR LAS CONTRASEÑAS EN LA BD?');
  console.log('='.repeat(60));
  
  // Generar los hashes correctos
  const hashsCorrectos = {};
  for (const [email, password] of Object.entries(passwordsEsperados)) {
    hashsCorrectos[email] = await bcrypt.hash(password, 10);
  }

  console.log('📝 QUERIES SQL PARA ACTUALIZAR:');
  console.log('');

  // Administradores
  console.log('-- ADMINISTRADORES:');
  const adminEmails = ['admin@municipalidad.gob.gt', 'energia@municipalidad.gob.gt', 
                      'agua@municipalidad.gob.gt', 'drenajes@municipalidad.gob.gt', 
                      'vial@municipalidad.gob.gt', 'basura@municipalidad.gob.gt'];
  
  for (const email of adminEmails) {
    console.log(`UPDATE administradores SET contrasena = '${hashsCorrectos[email]}' WHERE correo = '${email}';`);
  }

  console.log('\n-- LÍDERES:');
  console.log(`UPDATE usuarios SET contrasena = '${hashsCorrectos['lider@cocode.gt']}' WHERE correo = 'lider@cocode.gt';`);

  console.log('\n-- CIUDADANOS:');
  console.log(`UPDATE ciudadanos_colaboradores SET contrasena = '${hashsCorrectos['ciudadano@email.com']}' WHERE correo = 'ciudadano@email.com';`);

  console.log('\n💡 COPIA Y EJECUTA ESTOS QUERIES EN TU BASE DE DATOS');
}

async function main() {
  await verificarYCorregirPasswords();
  await generarHashsCorrectos();
  await actualizarPasswords();
  
  console.log('\n✅ DIAGNÓSTICO COMPLETADO');
  console.log('');
  console.log('📋 SIGUIENTE PASO: Ejecuta los queries SQL mostrados arriba en tu base de datos');
  console.log('    y luego vuelve a ejecutar: node testLogin.js');
  
  process.exit(0);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { verificarYCorregirPasswords, generarHashsCorrectos };