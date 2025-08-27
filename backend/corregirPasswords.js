// corregirPasswords.js - Corregir contraseñas en nuevo equipo
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT,
});

async function corregirTodasLasContrasenas() {
  try {
    console.log('🔧 CORRIGIENDO CONTRASEÑAS EN NUEVO EQUIPO...');
    console.log('='.repeat(50));

    // Generar hashes correctos
    const hashAdmin = await bcrypt.hash('admin123', 10);
    const hashTecnico = await bcrypt.hash('tecnico123', 10);
    const hashLider = await bcrypt.hash('lider123', 10);
    const hashCiudadano = await bcrypt.hash('ciudadano123', 10);

    console.log('✅ Hashes generados');

    // Corregir administrador
    await pool.query(`
      UPDATE administradores SET contrasena = $1 
      WHERE correo = 'admin@municipalidad.gob.gt'
    `, [hashAdmin]);
    console.log('✅ Admin corregido');

    // Corregir técnicos
    const tecnicos = [
      'energia@municipalidad.gob.gt',
      'agua@municipalidad.gob.gt',
      'drenajes@municipalidad.gob.gt', 
      'vial@municipalidad.gob.gt',
      'basura@municipalidad.gob.gt'
    ];

    for (const email of tecnicos) {
      await pool.query(`
        UPDATE administradores SET contrasena = $1 
        WHERE correo = $2
      `, [hashTecnico, email]);
    }
    console.log('✅ Técnicos corregidos (5)');

    // Corregir líder
    await pool.query(`
      UPDATE usuarios SET contrasena = $1 
      WHERE correo = 'lider@cocode.gt'
    `, [hashLider]);
    console.log('✅ Líder corregido');

    // Corregir ciudadano
    await pool.query(`
      UPDATE ciudadanos_colaboradores SET contrasena = $1 
      WHERE correo = 'ciudadano@email.com'
    `, [hashCiudadano]);
    console.log('✅ Ciudadano corregido');

    console.log('\n🎯 CONTRASEÑAS CORREGIDAS:');
    console.log('admin@municipalidad.gob.gt → admin123');
    console.log('energia@municipalidad.gob.gt → tecnico123');
    console.log('agua@municipalidad.gob.gt → tecnico123');
    console.log('drenajes@municipalidad.gob.gt → tecnico123');
    console.log('vial@municipalidad.gob.gt → tecnico123'); 
    console.log('basura@municipalidad.gob.gt → tecnico123');
    console.log('lider@cocode.gt → lider123');
    console.log('ciudadano@email.com → ciudadano123');

    console.log('\n▶️ EJECUTA AHORA: node testLogin.js');

    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    console.log('\n🔍 VERIFICA:');
    console.log('1. Archivo .env con credenciales correctas');
    console.log('2. PostgreSQL corriendo'); 
    console.log('3. Base de datos "proyectococode" existe');
    process.exit(1);
  }
}

if (require.main === module) {
  corregirTodasLasContrasenas();
}

module.exports = { corregirTodasLasContrasenas };