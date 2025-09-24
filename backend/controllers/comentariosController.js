// controllers/comentariosController.js
const pool = require('../models/db');

const agregarComentario = async (req, res) => {
  try {
    const { id } = req.params;
    const { comentario, es_interno = false } = req.body;
    const usuario = req.user;

    if (!comentario || comentario.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'El comentario no puede estar vacío'
      });
    }

    const reporteResult = await pool.query(
      'SELECT id FROM reportes WHERE id = $1 AND estado = TRUE',
      [id]
    );

    if (reporteResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Reporte no encontrado'
      });
    }

    let tipoUsuario, nombreUsuario, idCampo, idValor;

    switch (usuario.tipo) {
      case 'administrador':
        tipoUsuario = usuario.rol?.includes('Técnico') ? 'tecnico' : 'admin';
        nombreUsuario = `${usuario.nombre} ${usuario.apellido}`;
        idCampo = 'id_administrador';
        idValor = usuario.id;
        break;
        
      case 'liderCocode':
        tipoUsuario = 'lider';
        nombreUsuario = `${usuario.nombre} ${usuario.apellido}`;
        idCampo = 'id_usuario_lider';
        idValor = usuario.id;
        break;
        
      case 'ciudadano':
        tipoUsuario = 'ciudadano';
        nombreUsuario = `${usuario.nombre} ${usuario.apellido}`;
        idCampo = 'id_ciudadano';
        idValor = usuario.id;
        break;
        
      default:
        return res.status(400).json({
          success: false,
          error: 'Tipo de usuario no válido'
        });
    }

    const insertQuery = `
      INSERT INTO comentarios_reportes (
        id_reporte, 
        ${idCampo}, 
        tipo_usuario_comentario, 
        nombre_usuario, 
        comentario, 
        es_interno, 
        usuario_ingreso
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING *
    `;

    const valores = [
      id,
      idValor,
      tipoUsuario,
      nombreUsuario,
      comentario.trim(),
      es_interno,
      `${usuario.nombre} ${usuario.apellido}`
    ];

    const result = await pool.query(insertQuery, valores);
    const nuevoComentario = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'Comentario agregado exitosamente',
      comentario: {
        id: nuevoComentario.id,
        id_reporte: nuevoComentario.id_reporte,
        tipo_usuario: nuevoComentario.tipo_usuario_comentario,
        nombre_usuario: nuevoComentario.nombre_usuario,
        comentario: nuevoComentario.comentario,
        es_interno: nuevoComentario.es_interno,
        fecha_comentario: nuevoComentario.fecha_comentario
      }
    });

  } catch (error) {
    console.error('Error al agregar comentario:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

const obtenerComentarios = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = req.user;

    const reporteResult = await pool.query(
      'SELECT id FROM reportes WHERE id = $1 AND estado = TRUE',
      [id]
    );

    if (reporteResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Reporte no encontrado'
      });
    }

    const puedeVerInternos = ['administrador'].includes(usuario.tipo);

    let whereCondition = 'WHERE id_reporte = $1 AND estado = TRUE';
    if (!puedeVerInternos) {
      whereCondition += ' AND es_interno = FALSE';
    }

    const query = `
      SELECT 
        id,
        id_reporte,
        tipo_usuario_comentario,
        nombre_usuario,
        comentario,
        es_interno,
        fecha_comentario
      FROM comentarios_reportes 
      ${whereCondition}
      ORDER BY fecha_comentario ASC
    `;

    const result = await pool.query(query, [id]);

    res.status(200).json({
      success: true,
      total: result.rows.length,
      comentarios: result.rows
    });

  } catch (error) {
    console.error('Error al obtener comentarios:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

module.exports = {
  agregarComentario,
  obtenerComentarios
};