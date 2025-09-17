// frontend/src/config/firebase.js
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// Tu configuración de Firebase Web
const firebaseConfig = {
  apiKey: "AIzaSyALzIBblqSDDWjwW8cbKyCNvqLZwxJ7L2Q",
  authDomain: "cocode-proyecto.firebaseapp.com",
  projectId: "cocode-proyecto",
  storageBucket: "cocode-proyecto.firebasestorage.app",
  messagingSenderId: "371956533031",
  appId: "1:371956533031:web:a7fd2c41806f31de2b4b02",
  measurementId: "G-GRV172P2LM"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Firebase Storage
const storage = getStorage(app);

export { storage, app };
export default app;