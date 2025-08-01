
const pool = require('../models/db');

// Obtener todos los administradores (SIN mostrar contraseñas)
const getAdministradores = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, nombre, apellido, correo, telefono, rol, departamento, 
             puede_asignar, zonas_responsabilidad, ultimo_acceso,
             fecha_ingreso, usuario_ingreso, fecha_modifica, usuario_modifica
      FROM administradores 
      WHERE estado = TRUE 
      ORDER BY nombre, apellido
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener administradores:', error);
    res.status(500).json({ error: 'Error al obtener administradores' });
  }
};

// Crear un nuevo administrador
const createAdministrador = async (req, res) => {
  const { 
    nombre, apellido, correo, contrasena, telefono, 
    rol, departamento, puede_asignar, zonas_responsabilidad, 
    usuario_ingreso 
  } = req.body;
  
  try {
    // TODO: En producción, hashear la contraseña antes de guardar
    // const hashedPassword = await bcrypt.hash(contrasena, 10);
    
    const result = await pool.query(
      `INSERT INTO administradores 
       (nombre, apellido, correo, contrasena, telefono, rol, departamento, 
        puede_asignar, zonas_responsabilidad, usuario_ingreso) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING id, nombre, apellido, correo, telefono, rol, departamento, 
                 puede_asignar, zonas_responsabilidad, fecha_ingreso`,
      [nombre, apellido, correo, contrasena, telefono, rol, departamento, 
       puede_asignar, zonas_responsabilidad, usuario_ingreso]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear administrador:', error);
    if (error.code === '23505') { // Unique violation
      res.status(400).json({ error: 'El correo electrónico ya está registrado' });
    } else {
      res.status(500).json({ error: 'Error al crear administrador' });
    }
  }
};

// Editar un administrador
const updateAdministrador = async (req, res) => {
  const { id } = req.params;
  const { 
    nombre, apellido, correo, telefono, 
    rol, departamento, puede_asignar, zonas_responsabilidad, 
    usuario_modifica 
  } = req.body;
  
  try {
    const result = await pool.query(
      `UPDATE administradores 
       SET nombre = $1, apellido = $2, correo = $3, telefono = $4, 
           rol = $5, departamento = $6, puede_asignar = $7, 
           zonas_responsabilidad = $8, usuario_modifica = $9, 
           fecha_modifica = CURRENT_TIMESTAMP 
       WHERE id = $10 AND estado = TRUE 
       RETURNING id, nombre, apellido, correo, telefono, rol, departamento, 
                 puede_asignar, zonas_responsabilidad, fecha_modifica`,
      [nombre, apellido, correo, telefono, rol, departamento, 
       puede_asignar, zonas_responsabilidad, usuario_modifica, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Administrador no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar administrador:', error);
    if (error.code === '23505') { // Unique violation
      res.status(400).json({ error: 'El correo electrónico ya está registrado' });
    } else {
      res.status(500).json({ error: 'Error al actualizar administrador' });
    }
  }
};

// Cambiar contraseña de administrador
const updatePassword = async (req, res) => {
  const { id } = req.params;
  const { nueva_contrasena, usuario_modifica } = req.body;
  
  try {
    // TODO: En producción, hashear la nueva contraseña
    // const hashedPassword = await bcrypt.hash(nueva_contrasena, 10);
    
    const result = await pool.query(
      `UPDATE administradores 
       SET contrasena = $1, usuario_modifica = $2, fecha_modifica = CURRENT_TIMESTAMP 
       WHERE id = $3 AND estado = TRUE 
       RETURNING id, nombre, apellido, correo`,
      [nueva_contrasena, usuario_modifica, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Administrador no encontrado' });
    }
    res.json({ message: 'Contraseña actualizada exitosamente', administrador: result.rows[0] });
  } catch (error) {
    console.error('Error al actualizar contraseña:', error);
    res.status(500).json({ error: 'Error al actualizar contraseña' });
  }
};

// Borrado lógico (desactivar administrador)
const deleteAdministrador = async (req, res) => {
  const { id } = req.params;
  const { usuario_modifica } = req.body;

  try {
    const result = await pool.query(
      `UPDATE administradores 
       SET estado = FALSE, usuario_modifica = $1, fecha_modifica = CURRENT_TIMESTAMP 
       WHERE id = $2 AND estado = TRUE 
       RETURNING id, nombre, apellido, correo`,
      [usuario_modifica || 'admin', id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Administrador no encontrado o ya desactivado' });
    }
    res.json({ message: 'Administrador desactivado', administrador: result.rows[0] });
  } catch (error) {
    console.error('Error al desactivar administrador:', error);
    res.status(500).json({ error: 'Error al desactivar administrador' });
  }
};

module.exports = {
  getAdministradores,
  createAdministrador,
  updateAdministrador,
  updatePassword,
  deleteAdministrador,
};