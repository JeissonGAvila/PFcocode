// backend/controllers/admin/zonasController.js
const pool = require('../../models/db');

// Obtener todas las zonas con información de COCODE
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
        z.coordenadas_centro,
        z.estado,
        z.fecha_ingreso,
        z.usuario_ingreso,
        z.fecha_modifica,
        z.usuario_modifica,
        -- Información del COCODE principal
        c.id as cocode_id,
        c.nombre as cocode_nombre,
        c.es_principal as cocode_es_principal,
        c.direccion_oficina as cocode_direccion,
        c.telefono as cocode_telefono,
        c.poblacion_estimada as cocode_poblacion,
        c.latitud as cocode_latitud,
        c.longitud as cocode_longitud,
        c.estado as cocode_estado,
        -- Contar sub-COCODE
        (SELECT COUNT(*) FROM subcocode sc WHERE sc.id_cocode_principal = c.id AND sc.estado = TRUE) as total_subcocode,
        -- Contar líderes
        (SELECT COUNT(*) FROM usuarios u WHERE u.id_cocode_principal = c.id AND u.estado = TRUE) as total_lideres_principales,
        -- Contar ciudadanos en la zona
        (SELECT COUNT(*) FROM ciudadanos_colaboradores cc WHERE cc.id_zona = z.id AND cc.estado = TRUE) as total_ciudadanos,
        -- Contar reportes activos en la zona
        (SELECT COUNT(*) FROM reportes r WHERE r.id_zona = z.id AND r.estado = TRUE) as total_reportes
      FROM zonas z
      LEFT JOIN cocode c ON c.id_zona = z.id AND c.estado = TRUE
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

// Obtener una zona específica con detalles completos
const getZonaById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const zonaQuery = `
      SELECT 
        z.*,
        c.id as cocode_id,
        c.nombre as cocode_nombre,
        c.direccion_oficina as cocode_direccion,
        c.telefono as cocode_telefono,
        c.poblacion_estimada as cocode_poblacion,
        c.latitud as cocode_latitud,
        c.longitud as cocode_longitud
      FROM zonas z
      LEFT JOIN cocode c ON c.id_zona = z.id AND c.estado = TRUE
      WHERE z.id = $1 AND z.estado = TRUE
    `;
    
    const zonaResult = await pool.query(zonaQuery, [id]);
    
    if (zonaResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Zona no encontrada' 
      });
    }

    // Obtener sub-COCODE de la zona
    const subcocodeQuery = `
      SELECT 
        sc.*,
        u.id as lider_id,
        u.nombre as lider_nombre,
        u.apellido as lider_apellido,
        u.correo as lider_correo,
        u.telefono as lider_telefono
      FROM subcocode sc
      LEFT JOIN usuarios u ON u.id_subcocode = sc.id AND u.estado = TRUE
      WHERE sc.id_cocode_principal = $1 AND sc.estado = TRUE
      ORDER BY sc.nombre ASC
    `;
    
    const subcocodeResult = await pool.query(subcocodeQuery, [zonaResult.rows[0].cocode_id]);

    res.json({
      success: true,
      zona: {
        ...zonaResult.rows[0],
        subcocode: subcocodeResult.rows
      }
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
    nombre, numero_zona, descripcion, poblacion_estimada, 
    area_km2, coordenadas_centro,
    // Datos del COCODE principal
    cocode_nombre, cocode_direccion, cocode_telefono,
    cocode_poblacion, cocode_latitud, cocode_longitud
  } = req.body;

  try {
    // Validaciones básicas
    if (!nombre || !numero_zona) {
      return res.status(400).json({ 
        error: 'Nombre y número de zona son requeridos' 
      });
    }

    // Validar que el número de zona no exista
    const numeroQuery = 'SELECT id FROM zonas WHERE numero_zona = $1 AND estado = TRUE';
    const numeroResult = await pool.query(numeroQuery, [numero_zona]);
    
    if (numeroResult.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Ya existe una zona con este número' 
      });
    }

    // Validar que el nombre no exista
    const nombreQuery = 'SELECT id FROM zonas WHERE LOWER(nombre) = LOWER($1) AND estado = TRUE';
    const nombreResult = await pool.query(nombreQuery, [nombre]);
    
    if (nombreResult.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Ya existe una zona con este nombre' 
      });
    }

    // Iniciar transacción
    await pool.query('BEGIN');

    // Insertar nueva zona
    const zonaInsertQuery = `
      INSERT INTO zonas (
        nombre, numero_zona, descripcion, poblacion_estimada, 
        area_km2, coordenadas_centro, usuario_ingreso
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, nombre, numero_zona
    `;

    const zonaValues = [
      nombre, numero_zona, descripcion, poblacion_estimada || null,
      area_km2 || null, coordenadas_centro || null,
      req.user?.correo || 'admin'
    ];

    const zonaResult = await pool.query(zonaInsertQuery, zonaValues);
    const zonaId = zonaResult.rows[0].id;

    // Crear COCODE principal automáticamente
    const cocodeNombre = cocode_nombre || `COCODE Principal ${nombre}`;
    
    const cocodeInsertQuery = `
      INSERT INTO cocode (
        id_zona, nombre, es_principal, direccion_oficina, telefono,
        poblacion_estimada, latitud, longitud, usuario_ingreso
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, nombre
    `;

    const cocodeValues = [
      zonaId, cocodeNombre, true, cocode_direccion || null, cocode_telefono || null,
      cocode_poblacion || poblacion_estimada || null, 
      cocode_latitud || null, cocode_longitud || null,
      req.user?.correo || 'admin'
    ];

    const cocodeResult = await pool.query(cocodeInsertQuery, cocodeValues);

    await pool.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Zona y COCODE principal creados exitosamente',
      zona: zonaResult.rows[0],
      cocode: cocodeResult.rows[0]
    });

  } catch (error) {
    await pool.query('ROLLBACK');
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

// Actualizar zona existente
const updateZona = async (req, res) => {
  const { id } = req.params;
  const { 
    nombre, numero_zona, descripcion, poblacion_estimada, 
    area_km2, coordenadas_centro,
    // Datos del COCODE principal para actualizar
    cocode_nombre, cocode_direccion, cocode_telefono,
    cocode_poblacion, cocode_latitud, cocode_longitud
  } = req.body;

  try {
    // Validaciones básicas
    if (!nombre || !numero_zona) {
      return res.status(400).json({ 
        error: 'Nombre y número de zona son requeridos' 
      });
    }

    // Validar que el número de zona no exista en otra zona
    const numeroQuery = 'SELECT id FROM zonas WHERE numero_zona = $1 AND id != $2 AND estado = TRUE';
    const numeroResult = await pool.query(numeroQuery, [numero_zona, id]);
    
    if (numeroResult.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Ya existe otra zona con este número' 
      });
    }

    // Validar que el nombre no exista en otra zona
    const nombreQuery = 'SELECT id FROM zonas WHERE LOWER(nombre) = LOWER($1) AND id != $2 AND estado = TRUE';
    const nombreResult = await pool.query(nombreQuery, [nombre, id]);
    
    if (nombreResult.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Ya existe otra zona con este nombre' 
      });
    }

    // Iniciar transacción
    await pool.query('BEGIN');

    // Actualizar zona
    const zonaUpdateQuery = `
      UPDATE zonas SET
        nombre = $1,
        numero_zona = $2,
        descripcion = $3,
        poblacion_estimada = $4,
        area_km2 = $5,
        coordenadas_centro = $6,
        fecha_modifica = NOW(),
        usuario_modifica = $7
      WHERE id = $8 AND estado = TRUE
      RETURNING id, nombre, numero_zona
    `;

    const zonaValues = [
      nombre, numero_zona, descripcion, poblacion_estimada || null,
      area_km2 || null, coordenadas_centro || null,
      req.user?.correo || 'admin',
      id
    ];

    const zonaResult = await pool.query(zonaUpdateQuery, zonaValues);

    if (zonaResult.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ 
        error: 'Zona no encontrada' 
      });
    }

    // Actualizar COCODE principal si existe
    if (cocode_nombre) {
      const cocodeUpdateQuery = `
        UPDATE cocode SET
          nombre = $1,
          direccion_oficina = $2,
          telefono = $3,
          poblacion_estimada = $4,
          latitud = $5,
          longitud = $6,
          fecha_modifica = NOW(),
          usuario_modifica = $7
        WHERE id_zona = $8 AND es_principal = TRUE AND estado = TRUE
        RETURNING id, nombre
      `;

      const cocodeValues = [
        cocode_nombre, cocode_direccion || null, cocode_telefono || null,
        cocode_poblacion || null, cocode_latitud || null, cocode_longitud || null,
        req.user?.correo || 'admin',
        id
      ];

      await pool.query(cocodeUpdateQuery, cocodeValues);
    }

    await pool.query('COMMIT');

    res.json({
      success: true,
      message: 'Zona actualizada exitosamente',
      zona: zonaResult.rows[0]
    });

  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error al actualizar zona:', error);
    res.status(500).json({ 
      error: 'Error al actualizar zona' 
    });
  }
};

// Desactivar zona (borrado lógico)
const deleteZona = async (req, res) => {
  const { id } = req.params;

  try {
    // Verificar si la zona tiene reportes activos
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

    // Verificar si tiene ciudadanos activos
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

    // Iniciar transacción
    await pool.query('BEGIN');

    // Desactivar zona
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
      await pool.query('ROLLBACK');
      return res.status(404).json({ 
        error: 'Zona no encontrada' 
      });
    }

    // Desactivar COCODE y sub-COCODE asociados
    await pool.query(`
      UPDATE cocode SET
        estado = FALSE,
        fecha_modifica = NOW(),
        usuario_modifica = $1
      WHERE id_zona = $2 AND estado = TRUE
    `, [req.user?.correo || 'admin', id]);

    await pool.query(`
      UPDATE subcocode SET
        estado = FALSE,
        fecha_modifica = NOW(),
        usuario_modifica = $1
      WHERE id_cocode_principal IN (
        SELECT id FROM cocode WHERE id_zona = $2
      ) AND estado = TRUE
    `, [req.user?.correo || 'admin', id]);

    await pool.query('COMMIT');

    res.json({
      success: true,
      message: 'Zona desactivada exitosamente'
    });

  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error al desactivar zona:', error);
    res.status(500).json({ 
      error: 'Error al desactivar zona' 
    });
  }
};

// Crear sub-COCODE en una zona
const createSubCocode = async (req, res) => {
  const { zonaId } = req.params;
  const { 
    nombre, sector, aldea_canton, direccion_oficina, telefono,
    poblacion_estimada, latitud, longitud, area_cobertura
  } = req.body;

  try {
    // Validar que la zona existe
    const zonaQuery = 'SELECT id, nombre FROM zonas WHERE id = $1 AND estado = TRUE';
    const zonaResult = await pool.query(zonaQuery, [zonaId]);
    
    if (zonaResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Zona no encontrada' 
      });
    }

    // Obtener COCODE principal de la zona
    const cocodeQuery = 'SELECT id FROM cocode WHERE id_zona = $1 AND es_principal = TRUE AND estado = TRUE';
    const cocodeResult = await pool.query(cocodeQuery, [zonaId]);
    
    if (cocodeResult.rows.length === 0) {
      return res.status(400).json({ 
        error: 'No se encontró COCODE principal para esta zona' 
      });
    }

    const cocodeId = cocodeResult.rows[0].id;

    // Validar datos requeridos
    if (!nombre || !sector) {
      return res.status(400).json({ 
        error: 'Nombre y sector son requeridos' 
      });
    }

    // Insertar sub-COCODE
    const insertQuery = `
      INSERT INTO subcocode (
        id_cocode_principal, nombre, sector, aldea_canton, direccion_oficina,
        telefono, poblacion_estimada, latitud, longitud, area_cobertura, usuario_ingreso
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, nombre, sector
    `;

    const values = [
      cocodeId, nombre, sector, aldea_canton || null, direccion_oficina || null,
      telefono || null, poblacion_estimada || null, latitud || null, 
      longitud || null, area_cobertura || null,
      req.user?.correo || 'admin'
    ];

    const result = await pool.query(insertQuery, values);

    res.status(201).json({
      success: true,
      message: 'Sub-COCODE creado exitosamente',
      subcocode: result.rows[0]
    });

  } catch (error) {
    console.error('Error al crear sub-COCODE:', error);
    res.status(500).json({ 
      error: 'Error al crear sub-COCODE' 
    });
  }
};

// Obtener estadísticas de zonas
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
  createSubCocode,
  getZonasStats
};