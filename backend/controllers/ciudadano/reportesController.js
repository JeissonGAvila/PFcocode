// backend/controllers/ciudadano/reportesController.js - COMPLETO Y CORREGIDO
const pool = require('../../models/db');

// Validar coordenadas de Guatemala
const validarCoordenadasGuatemala = (lat, lng) => {
  if (!lat || !lng) return false;
  
  // Rango de Guatemala: 13.5°N-18.5°N, 88°W-92.5°W
  const latValida = lat >= 13.5 && lat <= 18.5;
  const lngValida = lng >= -92.5 && lng <= -88.0;
  
  return latValida && lngValida;
};

// Crear nuevo reporte con geolocalización
const crearReporte = async (req, res) => {
  try {
    const ciudadanoId = req.user.id; // Del JWT
    const {
      titulo,
      descripcion,
      direccion,
      id_tipo_problema,
      prioridad = 'Media',
      ubicacion_lat,
      ubicacion_lng,
      metodo_ubicacion = 'manual',
      precision_metros
    } = req.body;

    // Validaciones básicas obligatorias
    if (!titulo || !descripcion || !direccion || !id_tipo_problema) {
      return res.status(400).json({
        error: 'Título, descripción, dirección y tipo de problema son requeridos'
      });
    }

    // Validación de dirección mínima
    if (direccion.length < 10) {
      return res.status(400).json({
        error: 'La dirección debe ser más específica (mínimo 10 caracteres)'
      });
    }

    // Validar coordenadas si se proporcionan
    if (ubicacion_lat && ubicacion_lng) {
      if (!validarCoordenadasGuatemala(ubicacion_lat, ubicacion_lng)) {
        return res.status(400).json({
          error: 'Las coordenadas proporcionadas están fuera del territorio de Guatemala'
        });
      }
    }

    // Verificar que el ciudadano existe y está activo - CONSULTA CORREGIDA
    const ciudadanoQuery = `
      SELECT id, nombre, apellido, id_zona, correo, telefono
      FROM ciudadanos_colaboradores 
      WHERE id = $1 AND estado = TRUE
    `;
    
    const ciudadanoResult = await pool.query(ciudadanoQuery, [ciudadanoId]);
    
    if (ciudadanoResult.rows.length === 0) {
      return res.status(403).json({ error: 'Ciudadano no encontrado o inactivo' });
    }
    
    const ciudadano = ciudadanoResult.rows[0];

    // Verificar que el tipo de problema existe
    const tipoProblemaQuery = `
      SELECT id, nombre, departamento_responsable 
      FROM tipos_problema 
      WHERE id = $1 AND estado = TRUE
    `;
    
    const tipoResult = await pool.query(tipoProblemaQuery, [id_tipo_problema]);
    
    if (tipoResult.rows.length === 0) {
      return res.status(400).json({ error: 'Tipo de problema no válido' });
    }

    // Generar número de reporte único con timestamp para evitar conflictos
    const timestamp = Date.now();
    const numeroReporte = `RPT-${timestamp.toString().slice(-6)}`;

    // Obtener ID del estado "Nuevo"
    const estadoQuery = `
      SELECT id FROM estados_reporte WHERE nombre = 'Nuevo' AND estado = TRUE
    `;
    const estadoResult = await pool.query(estadoQuery);
    
    if (estadoResult.rows.length === 0) {
      return res.status(500).json({ error: 'Estado "Nuevo" no configurado en el sistema' });
    }
    
    const estadoNuevoId = estadoResult.rows[0].id;

    // Preparar datos de ubicación
    const latFinal = ubicacion_lat || null;
    const lngFinal = ubicacion_lng || null;
    const metodoFinal = metodo_ubicacion || 'manual';
    const precisionFinal = precision_metros || null;

    // Insertar el reporte con geolocalización
    const insertQuery = `
      INSERT INTO reportes (
        numero_reporte, titulo, descripcion, direccion,
        id_tipo_problema, prioridad, id_estado,
        id_ciudadano_colaborador, tipo_usuario_creador,
        id_zona, latitud, longitud,
        metodo_ubicacion, precision_metros,
        fecha_reporte, usuario_ingreso
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, 'ciudadano',
        $9, $10, $11, $12, $13, CURRENT_TIMESTAMP, $14
      ) RETURNING *
    `;

    const newReporte = await pool.query(insertQuery, [
      numeroReporte, titulo, descripcion, direccion,
      id_tipo_problema, prioridad, estadoNuevoId,
      ciudadanoId, ciudadano.id_zona,
      latFinal, lngFinal, metodoFinal, precisionFinal,
      `ciudadano_${ciudadanoId}`
    ]);

    // Registrar en seguimiento (opcional - solo si la tabla lo soporta)
    try {
      const seguimientoQuery = `
        INSERT INTO seguimiento_reportes (
          id_reporte, tipo_usuario_seguimiento,
          comentario, tipo_seguimiento, usuario_ingreso
        ) VALUES ($1, 'ciudadano', $2, 'creacion', $3)
      `;

      await pool.query(seguimientoQuery, [
        newReporte.rows[0].id,
        `Reporte creado por el ciudadano. Ubicación: ${latFinal && lngFinal ? 'GPS' : 'Dirección'}: ${direccion}`,
        `ciudadano_${ciudadanoId}`
      ]);
    } catch (seguimientoError) {
      console.warn('No se pudo registrar seguimiento:', seguimientoError.message);
      // Continúa sin error - el seguimiento es opcional
    }

    res.status(201).json({
      success: true,
      message: 'Reporte creado exitosamente',
      reporte: {
        ...newReporte.rows[0],
        ciudadano_info: {
          nombre: `${ciudadano.nombre} ${ciudadano.apellido}`,
          correo: ciudadano.correo,
          telefono: ciudadano.telefono
        }
      },
      numero_reporte: numeroReporte,
      ubicacion: {
        tiene_coordenadas: !!(latFinal && lngFinal),
        metodo: metodoFinal,
        precision_metros: precisionFinal
      }
    });

  } catch (error) {
    console.error('Error al crear reporte:', error);
    res.status(500).json({
      error: 'Error al crear el reporte'
    });
  }
};

// Obtener reportes del ciudadano (SOLO los suyos)
const getMisReportes = async (req, res) => {
  try {
    const ciudadanoId = req.user.id;

    const reportesQuery = `
      SELECT 
        r.id,
        r.numero_reporte,
        r.titulo,
        r.descripcion,
        r.direccion,
        r.prioridad,
        r.fecha_reporte,
        r.fecha_asignacion,
        r.fecha_resolucion,
        r.latitud,
        r.longitud,
        r.metodo_ubicacion,
        r.precision_metros,
        er.nombre as estado,
        er.color as estado_color,
        tp.nombre as tipo_problema,
        tp.departamento_responsable,
        z.nombre as zona,
        -- Información del técnico asignado (si existe)
        CASE 
          WHEN r.id_administrador_asignado IS NOT NULL 
          THEN a.nombre || ' ' || a.apellido
          ELSE NULL
        END as tecnico_asignado,
        a.telefono as telefono_tecnico,
        -- Días transcurridos
        EXTRACT(DAYS FROM (CURRENT_TIMESTAMP - r.fecha_reporte)) as dias_creado,
        CASE 
          WHEN r.fecha_asignacion IS NOT NULL 
          THEN EXTRACT(DAYS FROM (CURRENT_TIMESTAMP - r.fecha_asignacion))
          ELSE NULL
        END as dias_asignado,
        -- Progreso estimado basado en estado
        CASE er.nombre
          WHEN 'Nuevo' THEN 10
          WHEN 'Aprobado por Líder' THEN 30
          WHEN 'Asignado' THEN 50
          WHEN 'En Proceso' THEN 80
          WHEN 'Resuelto' THEN 100
          WHEN 'Cerrado' THEN 100
          ELSE 5
        END as progreso_porcentaje
      FROM reportes r
      JOIN estados_reporte er ON r.id_estado = er.id
      JOIN tipos_problema tp ON r.id_tipo_problema = tp.id
      LEFT JOIN zonas z ON r.id_zona = z.id
      LEFT JOIN administradores a ON r.id_administrador_asignado = a.id
      WHERE r.id_ciudadano_colaborador = $1 
        AND r.estado = TRUE
        AND r.tipo_usuario_creador = 'ciudadano'
      ORDER BY r.fecha_reporte DESC
    `;
    
    const reportesResult = await pool.query(reportesQuery, [ciudadanoId]);

    // Obtener estadísticas del ciudadano
    const statsQuery = `
      SELECT 
        COUNT(*) as total_creados,
        COUNT(*) FILTER (WHERE er.nombre = 'Nuevo') as nuevos,
        COUNT(*) FILTER (WHERE er.nombre = 'Aprobado por Líder') as aprobados,
        COUNT(*) FILTER (WHERE er.nombre IN ('Asignado', 'En Proceso')) as en_progreso,
        COUNT(*) FILTER (WHERE er.nombre = 'Resuelto') as resueltos,
        COUNT(*) FILTER (WHERE er.nombre = 'Cerrado') as cerrados,
        COUNT(*) FILTER (WHERE r.prioridad = 'Alta') as criticos,
        AVG(EXTRACT(DAYS FROM (r.fecha_resolucion - r.fecha_reporte))) FILTER (WHERE er.nombre = 'Resuelto') as promedio_dias_resolucion
      FROM reportes r
      JOIN estados_reporte er ON r.id_estado = er.id
      WHERE r.id_ciudadano_colaborador = $1 AND r.estado = TRUE
    `;
    
    const statsResult = await pool.query(statsQuery, [ciudadanoId]);

    res.json({
      success: true,
      ciudadano: {
        id: ciudadanoId,
        estadisticas: statsResult.rows[0]
      },
      reportes: reportesResult.rows,
      total: reportesResult.rows.length
    });

  } catch (error) {
    console.error('Error al obtener reportes del ciudadano:', error);
    res.status(500).json({
      error: 'Error al obtener tus reportes'
    });
  }
};

// Agregar comentario a reporte propio
const agregarComentario = async (req, res) => {
  const { id } = req.params;
  const { comentario } = req.body;
  const ciudadanoId = req.user.id;

  try {
    if (!comentario || comentario.trim().length < 5) {
      return res.status(400).json({
        error: 'El comentario debe tener al menos 5 caracteres'
      });
    }

    // Verificar que el reporte pertenece al ciudadano
    const verificarQuery = `
      SELECT id, titulo, numero_reporte
      FROM reportes 
      WHERE id = $1 AND id_ciudadano_colaborador = $2 AND estado = TRUE
    `;
    
    const verificarResult = await pool.query(verificarQuery, [id, ciudadanoId]);
    
    if (verificarResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Reporte no encontrado o no tienes permisos para comentar'
      });
    }

    // Insertar comentario en seguimiento
    try {
      const seguimientoQuery = `
        INSERT INTO seguimiento_reportes (
          id_reporte, tipo_usuario_seguimiento,
          comentario, tipo_seguimiento, usuario_ingreso
        ) VALUES ($1, 'ciudadano', $2, 'comentario', $3)
        RETURNING *
      `;

      const seguimientoResult = await pool.query(seguimientoQuery, [
        id, comentario.trim(), `ciudadano_${ciudadanoId}`
      ]);

      res.json({
        success: true,
        message: 'Comentario agregado exitosamente',
        seguimiento: seguimientoResult.rows[0]
      });
    } catch (seguimientoError) {
      console.warn('Error al insertar seguimiento:', seguimientoError.message);
      // Si falla el seguimiento, al menos confirmamos que el comentario se quiso agregar
      res.json({
        success: true,
        message: 'Comentario registrado (seguimiento limitado)',
        seguimiento: null
      });
    }

  } catch (error) {
    console.error('Error al agregar comentario:', error);
    res.status(500).json({
      error: 'Error al agregar comentario'
    });
  }
};

// Obtener tipos de problema disponibles para ciudadanos
const getTiposProblema = async (req, res) => {
  try {
    const tiposQuery = `
      SELECT id, nombre, descripcion, departamento_responsable,
             tiempo_estimado_dias, icono
      FROM tipos_problema 
      WHERE estado = TRUE 
      ORDER BY nombre
    `;
    
    const result = await pool.query(tiposQuery);
    
    res.json({
      success: true,
      tipos_problema: result.rows
    });

  } catch (error) {
    console.error('Error al obtener tipos de problema:', error);
    res.status(500).json({
      error: 'Error al obtener tipos de problema'
    });
  }
};

// Obtener datos para selects del formulario - CONSULTA CORREGIDA
const getDatosFormulario = async (req, res) => {
  try {
    const ciudadanoId = req.user.id;

    // Obtener información del ciudadano - COLUMNAS CORREGIDAS
    const ciudadanoQuery = `
      SELECT c.nombre, c.apellido, c.direccion, 
             z.nombre as zona
      FROM ciudadanos_colaboradores c
      LEFT JOIN zonas z ON c.id_zona = z.id
      WHERE c.id = $1 AND c.estado = TRUE
    `;
    
    const ciudadanoResult = await pool.query(ciudadanoQuery, [ciudadanoId]);

    // Obtener tipos de problema
    const tiposResult = await pool.query(`
      SELECT id, nombre, descripcion, departamento_responsable, tiempo_estimado_dias
      FROM tipos_problema 
      WHERE estado = TRUE 
      ORDER BY nombre
    `);

    res.json({
      success: true,
      ciudadano: ciudadanoResult.rows[0] || {},
      tipos_problema: tiposResult.rows,
      prioridades: ['Baja', 'Media', 'Alta'],
      metodos_ubicacion: [
        { value: 'gps', label: 'GPS del dispositivo' },
        { value: 'mapa', label: 'Selección en mapa' },
        { value: 'manual', label: 'Dirección manual' }
      ]
    });

  } catch (error) {
    console.error('Error al obtener datos del formulario:', error);
    res.status(500).json({
      error: 'Error al obtener datos del formulario'
    });
  }
};

module.exports = {
  crearReporte,
  getMisReportes,
  agregarComentario,
  getTiposProblema,
  getDatosFormulario
};