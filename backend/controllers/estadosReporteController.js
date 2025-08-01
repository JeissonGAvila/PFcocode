const pool = require('../models/db');

// Obtener todos los estados de reporte
const getEstadosReporte = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM estados_reporte WHERE estado = TRUE ORDER BY orden, id');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener estados de reporte:', error);
    res.status(500).json({ error: 'Error al obtener estados de reporte' });
  }
};

// Crear un nuevo estado de reporte
const createEstadoReporte = async (req, res) => {
  const { nombre, descripcion, color, orden, es_final, usuario_ingreso } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO estados_reporte (nombre, descripcion, color, orden, es_final, usuario_ingreso) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [nombre, descripcion, color, orden, es_final, usuario_ingreso]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear estado de reporte:', error);
    res.status(500).json({ error: 'Error al crear estado de reporte' });
  }
};

// Editar un estado de reporte
const updateEstadoReporte = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, color, orden, es_final, usuario_modifica } = req.body;
  try {
    const result = await pool.query(
      'UPDATE estados_reporte SET nombre = $1, descripcion = $2, color = $3, orden = $4, es_final = $5, usuario_modifica = $6, fecha_modifica = CURRENT_TIMESTAMP WHERE id = $7 AND estado = TRUE RETURNING *',
      [nombre, descripcion, color, orden, es_final, usuario_modifica, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Estado de reporte no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar estado de reporte:', error);
    res.status(500).json({ error: 'Error al actualizar estado de reporte' });
  }
};

// Borrado lógico (desactivar estado de reporte)
const deleteEstadoReporte = async (req, res) => {
  const { id } = req.params;
  const { usuario_modifica } = req.body;

  try {
    const result = await pool.query(
      'UPDATE estados_reporte SET estado = FALSE, usuario_modifica = $1, fecha_modifica = CURRENT_TIMESTAMP WHERE id = $2 AND estado = TRUE RETURNING *',
      [usuario_modifica || 'admin', id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Estado de reporte no encontrado o ya desactivado' });
    }
    res.json({ message: 'Estado de reporte desactivado', estado: result.rows[0] });
  } catch (error) {
    console.error('Error al desactivar estado de reporte:', error);
    res.status(500).json({ error: 'Error al desactivar estado de reporte' });
  }
};

module.exports = {
  getEstadosReporte,
  createEstadoReporte,
  updateEstadoReporte,
  deleteEstadoReporte,
};