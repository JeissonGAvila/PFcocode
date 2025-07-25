const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json()); // ¡Clave para recibir JSON!

const tiposProblemaRoutes = require('./routes/tiposProblemaRoutes');
app.use('/api/tipos-problema', tiposProblemaRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});