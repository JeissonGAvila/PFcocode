// testdb.js

const pool = require('./backend/models/db');

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error de conexión:', err);
  } else {
    console.log('Conexión exitosa:', res.rows);
  }
  pool.end();
});