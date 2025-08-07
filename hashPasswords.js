// hashPasswords.js - Crear en la raíz del proyecto
const bcrypt = require('bcrypt');

async function hashearPasswords() {
  console.log('🔐 Hasheando contraseñas para pruebas...\n');
  
  const passwords = [
    { usuario: 'admin', password: 'admin123' },
    { usuario: 'tecnico energia', password: 'tecnico123' },
    { usuario: 'tecnico agua', password: 'agua123' },
    { usuario: 'lider', password: 'lider123' },
    { usuario: 'ciudadano', password: 'ciudadano123' }
  ];

  for (const item of passwords) {
    const hashed = await bcrypt.hash(item.password, 10);
    console.log(`${item.usuario}:`);
    console.log(`  Contraseña original: ${item.password}`);
    console.log(`  Hash para BD: ${hashed}\n`);
  }
  
  console.log('✅ Copia estos hashes y actualiza tu base de datos');
}

hashearPasswords();