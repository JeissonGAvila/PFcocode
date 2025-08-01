const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Rutas existentes
const tiposProblemaRoutes = require('./routes/tiposProblemaRoutes');
app.use('/api/tipos-problema', tiposProblemaRoutes);

// Nuevas rutas para categorías problema
const categoriasProblemaRoutes = require('./routes/categoriasProblemaRoutes');
app.use('/api/categorias-problema', categoriasProblemaRoutes);

// Nuevas rutas para estados reporte
const estadosReporteRoutes = require('./routes/estadosReporteRoutes');
app.use('/api/estados-reporte', estadosReporteRoutes);

// Nuevas rutas para zonas
const zonasRoutes = require('./routes/zonasRoutes');
app.use('/api/zonas', zonasRoutes);

// Nuevas rutas para administradores
const administradoresRoutes = require('./routes/administradoresRoutes');
app.use('/api/administradores', administradoresRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});