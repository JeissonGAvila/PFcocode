const pool = require('../models/db');

// Obtener todos los tipos de problema
const getTiposProblema = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tipos_problema WHERE estado = TRUE ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener tipos de problema:', error);
    res.status(500).json({ error: 'Error al obtener tipos de problema' });
  }
};

// Crear un nuevo tipo de problema
const createTipoProblema = async (req, res) => {
  const { nombre, descripcion, usuario_ingreso } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO tipos_problema (nombre, descripcion, usuario_ingreso) VALUES ($1, $2, $3) RETURNING *',
      [nombre, descripcion, usuario_ingreso]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear tipo de problema:', error);
    res.status(500).json({ error: 'Error al crear tipo de problema' });
  }
};

// Editar un tipo de problema
const updateTipoProblema = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, usuario_modifica } = req.body;
  try {
    const result = await pool.query(
      'UPDATE tipos_problema SET nombre = $1, descripcion = $2, usuario_modifica = $3, fecha_modifica = CURRENT_TIMESTAMP WHERE id = $4 AND estado = TRUE RETURNING *',
      [nombre, descripcion, usuario_modifica, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tipo de problema no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar tipo de problema:', error);
    res.status(500).json({ error: 'Error al actualizar tipo de problema' });
  }
};

// Borrado lógico (desactivar tipo de problema)
const deleteTipoProblema = async (req, res) => {
    const { id } = req.params;
    const { usuario_modifica } = req.body; //Aqui maneje quien 
  
    try {
      const result = await pool.query(
        'UPDATE tipos_problema SET estado = FALSE, usuario_modifica = $1, fecha_modifica = CURRENT_TIMESTAMP WHERE id = $2 AND estado = TRUE RETURNING *',
        [usuario_modifica || 'admin', id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Tipo de problema no encontrado o ya desactivado' });
      }
      res.json({ message: 'Tipo de problema desactivado', tipo_problema: result.rows[0] });
    } catch (error) {
      console.error('Error al desactivar tipo de problema:', error);
      res.status(500).json({ error: 'Error al desactivar tipo de problema' });
    }
  };

module.exports = {
  getTiposProblema,
  createTipoProblema,
  updateTipoProblema,
  deleteTipoProblema,
};

