// backend/controllers/admin/reportesController.js
const pool = require('../../models/db');

// Obtener todos los reportes (admin ve TODOS)
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
      ORDER BY r.fecha_reporte DESC
    `;
    
    const result = await pool.query(query);
    
    res.json({
      success: true,
      reportes: result.rows
    });
  } catch (error) {
    console.error('Error al obtener reportes:', error);
    res.status(500).json({ 
      error: 'Error al obtener reportes' 
    });
  }
};

// Asignar reporte a técnico
const asignarReporte = async (req, res) => {
  const { id } = req.params;
  const { id_tecnico } = req.body;
  
  try {
    const updateQuery = `
      UPDATE reportes 
      SET 
        id_administrador_asignado = $1,
        fecha_modifica = NOW(),
        usuario_modifica = $2
      WHERE id = $3 AND estado = TRUE
      RETURNING *
    `;
    
    const result = await pool.query(updateQuery, [id_tecnico, 'admin', id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }
    
    res.json({
      success: true,
      message: 'Reporte asignado exitosamente',
      reporte: result.rows[0]
    });
  } catch (error) {
    console.error('Error al asignar reporte:', error);
    res.status(500).json({ 
      error: 'Error al asignar reporte' 
    });
  }
};

// Cambiar estado de reporte
const cambiarEstado = async (req, res) => {
  const { id } = req.params;
  const { id_estado } = req.body;
  
  try {
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
      message: 'Estado cambiado exitosamente',
      reporte: result.rows[0]
    });
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    res.status(500).json({ 
      error: 'Error al cambiar estado' 
    });
  }
};

// Cambiar prioridad
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

// Obtener datos para selects (técnicos, estados, etc.)
const getDatosSelect = async (req, res) => {
  try {
    // Obtener técnicos activos
    const tecnicosQuery = `
      SELECT id, nombre, apellido, departamento 
      FROM administradores 
      WHERE tipo_usuario = 'tecnico' AND estado = TRUE
      ORDER BY nombre
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
    
    res.json({
      success: true,
      tecnicos: tecnicosResult.rows,
      estados: estadosResult.rows,
      prioridades: ['Alta', 'Media', 'Baja']
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