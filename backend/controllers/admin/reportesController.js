// backend/controllers/admin/reportesController.js - CORREGIDO PARA FLUJO CORRECTO
const pool = require('../../models/db');

// Obtener SOLO reportes "Aprobados por Líder" (FLUJO CORRECTO)
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
        er.nombre as estado,
        tp.nombre as tipo_problema,
        tp.departamento_responsable,
        CASE 
          WHEN r.tipo_usuario_creador = 'lider' THEN u.nombre || ' ' || u.apellido
          WHEN r.tipo_usuario_creador = 'ciudadano' THEN c.nombre || ' ' || c.apellido
          ELSE 'Usuario desconocido'
        END as ciudadano_creador,
        CASE 
          WHEN r.id_administrador_asignado IS NOT NULL THEN a.nombre || ' ' || a.apellido
          ELSE 'Sin asignar'
        END as tecnico_asignado,
        z.nombre as zona
      FROM reportes r
      LEFT JOIN estados_reporte er ON r.id_estado = er.id
      LEFT JOIN tipos_problema tp ON r.id_tipo_problema = tp.id
      LEFT JOIN usuarios u ON r.id_usuario = u.id
      LEFT JOIN ciudadanos_colaboradores c ON r.id_ciudadano_colaborador = c.id
      LEFT JOIN administradores a ON r.id_administrador_asignado = a.id
      LEFT JOIN zonas z ON r.id_zona = z.id
      WHERE r.estado = TRUE 
        AND er.nombre = 'Aprobado por Líder'
      ORDER BY r.fecha_reporte DESC
    `;
    
    const result = await pool.query(query);
    
    res.json({
      success: true,
      reportes: result.rows,
      mensaje: `Se encontraron ${result.rows.length} reportes aprobados por líderes esperando asignación`
    });
  } catch (error) {
    console.error('Error al obtener reportes aprobados:', error);
    res.status(500).json({ 
      error: 'Error al obtener reportes aprobados por líderes' 
    });
  }
};

// Asignar reporte a técnico Y cambiar estado automáticamente (FLUJO CORRECTO)
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
      error: 'Error al asignar reporte' 
    });
  }
};

// Cambiar estado de reporte (VALIDACIÓN MEJORADA)
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
      error: 'Error al cambiar estado' 
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
      error: 'Error al cambiar prioridad' 
    });
  }
};

// Obtener datos para selects Y estadísticas específicas (MEJORADO)
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
    
    // NUEVO: Estadísticas específicas para el dashboard
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
      error: 'Error al obtener datos' 
    });
  }
};

module.exports = {
  getReportes,
  asignarReporte,
  cambiarEstado,
  cambiarPrioridad,
  getDatosSelect
};