// backend/controllers/tecnico/reportesController.js
const pool = require('../../models/db');

// Obtener reportes asignados al técnico (SOLO de su departamento)
const getMisReportes = async (req, res) => {
  try {
    // El técnico debe estar autenticado, su ID viene del middleware de auth
    const tecnicoId = req.user?.id || req.params.tecnicoId; // Ajustar según tu sistema de auth
    
    if (!tecnicoId) {
      return res.status(401).json({ error: 'Técnico no autenticado' });
    }

    // Verificar que es técnico y obtener su departamento
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
    
    // Obtener reportes SOLO de su departamento Y que estén asignados
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
        z.nombre as zona,
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
    
    res.json({
      success: true,
      tecnico: {
        nombre: `${tecnico.nombre} ${tecnico.apellido}`,
        departamento: tecnico.departamento,
        correo: tecnico.correo
      },
      reportes: reportesResult.rows,
      estadisticas: {
        total_asignados: reportesResult.rows.length,
        pendientes: reportesResult.rows.filter(r => r.estado === 'Asignado').length,
        en_proceso: reportesResult.rows.filter(r => r.estado === 'En Proceso').length,
        pendiente_materiales: reportesResult.rows.filter(r => r.estado === 'Pendiente Materiales').length
      }
    });
  } catch (error) {
    console.error('Error al obtener reportes del técnico:', error);
    res.status(500).json({ 
      error: 'Error al obtener reportes asignados' 
    });
  }
};

// Cambiar estado de reporte (SOLO estados permitidos para técnico)
const cambiarEstadoReporte = async (req, res) => {
  const { id } = req.params;
  const { nuevo_estado, comentario } = req.body;
  const tecnicoId = req.user?.id || req.body.tecnico_id;
  
  try {
    // Verificar que el reporte está asignado a este técnico
    const verificarQuery = `
      SELECT r.*, er.nombre as estado_actual, tp.departamento_responsable,
             a.departamento as tecnico_departamento
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
    
    // Registrar en seguimiento si hay comentario
    if (comentario) {
      const seguimientoQuery = `
        INSERT INTO seguimiento_reportes (
          id_reporte, id_administrador, tipo_usuario_seguimiento,
          estado_anterior, estado_nuevo, comentario, 
          tipo_seguimiento, usuario_ingreso
        ) VALUES ($1, $2, 'tecnico', $3, $4, $5, $6, $7)
      `;
      
      const tipoSeguimiento = nuevo_estado === 'Resuelto' ? 'resolucion' : 'actualizacion';
      
      await pool.query(seguimientoQuery, [
        id, tecnicoId, 
        (await pool.query('SELECT id FROM estados_reporte WHERE nombre = $1', [reporte.estado_actual])).rows[0].id,
        nuevoEstadoId, 
        comentario, 
        tipoSeguimiento,
        `tecnico_${tecnicoId}`
      ]);
    }
    
    res.json({
      success: true,
      message: `Estado cambiado exitosamente a "${nuevo_estado}"`,
      reporte: updateResult.rows[0],
      estado_anterior: reporte.estado_actual,
      estado_nuevo: nuevo_estado
    });
    
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    res.status(500).json({ 
      error: 'Error al cambiar estado del reporte' 
    });
  }
};

// Agregar seguimiento/comentario a reporte
const agregarSeguimiento = async (req, res) => {
  const { id } = req.params;
  const { comentario, tiempo_invertido_horas, accion_tomada } = req.body;
  const tecnicoId = req.user?.id || req.body.tecnico_id;
  
  try {
    // Verificar que el reporte está asignado a este técnico
    const verificarQuery = `
      SELECT r.*, er.nombre as estado_actual
      FROM reportes r
      JOIN estados_reporte er ON r.id_estado = er.id
      WHERE r.id = $1 AND r.id_administrador_asignado = $2 AND r.estado = TRUE
    `;
    
    const verificarResult = await pool.query(verificarQuery, [id, tecnicoId]);
    
    if (verificarResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Reporte no encontrado o no asignado a este técnico' 
      });
    }
    
    // Insertar seguimiento
    const seguimientoQuery = `
      INSERT INTO seguimiento_reportes (
        id_reporte, id_administrador, tipo_usuario_seguimiento,
        comentario, accion_tomada, tiempo_invertido_horas,
        tipo_seguimiento, usuario_ingreso
      ) VALUES ($1, $2, 'tecnico', $3, $4, $5, 'actualizacion', $6)
      RETURNING *
    `;
    
    const seguimientoResult = await pool.query(seguimientoQuery, [
      id, tecnicoId, comentario, accion_tomada, 
      tiempo_invertido_horas, `tecnico_${tecnicoId}`
    ]);
    
    res.json({
      success: true,
      message: 'Seguimiento agregado exitosamente',
      seguimiento: seguimientoResult.rows[0]
    });
    
  } catch (error) {
    console.error('Error al agregar seguimiento:', error);
    res.status(500).json({ 
      error: 'Error al agregar seguimiento' 
    });
  }
};

// Obtener historial de seguimiento de un reporte
const getHistorialReporte = async (req, res) => {
  const { id } = req.params;
  const tecnicoId = req.user?.id || req.params.tecnicoId;
  
  try {
    // Verificar acceso al reporte
    const verificarQuery = `
      SELECT 1 FROM reportes r
      JOIN tipos_problema tp ON r.id_tipo_problema = tp.id
      JOIN administradores a ON r.id_administrador_asignado = a.id
      WHERE r.id = $1 AND (r.id_administrador_asignado = $2 OR a.departamento = (
        SELECT departamento FROM administradores WHERE id = $2
      ))
    `;
    
    const acceso = await pool.query(verificarQuery, [id, tecnicoId]);
    
    if (acceso.rows.length === 0) {
      return res.status(403).json({ error: 'Sin acceso a este reporte' });
    }
    
    // Obtener historial
    const historialQuery = `
      SELECT 
        s.*,
        ea.nombre as estado_anterior_nombre,
        en.nombre as estado_nuevo_nombre,
        CASE 
          WHEN s.tipo_usuario_seguimiento = 'tecnico' THEN a.nombre || ' ' || a.apellido
          WHEN s.tipo_usuario_seguimiento = 'administrador' THEN a2.nombre || ' ' || a2.apellido
          WHEN s.tipo_usuario_seguimiento = 'lider' THEN u.nombre || ' ' || u.apellido
          ELSE 'Usuario desconocido'
        END as usuario_seguimiento
      FROM seguimiento_reportes s
      LEFT JOIN estados_reporte ea ON s.estado_anterior = ea.id
      LEFT JOIN estados_reporte en ON s.estado_nuevo = en.id
      LEFT JOIN administradores a ON s.id_administrador = a.id AND s.tipo_usuario_seguimiento = 'tecnico'
      LEFT JOIN administradores a2 ON s.id_administrador = a2.id AND s.tipo_usuario_seguimiento = 'administrador'
      LEFT JOIN usuarios u ON s.id_lider = u.id AND s.tipo_usuario_seguimiento = 'lider'
      WHERE s.id_reporte = $1 AND s.estado = TRUE
      ORDER BY s.fecha_seguimiento DESC
    `;
    
    const historialResult = await pool.query(historialQuery, [id]);
    
    res.json({
      success: true,
      historial: historialResult.rows
    });
    
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ 
      error: 'Error al obtener historial del reporte' 
    });
  }
};

// Obtener estadísticas del técnico
const getEstadisticasTecnico = async (req, res) => {
  const tecnicoId = req.user?.id || req.params.tecnicoId;
  
  try {
    const statsQuery = `
      SELECT 
        COUNT(*) as total_asignados,
        COUNT(*) FILTER (WHERE er.nombre = 'Asignado') as pendientes,
        COUNT(*) FILTER (WHERE er.nombre = 'En Proceso') as en_proceso,
        COUNT(*) FILTER (WHERE er.nombre = 'Pendiente Materiales') as pendiente_materiales,
        COUNT(*) FILTER (WHERE er.nombre = 'Resuelto') as resueltos,
        COUNT(*) FILTER (WHERE r.prioridad = 'Alta') as criticos,
        AVG(EXTRACT(DAYS FROM (r.fecha_resolucion - r.fecha_asignacion))) FILTER (WHERE er.nombre = 'Resuelto') as promedio_dias_resolucion
      FROM reportes r
      JOIN estados_reporte er ON r.id_estado = er.id
      WHERE r.id_administrador_asignado = $1 AND r.estado = TRUE
    `;
    
    const statsResult = await pool.query(statsQuery, [tecnicoId]);
    
    res.json({
      success: true,
      estadisticas: statsResult.rows[0]
    });
    
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ 
      error: 'Error al obtener estadísticas' 
    });
  }
};

module.exports = {
  getMisReportes,
  cambiarEstadoReporte,
  agregarSeguimiento,
  getHistorialReporte,
  getEstadisticasTecnico
};