// backend/controllers/admin/tecnicosController.js - VERSIÓN COMPLETA CORREGIDA
const pool = require('../../models/db');
const bcrypt = require('bcrypt');

// 📋 LISTAR TODOS LOS TÉCNICOS
const getTecnicos = async (req, res) => {
  try {
    const query = `
      SELECT 
        id, nombre, apellido, correo, telefono, 
        departamento, rol, puede_asignar,
        estado, fecha_ingreso, fecha_modifica
      FROM administradores 
      WHERE tipo_usuario = 'tecnico' AND estado = TRUE
      ORDER BY nombre, apellido
    `;
    
    const result = await pool.query(query);
    
    res.json({
      success: true,
      data: result.rows,
      total: result.rows.length
    });
    
  } catch (error) {
    console.error('Error al obtener técnicos:', error);
    res.status(500).json({ 
      error: 'Error al obtener lista de técnicos',
      details: error.message 
    });
  }
};

// 📝 CREAR NUEVO TÉCNICO
const createTecnico = async (req, res) => {
  const { 
    nombre, apellido, correo, contrasena, telefono,
    departamento, rol, puede_asignar = false, usuario_ingreso
  } = req.body;

  try {
    // Validaciones básicas
    if (!nombre || !apellido || !correo || !contrasena || !departamento) {
      return res.status(400).json({ 
        error: 'Nombre, apellido, correo, contraseña y departamento son obligatorios' 
      });
    }

    // Validar email único
    const emailExists = await pool.query(
      'SELECT id FROM administradores WHERE correo = $1 AND estado = TRUE',
      [correo]
    );
    
    if (emailExists.rows.length > 0) {
      return res.status(400).json({ 
        error: 'El correo electrónico ya está registrado' 
      });
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);
    
    // Insertar técnico
    const query = `
      INSERT INTO administradores (
        nombre, apellido, correo, contrasena, telefono,
        tipo_usuario, departamento, rol, puede_asignar,
        estado, fecha_ingreso, usuario_ingreso
      ) VALUES (
        $1, $2, $3, $4, $5, 'tecnico', $6, $7, $8, TRUE, CURRENT_TIMESTAMP, $9
      ) RETURNING id, nombre, apellido, correo, telefono, departamento, rol, puede_asignar, fecha_ingreso
    `;
    
    const result = await pool.query(query, [
      nombre, apellido, correo, hashedPassword, telefono,
      departamento, rol, puede_asignar, usuario_ingreso || 'admin'
    ]);
    
    res.status(201).json({
      success: true,
      message: 'Técnico creado exitosamente',
      data: result.rows[0]
    });
    
  } catch (error) {
    console.error('Error al crear técnico:', error);
    
    if (error.code === '23505') { // Unique violation
      res.status(400).json({ error: 'El correo electrónico ya está registrado' });
    } else {
      res.status(500).json({ 
        error: 'Error al crear técnico',
        details: error.message 
      });
    }
  }
};

// ✏️ ACTUALIZAR TÉCNICO
const updateTecnico = async (req, res) => {
  const { id } = req.params;
  const { 
    nombre, apellido, correo, telefono,
    departamento, rol, puede_asignar, usuario_modifica
  } = req.body;
  
  try {
    // Validaciones básicas
    if (!nombre || !apellido || !correo || !departamento) {
      return res.status(400).json({ 
        error: 'Nombre, apellido, correo y departamento son obligatorios' 
      });
    }

    // Verificar que el técnico existe
    const tecnicoExists = await pool.query(
      'SELECT id FROM administradores WHERE id = $1 AND tipo_usuario = $2 AND estado = TRUE',
      [id, 'tecnico']
    );
    
    if (tecnicoExists.rows.length === 0) {
      return res.status(404).json({ error: 'Técnico no encontrado' });
    }

    // Verificar email único (excluyendo el técnico actual)
    const emailExists = await pool.query(
      'SELECT id FROM administradores WHERE correo = $1 AND id != $2 AND estado = TRUE',
      [correo, id]
    );
    
    if (emailExists.rows.length > 0) {
      return res.status(400).json({ 
        error: 'El correo electrónico ya está registrado por otro usuario' 
      });
    }
    
    // Actualizar técnico
    const query = `
      UPDATE administradores 
      SET nombre = $1, apellido = $2, correo = $3, telefono = $4, 
          departamento = $5, rol = $6, puede_asignar = $7, 
          usuario_modifica = $8, fecha_modifica = CURRENT_TIMESTAMP 
      WHERE id = $9 AND tipo_usuario = 'tecnico' AND estado = TRUE 
      RETURNING id, nombre, apellido, correo, telefono, departamento, 
                rol, puede_asignar, fecha_modifica
    `;
    
    const result = await pool.query(query, [
      nombre, apellido, correo, telefono, departamento, 
      rol, puede_asignar, usuario_modifica || 'admin', id
    ]);
    
    res.json({
      success: true,
      message: 'Técnico actualizado exitosamente',
      data: result.rows[0]
    });
    
  } catch (error) {
    console.error('Error al actualizar técnico:', error);
    
    if (error.code === '23505') { // Unique violation
      res.status(400).json({ error: 'El correo electrónico ya está registrado' });
    } else {
      res.status(500).json({ 
        error: 'Error al actualizar técnico',
        details: error.message 
      });
    }
  }
};

// 🔑 CAMBIAR CONTRASEÑA DE TÉCNICO
const updateTecnicoPassword = async (req, res) => {
  const { id } = req.params;
  const { nueva_contrasena, usuario_modifica } = req.body;
  
  try {
    if (!nueva_contrasena) {
      return res.status(400).json({ error: 'Nueva contraseña es obligatoria' });
    }

    if (nueva_contrasena.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(nueva_contrasena, 10);
    
    const result = await pool.query(
      `UPDATE administradores 
       SET contrasena = $1, usuario_modifica = $2, fecha_modifica = CURRENT_TIMESTAMP 
       WHERE id = $3 AND tipo_usuario = 'tecnico' AND estado = TRUE 
       RETURNING id, nombre, apellido, correo`,
      [hashedPassword, usuario_modifica || 'admin', id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Técnico no encontrado' });
    }

    res.json({ 
      success: true,
      message: 'Contraseña actualizada exitosamente', 
      data: result.rows[0] 
    });
    
  } catch (error) {
    console.error('Error al actualizar contraseña:', error);
    res.status(500).json({ 
      error: 'Error al actualizar contraseña',
      details: error.message 
    });
  }
};

// 🗑️ DESACTIVAR TÉCNICO (Borrado lógico)
const deleteTecnico = async (req, res) => {
  const { id } = req.params;
  const { usuario_modifica } = req.body;

  try {
    // Verificar que el técnico existe y está activo
    const tecnicoExists = await pool.query(
      'SELECT id, nombre, apellido FROM administradores WHERE id = $1 AND tipo_usuario = $2 AND estado = TRUE',
      [id, 'tecnico']
    );
    
    if (tecnicoExists.rows.length === 0) {
      return res.status(404).json({ error: 'Técnico no encontrado o ya desactivado' });
    }

    // Verificar si tiene reportes asignados activos
    const reportesActivos = await pool.query(
      `SELECT COUNT(*) as total FROM reportes 
       WHERE id_administrador_asignado = $1 AND estado = TRUE 
       AND id_estado NOT IN (SELECT id FROM estados_reporte WHERE es_final = TRUE)`,
      [id]
    );

    if (parseInt(reportesActivos.rows[0].total) > 0) {
      return res.status(400).json({ 
        error: 'No se puede desactivar el técnico porque tiene reportes activos asignados',
        reportes_activos: reportesActivos.rows[0].total
      });
    }
    
    // Desactivar técnico
    const result = await pool.query(
      `UPDATE administradores 
       SET estado = FALSE, usuario_modifica = $1, fecha_modifica = CURRENT_TIMESTAMP 
       WHERE id = $2 AND tipo_usuario = 'tecnico' AND estado = TRUE 
       RETURNING id, nombre, apellido, correo`,
      [usuario_modifica || 'admin', id]
    );
    
    res.json({ 
      success: true,
      message: 'Técnico desactivado exitosamente', 
      data: result.rows[0] 
    });
    
  } catch (error) {
    console.error('Error al desactivar técnico:', error);
    res.status(500).json({ 
      error: 'Error al desactivar técnico',
      details: error.message 
    });
  }
};

// 📊 OBTENER TÉCNICOS POR DEPARTAMENTO - FUNCIÓN CORREGIDA
const getTecnicosByDepartamento = async (req, res) => {
  const { departamento } = req.params;

  try {
    // Query más simple sin JOIN complejo
    const query = `
      SELECT 
        a.id, a.nombre, a.apellido, a.correo, a.telefono, a.rol, a.puede_asignar,
        COALESCE(
          (SELECT COUNT(*) FROM reportes r 
           WHERE r.id_administrador_asignado = a.id 
           AND r.estado = TRUE 
           AND r.id_estado NOT IN (SELECT id FROM estados_reporte WHERE es_final = TRUE)
          ), 0
        ) as reportes_asignados
      FROM administradores a
      WHERE a.tipo_usuario = 'tecnico' 
        AND a.departamento = $1 
        AND a.estado = TRUE
      ORDER BY a.nombre, a.apellido
    `;
    
    const result = await pool.query(query, [departamento]);
    
    res.json({
      success: true,
      data: result.rows,
      departamento: departamento,
      total: result.rows.length
    });
    
  } catch (error) {
    console.error('Error al obtener técnicos por departamento:', error);
    console.error('Departamento solicitado:', departamento);
    console.error('Error details:', error.message);
    res.status(500).json({ 
      error: 'Error al obtener técnicos del departamento',
      details: error.message,
      departamento: departamento
    });
  }
};

module.exports = {
  getTecnicos,
  createTecnico,
  updateTecnico,
  updateTecnicoPassword,
  deleteTecnico,
  getTecnicosByDepartamento
};