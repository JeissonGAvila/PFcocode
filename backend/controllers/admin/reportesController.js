// backend/controllers/admin/reportesController.js - ACTUALIZADO CON FOTOS Y UBICACIÓN
const pool = require('../../models/db');

// Obtener SOLO reportes "Aprobados por Líder" CON FOTOS Y UBICACIÓN (FLUJO CORRECTO)
const getReportes = async (req, res) => {
  try {
    const query = `
      SELECT 
        r.id,
        r.numero_reporte,
        r.titulo,
        r.descripcion,
        r.direccion,
        r.prioridad,
        r.fecha_reporte,
        r.latitud,
        r.longitud,
        r.metodo_ubicacion,
        r.precision_metros,
        er.nombre as estado,
        tp.nombre as tipo_problema,
        tp.departamento_responsable,
        
        -- Información del ciudadano que creó el reporte
        CASE 
          WHEN r.tipo_usuario_creador = 'lider' THEN u.nombre || ' ' || u.apellido
          WHEN r.tipo_usuario_creador = 'ciudadano' THEN c.nombre || ' ' || c.apellido
          ELSE 'Usuario desconocido'
        END as ciudadano_creador,
        
        -- Teléfono del ciudadano para contacto
        CASE 
          WHEN r.tipo_usuario_creador = 'ciudadano' THEN c.telefono
          ELSE NULL
        END as ciudadano_telefono,
        
        -- Técnico asignado
        CASE 
          WHEN r.id_administrador_asignado IS NOT NULL THEN a.nombre || ' ' || a.apellido
          ELSE 'Sin asignar'
        END as tecnico_asignado,
        
        -- Zona
        z.nombre as zona,
        z.numero_zona,
        
        -- NUEVO: Fotos del reporte (ARRAY de fotos)
        (
          SELECT JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', ar.id,
              'nombre_archivo', ar.nombre_archivo,
              'url_archivo', ar.url_archivo,
              'tipo_archivo', ar.tipo_archivo,
              'tamano_kb', ar.tamano_kb,
              'fecha_subida', ar.fecha_subida,
              'es_evidencia_inicial', ar.es_evidencia_inicial
            )
          )
          FROM archivos_reporte ar 
          WHERE ar.id_reporte = r.id 
            AND ar.estado = TRUE
            AND ar.es_evidencia_inicial = TRUE
        ) as fotos,
        
        -- NUEVO: Contador de fotos
        (
          SELECT COUNT(*) 
          FROM archivos_reporte ar 
          WHERE ar.id_reporte = r.id 
            AND ar.estado = TRUE
            AND ar.es_evidencia_inicial = TRUE
        ) as total_fotos
        
      FROM reportes r
      LEFT JOIN estados_reporte er ON r.id_estado = er.id
      LEFT JOIN tipos_problema tp ON r.id_tipo_problema = tp.id
      LEFT JOIN usuarios u ON r.id_usuario = u.id
      LEFT JOIN ciudadanos_colaboradores c ON r.id_ciudadano_colaborador = c.id
      LEFT JOIN administradores a ON r.id_administrador_asignado = a.id
      LEFT JOIN zonas z ON r.id_zona = z.id
      WHERE r.estado = TRUE 
        AND er.nombre = 'Aprobado por Líder'
      ORDER BY 
        CASE r.prioridad
          WHEN 'Alta' THEN 1
          WHEN 'Media' THEN 2
          WHEN 'Baja' THEN 3
          ELSE 4
        END,
        r.fecha_reporte DESC
    `;
    
    const result = await pool.query(query);
    
    // Procesar resultados para incluir información de ubicación y fotos
    const reportesProcesados = result.rows.map(reporte => ({
      ...reporte,
      tiene_ubicacion_gps: !!(reporte.latitud && reporte.longitud),
      tiene_fotos: (reporte.total_fotos || 0) > 0,
      fotos: reporte.fotos || [] // Asegurar que fotos sea un array
    }));
    
    res.json({
      success: true,
      reportes: reportesProcesados,
      mensaje: `Se encontraron ${result.rows.length} reportes aprobados por líderes esperando asignación`,
      estadisticas: {
        total: result.rows.length,
        con_fotos: reportesProcesados.filter(r => r.tiene_fotos).length,
        con_ubicacion: reportesProcesados.filter(r => r.tiene_ubicacion_gps).length,
        criticos: reportesProcesados.filter(r => r.prioridad === 'Alta').length
      }
    });
  } catch (error) {
    console.error('Error al obtener reportes aprobados:', error);
    res.status(500).json({ 
      error: 'Error al obtener reportes aprobados por líderes',
      details: error.message 
    });
  }
};

// NUEVO: Obtener detalles completos de un reporte específico
const getReporteDetalle = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        r.id,
        r.numero_reporte,
        r.titulo,
        r.descripcion,
        r.direccion,
        r.prioridad,
        r.fecha_reporte,
        r.fecha_asignacion,
        r.latitud,
        r.longitud,
        r.metodo_ubicacion,
        r.precision_metros,
        
        -- Estados
        er.nombre as estado,
        er.color as estado_color,
        
        -- Tipo de problema
        tp.nombre as tipo_problema,
        tp.descripcion as tipo_descripcion,
        tp.departamento_responsable,
        
        -- Información del ciudadano completa
        c.nombre as ciudadano_nombre,
        c.apellido as ciudadano_apellido,
        c.telefono as ciudadano_telefono,
        c.correo as ciudadano_correo,
        
        -- Técnico asignado
        a.nombre as tecnico_nombre,
        a.apellido as tecnico_apellido,
        a.telefono as tecnico_telefono,
        a.departamento as tecnico_departamento,
        
        -- Zona completa
        z.nombre as zona_nombre,
        z.numero_zona,
        z.descripcion as zona_descripcion,
        
        -- Líder que aprobó (si está disponible en otra tabla)
        NULL as lider_nombre,
        NULL as lider_apellido,
        
        -- Fotos del reporte con más detalles
        (
          SELECT JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', ar.id,
              'nombre_archivo', ar.nombre_archivo,
              'url_archivo', ar.url_archivo,
              'tipo_archivo', ar.tipo_archivo,
              'tamano_kb', ar.tamano_kb,
              'fecha_subida', ar.fecha_subida,
              'es_evidencia_inicial', ar.es_evidencia_inicial,
              'subido_por_tipo', ar.subido_por_tipo
            )
          )
          FROM archivos_reporte ar 
          WHERE ar.id_reporte = r.id 
            AND ar.estado = TRUE
        ) as fotos
        
      FROM reportes r
      INNER JOIN estados_reporte er ON r.id_estado = er.id
      INNER JOIN tipos_problema tp ON r.id_tipo_problema = tp.id
      LEFT JOIN ciudadanos_colaboradores c ON r.id_ciudadano_colaborador = c.id
      LEFT JOIN administradores a ON r.id_administrador_asignado = a.id
      LEFT JOIN zonas z ON r.id_zona = z.id
      WHERE r.id = $1 AND r.estado = TRUE
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Reporte no encontrado' 
      });
    }
    
    const reporte = result.rows[0];
    
    // Procesar resultado
    const reporteProcesado = {
      ...reporte,
      tiene_ubicacion_gps: !!(reporte.latitud && reporte.longitud),
      tiene_fotos: !!(reporte.fotos && reporte.fotos.length > 0),
      fotos: reporte.fotos || []
    };
    
    res.json({
      success: true,
      reporte: reporteProcesado
    });
    
  } catch (error) {
    console.error('Error al obtener detalle del reporte:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener detalle del reporte',
      details: error.message 
    });
  }
};

// Asignar reporte a técnico Y cambiar estado automáticamente (FLUJO CORRECTO - sin cambios)
const asignarReporte = async (req, res) => {
  const { id } = req.params;
  const { id_tecnico } = req.body;
  
  try {
    // Validar que el reporte esté en estado "Aprobado por Líder"
    const validarEstadoQuery = `
      SELECT r.*, tp.departamento_responsable, er.nombre as estado_actual
      FROM reportes r
      JOIN tipos_problema tp ON r.id_tipo_problema = tp.id
      JOIN estados_reporte er ON r.id_estado = er.id
      WHERE r.id = $1 AND r.estado = TRUE
    `;
    
    const reporteResult = await pool.query(validarEstadoQuery, [id]);
    
    if (reporteResult.rows.length === 0) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }
    
    const reporte = reporteResult.rows[0];
    
    if (reporte.estado_actual !== 'Aprobado por Líder') {
      return res.status(400).json({ 
        error: `Este reporte está en estado "${reporte.estado_actual}". Solo se pueden asignar reportes aprobados por líderes.` 
      });
    }
    
    // Validar que el técnico pertenece al departamento correcto
    const tecnicoQuery = `
      SELECT nombre, apellido, departamento 
      FROM administradores 
      WHERE id = $1 AND tipo_usuario = 'tecnico' AND estado = TRUE
    `;
    
    const tecnicoResult = await pool.query(tecnicoQuery, [id_tecnico]);
    
    if (tecnicoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Técnico no encontrado o no activo' });
    }
    
    const tecnico = tecnicoResult.rows[0];
    
    if (tecnico.departamento !== reporte.departamento_responsable) {
      return res.status(400).json({ 
        error: `El técnico ${tecnico.nombre} ${tecnico.apellido} pertenece al departamento "${tecnico.departamento}", pero este reporte requiere "${reporte.departamento_responsable}"` 
      });
    }
    
    // Actualizar reporte: asignar técnico Y cambiar estado a "Asignado"
    const updateQuery = `
      UPDATE reportes 
      SET 
        id_administrador_asignado = $1,
        id_estado = (SELECT id FROM estados_reporte WHERE nombre = 'Asignado'),
        fecha_asignacion = NOW(),
        fecha_modifica = NOW(),
        usuario_modifica = $2
      WHERE id = $3 AND estado = TRUE
      RETURNING *
    `;
    
    const result = await pool.query(updateQuery, [id_tecnico, 'admin', id]);
    
    // Crear registro de seguimiento
    try {
      const seguimientoQuery = `
        INSERT INTO seguimiento_reportes (
          id_reporte, tipo_usuario_seguimiento,
          estado_anterior, estado_nuevo, tipo_seguimiento,
          comentario, accion_tomada, usuario_ingreso
        ) VALUES ($1, 'admin', 
          (SELECT id FROM estados_reporte WHERE nombre = 'Aprobado por Líder'),
          (SELECT id FROM estados_reporte WHERE nombre = 'Asignado'),
          'asignacion_tecnico', $2, 'Reporte asignado a técnico por administrador', $3)
      `;
      
      await pool.query(seguimientoQuery, [
        id,
        `Reporte asignado a ${tecnico.nombre} ${tecnico.apellido} del departamento ${tecnico.departamento}`,
        'admin'
      ]);
    } catch (seguimientoError) {
      console.warn('No se pudo registrar seguimiento:', seguimientoError.message);
    }
    
    res.json({
      success: true,
      message: `Reporte asignado exitosamente a ${tecnico.nombre} ${tecnico.apellido}. Estado cambiado a "Asignado".`,
      reporte: result.rows[0],
      tecnico_asignado: `${tecnico.nombre} ${tecnico.apellido}`,
      departamento: tecnico.departamento
    });
  } catch (error) {
    console.error('Error al asignar reporte:', error);
    res.status(500).json({ 
      error: 'Error al asignar reporte',
      details: error.message 
    });
  }
};

// Cambiar estado de reporte (VALIDACIÓN MEJORADA - sin cambios)
const cambiarEstado = async (req, res) => {
  const { id } = req.params;
  const { id_estado } = req.body;
  
  try {
    // Validar que el estado existe y es válido para admin
    const estadoQuery = `
      SELECT nombre FROM estados_reporte WHERE id = $1 AND estado = TRUE
    `;
    const estadoResult = await pool.query(estadoQuery, [id_estado]);
    
    if (estadoResult.rows.length === 0) {
      return res.status(400).json({ error: 'Estado no válido' });
    }
    
    const nuevoEstado = estadoResult.rows[0].nombre;
    
    const updateQuery = `
      UPDATE reportes 
      SET 
        id_estado = $1,
        fecha_modifica = NOW(),
        usuario_modifica = $2
      WHERE id = $3 AND estado = TRUE
      RETURNING *
    `;
    
    const result = await pool.query(updateQuery, [id_estado, 'admin', id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }
    
    res.json({
      success: true,
      message: `Estado cambiado exitosamente a "${nuevoEstado}"`,
      reporte: result.rows[0]
    });
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    res.status(500).json({ 
      error: 'Error al cambiar estado',
      details: error.message 
    });
  }
};

// Cambiar prioridad (sin cambios)
const cambiarPrioridad = async (req, res) => {
  const { id } = req.params;
  const { prioridad } = req.body;
  
  try {
    if (!['Alta', 'Media', 'Baja'].includes(prioridad)) {
      return res.status(400).json({ error: 'Prioridad inválida' });
    }
    
    const updateQuery = `
      UPDATE reportes 
      SET 
        prioridad = $1,
        fecha_modifica = NOW(),
        usuario_modifica = $2
      WHERE id = $3 AND estado = TRUE
      RETURNING *
    `;
    
    const result = await pool.query(updateQuery, [prioridad, 'admin', id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }
    
    res.json({
      success: true,
      message: 'Prioridad cambiada exitosamente',
      reporte: result.rows[0]
    });
  } catch (error) {
    console.error('Error al cambiar prioridad:', error);
    res.status(500).json({ 
      error: 'Error al cambiar prioridad',
      details: error.message 
    });
  }
};

// Obtener datos para selects Y estadísticas específicas (MEJORADO - sin cambios)
const getDatosSelect = async (req, res) => {
  try {
    // Obtener técnicos activos
    const tecnicosQuery = `
      SELECT id, nombre, apellido, departamento 
      FROM administradores 
      WHERE tipo_usuario = 'tecnico' AND estado = TRUE
      ORDER BY departamento, nombre
    `;
    const tecnicosResult = await pool.query(tecnicosQuery);
    
    // Obtener estados
    const estadosQuery = `
      SELECT id, nombre, descripcion 
      FROM estados_reporte 
      WHERE estado = TRUE
      ORDER BY orden
    `;
    const estadosResult = await pool.query(estadosQuery);
    
    // Estadísticas específicas para el dashboard
    const statsQuery = `
      SELECT 
        COUNT(*) FILTER (WHERE er.nombre = 'Aprobado por Líder') as reportes_pendientes_asignacion,
        COUNT(*) FILTER (WHERE er.nombre = 'Asignado') as reportes_asignados,
        COUNT(*) FILTER (WHERE er.nombre = 'En Proceso') as reportes_en_proceso,
        COUNT(DISTINCT CASE WHEN er.nombre = 'Aprobado por Líder' AND r.prioridad = 'Alta' THEN r.id END) as reportes_criticos_sin_asignar
      FROM reportes r
      JOIN estados_reporte er ON r.id_estado = er.id
      WHERE r.estado = TRUE
    `;
    const statsResult = await pool.query(statsQuery);
    
    // Técnicos por departamento con carga de trabajo
    const departamentosQuery = `
      SELECT 
        a.departamento,
        COUNT(a.id) as tecnicos_disponibles,
        COUNT(r.id) as reportes_asignados
      FROM administradores a
      LEFT JOIN reportes r ON a.id = r.id_administrador_asignado 
        AND r.estado = TRUE 
        AND r.id_estado IN (SELECT id FROM estados_reporte WHERE nombre IN ('Asignado', 'En Proceso'))
      WHERE a.tipo_usuario = 'tecnico' AND a.estado = TRUE
      GROUP BY a.departamento
      ORDER BY a.departamento
    `;
    const departamentosResult = await pool.query(departamentosQuery);
    
    res.json({
      success: true,
      tecnicos: tecnicosResult.rows,
      estados: estadosResult.rows,
      prioridades: ['Alta', 'Media', 'Baja'],
      estadisticas: statsResult.rows[0],
      departamentos: departamentosResult.rows
    });
  } catch (error) {
    console.error('Error al obtener datos:', error);
    res.status(500).json({ 
      error: 'Error al obtener datos',
      details: error.message 
    });
  }
};

module.exports = {
  getReportes,
  getReporteDetalle, // NUEVO
  asignarReporte,
  cambiarEstado,
  cambiarPrioridad,
  getDatosSelect
};