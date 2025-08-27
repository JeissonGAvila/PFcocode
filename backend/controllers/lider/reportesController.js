// backend/controllers/lider/reportesController.js - CORREGIDO
const pool = require('../../models/db');

// 1. VER REPORTES PENDIENTES DE APROBACIÓN (Estado "Nuevo" de su zona)
const getReportesPendientesAprobacion = async (req, res) => {
  try {
    const liderId = req.user.id; // Del token JWT
    const zonaId = req.user.permisos.id_zona; // Zona del líder

    const query = `
      SELECT 
        r.id,
        r.numero_reporte,
        r.titulo,
        r.descripcion,
        cc.direccion,  -- CORREGIDO: cc.direccion en lugar de cc.direccion_completa
        r.prioridad,
        r.fecha_reporte,
        
        -- Datos del ciudadano que creó el reporte
        cc.nombre as ciudadano_nombre,
        cc.apellido as ciudadano_apellido, 
        cc.telefono as ciudadano_telefono,
        cc.correo as ciudadano_correo,
        
        -- Tipo de problema
        tp.nombre as tipo_problema,
        tp.descripcion as tipo_descripcion,
        tp.departamento_responsable,
        
        -- Estado actual
        er.nombre as estado_actual,
        
        -- Zona
        z.nombre as zona_nombre,
        z.numero_zona
        
      FROM reportes r
      INNER JOIN ciudadanos_colaboradores cc ON r.id_ciudadano_colaborador = cc.id
      INNER JOIN tipos_problema tp ON r.id_tipo_problema = tp.id
      INNER JOIN estados_reporte er ON r.id_estado = er.id
      INNER JOIN zonas z ON r.id_zona = z.id
      
      WHERE r.id_zona = $1 
        AND er.nombre = 'Nuevo'
        AND r.estado = TRUE
        
      ORDER BY r.fecha_reporte DESC, r.prioridad DESC
    `;

    const result = await pool.query(query, [zonaId]);

    res.json({
      success: true,
      message: `Reportes pendientes de aprobación en zona ${zonaId}`,
      reportes: result.rows,
      total: result.rows.length
    });

  } catch (error) {
    console.error('Error al obtener reportes pendientes:', error);
    res.status(500).json({ 
      error: 'Error al obtener reportes pendientes de aprobación',
      details: error.message 
    });
  }
};

// 2. APROBAR REPORTE (Cambiar de "Nuevo" a "Aprobado por Líder")
const aprobarReporte = async (req, res) => {
  try {
    const { reporteId } = req.params;
    const { comentario_lider } = req.body;
    const liderId = req.user.id;
    const zonaId = req.user.permisos.id_zona;

    // Verificar que el reporte pertenezca a la zona del líder
    const verificarQuery = `
      SELECT r.id, r.id_zona, er.nombre as estado_actual
      FROM reportes r
      INNER JOIN estados_reporte er ON r.id_estado = er.id
      WHERE r.id = $1 AND r.id_zona = $2 AND r.estado = TRUE
    `;
    
    const verificarResult = await pool.query(verificarQuery, [reporteId, zonaId]);
    
    if (verificarResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Reporte no encontrado en tu zona' 
      });
    }
    
    if (verificarResult.rows[0].estado_actual !== 'Nuevo') {
      return res.status(400).json({ 
        error: `El reporte ya está en estado: ${verificarResult.rows[0].estado_actual}` 
      });
    }

    // Obtener ID del estado "Aprobado por Líder"
    const estadoQuery = `SELECT id FROM estados_reporte WHERE nombre = 'Aprobado por Líder'`;
    const estadoResult = await pool.query(estadoQuery);
    
    if (estadoResult.rows.length === 0) {
      return res.status(500).json({ 
        error: 'Estado "Aprobado por Líder" no configurado en el sistema' 
      });
    }
    
    const estadoAprobadoId = estadoResult.rows[0].id;

    // Actualizar el reporte
    const updateQuery = `
      UPDATE reportes 
      SET 
        id_estado = $1,
        id_lider_coordinador = $2,
        fecha_modifica = CURRENT_TIMESTAMP,
        usuario_modifica = $3
      WHERE id = $4 AND estado = TRUE
      RETURNING id, numero_reporte, titulo
    `;
    
    const updateResult = await pool.query(updateQuery, [
      estadoAprobadoId, 
      liderId, 
      `lider_${liderId}`,
      reporteId
    ]);

    // Crear registro de seguimiento
    const seguimientoQuery = `
      INSERT INTO seguimiento_reportes (
        id_reporte, id_lider, tipo_usuario_seguimiento,
        estado_anterior, estado_nuevo, tipo_seguimiento,
        comentario, accion_tomada, usuario_ingreso
      ) VALUES ($1, $2, $3, 
        (SELECT id FROM estados_reporte WHERE nombre = 'Nuevo'),
        $4, 'aprobacion_lider', $5, 'Reporte aprobado por líder COCODE', $6)
    `;
    
    await pool.query(seguimientoQuery, [
      reporteId,
      liderId,
      'lider',
      estadoAprobadoId,
      comentario_lider || 'Reporte aprobado para revisión administrativa',
      `lider_${liderId}`
    ]);

    res.json({
      success: true,
      message: 'Reporte aprobado exitosamente',
      reporte: updateResult.rows[0],
      nuevo_estado: 'Aprobado por Líder'
    });

  } catch (error) {
    console.error('Error al aprobar reporte:', error);
    res.status(500).json({ 
      error: 'Error al aprobar el reporte',
      details: error.message 
    });
  }
};

// 3. RECHAZAR REPORTE (Cambiar de "Nuevo" a "Rechazado por Líder")
const rechazarReporte = async (req, res) => {
  try {
    const { reporteId } = req.params;
    const { motivo_rechazo, comentario_lider } = req.body;
    const liderId = req.user.id;
    const zonaId = req.user.permisos.id_zona;

    if (!motivo_rechazo) {
      return res.status(400).json({ 
        error: 'Motivo de rechazo es requerido' 
      });
    }

    // Verificar que el reporte pertenezca a la zona del líder
    const verificarQuery = `
      SELECT r.id, r.id_zona, er.nombre as estado_actual
      FROM reportes r
      INNER JOIN estados_reporte er ON r.id_estado = er.id
      WHERE r.id = $1 AND r.id_zona = $2 AND r.estado = TRUE
    `;
    
    const verificarResult = await pool.query(verificarQuery, [reporteId, zonaId]);
    
    if (verificarResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Reporte no encontrado en tu zona' 
      });
    }

    if (verificarResult.rows[0].estado_actual !== 'Nuevo') {
      return res.status(400).json({ 
        error: `El reporte ya está en estado: ${verificarResult.rows[0].estado_actual}` 
      });
    }

    // Obtener ID del estado "Rechazado por Líder"
    const estadoQuery = `SELECT id FROM estados_reporte WHERE nombre = 'Rechazado por Líder'`;
    const estadoResult = await pool.query(estadoQuery);
    
    if (estadoResult.rows.length === 0) {
      return res.status(500).json({ 
        error: 'Estado "Rechazado por Líder" no configurado en el sistema' 
      });
    }
    
    const estadoRechazadoId = estadoResult.rows[0].id;

    // Actualizar el reporte
    const updateQuery = `
      UPDATE reportes 
      SET 
        id_estado = $1,
        id_lider_coordinador = $2,
        fecha_modifica = CURRENT_TIMESTAMP,
        usuario_modifica = $3
      WHERE id = $4 AND estado = TRUE
      RETURNING id, numero_reporte, titulo
    `;
    
    const updateResult = await pool.query(updateQuery, [
      estadoRechazadoId, 
      liderId, 
      `lider_${liderId}`,
      reporteId
    ]);

    // Crear registro de seguimiento con el motivo en el comentario
    const seguimientoQuery = `
      INSERT INTO seguimiento_reportes (
        id_reporte, id_lider, tipo_usuario_seguimiento,
        estado_anterior, estado_nuevo, tipo_seguimiento,
        comentario, accion_tomada, usuario_ingreso
      ) VALUES ($1, $2, $3, 
        (SELECT id FROM estados_reporte WHERE nombre = 'Nuevo'),
        $4, 'rechazo_lider', $5, 'Reporte rechazado por líder COCODE', $6)
    `;
    
    await pool.query(seguimientoQuery, [
      reporteId,
      liderId,
      'lider',
      estadoRechazadoId,
      `${motivo_rechazo}. ${comentario_lider || ''}`,
      `lider_${liderId}`
    ]);

    res.json({
      success: true,
      message: 'Reporte rechazado exitosamente',
      reporte: updateResult.rows[0],
      motivo: motivo_rechazo,
      nuevo_estado: 'Rechazado por Líder'
    });

  } catch (error) {
    console.error('Error al rechazar reporte:', error);
    res.status(500).json({ 
      error: 'Error al rechazar el reporte',
      details: error.message 
    });
  }
};

// 4. VER REPORTES DE SU ZONA (todos los estados)
const getReportesZona = async (req, res) => {
  try {
    const liderId = req.user.id;
    const zonaId = req.user.permisos.id_zona;
    const { estado, page = 1, limit = 20 } = req.query;

    let whereClause = 'WHERE r.id_zona = $1 AND r.estado = TRUE';
    let params = [zonaId];

    // Filtro opcional por estado
    if (estado) {
      whereClause += ' AND er.nombre = $2';
      params.push(estado);
    }

    const offset = (page - 1) * limit;

    const query = `
      SELECT 
        r.id,
        r.numero_reporte,
        r.titulo,
        r.descripcion,
        cc.direccion,  -- CORREGIDO: cc.direccion
        r.prioridad,
        r.fecha_reporte,
        
        -- Datos del ciudadano
        cc.nombre as ciudadano_nombre,
        cc.apellido as ciudadano_apellido, 
        cc.telefono as ciudadano_telefono,
        
        -- Tipo de problema
        tp.nombre as tipo_problema,
        tp.departamento_responsable,
        
        -- Estado actual
        er.nombre as estado_actual,
        er.color as estado_color,
        
        -- Técnico asignado (si existe)
        ta.nombre as tecnico_nombre,
        ta.apellido as tecnico_apellido,
        
        -- Zona
        z.nombre as zona_nombre
        
      FROM reportes r
      INNER JOIN ciudadanos_colaboradores cc ON r.id_ciudadano_colaborador = cc.id
      INNER JOIN tipos_problema tp ON r.id_tipo_problema = tp.id
      INNER JOIN estados_reporte er ON r.id_estado = er.id
      INNER JOIN zonas z ON r.id_zona = z.id
      LEFT JOIN administradores ta ON r.id_administrador_asignado = ta.id
      
      ${whereClause}
      
      ORDER BY 
        CASE 
          WHEN er.nombre = 'Nuevo' THEN 1
          WHEN er.nombre = 'Aprobado por Líder' THEN 2
          WHEN er.nombre = 'Asignado' THEN 3
          WHEN er.nombre = 'En Proceso' THEN 4
          WHEN er.nombre = 'Resuelto' THEN 5
          ELSE 6
        END,
        r.fecha_reporte DESC
        
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    params.push(limit, offset);
    const result = await pool.query(query, params);

    // Contar total de reportes
    const countQuery = `
      SELECT COUNT(*) as total
      FROM reportes r
      INNER JOIN estados_reporte er ON r.id_estado = er.id
      ${whereClause}
    `;
    
    const countResult = await pool.query(countQuery, params.slice(0, -2));

    res.json({
      success: true,
      reportes: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].total),
        pages: Math.ceil(countResult.rows[0].total / limit)
      }
    });

  } catch (error) {
    console.error('Error al obtener reportes de zona:', error);
    res.status(500).json({ 
      error: 'Error al obtener reportes de la zona',
      details: error.message 
    });
  }
};

// 5. VALIDAR RESOLUCIÓN DE TÉCNICO (Cerrar reporte)
const validarResolucion = async (req, res) => {
  try {
    const { reporteId } = req.params;
    const { aprobado, comentario_validacion } = req.body;
    const liderId = req.user.id;
    const zonaId = req.user.permisos.id_zona;

    // Verificar que el reporte esté en estado "Resuelto"
    const verificarQuery = `
      SELECT r.id, r.id_zona, er.nombre as estado_actual, r.numero_reporte
      FROM reportes r
      INNER JOIN estados_reporte er ON r.id_estado = er.id
      WHERE r.id = $1 AND r.id_zona = $2 AND r.estado = TRUE
    `;
    
    const verificarResult = await pool.query(verificarQuery, [reporteId, zonaId]);
    
    if (verificarResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Reporte no encontrado en tu zona' 
      });
    }

    if (verificarResult.rows[0].estado_actual !== 'Resuelto') {
      return res.status(400).json({ 
        error: `El reporte debe estar en estado "Resuelto" para validar. Estado actual: ${verificarResult.rows[0].estado_actual}` 
      });
    }

    // Determinar nuevo estado
    const nuevoEstado = aprobado ? 'Cerrado' : 'Reabierto';
    
    // Obtener ID del nuevo estado
    const estadoQuery = `SELECT id FROM estados_reporte WHERE nombre = $1`;
    const estadoResult = await pool.query(estadoQuery, [nuevoEstado]);
    
    if (estadoResult.rows.length === 0) {
      return res.status(500).json({ 
        error: `Estado "${nuevoEstado}" no configurado en el sistema` 
      });
    }
    
    const nuevoEstadoId = estadoResult.rows[0].id;

    // Actualizar el reporte
    const updateQuery = `
      UPDATE reportes 
      SET 
        id_estado = $1,
        fecha_cierre = ${aprobado ? 'CURRENT_TIMESTAMP' : 'NULL'},
        fecha_modifica = CURRENT_TIMESTAMP,
        usuario_modifica = $2
      WHERE id = $3 AND estado = TRUE
      RETURNING id, numero_reporte, titulo
    `;
    
    const updateResult = await pool.query(updateQuery, [
      nuevoEstadoId, 
      `lider_${liderId}`,
      reporteId
    ]);

    // Crear registro de seguimiento
    const accionTomada = aprobado ? 
      'Resolución validada y reporte cerrado por líder COCODE' : 
      'Resolución rechazada - reporte reabierto por líder COCODE';

    const seguimientoQuery = `
      INSERT INTO seguimiento_reportes (
        id_reporte, id_lider, tipo_usuario_seguimiento,
        estado_anterior, estado_nuevo, tipo_seguimiento,
        comentario, accion_tomada, usuario_ingreso
      ) VALUES ($1, $2, $3, 
        (SELECT id FROM estados_reporte WHERE nombre = 'Resuelto'),
        $4, $5, $6, $7, $8)
    `;
    
    await pool.query(seguimientoQuery, [
      reporteId,
      liderId,
      'lider',
      nuevoEstadoId,
      aprobado ? 'validacion_resolucion' : 'rechazo_resolucion',
      comentario_validacion || `Resolución ${aprobado ? 'aprobada' : 'rechazada'} por líder`,
      accionTomada,
      `lider_${liderId}`
    ]);

    res.json({
      success: true,
      message: `Resolución ${aprobado ? 'validada' : 'rechazada'} exitosamente`,
      reporte: updateResult.rows[0],
      nuevo_estado: nuevoEstado,
      aprobado: aprobado
    });

  } catch (error) {
    console.error('Error al validar resolución:', error);
    res.status(500).json({ 
      error: 'Error al validar la resolución',
      details: error.message 
    });
  }
};

module.exports = {
  getReportesPendientesAprobacion,
  aprobarReporte,
  rechazarReporte,
  getReportesZona,
  validarResolucion
};