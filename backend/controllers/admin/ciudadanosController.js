// backend/controllers/admin/ciudadanosController.js
const pool = require('../../models/db');

// Obtener todos los ciudadanos (SIN mostrar contraseñas)
const getCiudadanos = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.id, c.nombre, c.apellido, c.correo, c.telefono, c.dpi,
        c.direccion_completa, c.id_zona, c.id_subcocode_cercano,
        c.fecha_ingreso, c.usuario_ingreso, c.fecha_modifica, c.usuario_modifica,
        z.nombre as nombre_zona,
        s.nombre as nombre_subcocode
      FROM ciudadanos_colaboradores c
      LEFT JOIN zonas z ON c.id_zona = z.id
      LEFT JOIN subcocode s ON c.id_subcocode_cercano = s.id
      WHERE c.estado = TRUE 
      ORDER BY c.nombre, c.apellido
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener ciudadanos:', error);
    res.status(500).json({ error: 'Error al obtener ciudadanos' });
  }
};

// Obtener ciudadanos por zona
const getCiudadanosPorZona = async (req, res) => {
  const { zonaId } = req.params;
  
  try {
    const result = await pool.query(`
      SELECT 
        c.id, c.nombre, c.apellido, c.correo, c.telefono, c.dpi,
        c.direccion_completa, c.fecha_ingreso,
        z.nombre as nombre_zona,
        s.nombre as nombre_subcocode
      FROM ciudadanos_colaboradores c
      LEFT JOIN zonas z ON c.id_zona = z.id
      LEFT JOIN subcocode s ON c.id_subcocode_cercano = s.id
      WHERE c.id_zona = $1 AND c.estado = TRUE 
      ORDER BY c.nombre, c.apellido
    `, [zonaId]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener ciudadanos por zona:', error);
    res.status(500).json({ error: 'Error al obtener ciudadanos por zona' });
  }
};

// Crear un nuevo ciudadano
const createCiudadano = async (req, res) => {
  const { 
    nombre, apellido, correo, contrasena, telefono, dpi,
    direccion_completa, id_zona, id_subcocode_cercano, 
    usuario_ingreso 
  } = req.body;
  
  try {
    // Validaciones básicas
    if (!nombre || !apellido || !correo || !contrasena || !dpi) {
      return res.status(400).json({ 
        error: 'Campos obligatorios: nombre, apellido, correo, contraseña y DPI' 
      });
    }

    // TODO: En producción, hashear la contraseña antes de guardar
    // const bcrypt = require('bcrypt');
    // const hashedPassword = await bcrypt.hash(contrasena, 10);
    
    const result = await pool.query(
      `INSERT INTO ciudadanos_colaboradores 
       (nombre, apellido, correo, contrasena, telefono, dpi, 
        direccion_completa, id_zona, id_subcocode_cercano, usuario_ingreso) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING id, nombre, apellido, correo, telefono, dpi, 
                 direccion_completa, id_zona, id_subcocode_cercano, fecha_ingreso`,
      [nombre, apellido, correo, contrasena, telefono, dpi, 
       direccion_completa, id_zona, id_subcocode_cercano, usuario_ingreso || 'admin']
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear ciudadano:', error);
    if (error.code === '23505') { // Unique violation
      res.status(400).json({ error: 'El correo electrónico o DPI ya está registrado' });
    } else {
      res.status(500).json({ error: 'Error al crear ciudadano' });
    }
  }
};

// Editar un ciudadano
const updateCiudadano = async (req, res) => {
  const { id } = req.params;
  const { 
    nombre, apellido, correo, telefono, dpi,
    direccion_completa, id_zona, id_subcocode_cercano, 
    usuario_modifica 
  } = req.body;
  
  try {
    const result = await pool.query(
      `UPDATE ciudadanos_colaboradores 
       SET nombre = $1, apellido = $2, correo = $3, telefono = $4, dpi = $5,
           direccion_completa = $6, id_zona = $7, id_subcocode_cercano = $8,
           usuario_modifica = $9, fecha_modifica = CURRENT_TIMESTAMP 
       WHERE id = $10 AND estado = TRUE 
       RETURNING id, nombre, apellido, correo, telefono, dpi, 
                 direccion_completa, id_zona, id_subcocode_cercano, fecha_modifica`,
      [nombre, apellido, correo, telefono, dpi, direccion_completa, 
       id_zona, id_subcocode_cercano, usuario_modifica || 'admin', id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ciudadano no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar ciudadano:', error);
    if (error.code === '23505') { // Unique violation
      res.status(400).json({ error: 'El correo electrónico o DPI ya está registrado' });
    } else {
      res.status(500).json({ error: 'Error al actualizar ciudadano' });
    }
  }
};

// Cambiar contraseña de ciudadano
const updatePassword = async (req, res) => {
  const { id } = req.params;
  const { nueva_contrasena, usuario_modifica } = req.body;
  
  try {
    if (!nueva_contrasena || nueva_contrasena.length < 6) {
      return res.status(400).json({ 
        error: 'La contraseña debe tener al menos 6 caracteres' 
      });
    }

    // TODO: En producción, hashear la nueva contraseña
    // const bcrypt = require('bcrypt');
    // const hashedPassword = await bcrypt.hash(nueva_contrasena, 10);
    
    const result = await pool.query(
      `UPDATE ciudadanos_colaboradores 
       SET contrasena = $1, usuario_modifica = $2, fecha_modifica = CURRENT_TIMESTAMP 
       WHERE id = $3 AND estado = TRUE 
       RETURNING id, nombre, apellido, correo`,
      [nueva_contrasena, usuario_modifica || 'admin', id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ciudadano no encontrado' });
    }
    res.json({ message: 'Contraseña actualizada exitosamente', ciudadano: result.rows[0] });
  } catch (error) {
    console.error('Error al actualizar contraseña:', error);
    res.status(500).json({ error: 'Error al actualizar contraseña' });
  }
};

// Borrado lógico (desactivar ciudadano)
const deleteCiudadano = async (req, res) => {
  const { id } = req.params;
  const { usuario_modifica } = req.body;

  try {
    const result = await pool.query(
      `UPDATE ciudadanos_colaboradores 
       SET estado = FALSE, usuario_modifica = $1, fecha_modifica = CURRENT_TIMESTAMP 
       WHERE id = $2 AND estado = TRUE 
       RETURNING id, nombre, apellido, correo`,
      [usuario_modifica || 'admin', id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ciudadano no encontrado o ya desactivado' });
    }
    res.json({ message: 'Ciudadano desactivado', ciudadano: result.rows[0] });
  } catch (error) {
    console.error('Error al desactivar ciudadano:', error);
    res.status(500).json({ error: 'Error al desactivar ciudadano' });
  }
};

// Obtener estadísticas de ciudadanos
const getEstadisticasCiudadanos = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_ciudadanos,
        COUNT(CASE WHEN estado = TRUE THEN 1 END) as ciudadanos_activos,
        COUNT(CASE WHEN estado = FALSE THEN 1 END) as ciudadanos_inactivos,
        COUNT(DISTINCT id_zona) as zonas_con_ciudadanos
      FROM ciudadanos_colaboradores
    `);
    
    const zonasMasActivas = await pool.query(`
      SELECT 
        z.nombre as zona,
        COUNT(c.id) as cantidad_ciudadanos
      FROM zonas z
      LEFT JOIN ciudadanos_colaboradores c ON z.id = c.id_zona AND c.estado = TRUE
      GROUP BY z.id, z.nombre
      ORDER BY cantidad_ciudadanos DESC
      LIMIT 5
    `);
    
    res.json({
      ...result.rows[0],
      zonas_mas_activas: zonasMasActivas.rows
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de ciudadanos:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};

// Verificar ciudadano (cambiar estado de verificación)
const verificarCiudadano = async (req, res) => {
  const { id } = req.params;
  const { verificado, usuario_modifica } = req.body;
  
  try {
    // Esta funcionalidad requiere agregar campo 'verificado' a la tabla
    // Por ahora simularemos con un comentario en usuario_modifica
    const comentario = verificado ? 'Verificado por admin' : 'Verificación removida';
    
    const result = await pool.query(
      `UPDATE ciudadanos_colaboradores 
       SET usuario_modifica = $1, fecha_modifica = CURRENT_TIMESTAMP 
       WHERE id = $2 AND estado = TRUE 
       RETURNING id, nombre, apellido, correo`,
      [`${usuario_modifica || 'admin'} - ${comentario}`, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ciudadano no encontrado' });
    }
    
    res.json({ 
      message: verificado ? 'Ciudadano verificado' : 'Verificación removida', 
      ciudadano: result.rows[0] 
    });
  } catch (error) {
    console.error('Error al verificar ciudadano:', error);
    res.status(500).json({ error: 'Error al verificar ciudadano' });
  }
};

module.exports = {
  getCiudadanos,
  getCiudadanosPorZona,
  createCiudadano,
  updateCiudadano,
  updatePassword,
  deleteCiudadano,
  getEstadisticasCiudadanos,
  verificarCiudadano
};