// backend/controllers/admin/zonasController.js
const pool = require('../../models/db');

// Obtener todas las zonas
const getZonas = async (req, res) => {
  try {
    const query = `
      SELECT 
        z.id,
        z.nombre,
        z.numero_zona,
        z.descripcion,
        z.poblacion_estimada,
        z.area_km2,
        z.estado,
        z.fecha_ingreso,
        z.usuario_ingreso,
        z.fecha_modifica,
        z.usuario_modifica,
        (SELECT COUNT(*) FROM cocode c WHERE c.id_zona = z.id AND c.estado = TRUE) as total_cocode,
        (SELECT COUNT(*) FROM ciudadanos_colaboradores cc WHERE cc.id_zona = z.id AND cc.estado = TRUE) as total_ciudadanos,
        (SELECT COUNT(*) FROM reportes r WHERE r.id_zona = z.id AND r.estado = TRUE) as total_reportes
      FROM zonas z
      WHERE z.estado = TRUE
      ORDER BY z.numero_zona ASC, z.nombre ASC
    `;
    
    const result = await pool.query(query);
    
    res.json({
      success: true,
      zonas: result.rows
    });
  } catch (error) {
    console.error('Error al obtener zonas:', error);
    res.status(500).json({ 
      error: 'Error al obtener zonas' 
    });
  }
};

// Obtener una zona específica
const getZonaById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const zonaQuery = `
      SELECT *
      FROM zonas
      WHERE id = $1 AND estado = TRUE
    `;
    
    const zonaResult = await pool.query(zonaQuery, [id]);
    
    if (zonaResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Zona no encontrada' 
      });
    }

    res.json({
      success: true,
      zona: zonaResult.rows[0]
    });

  } catch (error) {
    console.error('Error al obtener zona:', error);
    res.status(500).json({ 
      error: 'Error al obtener zona' 
    });
  }
};

// Crear nueva zona
const createZona = async (req, res) => {
  const { 
    nombre, 
    numero_zona, 
    descripcion, 
    poblacion_estimada, 
    area_km2
  } = req.body;

  try {
    if (!nombre || !numero_zona) {
      return res.status(400).json({ 
        error: 'Nombre y número de zona son requeridos' 
      });
    }

    const numeroQuery = 'SELECT id FROM zonas WHERE numero_zona = $1 AND estado = TRUE';
    const numeroResult = await pool.query(numeroQuery, [numero_zona]);
    
    if (numeroResult.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Ya existe una zona con este número' 
      });
    }

    const nombreQuery = 'SELECT id FROM zonas WHERE LOWER(nombre) = LOWER($1) AND estado = TRUE';
    const nombreResult = await pool.query(nombreQuery, [nombre]);
    
    if (nombreResult.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Ya existe una zona con este nombre' 
      });
    }

    const zonaInsertQuery = `
      INSERT INTO zonas (
        nombre, numero_zona, descripcion, poblacion_estimada, 
        area_km2, usuario_ingreso
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const zonaValues = [
      nombre, 
      numero_zona, 
      descripcion || null, 
      poblacion_estimada || null,
      area_km2 || null, 
      req.user?.correo || 'admin'
    ];

    const zonaResult = await pool.query(zonaInsertQuery, zonaValues);

    res.status(201).json({
      success: true,
      message: 'Zona creada exitosamente',
      zona: zonaResult.rows[0]
    });

  } catch (error) {
    console.error('Error al crear zona:', error);
    
    if (error.code === '23505') {
      return res.status(400).json({ 
        error: 'Ya existe una zona con esta información' 
      });
    }
    
    res.status(500).json({ 
      error: 'Error al crear zona' 
    });
  }
};

// Actualizar zona
const updateZona = async (req, res) => {
  const { id } = req.params;
  const { 
    nombre, 
    numero_zona, 
    descripcion, 
    poblacion_estimada, 
    area_km2
  } = req.body;

  try {
    if (!nombre || !numero_zona) {
      return res.status(400).json({ 
        error: 'Nombre y número de zona son requeridos' 
      });
    }

    const numeroQuery = 'SELECT id FROM zonas WHERE numero_zona = $1 AND id != $2 AND estado = TRUE';
    const numeroResult = await pool.query(numeroQuery, [numero_zona, id]);
    
    if (numeroResult.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Ya existe otra zona con este número' 
      });
    }

    const nombreQuery = 'SELECT id FROM zonas WHERE LOWER(nombre) = LOWER($1) AND id != $2 AND estado = TRUE';
    const nombreResult = await pool.query(nombreQuery, [nombre, id]);
    
    if (nombreResult.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Ya existe otra zona con este nombre' 
      });
    }

    const zonaUpdateQuery = `
      UPDATE zonas SET
        nombre = $1,
        numero_zona = $2,
        descripcion = $3,
        poblacion_estimada = $4,
        area_km2 = $5,
        fecha_modifica = NOW(),
        usuario_modifica = $6
      WHERE id = $7 AND estado = TRUE
      RETURNING *
    `;

    const zonaValues = [
      nombre, 
      numero_zona, 
      descripcion || null, 
      poblacion_estimada || null,
      area_km2 || null, 
      req.user?.correo || 'admin', 
      id
    ];

    const zonaResult = await pool.query(zonaUpdateQuery, zonaValues);

    if (zonaResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Zona no encontrada' 
      });
    }

    res.json({
      success: true,
      message: 'Zona actualizada exitosamente',
      zona: zonaResult.rows[0]
    });

  } catch (error) {
    console.error('Error al actualizar zona:', error);
    res.status(500).json({ 
      error: 'Error al actualizar zona' 
    });
  }
};

// Desactivar zona
const deleteZona = async (req, res) => {
  const { id } = req.params;

  try {
    const cocodeQuery = `
      SELECT COUNT(*) as total 
      FROM cocode 
      WHERE id_zona = $1 
      AND estado = TRUE
    `;
    
    const cocodeResult = await pool.query(cocodeQuery, [id]);
    const cocodesActivos = parseInt(cocodeResult.rows[0].total);

    if (cocodesActivos > 0) {
      return res.status(400).json({ 
        error: `No se puede desactivar la zona porque tiene ${cocodesActivos} COCODEs activos. Desactiva primero los COCODEs.` 
      });
    }

    const reportesQuery = `
      SELECT COUNT(*) as total 
      FROM reportes 
      WHERE id_zona = $1 
      AND estado = TRUE
    `;
    
    const reportesResult = await pool.query(reportesQuery, [id]);
    const reportesActivos = parseInt(reportesResult.rows[0].total);

    if (reportesActivos > 0) {
      return res.status(400).json({ 
        error: `No se puede desactivar la zona porque tiene ${reportesActivos} reportes activos` 
      });
    }

    const ciudadanosQuery = `
      SELECT COUNT(*) as total 
      FROM ciudadanos_colaboradores 
      WHERE id_zona = $1 
      AND estado = TRUE
    `;
    
    const ciudadanosResult = await pool.query(ciudadanosQuery, [id]);
    const ciudadanosActivos = parseInt(ciudadanosResult.rows[0].total);

    if (ciudadanosActivos > 0) {
      return res.status(400).json({ 
        error: `No se puede desactivar la zona porque tiene ${ciudadanosActivos} ciudadanos registrados` 
      });
    }

    const deleteZonaQuery = `
      UPDATE zonas SET
        estado = FALSE,
        fecha_modifica = NOW(),
        usuario_modifica = $1
      WHERE id = $2 AND estado = TRUE
      RETURNING id, nombre
    `;

    const zonaResult = await pool.query(deleteZonaQuery, [
      req.user?.correo || 'admin', 
      id
    ]);

    if (zonaResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Zona no encontrada' 
      });
    }

    res.json({
      success: true,
      message: 'Zona desactivada exitosamente'
    });

  } catch (error) {
    console.error('Error al desactivar zona:', error);
    res.status(500).json({ 
      error: 'Error al desactivar zona' 
    });
  }
};

// Obtener estadísticas
const getZonasStats = async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        COUNT(*) as total_zonas,
        COUNT(CASE WHEN z.estado = TRUE THEN 1 END) as zonas_activas,
        SUM(z.poblacion_estimada) as poblacion_total,
        AVG(z.poblacion_estimada) as poblacion_promedio,
        SUM(z.area_km2) as area_total,
        COUNT(DISTINCT c.id) as total_cocode,
        COUNT(DISTINCT sc.id) as total_subcocode,
        COUNT(DISTINCT u.id) as total_lideres,
        COUNT(DISTINCT cc.id) as total_ciudadanos,
        COUNT(DISTINCT r.id) as total_reportes
      FROM zonas z
      LEFT JOIN cocode c ON c.id_zona = z.id AND c.estado = TRUE
      LEFT JOIN subcocode sc ON sc.id_cocode_principal = c.id AND sc.estado = TRUE
      LEFT JOIN usuarios u ON (u.id_cocode_principal = c.id OR u.id_subcocode = sc.id) AND u.estado = TRUE
      LEFT JOIN ciudadanos_colaboradores cc ON cc.id_zona = z.id AND cc.estado = TRUE
      LEFT JOIN reportes r ON r.id_zona = z.id AND r.estado = TRUE
      WHERE z.estado = TRUE
    `;

    const result = await pool.query(statsQuery);

    res.json({
      success: true,
      stats: result.rows[0]
    });

  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ 
      error: 'Error al obtener estadísticas' 
    });
  }
};

module.exports = {
  getZonas,
  getZonaById,
  createZona,
  updateZona,
  deleteZona,
  getZonasStats
};