// backend/controllers/ciudadano/reportesController.js - CORREGIDO CON id_subcocode_area
const pool = require('../../models/db');
const { guardarArchivosFirebaseDB, getArchivosReporteDB } = require('../firebaseController');

// Validar coordenadas de Guatemala
const validarCoordenadasGuatemala = (lat, lng) => {
  if (!lat || !lng) return false;
  
  // Rango de Guatemala: 13.5°N-18.5°N, 88°W-92.5°W
  const latValida = lat >= 13.5 && lat <= 18.5;
  const lngValida = lng >= -92.5 && lng <= -88.0;
  
  return latValida && lngValida;
};

// Crear nuevo reporte SIN fotos (método original)
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

    // ✅ CORREGIDO: Obtener ciudadano con id_subcocode_area
    const ciudadanoQuery = `
      SELECT 
        c.id, 
        c.nombre, 
        c.apellido, 
        c.id_zona, 
        c.id_subcocode_area,
        c.correo, 
        c.telefono,
        sc.nombre as nombre_sector,
        z.nombre as nombre_zona
      FROM ciudadanos_colaboradores c
      LEFT JOIN subcocode sc ON c.id_subcocode_area = sc.id
      LEFT JOIN zonas z ON c.id_zona = z.id
      WHERE c.id = $1 AND c.estado = TRUE
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

    // Generar número de reporte único
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

    // ✅ CORREGIDO: Insertar con id_subcocode_area
    const insertQuery = `
      INSERT INTO reportes (
        numero_reporte, titulo, descripcion, direccion,
        id_tipo_problema, prioridad, id_estado,
        id_ciudadano_colaborador, tipo_usuario_creador,
        id_zona, id_subcocode_area, latitud, longitud,
        metodo_ubicacion, precision_metros,
        fecha_reporte, usuario_ingreso
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, 'ciudadano',
        $9, $10, $11, $12, $13, $14, CURRENT_TIMESTAMP, $15
      ) RETURNING *
    `;

    const newReporte = await pool.query(insertQuery, [
      numeroReporte, titulo, descripcion, direccion,
      id_tipo_problema, prioridad, estadoNuevoId,
      ciudadanoId, 
      ciudadano.id_zona,
      ciudadano.id_subcocode_area, // ✅ CORREGIDO
      latFinal, lngFinal, metodoFinal, precisionFinal,
      `ciudadano_${ciudadanoId}`
    ]);

    // Crear comentario inicial automático
    try {
      const comentarioTexto = `Reporte creado. Ubicación: ${latFinal && lngFinal ? 'GPS' : 'Dirección'}: ${direccion}${
        ciudadano.nombre_sector ? ` | Sector: ${ciudadano.nombre_sector}` : ''
      }`;
      
      await pool.query(`
        INSERT INTO comentarios_reportes (
          id_reporte, id_ciudadano, tipo_usuario_comentario, 
          nombre_usuario, comentario, es_interno, usuario_ingreso
        ) VALUES ($1, $2, 'ciudadano', $3, $4, FALSE, $5)
      `, [
        newReporte.rows[0].id,
        ciudadanoId,
        `${ciudadano.nombre} ${ciudadano.apellido}`,
        comentarioTexto,
        `ciudadano_${ciudadanoId}`
      ]);
    } catch (comentarioError) {
      console.warn('No se pudo crear comentario inicial:', comentarioError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Reporte creado exitosamente',
      reporte: {
        ...newReporte.rows[0],
        ciudadano_info: {
          nombre: `${ciudadano.nombre} ${ciudadano.apellido}`,
          correo: ciudadano.correo,
          telefono: ciudadano.telefono,
          sector: ciudadano.nombre_sector,
          zona: ciudadano.nombre_zona
        }
      },
      numero_reporte: numeroReporte,
      sector: ciudadano.nombre_sector || 'Sin sector asignado',
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

// Guardar archivos Firebase en BD
const guardarArchivosFirebase = async (req, res) => {
  try {
    const { id: reporteId } = req.params;
    const { archivos } = req.body;
    const ciudadanoId = req.user.id;

    const verificarQuery = `
      SELECT id, titulo, numero_reporte
      FROM reportes 
      WHERE id = $1 AND id_ciudadano_colaborador = $2 AND estado = TRUE
    `;
    
    const verificarResult = await pool.query(verificarQuery, [reporteId, ciudadanoId]);
    
    if (verificarResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Reporte no encontrado o no tienes permisos'
      });
    }

    const reporte = verificarResult.rows[0];

    const archivosGuardados = await guardarArchivosFirebaseDB(
      reporteId, 
      archivos, 
      ciudadanoId, 
      'ciudadano'
    );

    res.status(201).json({
      success: true,
      message: `${archivos.length} archivo(s) guardado(s) exitosamente en Firebase`,
      reporte: {
        id: reporte.id,
        numero_reporte: reporte.numero_reporte,
        titulo: reporte.titulo
      },
      archivos: archivosGuardados,
      firebase_enabled: true,
      archivos_guardados: archivosGuardados.length
    });

  } catch (error) {
    console.error('Error al guardar archivos Firebase:', error);
    res.status(500).json({
      error: 'Error al guardar archivos Firebase',
      message: error.message
    });
  }
};

// Obtener archivos de un reporte
const getArchivosReporte = async (req, res) => {
  try {
    const { id: reporteId } = req.params;
    const ciudadanoId = req.user.id;

    const verificarQuery = `
      SELECT id, titulo, numero_reporte
      FROM reportes 
      WHERE id = $1 AND id_ciudadano_colaborador = $2 AND estado = TRUE
    `;
    
    const verificarResult = await pool.query(verificarQuery, [reporteId, ciudadanoId]);
    
    if (verificarResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Reporte no encontrado o no tienes permisos'
      });
    }

    const resultadoArchivos = await getArchivosReporteDB(reporteId);

    res.json({
      success: true,
      reporte: verificarResult.rows[0],
      ...resultadoArchivos,
      firebase_enabled: true
    });

  } catch (error) {
    console.error('Error al obtener archivos:', error);
    res.status(500).json({
      error: 'Error al obtener archivos del reporte'
    });
  }
};

// ✅ CORREGIDO: getMisReportes con id_subcocode_area
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
        sc.nombre as sector,
        sc.sector as sector_descripcion,
        CASE 
          WHEN r.id_administrador_asignado IS NOT NULL 
          THEN a.nombre || ' ' || a.apellido
          ELSE NULL
        END as tecnico_asignado,
        a.telefono as telefono_tecnico,
        EXTRACT(DAYS FROM (CURRENT_TIMESTAMP - r.fecha_reporte)) as dias_creado,
        CASE 
          WHEN r.fecha_asignacion IS NOT NULL 
          THEN EXTRACT(DAYS FROM (CURRENT_TIMESTAMP - r.fecha_asignacion))
          ELSE NULL
        END as dias_asignado,
        CASE er.nombre
          WHEN 'Nuevo' THEN 10
          WHEN 'Aprobado por Líder' THEN 30
          WHEN 'Asignado' THEN 50
          WHEN 'En Proceso' THEN 80
          WHEN 'Resuelto' THEN 100
          WHEN 'Cerrado' THEN 100
          ELSE 5
        END as progreso_porcentaje,
        (SELECT COUNT(*) > 0 FROM archivos_reporte ar WHERE ar.id_reporte = r.id AND ar.estado = TRUE) as tiene_fotos,
        (SELECT COUNT(*) FROM archivos_reporte ar WHERE ar.id_reporte = r.id AND ar.firebase_path IS NOT NULL AND ar.estado = TRUE) as fotos_firebase,
        (SELECT COUNT(*) FROM comentarios_reportes cr WHERE cr.id_reporte = r.id AND cr.es_interno = FALSE AND cr.estado = TRUE) as comentarios_count
      FROM reportes r
      JOIN estados_reporte er ON r.id_estado = er.id
      JOIN tipos_problema tp ON r.id_tipo_problema = tp.id
      LEFT JOIN zonas z ON r.id_zona = z.id
      LEFT JOIN subcocode sc ON r.id_subcocode_area = sc.id
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
        AVG(EXTRACT(DAYS FROM (r.fecha_resolucion - r.fecha_reporte))) FILTER (WHERE er.nombre = 'Resuelto') as promedio_dias_resolucion,
        (SELECT COUNT(*) FROM comentarios_reportes cr 
         INNER JOIN reportes r2 ON cr.id_reporte = r2.id 
         WHERE r2.id_ciudadano_colaborador = $1 AND cr.tipo_usuario_comentario = 'ciudadano' AND cr.estado = TRUE) as comentarios_realizados
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
      total: reportesResult.rows.length,
      firebase_enabled: true,
      comentarios_enabled: true
    });

  } catch (error) {
    console.error('Error al obtener reportes del ciudadano:', error);
    res.status(500).json({
      error: 'Error al obtener tus reportes'
    });
  }
};

// Obtener tipos de problema disponibles
const getTiposProblema = async (req, res) => {
  try {
    const tiposQuery = `
      SELECT tp.id, tp.id_categoria, tp.nombre, tp.descripcion, tp.departamento_responsable,
             tp.tiempo_estimado_dias,
             cp.nombre as categoria_nombre,
             cp.color as categoria_color
      FROM tipos_problema tp
      INNER JOIN categorias_problema cp ON tp.id_categoria = cp.id
      WHERE tp.estado = TRUE AND cp.estado = TRUE
      ORDER BY cp.nombre, tp.nombre
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

// ✅ CORREGIDO: getDatosFormulario con id_subcocode_area
const getDatosFormulario = async (req, res) => {
  try {
    const ciudadanoId = req.user.id;

    console.log('🔍 Obteniendo datos para formulario de reporte...');

    // ✅ CORREGIDO: Query con id_subcocode_area
    const ciudadanoQuery = `
      SELECT 
        c.nombre, 
        c.apellido, 
        c.direccion, 
        c.id_zona,
        c.id_subcocode_area,
        z.nombre as zona,
        sc.nombre as sector,
        sc.sector as sector_descripcion
      FROM ciudadanos_colaboradores c
      LEFT JOIN zonas z ON c.id_zona = z.id
      LEFT JOIN subcocode sc ON c.id_subcocode_area = sc.id
      WHERE c.id = $1 AND c.estado = TRUE
    `;
    
    const ciudadanoResult = await pool.query(ciudadanoQuery, [ciudadanoId]);

    // Obtener categorías de problema
    const categoriasQuery = `
      SELECT 
        id, 
        nombre, 
        descripcion, 
        icono, 
        color 
      FROM categorias_problema 
      WHERE estado = TRUE 
      ORDER BY nombre ASC
    `;
    
    // Obtener tipos de problema con sus categorías
    const tiposQuery = `
      SELECT 
        tp.id,
        tp.id_categoria,
        tp.nombre,
        tp.descripcion,
        tp.departamento_responsable,
        tp.tiempo_estimado_dias,
        tp.costo_estimado,
        cp.nombre as categoria_nombre,
        cp.color as categoria_color
      FROM tipos_problema tp
      INNER JOIN categorias_problema cp ON tp.id_categoria = cp.id
      WHERE tp.estado = TRUE AND cp.estado = TRUE
      ORDER BY cp.nombre ASC, tp.nombre ASC
    `;
    
    const [categoriasResult, tiposResult] = await Promise.all([
      pool.query(categoriasQuery),
      pool.query(tiposQuery)
    ]);
    
    console.log(`📋 Encontradas ${categoriasResult.rows.length} categorías y ${tiposResult.rows.length} tipos`);

    res.json({
      success: true,
      ciudadano: ciudadanoResult.rows[0] || {},
      categorias_problema: categoriasResult.rows,
      tipos_problema: tiposResult.rows,
      prioridades: ['Baja', 'Media', 'Alta'],
      metodos_ubicacion: [
        { value: 'gps', label: 'GPS del dispositivo' },
        { value: 'mapa', label: 'Selección en mapa' },
        { value: 'manual', label: 'Dirección manual' }
      ],
      firebase_enabled: true,
      comentarios_enabled: true,
      sector_info: {
        tiene_sector: !!ciudadanoResult.rows[0]?.id_subcocode_area,
        sector: ciudadanoResult.rows[0]?.sector,
        zona: ciudadanoResult.rows[0]?.zona
      },
      mensaje: 'Datos obtenidos correctamente'
    });

  } catch (error) {
    console.error('❌ Error al obtener datos del formulario:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener datos del formulario',
      mensaje: error.message
    });
  }
};

module.exports = {
  crearReporte,
  getMisReportes,
  getTiposProblema,
  getDatosFormulario,
  guardarArchivosFirebase,
  getArchivosReporte
};