// backend/controllers/firebaseController.js - FUNCIONES CENTRALES FIREBASE
const pool = require('../models/db');

// Guardar archivos Firebase en base de datos (función común)
const guardarArchivosFirebaseDB = async (reporteId, archivos, usuarioId, tipoUsuario) => {
  try {
    if (!reporteId || !archivos || !Array.isArray(archivos) || archivos.length === 0) {
      throw new Error('ID de reporte y array de archivos son requeridos');
    }

    // Validar estructura de archivos
    for (const archivo of archivos) {
      if (!archivo.nombre_archivo || !archivo.url_archivo || !archivo.firebase_path) {
        throw new Error('Cada archivo debe tener nombre_archivo, url_archivo y firebase_path');
      }

      // Validar que sea URL de Firebase
      if (!archivo.url_archivo.includes('firebasestorage.googleapis.com')) {
        throw new Error('Solo se permiten URLs de Firebase Storage');
      }
    }

    // Iniciar transacción
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      const archivosGuardados = [];

      // Insertar cada archivo
      for (const archivo of archivos) {
        const insertQuery = `
          INSERT INTO archivos_reporte (
            id_reporte, nombre_archivo, url_archivo, tipo_archivo,
            tamano_kb, es_evidencia_inicial, subido_por_tipo, subido_por_id,
            firebase_path, fecha_subida, usuario_ingreso, estado
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, $10, true)
          RETURNING *
        `;

        const archivoResult = await client.query(insertQuery, [
          reporteId,
          archivo.nombre_archivo,
          archivo.url_archivo,
          archivo.tipo_archivo || 'image/jpeg',
          archivo.tamano_kb || 0,
          archivo.es_evidencia_inicial || true,
          tipoUsuario || 'ciudadano',
          usuarioId,
          archivo.firebase_path,
          `${tipoUsuario}_${usuarioId}`
        ]);

        archivosGuardados.push(archivoResult.rows[0]);
      }

      // Registrar en seguimiento
      try {
        const seguimientoQuery = `
          INSERT INTO seguimiento_reportes (
            id_reporte, tipo_usuario_seguimiento,
            comentario, tipo_seguimiento, usuario_ingreso
          ) VALUES ($1, $2, $3, 'archivos_firebase', $4)
        `;

        await client.query(seguimientoQuery, [
          reporteId,
          tipoUsuario,
          `${tipoUsuario} subió ${archivos.length} archivo(s) a Firebase Storage`,
          `${tipoUsuario}_${usuarioId}`
        ]);
      } catch (seguimientoError) {
        console.warn('No se pudo registrar seguimiento:', seguimientoError.message);
      }

      await client.query('COMMIT');
      return archivosGuardados;

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error en guardarArchivosFirebaseDB:', error);
    throw error;
  }
};

// Obtener archivos de un reporte (función común)
const getArchivosReporteDB = async (reporteId) => {
  try {
    const archivosQuery = `
      SELECT 
        id, nombre_archivo, url_archivo, tipo_archivo, tamano_kb,
        firebase_path, es_evidencia_inicial, fecha_subida,
        subido_por_tipo, subido_por_id,
        CASE 
          WHEN firebase_path IS NOT NULL THEN 'firebase'
          ELSE 'local'
        END as storage_type
      FROM archivos_reporte 
      WHERE id_reporte = $1 AND estado = TRUE
      ORDER BY fecha_subida ASC
    `;
    
    const archivosResult = await pool.query(archivosQuery, [reporteId]);

    // Separar por tipo de storage
    const archivosFirebase = archivosResult.rows.filter(a => a.storage_type === 'firebase');
    const archivosLocales = archivosResult.rows.filter(a => a.storage_type === 'local');

    return {
      archivos: archivosResult.rows,
      estadisticas: {
        total: archivosResult.rows.length,
        firebase: archivosFirebase.length,
        locales: archivosLocales.length
      }
    };

  } catch (error) {
    console.error('Error en getArchivosReporteDB:', error);
    throw error;
  }
};

// Eliminar archivo de Firebase y BD (función común)
const eliminarArchivoFirebaseDB = async (archivoId, usuarioId, tipoUsuario) => {
  try {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Obtener información del archivo
      const archivoQuery = `
        SELECT firebase_path, nombre_archivo, id_reporte
        FROM archivos_reporte 
        WHERE id = $1 AND estado = TRUE
      `;
      
      const archivoResult = await client.query(archivoQuery, [archivoId]);
      
      if (archivoResult.rows.length === 0) {
        throw new Error('Archivo no encontrado');
      }

      const archivo = archivoResult.rows[0];

      // Marcar como eliminado en BD
      const deleteQuery = `
        UPDATE archivos_reporte 
        SET estado = FALSE, fecha_modifica = CURRENT_TIMESTAMP, usuario_modifica = $1
        WHERE id = $2
      `;
      
      await client.query(deleteQuery, [`${tipoUsuario}_${usuarioId}`, archivoId]);

      // TODO: Aquí se podría eliminar de Firebase Storage también
      // const { deleteFile } = require('../config/firebase');
      // await deleteFile(archivo.firebase_path);

      await client.query('COMMIT');
      return archivo;

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error en eliminarArchivoFirebaseDB:', error);
    throw error;
  }
};

module.exports = {
  guardarArchivosFirebaseDB,
  getArchivosReporteDB,
  eliminarArchivoFirebaseDB
};