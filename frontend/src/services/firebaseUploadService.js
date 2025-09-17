// frontend/src/services/firebaseUploadService.js
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../config/firebase.js';

// Función para generar nombres únicos de archivos
const generateFileName = (originalName, reporteId, userType) => {
  const timestamp = Date.now();
  const extension = originalName.split('.').pop().toLowerCase();
  const cleanName = originalName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  
  return `reportes/${reporteId}/${userType}_${timestamp}_${cleanName}.${extension}`;
};

// Función principal para subir UN archivo a Firebase
export const subirArchivoFirebase = async (file, reporteId, userType = 'ciudadano') => {
  try {
    // Validaciones básicas
    if (!file) {
      throw new Error('No se ha seleccionado ningún archivo');
    }

    if (!reporteId) {
      throw new Error('ID de reporte requerido');
    }

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Solo se permiten archivos de imagen (JPG, PNG, GIF, WebP)');
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      throw new Error(`El archivo es demasiado grande (${sizeMB}MB). Máximo 5MB permitido`);
    }

    // Generar nombre único del archivo
    const fileName = generateFileName(file.name, reporteId, userType);
    
    // Crear referencia en Firebase Storage
    const storageRef = ref(storage, fileName);
    
    // Metadatos del archivo
    const metadata = {
      contentType: file.type,
      customMetadata: {
        'reporteId': reporteId.toString(),
        'userType': userType,
        'originalName': file.name,
        'uploadDate': new Date().toISOString()
      }
    };

    console.log('📤 Subiendo archivo a Firebase:', fileName);

    // Subir archivo
    const snapshot = await uploadBytes(storageRef, file, metadata);
    
    // Obtener URL de descarga
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    console.log('✅ Archivo subido exitosamente:', fileName);
    
    return {
      success: true,
      url: downloadURL,
      fileName: fileName,
      originalName: file.name,
      size: file.size,
      type: file.type,
      path: snapshot.ref.fullPath,
      userType: userType,
      reporteId: reporteId
    };

  } catch (error) {
    console.error('❌ Error al subir archivo a Firebase:', error);
    throw new Error(`Error al subir archivo: ${error.message}`);
  }
};

export default {
  subirArchivoFirebase
};