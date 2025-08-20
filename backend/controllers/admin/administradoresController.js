// backend/controllers/admin/administradoresController.js
const pool = require('../../models/db');
const bcrypt = require('bcrypt');

// Obtener todos los administradores
const getAdministradores = async (req, res) => {
  try {
    const query = `
      SELECT 
        id,
        nombre,
        apellido,
        correo,
        telefono,
        tipo_usuario,
        rol,
        departamento,
        puede_asignar,
        zonas_responsabilidad,
        estado,
        ultimo_acceso,
        fecha_ingreso,
        usuario_ingreso,
        fecha_modifica,
        usuario_modifica
      FROM administradores 
      WHERE estado = TRUE
      ORDER BY fecha_ingreso DESC, nombre, apellido
    `;
    
    const result = await pool.query(query);
    
    res.json({
      success: true,
      administradores: result.rows
    });
  } catch (error) {
    console.error('Error al obtener administradores:', error);
    res.status(500).json({ 
      error: 'Error al obtener administradores' 
    });
  }
};

// Crear nuevo administrador
const createAdministrador = async (req, res) => {
  const { 
    nombre, apellido, correo, contrasena, telefono,
    tipo_usuario, rol, departamento, puede_asignar, zonas_responsabilidad
  } = req.body;

  try {
    // Validaciones básicas
    if (!nombre || !apellido || !correo || !contrasena || !tipo_usuario) {
      return res.status(400).json({ 
        error: 'Nombre, apellido, correo, contraseña y tipo de usuario son requeridos' 
      });
    }

    // Validar que el correo no exista
    const emailQuery = 'SELECT id FROM administradores WHERE correo = $1 AND estado = TRUE';
    const emailResult = await pool.query(emailQuery, [correo]);
    
    if (emailResult.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Ya existe un administrador con este correo electrónico' 
      });
    }

    // Validar tipo de usuario
    if (!['administrador', 'tecnico'].includes(tipo_usuario)) {
      return res.status(400).json({ 
        error: 'El tipo de usuario debe ser "administrador" o "tecnico"' 
      });
    }

    // Hashear la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(contrasena, saltRounds);

    // Insertar nuevo administrador
    const insertQuery = `
      INSERT INTO administradores (
        nombre, apellido, correo, contrasena, telefono,
        tipo_usuario, rol, departamento, puede_asignar, zonas_responsabilidad,
        usuario_ingreso
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, nombre, apellido, correo, tipo_usuario, rol, departamento
    `;

    const values = [
      nombre, apellido, correo, hashedPassword, telefono,
      tipo_usuario, rol, departamento, puede_asignar || false, zonas_responsabilidad,
      req.user?.correo || 'admin'
    ];

    const result = await pool.query(insertQuery, values);

    res.status(201).json({
      success: true,
      message: 'Administrador creado exitosamente',
      administrador: result.rows[0]
    });

  } catch (error) {
    console.error('Error al crear administrador:', error);
    
    if (error.code === '23505') { // Violación de unicidad
      return res.status(400).json({ 
        error: 'Ya existe un administrador con este correo electrónico' 
      });
    }
    
    res.status(500).json({ 
      error: 'Error al crear administrador' 
    });
  }
};

// Actualizar administrador existente
const updateAdministrador = async (req, res) => {
  const { id } = req.params;
  const { 
    nombre, apellido, correo, telefono,
    tipo_usuario, rol, departamento, puede_asignar, zonas_responsabilidad
  } = req.body;

  try {
    // Validaciones básicas
    if (!nombre || !apellido || !correo || !tipo_usuario) {
      return res.status(400).json({ 
        error: 'Nombre, apellido, correo y tipo de usuario son requeridos' 
      });
    }

    // Validar que el correo no exista en otro administrador
    const emailQuery = 'SELECT id FROM administradores WHERE correo = $1 AND id != $2 AND estado = TRUE';
    const emailResult = await pool.query(emailQuery, [correo, id]);
    
    if (emailResult.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Ya existe otro administrador con este correo electrónico' 
      });
    }

    // Actualizar administrador
    const updateQuery = `
      UPDATE administradores SET
        nombre = $1,
        apellido = $2,
        correo = $3,
        telefono = $4,
        tipo_usuario = $5,
        rol = $6,
        departamento = $7,
        puede_asignar = $8,
        zonas_responsabilidad = $9,
        fecha_modifica = NOW(),
        usuario_modifica = $10
      WHERE id = $11 AND estado = TRUE
      RETURNING id, nombre, apellido, correo, tipo_usuario, rol, departamento
    `;

    const values = [
      nombre, apellido, correo, telefono,
      tipo_usuario, rol, departamento, puede_asignar || false, zonas_responsabilidad,
      req.user?.correo || 'admin',
      id
    ];

    const result = await pool.query(updateQuery, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Administrador no encontrado' 
      });
    }

    res.json({
      success: true,
      message: 'Administrador actualizado exitosamente',
      administrador: result.rows[0]
    });

  } catch (error) {
    console.error('Error al actualizar administrador:', error);
    res.status(500).json({ 
      error: 'Error al actualizar administrador' 
    });
  }
};

// Cambiar contraseña del administrador
const updateAdministradorPassword = async (req, res) => {
  const { id } = req.params;
  const { nueva_contrasena } = req.body;

  try {
    if (!nueva_contrasena || nueva_contrasena.length < 6) {
      return res.status(400).json({ 
        error: 'La contraseña debe tener al menos 6 caracteres' 
      });
    }

    // Hashear nueva contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(nueva_contrasena, saltRounds);

    const updateQuery = `
      UPDATE administradores SET
        contrasena = $1,
        fecha_modifica = NOW(),
        usuario_modifica = $2
      WHERE id = $3 AND estado = TRUE
      RETURNING id, nombre, apellido
    `;

    const result = await pool.query(updateQuery, [
      hashedPassword, 
      req.user?.correo || 'admin', 
      id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Administrador no encontrado' 
      });
    }

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });

  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({ 
      error: 'Error al cambiar contraseña' 
    });
  }
};

// Desactivar administrador (borrado lógico)
const deleteAdministrador = async (req, res) => {
  const { id } = req.params;

  try {
    // Verificar si el administrador tiene reportes activos asignados
    const reportesQuery = `
      SELECT COUNT(*) as total 
      FROM reportes 
      WHERE id_administrador_asignado = $1 
      AND estado = TRUE 
      AND id_estado NOT IN (
        SELECT id FROM estados_reporte WHERE es_final = TRUE
      )
    `;
    
    const reportesResult = await pool.query(reportesQuery, [id]);
    const reportesActivos = parseInt(reportesResult.rows[0].total);

    if (reportesActivos > 0) {
      return res.status(400).json({ 
        error: `No se puede desactivar el administrador porque tiene ${reportesActivos} reportes activos asignados` 
      });
    }

    // Desactivar administrador
    const deleteQuery = `
      UPDATE administradores SET
        estado = FALSE,
        fecha_modifica = NOW(),
        usuario_modifica = $1
      WHERE id = $2 AND estado = TRUE
      RETURNING id, nombre, apellido
    `;

    const result = await pool.query(deleteQuery, [
      req.user?.correo || 'admin', 
      id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Administrador no encontrado' 
      });
    }

    res.json({
      success: true,
      message: 'Administrador desactivado exitosamente'
    });

  } catch (error) {
    console.error('Error al desactivar administrador:', error);
    res.status(500).json({ 
      error: 'Error al desactivar administrador' 
    });
  }
};

// Obtener datos para selects (roles, departamentos, etc.)
const getDatosSelect = async (req, res) => {
  try {
    res.json({
      success: true,
      tipos_usuario: ['administrador', 'tecnico'],
      roles_disponibles: [
        'Administrador General',
        'Supervisor',
        'Coordinador',
        'Asistente',
        'Técnico Especialista'
      ],
      departamentos_disponibles: [
        'Administración General',
        'Energía Eléctrica',
        'Agua Potable',
        'Drenajes',
        'Obras Públicas',
        'Servicios Municipales',
        'Recursos Humanos',
        'Tecnología',
        'Planificación',
        'Finanzas',
        'Secretaría'
      ]
    });

  } catch (error) {
    console.error('Error al obtener datos para selects:', error);
    res.status(500).json({ 
      error: 'Error al obtener datos' 
    });
  }
};

module.exports = {
  getAdministradores,
  createAdministrador,
  updateAdministrador,
  updateAdministradorPassword,
  deleteAdministrador,
  getDatosSelect
};