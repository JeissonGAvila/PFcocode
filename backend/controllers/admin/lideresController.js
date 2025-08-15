// backend/controllers/admin/lideresController.js
const pool = require('../../models/db');
const bcrypt = require('bcrypt');

// Obtener todos los líderes COCODE
const getLideres = async (req, res) => {
  try {
    const query = `
      SELECT 
        u.id,
        u.nombre,
        u.apellido,
        u.correo,
        u.telefono,
        u.dpi,
        u.tipo_lider,
        u.cargo,
        u.fecha_eleccion,
        u.periodo_inicio,
        u.periodo_fin,
        u.ultimo_acceso,
        u.estado,
        u.fecha_ingreso,
        CASE 
          WHEN u.tipo_lider = 'principal' THEN c.nombre
          WHEN u.tipo_lider = 'subcocode' THEN s.nombre
        END as cocode_asignado,
        CASE 
          WHEN u.tipo_lider = 'principal' THEN z.nombre
          WHEN u.tipo_lider = 'subcocode' THEN z2.nombre
        END as zona_nombre
      FROM usuarios u
      LEFT JOIN cocode c ON u.id_cocode_principal = c.id
      LEFT JOIN subcocode s ON u.id_subcocode = s.id
      LEFT JOIN zonas z ON c.id_zona = z.id
      LEFT JOIN cocode c2 ON s.id_cocode_principal = c2.id
      LEFT JOIN zonas z2 ON c2.id_zona = z2.id
      WHERE u.estado = TRUE
      ORDER BY u.nombre, u.apellido
    `;
    
    const result = await pool.query(query);
    
    res.json({
      success: true,
      lideres: result.rows
    });
  } catch (error) {
    console.error('Error al obtener líderes:', error);
    res.status(500).json({ 
      error: 'Error al obtener líderes' 
    });
  }
};

// Crear nuevo líder COCODE
const createLider = async (req, res) => {
  const { 
    nombre, apellido, correo, contrasena, telefono, dpi,
    tipo_lider, cargo, fecha_eleccion, periodo_inicio, periodo_fin,
    id_cocode_principal, id_subcocode
  } = req.body;

  try {
    // Validaciones básicas
    if (!nombre || !apellido || !correo || !contrasena || !tipo_lider) {
      return res.status(400).json({ 
        error: 'Nombre, apellido, correo, contraseña y tipo de líder son requeridos' 
      });
    }

    // Validar que el correo no exista
    const emailQuery = 'SELECT id FROM usuarios WHERE correo = $1 AND estado = TRUE';
    const emailResult = await pool.query(emailQuery, [correo]);
    
    if (emailResult.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Ya existe un líder con este correo electrónico' 
      });
    }

    // Validar asignación según tipo de líder
    if (tipo_lider === 'principal' && !id_cocode_principal) {
      return res.status(400).json({ 
        error: 'Debe seleccionar un COCODE principal' 
      });
    }

    if (tipo_lider === 'subcocode' && !id_subcocode) {
      return res.status(400).json({ 
        error: 'Debe seleccionar un Sub-COCODE' 
      });
    }

    // Hashear la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(contrasena, saltRounds);

    // Insertar nuevo líder
    const insertQuery = `
      INSERT INTO usuarios (
        nombre, apellido, correo, contrasena, telefono, dpi,
        tipo_lider, cargo, fecha_eleccion, periodo_inicio, periodo_fin,
        id_cocode_principal, id_subcocode, usuario_ingreso
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING id, nombre, apellido, correo, tipo_lider, cargo
    `;

    const values = [
      nombre, apellido, correo, hashedPassword, telefono, dpi,
      tipo_lider, cargo, fecha_eleccion, periodo_inicio, periodo_fin,
      tipo_lider === 'principal' ? id_cocode_principal : null,
      tipo_lider === 'subcocode' ? id_subcocode : null,
      req.user?.correo || 'admin'
    ];

    const result = await pool.query(insertQuery, values);

    res.status(201).json({
      success: true,
      message: 'Líder COCODE creado exitosamente',
      lider: result.rows[0]
    });

  } catch (error) {
    console.error('Error al crear líder:', error);
    
    if (error.code === '23505') { // Violación de unicidad
      return res.status(400).json({ 
        error: 'Ya existe un líder con este correo electrónico' 
      });
    }
    
    res.status(500).json({ 
      error: 'Error al crear líder' 
    });
  }
};

// Actualizar líder existente
const updateLider = async (req, res) => {
  const { id } = req.params;
  const { 
    nombre, apellido, correo, telefono, dpi,
    tipo_lider, cargo, fecha_eleccion, periodo_inicio, periodo_fin,
    id_cocode_principal, id_subcocode
  } = req.body;

  try {
    // Validaciones básicas
    if (!nombre || !apellido || !correo || !tipo_lider) {
      return res.status(400).json({ 
        error: 'Nombre, apellido, correo y tipo de líder son requeridos' 
      });
    }

    // Validar que el correo no exista en otro líder
    const emailQuery = 'SELECT id FROM usuarios WHERE correo = $1 AND id != $2 AND estado = TRUE';
    const emailResult = await pool.query(emailQuery, [correo, id]);
    
    if (emailResult.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Ya existe otro líder con este correo electrónico' 
      });
    }

    // Actualizar líder
    const updateQuery = `
      UPDATE usuarios SET
        nombre = $1,
        apellido = $2,
        correo = $3,
        telefono = $4,
        dpi = $5,
        tipo_lider = $6,
        cargo = $7,
        fecha_eleccion = $8,
        periodo_inicio = $9,
        periodo_fin = $10,
        id_cocode_principal = $11,
        id_subcocode = $12,
        fecha_modifica = NOW(),
        usuario_modifica = $13
      WHERE id = $14 AND estado = TRUE
      RETURNING id, nombre, apellido, correo, tipo_lider, cargo
    `;

    const values = [
      nombre, apellido, correo, telefono, dpi,
      tipo_lider, cargo, fecha_eleccion, periodo_inicio, periodo_fin,
      tipo_lider === 'principal' ? id_cocode_principal : null,
      tipo_lider === 'subcocode' ? id_subcocode : null,
      req.user?.correo || 'admin',
      id
    ];

    const result = await pool.query(updateQuery, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Líder no encontrado' 
      });
    }

    res.json({
      success: true,
      message: 'Líder actualizado exitosamente',
      lider: result.rows[0]
    });

  } catch (error) {
    console.error('Error al actualizar líder:', error);
    res.status(500).json({ 
      error: 'Error al actualizar líder' 
    });
  }
};

// Cambiar contraseña del líder
const updateLiderPassword = async (req, res) => {
  const { id } = req.params;
  const { nueva_contrasena } = req.body;

  try {
    if (!nueva_contrasena || nueva_contrasena.length < 6) {
      return res.status(400).json({ 
        error: 'La contraseña debe tener al menos 6 caracteres' 
      });
    }

    // Hashear nueva contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(nueva_contrasena, saltRounds);

    const updateQuery = `
      UPDATE usuarios SET
        contrasena = $1,
        fecha_modifica = NOW(),
        usuario_modifica = $2
      WHERE id = $3 AND estado = TRUE
      RETURNING id, nombre, apellido
    `;

    const result = await pool.query(updateQuery, [
      hashedPassword, 
      req.user?.correo || 'admin', 
      id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Líder no encontrado' 
      });
    }

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });

  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({ 
      error: 'Error al cambiar contraseña' 
    });
  }
};

// Desactivar líder (borrado lógico)
const deleteLider = async (req, res) => {
  const { id } = req.params;

  try {
    // Verificar si el líder tiene reportes activos
    const reportesQuery = `
      SELECT COUNT(*) as total 
      FROM reportes 
      WHERE (id_usuario = $1 OR id_lider_coordinador = $1) 
      AND estado = TRUE 
      AND id_estado NOT IN (
        SELECT id FROM estados_reporte WHERE es_final = TRUE
      )
    `;
    
    const reportesResult = await pool.query(reportesQuery, [id]);
    const reportesActivos = parseInt(reportesResult.rows[0].total);

    if (reportesActivos > 0) {
      return res.status(400).json({ 
        error: `No se puede desactivar el líder porque tiene ${reportesActivos} reportes activos asignados` 
      });
    }

    // Desactivar líder
    const deleteQuery = `
      UPDATE usuarios SET
        estado = FALSE,
        fecha_modifica = NOW(),
        usuario_modifica = $1
      WHERE id = $2 AND estado = TRUE
      RETURNING id, nombre, apellido
    `;

    const result = await pool.query(deleteQuery, [
      req.user?.correo || 'admin', 
      id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Líder no encontrado' 
      });
    }

    res.json({
      success: true,
      message: 'Líder desactivado exitosamente'
    });

  } catch (error) {
    console.error('Error al desactivar líder:', error);
    res.status(500).json({ 
      error: 'Error al desactivar líder' 
    });
  }
};

// Obtener datos para selects (COCODE, Sub-COCODE, etc.)
const getDatosSelect = async (req, res) => {
  try {
    // Obtener COCODE principales
    const cocodeQuery = `
      SELECT c.id, c.nombre, z.nombre as zona_nombre
      FROM cocode c
      LEFT JOIN zonas z ON c.id_zona = z.id
      WHERE c.estado = TRUE AND c.es_principal = TRUE
      ORDER BY c.nombre
    `;
    const cocodeResult = await pool.query(cocodeQuery);

    // Obtener Sub-COCODE
    const subcocodeQuery = `
      SELECT s.id, s.nombre, s.sector, c.nombre as cocode_principal
      FROM subcocode s
      LEFT JOIN cocode c ON s.id_cocode_principal = c.id
      WHERE s.estado = TRUE
      ORDER BY s.nombre
    `;
    const subcocodeResult = await pool.query(subcocodeQuery);

    res.json({
      success: true,
      cocode_principales: cocodeResult.rows,
      sub_cocode: subcocodeResult.rows,
      tipos_lider: ['principal', 'subcocode'],
      cargos_disponibles: [
        'Presidente/a',
        'Vicepresidente/a', 
        'Secretario/a',
        'Tesorero/a',
        'Vocal I',
        'Vocal II',
        'Vocal III'
      ]
    });

  } catch (error) {
    console.error('Error al obtener datos para selects:', error);
    res.status(500).json({ 
      error: 'Error al obtener datos' 
    });
  }
};

module.exports = {
  getLideres,
  createLider,
  updateLider,
  updateLiderPassword,
  deleteLider,
  getDatosSelect
};