const pool = require('../models/db');

// Obtener todas las categorías de problema
const getCategoriasProblema = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categorias_problema WHERE estado = TRUE ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener categorías de problema:', error);
    res.status(500).json({ error: 'Error al obtener categorías de problema' });
  }
};

// Crear una nueva categoría de problema
const createCategoriaProblema = async (req, res) => {
  const { nombre, descripcion, icono, color, usuario_ingreso } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO categorias_problema (nombre, descripcion, icono, color, usuario_ingreso) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [nombre, descripcion, icono, color, usuario_ingreso]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear categoría de problema:', error);
    res.status(500).json({ error: 'Error al crear categoría de problema' });
  }
};

// Editar una categoría de problema
const updateCategoriaProblema = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, icono, color, usuario_modifica } = req.body;
  try {
    const result = await pool.query(
      'UPDATE categorias_problema SET nombre = $1, descripcion = $2, icono = $3, color = $4, usuario_modifica = $5, fecha_modifica = CURRENT_TIMESTAMP WHERE id = $6 AND estado = TRUE RETURNING *',
      [nombre, descripcion, icono, color, usuario_modifica, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Categoría de problema no encontrada' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar categoría de problema:', error);
    res.status(500).json({ error: 'Error al actualizar categoría de problema' });
  }
};

// Borrado lógico (desactivar categoría de problema)
const deleteCategoriaProblema = async (req, res) => {
  const { id } = req.params;
  const { usuario_modifica } = req.body;

  try {
    const result = await pool.query(
      'UPDATE categorias_problema SET estado = FALSE, usuario_modifica = $1, fecha_modifica = CURRENT_TIMESTAMP WHERE id = $2 AND estado = TRUE RETURNING *',
      [usuario_modifica || 'admin', id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Categoría de problema no encontrada o ya desactivada' });
    }
    res.json({ message: 'Categoría de problema desactivada', categoria: result.rows[0] });
  } catch (error) {
    console.error('Error al desactivar categoría de problema:', error);
    res.status(500).json({ error: 'Error al desactivar categoría de problema' });
  }
};

module.exports = {
  getCategoriasProblema,
  createCategoriaProblema,
  updateCategoriaProblema,
  deleteCategoriaProblema,
};