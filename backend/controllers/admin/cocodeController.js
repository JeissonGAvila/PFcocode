// backend/controllers/admin/cocodeController.js
const pool = require('../../models/db');

// Obtener todos los COCODEs
const getCocodes = async (req, res) => {
  try {
    const query = `
      SELECT 
        c.id,
        c.nombre,
        c.direccion,
        c.telefono,
        c.poblacion_estimada,
        c.id_zona,
        z.nombre as zona_nombre,
        z.numero_zona,
        c.estado,
        c.fecha_ingreso,
        (SELECT COUNT(*) FROM subcocode WHERE id_cocode_principal = c.id AND estado = TRUE) as total_sectores,
        (SELECT COUNT(*) FROM usuarios WHERE id_cocode_principal = c.id AND estado = TRUE) as total_lideres
      FROM cocode c
      LEFT JOIN zonas z ON c.id_zona = z.id
      WHERE c.estado = TRUE
      ORDER BY z.numero_zona, c.nombre
    `;
    
    const result = await pool.query(query);
    
    res.json({
      success: true,
      cocodes: result.rows
    });
  } catch (error) {
    console.error('Error al obtener COCODEs:', error);
    res.status(500).json({ 
      error: 'Error al obtener COCODEs' 
    });
  }
};

// Obtener COCODEs por zona
const getCocodesPorZona = async (req, res) => {
  const { zonaId } = req.params;
  
  try {
    const query = `
      SELECT 
        c.id,
        c.nombre,
        c.direccion,
        c.telefono,
        c.poblacion_estimada,
        c.id_zona,
        (SELECT COUNT(*) FROM subcocode WHERE id_cocode_principal = c.id AND estado = TRUE) as total_sectores
      FROM cocode c
      WHERE c.id_zona = $1 AND c.estado = TRUE
      ORDER BY c.nombre
    `;
    
    const result = await pool.query(query, [zonaId]);
    
    res.json({
      success: true,
      cocodes: result.rows
    });
  } catch (error) {
    console.error('Error al obtener COCODEs por zona:', error);
    res.status(500).json({ 
      error: 'Error al obtener COCODEs' 
    });
  }
};

// Crear nuevo COCODE
const createCocode = async (req, res) => {
  const { nombre, direccion, telefono, poblacion_estimada, id_zona } = req.body;

  try {
    // Validaciones básicas
    if (!nombre || !id_zona) {
      return res.status(400).json({ 
        error: 'Nombre y zona son requeridos' 
      });
    }

    // Verificar que la zona existe
    const zonaQuery = 'SELECT id FROM zonas WHERE id = $1 AND estado = TRUE';
    const zonaResult = await pool.query(zonaQuery, [id_zona]);
    
    if (zonaResult.rows.length === 0) {
      return res.status(400).json({ 
        error: 'La zona seleccionada no existe' 
      });
    }

    // Verificar que no exista un COCODE con el mismo nombre en la misma zona
    const existeQuery = `
      SELECT id FROM cocode 
      WHERE nombre = $1 AND id_zona = $2 AND estado = TRUE
    `;
    const existeResult = await pool.query(existeQuery, [nombre, id_zona]);
    
    if (existeResult.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Ya existe un COCODE con este nombre en esta zona' 
      });
    }

    // Insertar nuevo COCODE
    const insertQuery = `
      INSERT INTO cocode (
        nombre, direccion, telefono, poblacion_estimada, id_zona, usuario_ingreso
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, nombre, direccion, telefono, poblacion_estimada, id_zona
    `;

    const values = [
      nombre,
      direccion || null,
      telefono || null,
      poblacion_estimada || null,
      id_zona,
      req.user?.correo || 'admin'
    ];

    const result = await pool.query(insertQuery, values);

    res.status(201).json({
      success: true,
      message: 'COCODE creado exitosamente',
      cocode: result.rows[0]
    });

  } catch (error) {
    console.error('Error al crear COCODE:', error);
    res.status(500).json({ 
      error: 'Error al crear COCODE' 
    });
  }
};

// Actualizar COCODE existente
const updateCocode = async (req, res) => {
  const { id } = req.params;
  const { nombre, direccion, telefono, poblacion_estimada, id_zona } = req.body;

  try {
    // Validaciones básicas
    if (!nombre || !id_zona) {
      return res.status(400).json({ 
        error: 'Nombre y zona son requeridos' 
      });
    }

    // Verificar que no exista otro COCODE con el mismo nombre en la misma zona
    const existeQuery = `
      SELECT id FROM cocode 
      WHERE nombre = $1 AND id_zona = $2 AND id != $3 AND estado = TRUE
    `;
    const existeResult = await pool.query(existeQuery, [nombre, id_zona, id]);
    
    if (existeResult.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Ya existe otro COCODE con este nombre en esta zona' 
      });
    }

    // Actualizar COCODE
    const updateQuery = `
      UPDATE cocode SET
        nombre = $1,
        direccion = $2,
        telefono = $3,
        poblacion_estimada = $4,
        id_zona = $5,
        fecha_modifica = NOW(),
        usuario_modifica = $6
      WHERE id = $7 AND estado = TRUE
      RETURNING id, nombre, direccion, telefono, poblacion_estimada, id_zona
    `;

    const values = [
      nombre,
      direccion || null,
      telefono || null,
      poblacion_estimada || null,
      id_zona,
      req.user?.correo || 'admin',
      id
    ];

    const result = await pool.query(updateQuery, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'COCODE no encontrado' 
      });
    }

    res.json({
      success: true,
      message: 'COCODE actualizado exitosamente',
      cocode: result.rows[0]
    });

  } catch (error) {
    console.error('Error al actualizar COCODE:', error);
    res.status(500).json({ 
      error: 'Error al actualizar COCODE' 
    });
  }
};

// Desactivar COCODE (borrado lógico)
const deleteCocode = async (req, res) => {
  const { id } = req.params;

  try {
    // Verificar si el COCODE tiene sectores activos
    const sectoresQuery = `
      SELECT COUNT(*) as total 
      FROM subcocode 
      WHERE id_cocode_principal = $1 AND estado = TRUE
    `;
    
    const sectoresResult = await pool.query(sectoresQuery, [id]);
    const sectoresActivos = parseInt(sectoresResult.rows[0].total);

    if (sectoresActivos > 0) {
      return res.status(400).json({ 
        error: `No se puede desactivar el COCODE porque tiene ${sectoresActivos} sectores activos` 
      });
    }

    // Verificar si el COCODE tiene líderes activos
    const lideresQuery = `
      SELECT COUNT(*) as total 
      FROM usuarios 
      WHERE id_cocode_principal = $1 AND estado = TRUE
    `;
    
    const lideresResult = await pool.query(lideresQuery, [id]);
    const lideresActivos = parseInt(lideresResult.rows[0].total);

    if (lideresActivos > 0) {
      return res.status(400).json({ 
        error: `No se puede desactivar el COCODE porque tiene ${lideresActivos} líderes activos` 
      });
    }

    // Desactivar COCODE
    const deleteQuery = `
      UPDATE cocode SET
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
        error: 'COCODE no encontrado' 
      });
    }

    res.json({
      success: true,
      message: 'COCODE desactivado exitosamente'
    });

  } catch (error) {
    console.error('Error al desactivar COCODE:', error);
    res.status(500).json({ 
      error: 'Error al desactivar COCODE' 
    });
  }
};

module.exports = {
  getCocodes,
  getCocodesPorZona,
  createCocode,
  updateCocode,
  deleteCocode
};