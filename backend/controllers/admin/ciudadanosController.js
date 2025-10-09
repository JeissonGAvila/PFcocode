// backend/controllers/admin/ciudadanosController.js
const pool = require('../../models/db');
const bcrypt = require('bcrypt');

// 🔧 NUEVO: Obtener datos para los selects (COCODE y Sub-COCODE)
const getDatosSelect = async (req, res) => {
  try {
    // Obtener todos los COCODEs con su zona
    const cocodesQuery = `
      SELECT 
        c.id,
        c.nombre,
        c.id_zona,
        z.nombre as nombre_zona
      FROM cocode c
      INNER JOIN zonas z ON c.id_zona = z.id
      WHERE c.estado = TRUE
      ORDER BY c.nombre
    `;
    const cocodesResult = await pool.query(cocodesQuery);

    // Obtener todos los Sub-COCODEs
    const subcocodesQuery = `
      SELECT 
        s.id,
        s.nombre,
        s.id_cocode_principal as cocode_principal_id,
        s.sector,
        c.nombre as nombre_cocode,
        c.id_zona,
        z.nombre as nombre_zona
      FROM subcocode s
      INNER JOIN cocode c ON s.id_cocode_principal = c.id
      INNER JOIN zonas z ON c.id_zona = z.id
      WHERE s.estado = TRUE
      ORDER BY s.nombre
    `;
    const subcocodesResult = await pool.query(subcocodesQuery);

    res.json({
      cocodes: cocodesResult.rows,
      subcodes: subcocodesResult.rows
    });
  } catch (error) {
    console.error('Error al obtener datos para selects:', error);
    res.status(500).json({ error: 'Error al obtener datos para selects' });
  }
};

// Obtener todos los ciudadanos CON JOINS para mostrar zona y subcocode
const getCiudadanos = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.id, c.nombre, c.apellido, c.correo, c.telefono, c.dpi,
        c.direccion, c.id_zona, c.id_subcocode,
        c.fecha_ingreso, c.usuario_ingreso, c.fecha_modifica, c.usuario_modifica,
        z.nombre as nombre_zona,
        s.nombre as nombre_subcocode,
        co.nombre as nombre_cocode
      FROM ciudadanos_colaboradores c
      LEFT JOIN zonas z ON c.id_zona = z.id
      LEFT JOIN subcocode s ON c.id_subcocode = s.id
      LEFT JOIN cocode co ON s.id_cocode_principal = co.id
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
        c.direccion, c.fecha_ingreso,
        z.nombre as nombre_zona,
        s.nombre as nombre_subcocode
      FROM ciudadanos_colaboradores c
      LEFT JOIN zonas z ON c.id_zona = z.id
      LEFT JOIN subcocode s ON c.id_subcocode = s.id
      WHERE c.id_zona = $1 AND c.estado = TRUE 
      ORDER BY c.nombre, c.apellido
    `, [zonaId]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener ciudadanos por zona:', error);
    res.status(500).json({ error: 'Error al obtener ciudadanos por zona' });
  }
};

// 🔥 CREAR CIUDADANO - SIMPLIFICADO (igual que líderes)
const createCiudadano = async (req, res) => {
  const { 
    nombre, 
    apellido, 
    correo, 
    contrasena, 
    telefono, 
    dpi,
    direccion, 
    id_subcocode,  // 👈 SOLO recibimos el subcocode
    usuario_ingreso 
  } = req.body;
  
  try {
    // Validaciones básicas
    if (!nombre || !apellido || !correo || !contrasena) {
      return res.status(400).json({ 
        error: 'Campos obligatorios: nombre, apellido, correo y contraseña' 
      });
    }

    if (!id_subcocode) {
      return res.status(400).json({ 
        error: 'Debes seleccionar un sector (Sub-COCODE)' 
      });
    }

    if (contrasena.length < 6) {
      return res.status(400).json({ 
        error: 'La contraseña debe tener al menos 6 caracteres' 
      });
    }

    // 🔒 Hashear la contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // 🔍 Obtener la zona automáticamente desde el subcocode seleccionado
    const zonaQuery = `
      SELECT c.id_zona 
      FROM subcocode s
      INNER JOIN cocode c ON s.id_cocode_principal = c.id
      WHERE s.id = $1
    `;
    const zonaResult = await pool.query(zonaQuery, [id_subcocode]);

    if (zonaResult.rows.length === 0) {
      return res.status(400).json({ 
        error: 'El sector seleccionado no existe o está inactivo' 
      });
    }

    const id_zona = zonaResult.rows[0].id_zona;
    
    // ✅ Insertar ciudadano con zona obtenida automáticamente
    const result = await pool.query(
      `INSERT INTO ciudadanos_colaboradores 
       (nombre, apellido, correo, contrasena, telefono, dpi, 
        direccion, id_zona, id_subcocode, usuario_ingreso) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING id, nombre, apellido, correo, telefono, dpi, 
                 direccion, id_zona, id_subcocode, fecha_ingreso`,
      [nombre, apellido, correo, hashedPassword, telefono, dpi, 
       direccion, id_zona, id_subcocode, usuario_ingreso || 'admin']
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear ciudadano:', error);
    if (error.code === '23505') { // Unique violation
      if (error.constraint === 'ciudadanos_colaboradores_correo_key') {
        res.status(400).json({ error: 'El correo electrónico ya está registrado' });
      } else if (error.constraint === 'ciudadanos_colaboradores_dpi_key') {
        res.status(400).json({ error: 'El DPI ya está registrado' });
      } else {
        res.status(400).json({ error: 'El correo o DPI ya está registrado' });
      }
    } else {
      res.status(500).json({ error: 'Error al crear ciudadano' });
    }
  }
};

// 🔥 ACTUALIZAR CIUDADANO - SIMPLIFICADO (igual que líderes)
const updateCiudadano = async (req, res) => {
  const { id } = req.params;
  const { 
    nombre, 
    apellido, 
    correo, 
    telefono, 
    dpi,
    direccion, 
    id_subcocode,  // 👈 SOLO recibimos el subcocode
    usuario_modifica 
  } = req.body;
  
  try {
    if (!id_subcocode) {
      return res.status(400).json({ 
        error: 'Debes seleccionar un sector (Sub-COCODE)' 
      });
    }

    // 🔍 Obtener la zona automáticamente desde el subcocode seleccionado
    const zonaQuery = `
      SELECT c.id_zona 
      FROM subcocode s
      INNER JOIN cocode c ON s.id_cocode_principal = c.id
      WHERE s.id = $1
    `;
    const zonaResult = await pool.query(zonaQuery, [id_subcocode]);

    if (zonaResult.rows.length === 0) {
      return res.status(400).json({ 
        error: 'El sector seleccionado no existe o está inactivo' 
      });
    }

    const id_zona = zonaResult.rows[0].id_zona;

    // ✅ Actualizar ciudadano
    const result = await pool.query(
      `UPDATE ciudadanos_colaboradores 
       SET nombre = $1, apellido = $2, correo = $3, telefono = $4, dpi = $5,
           direccion = $6, id_zona = $7, id_subcocode = $8,
           usuario_modifica = $9, fecha_modifica = CURRENT_TIMESTAMP 
       WHERE id = $10 AND estado = TRUE 
       RETURNING id, nombre, apellido, correo, telefono, dpi, 
                 direccion, id_zona, id_subcocode, fecha_modifica`,
      [nombre, apellido, correo, telefono, dpi, direccion, 
       id_zona, id_subcocode, usuario_modifica || 'admin', id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ciudadano no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar ciudadano:', error);
    if (error.code === '23505') { // Unique violation
      if (error.constraint === 'ciudadanos_colaboradores_correo_key') {
        res.status(400).json({ error: 'El correo electrónico ya está registrado' });
      } else if (error.constraint === 'ciudadanos_colaboradores_dpi_key') {
        res.status(400).json({ error: 'El DPI ya está registrado' });
      } else {
        res.status(400).json({ error: 'El correo o DPI ya está registrado' });
      }
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

    // 🔒 Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(nueva_contrasena, 10);
    
    const result = await pool.query(
      `UPDATE ciudadanos_colaboradores 
       SET contrasena = $1, usuario_modifica = $2, fecha_modifica = CURRENT_TIMESTAMP 
       WHERE id = $3 AND estado = TRUE 
       RETURNING id, nombre, apellido, correo`,
      [hashedPassword, usuario_modifica || 'admin', id]
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

// Verificar ciudadano
const verificarCiudadano = async (req, res) => {
  const { id } = req.params;
  const { verificado, id_lider_verificador, usuario_modifica } = req.body;
  
  try {
    const result = await pool.query(
      `UPDATE ciudadanos_colaboradores 
       SET verificado_por_lider = $1, 
           id_lider_verificador = $2,
           fecha_verificacion = $3,
           usuario_modifica = $4, 
           fecha_modifica = CURRENT_TIMESTAMP 
       WHERE id = $5 AND estado = TRUE 
       RETURNING id, nombre, apellido, correo, verificado_por_lider`,
      [
        verificado, 
        verificado ? id_lider_verificador : null,
        verificado ? new Date() : null,
        usuario_modifica || 'admin', 
        id
      ]
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
  verificarCiudadano,
  getDatosSelect  // 👈 NUEVA FUNCIÓN EXPORTADA
};