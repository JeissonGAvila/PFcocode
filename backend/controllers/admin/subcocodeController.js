// backend/controllers/admin/subcocodeController.js
const pool = require('../../models/db');

// Obtener todos los SUBCOCODEs (Sectores)
const getSubcocodes = async (req, res) => {
  try {
    const query = `
      SELECT 
        s.id,
        s.nombre,
        s.sector,
        s.direccion,
        s.poblacion_estimada,
        s.id_cocode_principal,
        c.nombre as cocode_nombre,
        c.id_zona,
        z.nombre as zona_nombre,
        z.numero_zona,
        s.estado,
        s.fecha_ingreso
      FROM subcocode s
      LEFT JOIN cocode c ON s.id_cocode_principal = c.id
      LEFT JOIN zonas z ON c.id_zona = z.id
      WHERE s.estado = TRUE
      ORDER BY z.numero_zona, c.nombre, s.sector
    `;
    
    const result = await pool.query(query);
    
    res.json({
      success: true,
      subcocodes: result.rows
    });
  } catch (error) {
    console.error('Error al obtener Sectores:', error);
    res.status(500).json({ 
      error: 'Error al obtener Sectores' 
    });
  }
};

// Obtener SUBCOCODEs por COCODE
const getSubcocodesPorCocode = async (req, res) => {
  const { cocodeId } = req.params;
  
  try {
    const query = `
      SELECT 
        s.id,
        s.nombre,
        s.sector,
        s.direccion,
        s.poblacion_estimada,
        s.id_cocode_principal
      FROM subcocode s
      WHERE s.id_cocode_principal = $1 AND s.estado = TRUE
      ORDER BY s.sector
    `;
    
    const result = await pool.query(query, [cocodeId]);
    
    res.json({
      success: true,
      subcocodes: result.rows
    });
  } catch (error) {
    console.error('Error al obtener Sectores por COCODE:', error);
    res.status(500).json({ 
      error: 'Error al obtener Sectores' 
    });
  }
};

// Obtener SUBCOCODEs por zona
const getSubcocodesPorZona = async (req, res) => {
  const { zonaId } = req.params;
  
  try {
    const query = `
      SELECT 
        s.id,
        s.nombre,
        s.sector,
        s.direccion,
        s.poblacion_estimada,
        s.id_cocode_principal,
        c.nombre as cocode_nombre
      FROM subcocode s
      INNER JOIN cocode c ON s.id_cocode_principal = c.id
      WHERE c.id_zona = $1 AND s.estado = TRUE
      ORDER BY c.nombre, s.sector
    `;
    
    const result = await pool.query(query, [zonaId]);
    
    res.json({
      success: true,
      subcocodes: result.rows
    });
  } catch (error) {
    console.error('Error al obtener Sectores por zona:', error);
    res.status(500).json({ 
      error: 'Error al obtener Sectores' 
    });
  }
};

// Crear nuevo SUBCOCODE (Sector)
const createSubcocode = async (req, res) => {
  const { nombre, sector, direccion, poblacion_estimada, id_cocode_principal } = req.body;

  try {
    // Validaciones básicas
    if (!nombre || !id_cocode_principal) {
      return res.status(400).json({ 
        error: 'Nombre y COCODE principal son requeridos' 
      });
    }

    // Verificar que el COCODE existe
    const cocodeQuery = 'SELECT id FROM cocode WHERE id = $1 AND estado = TRUE';
    const cocodeResult = await pool.query(cocodeQuery, [id_cocode_principal]);
    
    if (cocodeResult.rows.length === 0) {
      return res.status(400).json({ 
        error: 'El COCODE seleccionado no existe' 
      });
    }

    // Verificar que no exista un sector con el mismo nombre en el mismo COCODE
    const existeQuery = `
      SELECT id FROM subcocode 
      WHERE nombre = $1 AND id_cocode_principal = $2 AND estado = TRUE
    `;
    const existeResult = await pool.query(existeQuery, [nombre, id_cocode_principal]);
    
    if (existeResult.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Ya existe un sector con este nombre en este COCODE' 
      });
    }

    // Insertar nuevo SUBCOCODE
    const insertQuery = `
      INSERT INTO subcocode (
        nombre, sector, direccion, poblacion_estimada, id_cocode_principal, usuario_ingreso
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, nombre, sector, direccion, poblacion_estimada, id_cocode_principal
    `;

    const values = [
      nombre,
      sector || null,
      direccion || null,
      poblacion_estimada || null,
      id_cocode_principal,
      req.user?.correo || 'admin'
    ];

    const result = await pool.query(insertQuery, values);

    res.status(201).json({
      success: true,
      message: 'Sector creado exitosamente',
      subcocode: result.rows[0]
    });

  } catch (error) {
    console.error('Error al crear Sector:', error);
    res.status(500).json({ 
      error: 'Error al crear Sector' 
    });
  }
};

// Actualizar SUBCOCODE existente
const updateSubcocode = async (req, res) => {
  const { id } = req.params;
  const { nombre, sector, direccion, poblacion_estimada, id_cocode_principal } = req.body;

  try {
    // Validaciones básicas
    if (!nombre || !id_cocode_principal) {
      return res.status(400).json({ 
        error: 'Nombre y COCODE principal son requeridos' 
      });
    }

    // Verificar que no exista otro sector con el mismo nombre en el mismo COCODE
    const existeQuery = `
      SELECT id FROM subcocode 
      WHERE nombre = $1 AND id_cocode_principal = $2 AND id != $3 AND estado = TRUE
    `;
    const existeResult = await pool.query(existeQuery, [nombre, id_cocode_principal, id]);
    
    if (existeResult.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Ya existe otro sector con este nombre en este COCODE' 
      });
    }

    // Actualizar SUBCOCODE
    const updateQuery = `
      UPDATE subcocode SET
        nombre = $1,
        sector = $2,
        direccion = $3,
        poblacion_estimada = $4,
        id_cocode_principal = $5,
        fecha_modifica = NOW(),
        usuario_modifica = $6
      WHERE id = $7 AND estado = TRUE
      RETURNING id, nombre, sector, direccion, poblacion_estimada, id_cocode_principal
    `;

    const values = [
      nombre,
      sector || null,
      direccion || null,
      poblacion_estimada || null,
      id_cocode_principal,
      req.user?.correo || 'admin',
      id
    ];

    const result = await pool.query(updateQuery, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Sector no encontrado' 
      });
    }

    res.json({
      success: true,
      message: 'Sector actualizado exitosamente',
      subcocode: result.rows[0]
    });

  } catch (error) {
    console.error('Error al actualizar Sector:', error);
    res.status(500).json({ 
      error: 'Error al actualizar Sector' 
    });
  }
};

// Desactivar SUBCOCODE (borrado lógico)
const deleteSubcocode = async (req, res) => {
  const { id } = req.params;

  try {
    // Desactivar SUBCOCODE directamente sin verificar líderes/ciudadanos
    // (esas validaciones se harán cuando intentes eliminar líderes/ciudadanos)
    const deleteQuery = `
      UPDATE subcocode SET
        estado = FALSE,
        fecha_modifica = NOW(),
        usuario_modifica = $1
      WHERE id = $2 AND estado = TRUE
      RETURNING id, nombre
    `;

    const result = await pool.query(deleteQuery, [
      req.user?.correo || 'admin', 
      id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Sector no encontrado' 
      });
    }

    res.json({
      success: true,
      message: 'Sector desactivado exitosamente'
    });

  } catch (error) {
    console.error('Error al desactivar Sector:', error);
    res.status(500).json({ 
      error: 'Error al desactivar Sector' 
    });
  }
};

module.exports = {
  getSubcocodes,
  getSubcocodesPorCocode,
  getSubcocodesPorZona,
  createSubcocode,
  updateSubcocode,
  deleteSubcocode
};