// backend/controllers/tecnico/reportesController.js - VERSIÓN COMPLETA CON COMENTARIOS DINÁMICOS
const pool = require('../../models/db');

// Obtener reportes asignados al técnico CON FOTOS Y UBICACIÓN (SOLO de su departamento)
const getMisReportes = async (req, res) => {
  try {
    // CORREGIDO: Usar req.user del JWT (viene del middleware)
    const tecnicoId = req.user.id;
    const tecnicoDepartamento = req.user.departamento;
    
    console.log(`[TÉCNICO] ID: ${tecnicoId}, Departamento: ${tecnicoDepartamento}`);
    
    if (!tecnicoId) {
      return res.status(401).json({ error: 'Técnico no autenticado' });
    }

    // Verificar que es técnico activo
    const tecnicoQuery = `
      SELECT id, nombre, apellido, departamento, correo
      FROM administradores 
      WHERE id = $1 AND tipo_usuario = 'tecnico' AND estado = TRUE
    `;
    
    const tecnicoResult = await pool.query(tecnicoQuery, [tecnicoId]);
    
    if (tecnicoResult.rows.length === 0) {
      return res.status(403).json({ error: 'Usuario no es técnico activo' });
    }
    
    const tecnico = tecnicoResult.rows[0];
    
    // Obtener reportes SOLO de su departamento Y que estén asignados CON FOTOS Y UBICACIÓN
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
        r.latitud,
        r.longitud,
        r.metodo_ubicacion,
        r.precision_metros,
        
        er.nombre as estado,
        er.id as id_estado,
        tp.nombre as tipo_problema,
        tp.departamento_responsable,
        tp.tiempo_estimado_dias,
        
        CASE 
          WHEN r.tipo_usuario_creador = 'lider' THEN u.nombre || ' ' || u.apellido
          WHEN r.tipo_usuario_creador = 'ciudadano' THEN c.nombre || ' ' || c.apellido
          ELSE 'Usuario desconocido'
        END as reportado_por,
        
        CASE 
          WHEN r.tipo_usuario_creador = 'ciudadano' THEN c.telefono
          WHEN r.tipo_usuario_creador = 'lider' THEN u.telefono
          ELSE NULL
        END as telefono_contacto,
        
        CASE 
          WHEN r.tipo_usuario_creador = 'ciudadano' THEN c.correo
          WHEN r.tipo_usuario_creador = 'lider' THEN u.correo
          ELSE NULL
        END as correo_contacto,
        
        z.nombre as zona,
        z.numero_zona,
        
        -- Fotos del reporte (ARRAY de fotos del ciudadano)
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
            AND ar.es_evidencia_inicial = TRUE
        ) as fotos,
        
        -- Contador de fotos
        (
          SELECT COUNT(*) 
          FROM archivos_reporte ar 
          WHERE ar.id_reporte = r.id 
            AND ar.estado = TRUE
            AND ar.es_evidencia_inicial = TRUE
        ) as total_fotos,
        
        -- NUEVO: Contador de comentarios públicos
        (
          SELECT COUNT(*) 
          FROM comentarios_reportes cr 
          WHERE cr.id_reporte = r.id 
            AND cr.es_interno = FALSE 
            AND cr.estado = TRUE
        ) as comentarios_count,
        
        -- Calcular días transcurridos desde asignación
        EXTRACT(DAYS FROM (CURRENT_TIMESTAMP - r.fecha_asignacion)) as dias_asignado
        
      FROM reportes r
      JOIN estados_reporte er ON r.id_estado = er.id
      JOIN tipos_problema tp ON r.id_tipo_problema = tp.id
      LEFT JOIN usuarios u ON r.id_usuario = u.id
      LEFT JOIN ciudadanos_colaboradores c ON r.id_ciudadano_colaborador = c.id
      LEFT JOIN zonas z ON r.id_zona = z.id
      WHERE r.estado = TRUE 
        AND r.id_administrador_asignado = $1
        AND tp.departamento_responsable = $2
        AND er.nombre IN ('Asignado', 'En Proceso', 'Pendiente Materiales')
      ORDER BY 
        CASE r.prioridad 
          WHEN 'Alta' THEN 1 
          WHEN 'Media' THEN 2 
          WHEN 'Baja' THEN 3 
        END,
        r.fecha_asignacion ASC
    `;
    
    const reportesResult = await pool.query(reportesQuery, [tecnicoId, tecnico.departamento]);
    
    // Procesar resultados para incluir información de ubicación y fotos
    const reportesProcesados = reportesResult.rows.map(reporte => ({
      ...reporte,
      tiene_ubicacion_gps: !!(reporte.latitud && reporte.longitud),
      tiene_fotos: (reporte.total_fotos || 0) > 0,
      fotos: reporte.fotos || [] // Asegurar que fotos sea un array
    }));
    
    res.json({
      success: true,
      tecnico: {
        nombre: `${tecnico.nombre} ${tecnico.apellido}`,
        departamento: tecnico.departamento,
        correo: tecnico.correo
      },
      reportes: reportesProcesados,
      estadisticas: {
        total_asignados: reportesProcesados.length,
        pendientes: reportesProcesados.filter(r => r.estado === 'Asignado').length,
        en_proceso: reportesProcesados.filter(r => r.estado === 'En Proceso').length,
        pendiente_materiales: reportesProcesados.filter(r => r.estado === 'Pendiente Materiales').length,
        con_fotos: reportesProcesados.filter(r => r.tiene_fotos).length,
        con_ubicacion: reportesProcesados.filter(r => r.tiene_ubicacion_gps).length,
        con_comentarios: reportesProcesados.filter(r => r.comentarios_count > 0).length
      },
      comentarios_enabled: true
    });
  } catch (error) {
    console.error('Error al obtener reportes del técnico:', error);
    res.status(500).json({ 
      error: 'Error al obtener reportes asignados' 
    });
  }
};

// NUEVO: Obtener detalles completos de un reporte específico para técnico
const getReporteDetalle = async (req, res) => {
  try {
    const { id } = req.params;
    const tecnicoId = req.user.id;
    
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
        tp.tiempo_estimado_dias,
        
        -- Información completa del ciudadano/creador
        CASE 
          WHEN r.tipo_usuario_creador = 'ciudadano' THEN c.nombre
          WHEN r.tipo_usuario_creador = 'lider' THEN u.nombre
          ELSE 'Usuario'
        END as creador_nombre,
        
        CASE 
          WHEN r.tipo_usuario_creador = 'ciudadano' THEN c.apellido
          WHEN r.tipo_usuario_creador = 'lider' THEN u.apellido
          ELSE 'Desconocido'
        END as creador_apellido,
        
        CASE 
          WHEN r.tipo_usuario_creador = 'ciudadano' THEN c.telefono
          WHEN r.tipo_usuario_creador = 'lider' THEN u.telefono
          ELSE NULL
        END as creador_telefono,
        
        CASE 
          WHEN r.tipo_usuario_creador = 'ciudadano' THEN c.correo
          WHEN r.tipo_usuario_creador = 'lider' THEN u.correo
          ELSE NULL
        END as creador_correo,
        
        r.tipo_usuario_creador,
        
        -- Zona completa
        z.nombre as zona_nombre,
        z.numero_zona,
        z.descripcion as zona_descripcion,
        
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
        ) as fotos,
        
        -- NUEVO: Contador de comentarios
        (
          SELECT COUNT(*) 
          FROM comentarios_reportes cr 
          WHERE cr.id_reporte = r.id 
            AND cr.es_interno = FALSE 
            AND cr.estado = TRUE
        ) as comentarios_count
        
      FROM reportes r
      INNER JOIN estados_reporte er ON r.id_estado = er.id
      INNER JOIN tipos_problema tp ON r.id_tipo_problema = tp.id
      LEFT JOIN ciudadanos_colaboradores c ON r.id_ciudadano_colaborador = c.id
      LEFT JOIN usuarios u ON r.id_usuario = u.id
      LEFT JOIN zonas z ON r.id_zona = z.id
      WHERE r.id = $1 
        AND r.id_administrador_asignado = $2 
        AND r.estado = TRUE
    `;
    
    const result = await pool.query(query, [id, tecnicoId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Reporte no encontrado o no asignado a este técnico' 
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
    console.error('Error al obtener detalle del reporte para técnico:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener detalle del reporte',
      details: error.message 
    });
  }
};

// Cambiar estado de reporte CON COMENTARIO DINÁMICO - ACTUALIZADO
const cambiarEstadoReporte = async (req, res) => {
  const { id } = req.params;
  const { nuevo_estado, comentario_progreso } = req.body; // NUEVO: Campo de comentario
  const tecnicoId = req.user.id; // CORREGIDO: usar req.user
  
  try {
    // Verificar que el reporte está asignado a este técnico
    const verificarQuery = `
      SELECT r.*, er.nombre as estado_actual, tp.departamento_responsable,
             a.departamento as tecnico_departamento, a.nombre as tecnico_nombre, a.apellido as tecnico_apellido
      FROM reportes r
      JOIN estados_reporte er ON r.id_estado = er.id
      JOIN tipos_problema tp ON r.id_tipo_problema = tp.id
      JOIN administradores a ON r.id_administrador_asignado = a.id
      WHERE r.id = $1 AND r.id_administrador_asignado = $2 AND r.estado = TRUE
    `;
    
    const verificarResult = await pool.query(verificarQuery, [id, tecnicoId]);
    
    if (verificarResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Reporte no encontrado o no asignado a este técnico' 
      });
    }
    
    const reporte = verificarResult.rows[0];
    
    // Validar transiciones de estado permitidas para técnicos
    const transicionesPermitidas = {
      'Asignado': ['En Proceso'],
      'En Proceso': ['Pendiente Materiales', 'Resuelto'],
      'Pendiente Materiales': ['En Proceso', 'Resuelto']
    };
    
    if (!transicionesPermitidas[reporte.estado_actual]?.includes(nuevo_estado)) {
      return res.status(400).json({ 
        error: `No se puede cambiar de "${reporte.estado_actual}" a "${nuevo_estado}". Transiciones permitidas: ${transicionesPermitidas[reporte.estado_actual]?.join(', ') || 'ninguna'}` 
      });
    }
    
    // Obtener ID del nuevo estado
    const estadoQuery = `
      SELECT id FROM estados_reporte WHERE nombre = $1 AND estado = TRUE
    `;
    const estadoResult = await pool.query(estadoQuery, [nuevo_estado]);
    
    if (estadoResult.rows.length === 0) {
      return res.status(400).json({ error: 'Estado no válido' });
    }
    
    const nuevoEstadoId = estadoResult.rows[0].id;
    
    // Actualizar estado del reporte
    const updateQuery = `
      UPDATE reportes 
      SET 
        id_estado = $1,
        fecha_modifica = CURRENT_TIMESTAMP,
        usuario_modifica = $2,
        fecha_resolucion = CASE WHEN $3 = 'Resuelto' THEN CURRENT_TIMESTAMP ELSE fecha_resolucion END
      WHERE id = $4 
      RETURNING *
    `;
    
    const updateResult = await pool.query(updateQuery, [
      nuevoEstadoId, 
      `tecnico_${tecnicoId}`, 
      nuevo_estado,
      id
    ]);
    
    // NUEVO: Crear comentario dinámico automáticamente usando sistema universal
    const comentarioFinal = comentario_progreso || 
      `Estado cambiado a "${nuevo_estado}" por el técnico ${reporte.tecnico_nombre} ${reporte.tecnico_apellido}.`;

    // Obtener emoji según el estado
    const emojiEstado = {
      'En Proceso': '🔧',
      'Pendiente Materiales': '⏳',
      'Resuelto': '✅'
    };

    try {
      await pool.query(`
        INSERT INTO comentarios_reportes (
          id_reporte, id_administrador, tipo_usuario_comentario, 
          nombre_usuario, comentario, es_interno, usuario_ingreso
        ) VALUES ($1, $2, 'tecnico', $3, $4, FALSE, $5)
      `, [
        id,
        tecnicoId,
        `${reporte.tecnico_nombre} ${reporte.tecnico_apellido}`,
        `${emojiEstado[nuevo_estado] || '🔧'} ${nuevo_estado.toUpperCase()}: ${comentarioFinal}`,
        `tecnico_${tecnicoId}`
      ]);
    } catch (comentarioError) {
      console.warn('No se pudo crear comentario de cambio de estado:', comentarioError.message);
    }
    
    res.json({
      success: true,
      message: `Estado cambiado exitosamente a "${nuevo_estado}"`,
      reporte: updateResult.rows[0],
      estado_anterior: reporte.estado_actual,
      estado_nuevo: nuevo_estado,
      comentario_agregado: true
    });
    
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    res.status(500).json({ 
      error: 'Error al cambiar estado del reporte' 
    });
  }
};

// Agregar seguimiento/comentario a reporte CON COMENTARIOS DINÁMICOS - ACTUALIZADO
const agregarSeguimiento = async (req, res) => {
  const { id } = req.params;
  const { comentario, tiempo_invertido_horas, accion_tomada } = req.body;
  const tecnicoId = req.user.id; // CORREGIDO: usar req.user
  
  try {
    // Verificar que el reporte está asignado a este técnico
    const verificarQuery = `
      SELECT r.*, er.nombre as estado_actual, a.nombre as tecnico_nombre, a.apellido as tecnico_apellido
      FROM reportes r
      JOIN estados_reporte er ON r.id_estado = er.id
      JOIN administradores a ON r.id_administrador_asignado = a.id
      WHERE r.id = $1 AND r.id_administrador_asignado = $2 AND r.estado = TRUE
    `;
    
    const verificarResult = await pool.query(verificarQuery, [id, tecnicoId]);
    
    if (verificarResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Reporte no encontrado o no asignado a este técnico' 
      });
    }

    const reporte = verificarResult.rows[0];
    
    // NUEVO: Crear comentario en sistema universal en lugar de seguimiento_reportes
    if (comentario && comentario.trim()) {
      let comentarioCompleto = comentario.trim();
      
      // Agregar información adicional si se proporciona
      if (accion_tomada) {
        comentarioCompleto = `${accion_tomada}: ${comentarioCompleto}`;
      }
      
      if (tiempo_invertido_horas) {
        comentarioCompleto += ` (Tiempo invertido: ${tiempo_invertido_horas}h)`;
      }

      await pool.query(`
        INSERT INTO comentarios_reportes (
          id_reporte, id_administrador, tipo_usuario_comentario, 
          nombre_usuario, comentario, es_interno, usuario_ingreso
        ) VALUES ($1, $2, 'tecnico', $3, $4, FALSE, $5)
      `, [
        id,
        tecnicoId,
        `${reporte.tecnico_nombre} ${reporte.tecnico_apellido}`,
        `🔧 PROGRESO: ${comentarioCompleto}`,
        `tecnico_${tecnicoId}`
      ]);
    }
    
    res.json({
      success: true,
      message: 'Seguimiento agregado exitosamente',
      comentario_agregado: !!(comentario && comentario.trim())
    });
    
  } catch (error) {
    console.error('Error al agregar seguimiento:', error);
    res.status(500).json({ 
      error: 'Error al agregar seguimiento' 
    });
  }
};

// Obtener historial de seguimiento de un reporte - ACTUALIZADO PARA COMENTARIOS
const getHistorialReporte = async (req, res) => {
  const { id } = req.params;
  const tecnicoId = req.user.id; // CORREGIDO: usar req.user
  
  try {
    // Verificar acceso al reporte (debe estar asignado al técnico o ser de su departamento)
    const verificarQuery = `
      SELECT 1 FROM reportes r
      JOIN tipos_problema tp ON r.id_tipo_problema = tp.id
      JOIN administradores a ON r.id_administrador_asignado = a.id
      WHERE r.id = $1 AND (
        r.id_administrador_asignado = $2 OR 
        tp.departamento_responsable = (
          SELECT departamento FROM administradores WHERE id = $2
        )
      )
    `;
    
    const acceso = await pool.query(verificarQuery, [id, tecnicoId]);
    
    if (acceso.rows.length === 0) {
      return res.status(403).json({ error: 'Sin acceso a este reporte' });
    }
    
    // NUEVO: Obtener comentarios públicos en lugar de seguimiento_reportes
    const comentariosQuery = `
      SELECT 
        cr.id,
        cr.comentario,
        cr.fecha_comentario,
        cr.tipo_usuario_comentario,
        cr.nombre_usuario,
        cr.es_interno,
        
        -- Información del reporte
        r.numero_reporte,
        r.titulo as titulo_reporte
        
      FROM comentarios_reportes cr
      INNER JOIN reportes r ON cr.id_reporte = r.id
      WHERE cr.id_reporte = $1 
        AND cr.estado = TRUE
        AND cr.es_interno = FALSE
      ORDER BY cr.fecha_comentario DESC
    `;
    
    const comentariosResult = await pool.query(comentariosQuery, [id]);
    
    res.json({
      success: true,
      historial: comentariosResult.rows,
      tipo: 'comentarios_publicos',
      total: comentariosResult.rows.length
    });
    
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ 
      error: 'Error al obtener historial del reporte' 
    });
  }
};

// Obtener estadísticas del técnico - CON COMENTARIOS
const getEstadisticasTecnico = async (req, res) => {
  const tecnicoId = req.user.id; // CORREGIDO: usar req.user
  
  try {
    const statsQuery = `
      SELECT 
        COUNT(*) as total_asignados,
        COUNT(*) FILTER (WHERE er.nombre = 'Asignado') as pendientes,
        COUNT(*) FILTER (WHERE er.nombre = 'En Proceso') as en_proceso,
        COUNT(*) FILTER (WHERE er.nombre = 'Pendiente Materiales') as pendiente_materiales,
        COUNT(*) FILTER (WHERE er.nombre = 'Resuelto') as resueltos,
        COUNT(*) FILTER (WHERE r.prioridad = 'Alta') as criticos,
        AVG(EXTRACT(DAYS FROM (r.fecha_resolucion - r.fecha_asignacion))) FILTER (WHERE er.nombre = 'Resuelto') as promedio_dias_resolucion,
        -- NUEVO: Estadísticas de comentarios del técnico
        (SELECT COUNT(*) FROM comentarios_reportes cr 
         INNER JOIN reportes r2 ON cr.id_reporte = r2.id 
         WHERE r2.id_administrador_asignado = $1 AND cr.tipo_usuario_comentario = 'tecnico' AND cr.estado = TRUE) as comentarios_realizados
      FROM reportes r
      JOIN estados_reporte er ON r.id_estado = er.id
      WHERE r.id_administrador_asignado = $1 AND r.estado = TRUE
    `;
    
    const statsResult = await pool.query(statsQuery, [tecnicoId]);
    
    res.json({
      success: true,
      estadisticas: {
        ...statsResult.rows[0],
        comentarios_enabled: true
      }
    });
    
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ 
      error: 'Error al obtener estadísticas' 
    });
  }
};

// NUEVA FUNCIÓN: Obtener todos los reportes completados para validación histórica
const getReportesCompletados = async (req, res) => {
  const tecnicoId = req.user.id;
  const { page = 1, limit = 10 } = req.query;
  
  try {
    const offset = (page - 1) * limit;
    
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
        r.fecha_resolucion,
        
        er.nombre as estado,
        tp.nombre as tipo_problema,
        z.nombre as zona,
        
        -- Información del ciudadano/creador
        CASE 
          WHEN r.tipo_usuario_creador = 'ciudadano' THEN c.nombre || ' ' || c.apellido
          WHEN r.tipo_usuario_creador = 'lider' THEN u.nombre || ' ' || u.apellido
          ELSE 'Usuario desconocido'
        END as reportado_por,
        
        -- Días para resolución
        EXTRACT(DAYS FROM (r.fecha_resolucion - r.fecha_asignacion)) as dias_resolucion,
        
        -- Contador de comentarios
        (
          SELECT COUNT(*) 
          FROM comentarios_reportes cr 
          WHERE cr.id_reporte = r.id 
            AND cr.es_interno = FALSE 
            AND cr.estado = TRUE
        ) as comentarios_count
        
      FROM reportes r
      JOIN estados_reporte er ON r.id_estado = er.id
      JOIN tipos_problema tp ON r.id_tipo_problema = tp.id
      LEFT JOIN ciudadanos_colaboradores c ON r.id_ciudadano_colaborador = c.id
      LEFT JOIN usuarios u ON r.id_usuario = u.id
      LEFT JOIN zonas z ON r.id_zona = z.id
      WHERE r.id_administrador_asignado = $1 
        AND r.estado = TRUE
        AND er.nombre IN ('Resuelto', 'Cerrado')
      ORDER BY r.fecha_resolucion DESC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await pool.query(query, [tecnicoId, limit, offset]);
    
    // Contar total
    const countQuery = `
      SELECT COUNT(*) as total
      FROM reportes r
      JOIN estados_reporte er ON r.id_estado = er.id
      WHERE r.id_administrador_asignado = $1 
        AND r.estado = TRUE
        AND er.nombre IN ('Resuelto', 'Cerrado')
    `;
    
    const countResult = await pool.query(countQuery, [tecnicoId]);
    
    res.json({
      success: true,
      reportes_completados: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].total),
        pages: Math.ceil(countResult.rows[0].total / limit)
      }
    });
    
  } catch (error) {
    console.error('Error al obtener reportes completados:', error);
    res.status(500).json({ 
      error: 'Error al obtener reportes completados' 
    });
  }
};

module.exports = {
  getMisReportes,
  getReporteDetalle,       // NUEVO MÉTODO
  cambiarEstadoReporte,    // ✅ ACTUALIZADO CON COMENTARIOS DINÁMICOS
  agregarSeguimiento,      // ✅ ACTUALIZADO CON COMENTARIOS DINÁMICOS
  getHistorialReporte,     // ✅ ACTUALIZADO PARA COMENTARIOS
  getEstadisticasTecnico,  // ✅ ACTUALIZADO CON ESTADÍSTICAS DE COMENTARIOS
  getReportesCompletados   // NUEVA FUNCIÓN
};