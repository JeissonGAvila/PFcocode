const pool = require('../models/db');

// Obtener todas las zonas
const getZonas = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM zonas WHERE estado = TRUE ORDER BY numero_zona, id');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener zonas:', error);
    res.status(500).json({ error: 'Error al obtener zonas' });
  }
};

// Crear una nueva zona
const createZona = async (req, res) => {
  const { nombre, numero_zona, descripcion, poblacion_estimada, area_km2, coordenadas_centro, usuario_ingreso } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO zonas (nombre, numero_zona, descripcion, poblacion_estimada, area_km2, coordenadas_centro, usuario_ingreso) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [nombre, numero_zona, descripcion, poblacion_estimada, area_km2, coordenadas_centro, usuario_ingreso]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear zona:', error);
    res.status(500).json({ error: 'Error al crear zona' });
  }
};

// Editar una zona
const updateZona = async (req, res) => {
  const { id } = req.params;
  const { nombre, numero_zona, descripcion, poblacion_estimada, area_km2, coordenadas_centro, usuario_modifica } = req.body;
  try {
    const result = await pool.query(
      'UPDATE zonas SET nombre = $1, numero_zona = $2, descripcion = $3, poblacion_estimada = $4, area_km2 = $5, coordenadas_centro = $6, usuario_modifica = $7, fecha_modifica = CURRENT_TIMESTAMP WHERE id = $8 AND estado = TRUE RETURNING *',
      [nombre, numero_zona, descripcion, poblacion_estimada, area_km2, coordenadas_centro, usuario_modifica, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Zona no encontrada' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar zona:', error);
    res.status(500).json({ error: 'Error al actualizar zona' });
  }
};

// Borrado lógico (desactivar zona)
const deleteZona = async (req, res) => {
  const { id } = req.params;
  const { usuario_modifica } = req.body;

  try {
    const result = await pool.query(
      'UPDATE zonas SET estado = FALSE, usuario_modifica = $1, fecha_modifica = CURRENT_TIMESTAMP WHERE id = $2 AND estado = TRUE RETURNING *',
      [usuario_modifica || 'admin', id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Zona no encontrada o ya desactivada' });
    }
    res.json({ message: 'Zona desactivada', zona: result.rows[0] });
  } catch (error) {
    console.error('Error al desactivar zona:', error);
    res.status(500).json({ error: 'Error al desactivar zona' });
  }
};

module.exports = {
  getZonas,
  createZona,
  updateZona,
  deleteZona,
};