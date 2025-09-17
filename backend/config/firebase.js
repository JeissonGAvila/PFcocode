// backend/config/firebase.js
const admin = require('firebase-admin');

// Cargar credenciales del archivo JSON
const serviceAccount = require('./firebase-service-account-key.json');

// Configuración del Storage Bucket
const STORAGE_BUCKET = 'cocode-proyecto.firebasestorage.app';

// Inicializar Firebase Admin
const initializeFirebase = () => {
  try {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: STORAGE_BUCKET
      });
      console.log('✅ Firebase Admin SDK inicializado correctamente');
    }
  } catch (error) {
    console.error('❌ Error al inicializar Firebase:', error);
    throw error;
  }
};

// Obtener instancia del bucket de Storage
const getBucket = () => {
  try {
    return admin.storage().bucket();
  } catch (error) {
    console.error('❌ Error al obtener bucket:', error);
    throw error;
  }
};

module.exports = {
  initializeFirebase,
  getBucket,
  admin,
  STORAGE_BUCKET
};