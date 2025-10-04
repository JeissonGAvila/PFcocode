// backend/controllers/admin/lideresController.js - VERSIÓN FINAL SIMPLIFICADA
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
        u.id_subcocode,
        u.ultimo_acceso,
        u.estado,
        u.fecha_ingreso,
        
        -- Información del Sub-COCODE
        s.nombre as subcocode_nombre,
        s.sector as subcocode_sector,
        
        -- Información del COCODE padre
        c.nombre as subcocode_cocode_principal,
        c.id as cocode_id,
        
        -- Información de la zona
        z.nombre as zona_nombre,
        z.id as zona_id
        
      FROM usuarios u
      LEFT JOIN subcocode s ON u.id_subcocode = s.id
      LEFT JOIN cocode c ON s.id_cocode_principal = c.id
      LEFT JOIN zonas z ON c.id_zona = z.id
      WHERE u.estado = TRUE
      ORDER BY z.nombre, c.nombre, s.nombre, u.nombre, u.apellido
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
    nombre, 
    apellido, 
    correo, 
    contrasena, 
    telefono, 
    dpi,
    id_subcocode
  } = req.body;

  try {
    // Validaciones básicas
    if (!nombre || !apellido || !correo || !contrasena) {
      return res.status(400).json({ 
        error: 'Nombre, apellido, correo y contraseña son requeridos' 
      });
    }

    // Validar que id_subcocode sea obligatorio
    if (!id_subcocode) {
      return res.status(400).json({ 
        error: 'Debe seleccionar un Sub-COCODE (sector) específico' 
      });
    }

    // Validar contraseña
    if (contrasena.length < 6) {
      return res.status(400).json({ 
        error: 'La contraseña debe tener al menos 6 caracteres' 
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      return res.status(400).json({ 
        error: 'El formato del correo electrónico no es válido' 
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

    // Validar DPI único si se proporciona
    if (dpi) {
      const dpiQuery = 'SELECT id FROM usuarios WHERE dpi = $1 AND estado = TRUE';
      const dpiResult = await pool.query(dpiQuery, [dpi]);
      
      if (dpiResult.rows.length > 0) {
        return res.status(400).json({ 
          error: 'Ya existe un líder con este DPI' 
        });
      }
    }

    // Verificar que el Sub-COCODE existe
    const subcocodeQuery = 'SELECT id FROM subcocode WHERE id = $1 AND estado = TRUE';
    const subcocodeResult = await pool.query(subcocodeQuery, [id_subcocode]);
    
    if (subcocodeResult.rows.length === 0) {
      return res.status(400).json({ 
        error: 'El Sub-COCODE seleccionado no existe' 
      });
    }

    // Hashear la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(contrasena, saltRounds);

    // Insertar líder
    const insertQuery = `
      INSERT INTO usuarios (
        nombre, 
        apellido, 
        correo, 
        contrasena, 
        telefono, 
        dpi,
        tipo_lider,
        id_subcocode,
        id_cocode_principal,
        es_lider_principal,
        puede_aprobar_reportes, 
        usuario_ingreso
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id, nombre, apellido, correo
    `;

    const values = [
      nombre, 
      apellido, 
      correo, 
      hashedPassword, 
      telefono || null, 
      dpi || null,
      'subcocode', // Siempre es líder de subcocode
      id_subcocode,
      null, // id_cocode_principal siempre NULL
      false, // es_lider_principal siempre FALSE
      true, // puede_aprobar_reportes siempre TRUE
      req.user?.correo || 'admin'
    ];

    const result = await pool.query(insertQuery, values);

    res.status(201).json({
      success: true,
      message: 'Líder de sector creado exitosamente',
      lider: result.rows[0]
    });

  } catch (error) {
    console.error('Error al crear líder:', error);
    
    if (error.code === '23505') {
      return res.status(400).json({ 
        error: 'Ya existe un líder con este correo electrónico o DPI' 
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
    nombre, 
    apellido, 
    correo, 
    telefono, 
    dpi,
    id_subcocode
  } = req.body;

  try {
    // Validaciones básicas
    if (!nombre || !apellido || !correo) {
      return res.status(400).json({ 
        error: 'Nombre, apellido y correo son requeridos' 
      });
    }

    // Validar que id_subcocode sea obligatorio
    if (!id_subcocode) {
      return res.status(400).json({ 
        error: 'Debe seleccionar un Sub-COCODE (sector)' 
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      return res.status(400).json({ 
        error: 'El formato del correo electrónico no es válido' 
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

    // Validar DPI único si se proporciona
    if (dpi) {
      const dpiQuery = 'SELECT id FROM usuarios WHERE dpi = $1 AND id != $2 AND estado = TRUE';
      const dpiResult = await pool.query(dpiQuery, [dpi, id]);
      
      if (dpiResult.rows.length > 0) {
        return res.status(400).json({ 
          error: 'Ya existe otro líder con este DPI' 
        });
      }
    }

    // Actualizar líder
    const updateQuery = `
      UPDATE usuarios SET
        nombre = $1,
        apellido = $2,
        correo = $3,
        telefono = $4,
        dpi = $5,
        id_subcocode = $6,
        tipo_lider = $7,
        id_cocode_principal = $8,
        es_lider_principal = $9,
        fecha_modifica = NOW(),
        usuario_modifica = $10
      WHERE id = $11 AND estado = TRUE
      RETURNING id, nombre, apellido, correo
    `;

    const values = [
      nombre, 
      apellido, 
      correo, 
      telefono || null, 
      dpi || null,
      id_subcocode,
      'subcocode', // Siempre subcocode
      null, // id_cocode_principal siempre NULL
      false, // es_lider_principal siempre FALSE
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
      WHERE id_usuario = $1 
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

// Obtener datos para selects
const getDatosSelect = async (req, res) => {
  try {
    // Obtener COCODE principales con su zona
    const cocodeQuery = `
      SELECT c.id, c.nombre, z.nombre as zona_nombre, z.id as zona_id
      FROM cocode c
      LEFT JOIN zonas z ON c.id_zona = z.id
      WHERE c.estado = TRUE
      ORDER BY z.nombre, c.nombre
    `;
    const cocodeResult = await pool.query(cocodeQuery);

    // Obtener Sub-COCODE con su COCODE principal y zona
    const subcocodeQuery = `
      SELECT 
        s.id, 
        s.nombre, 
        s.sector, 
        c.nombre as cocode_principal,
        c.id as cocode_principal_id,
        z.nombre as zona_nombre,
        z.id as zona_id
      FROM subcocode s
      LEFT JOIN cocode c ON s.id_cocode_principal = c.id
      LEFT JOIN zonas z ON c.id_zona = z.id
      WHERE s.estado = TRUE
      ORDER BY z.nombre, c.nombre, s.nombre
    `;
    const subcocodeResult = await pool.query(subcocodeQuery);

    res.json({
      success: true,
      cocode_principales: cocodeResult.rows,
      sub_cocode: subcocodeResult.rows
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