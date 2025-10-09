// frontend/src/components/admin/GestionZonas.jsx
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Chip, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Grid, Alert, Snackbar,
  CircularProgress, Tooltip, Card, CardContent
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  Refresh as RefreshIcon, LocationCity as LocationIcon
} from '@mui/icons-material';
import zonasService from '../../services/admin/zonasService.js';

const GestionZonas = () => {
  const [zonas, setZonas] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [editingZona, setEditingZona] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    numero_zona: '',
    descripcion: '',
    poblacion_estimada: '',
    area_km2: ''
  });
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [zonasResponse, statsResponse] = await Promise.all([
        zonasService.getAll(),
        zonasService.getStats()
      ]);
      
      if (zonasResponse.success) {
        setZonas(zonasResponse.zonas);
      }
      
      if (statsResponse.success) {
        setStats(statsResponse.stats);
      }
      
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError(error.message);
      mostrarSnackbar('Error al cargar datos: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const mostrarSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const cerrarSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const abrirModalCrear = () => {
    setFormData({
      nombre: '',
      numero_zona: '',
      descripcion: '',
      poblacion_estimada: '',
      area_km2: ''
    });
    setEditingZona(null);
    setIsEditing(false);
    setOpenModal(true);
  };

  const abrirModalEditar = (zona) => {
    setFormData({
      nombre: zona.nombre || '',
      numero_zona: zona.numero_zona || '',
      descripcion: zona.descripcion || '',
      poblacion_estimada: zona.poblacion_estimada || '',
      area_km2: zona.area_km2 || ''
    });
    setEditingZona(zona);
    setIsEditing(true);
    setOpenModal(true);
  };

  const cerrarModal = () => {
    setOpenModal(false);
    setEditingZona(null);
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      if (!formData.nombre || !formData.numero_zona) {
        mostrarSnackbar('Nombre y número de zona son requeridos', 'error');
        return;
      }

      const numeroValido = await zonasService.validateNumeroZona(
        formData.numero_zona, 
        isEditing ? editingZona.id : null
      );
      
      if (!numeroValido) {
        mostrarSnackbar('Ya existe una zona con este número', 'error');
        return;
      }

      const nombreValido = await zonasService.validateNombreZona(
        formData.nombre, 
        isEditing ? editingZona.id : null
      );
      
      if (!nombreValido) {
        mostrarSnackbar('Ya existe una zona con este nombre', 'error');
        return;
      }

      setLoading(true);

      const dataToSend = {
        nombre: formData.nombre,
        numero_zona: parseInt(formData.numero_zona),
        descripcion: formData.descripcion || null,
        poblacion_estimada: formData.poblacion_estimada ? parseInt(formData.poblacion_estimada) : null,
        area_km2: formData.area_km2 ? parseFloat(formData.area_km2) : null
      };

      if (isEditing) {
        await zonasService.update(editingZona.id, dataToSend);
        mostrarSnackbar('Zona actualizada exitosamente', 'success');
      } else {
        await zonasService.create(dataToSend);
        mostrarSnackbar('Zona creada exitosamente', 'success');
      }

      cerrarModal();
      cargarDatos();

    } catch (error) {
      mostrarSnackbar(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (zona) => {
    if (window.confirm(`¿Estás seguro de desactivar la zona "${zona.nombre}"?`)) {
      try {
        setLoading(true);
        await zonasService.delete(zona.id);
        mostrarSnackbar('Zona desactivada exitosamente', 'success');
        cargarDatos();
      } catch (error) {
        mostrarSnackbar(error.message, 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const formatearNumero = (numero) => {
    return numero ? numero.toLocaleString() : 'N/D';
  };

  const getEstadoChip = (estado) => {
    return estado ? (
      <Chip label="Activa" color="success" size="small" />
    ) : (
      <Chip label="Inactiva" color="error" size="small" />
    );
  };

  if (loading && zonas.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Cargando zonas...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={1}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="primary">
                {stats.total_zonas || 0}
              </Typography>
              <Typography variant="body2">Zonas Totales</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={1}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="success.main">
                {formatearNumero(stats.poblacion_total)}
              </Typography>
              <Typography variant="body2">Población Total</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={1}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="warning.main">
                {stats.total_cocode || 0}
              </Typography>
              <Typography variant="body2">COCODEs</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={1}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="info.main">
                {stats.total_ciudadanos || 0}
              </Typography>
              <Typography variant="body2">Ciudadanos</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">
          Gestión de Zonas ({zonas.length} total)
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={cargarDatos}
            disabled={loading}
          >
            Actualizar
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={abrirModalCrear}
            disabled={loading}
          >
            Nueva Zona
          </Button>
        </Box>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Nota:</strong> Este módulo solo gestiona zonas. Los COCODEs y Sub-COCODEs 
          se gestionan en sus módulos correspondientes.
        </Typography>
      </Alert>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
          <Button onClick={cargarDatos} sx={{ ml: 2 }}>
            Reintentar
          </Button>
        </Alert>
      )}

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'grey.100' }}>
              <TableCell><strong>Zona</strong></TableCell>
              <TableCell><strong>Número</strong></TableCell>
              <TableCell><strong>Población</strong></TableCell>
              <TableCell><strong>Área</strong></TableCell>
              <TableCell><strong>Estadísticas</strong></TableCell>
              <TableCell><strong>Estado</strong></TableCell>
              <TableCell><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {zonas.map((zona) => (
              <TableRow key={zona.id} hover>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {zona.nombre}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {zona.descripcion || 'Sin descripción'}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip label={`Zona ${zona.numero_zona}`} size="small" color="primary" variant="outlined" />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {formatearNumero(zona.poblacion_estimada)} hab.
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {zona.area_km2 ? `${zona.area_km2} km²` : 'N/D'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2">
                      COCODEs: {zona.total_cocode || 0}
                    </Typography>
                    <Typography variant="body2">
                      Ciudadanos: {zona.total_ciudadanos || 0}
                    </Typography>
                    <Typography variant="body2">
                      Reportes: {zona.total_reportes || 0}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  {getEstadoChip(zona.estado)}
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    <Tooltip title="Editar zona">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => abrirModalEditar(zona)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Desactivar zona">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(zona)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openModal} onClose={cerrarModal} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <LocationIcon />
            {isEditing ? 'Editar Zona' : 'Crear Nueva Zona'}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombre de la Zona *"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                required
                placeholder="Ej: Zona Central"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Número de Zona *"
                name="numero_zona"
                type="number"
                value={formData.numero_zona}
                onChange={handleInputChange}
                required
                inputProps={{ min: 1, max: 50 }}
                placeholder="1"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Descripción"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                multiline
                rows={3}
                placeholder="Descripción general de la zona..."
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Población Estimada"
                name="poblacion_estimada"
                type="number"
                value={formData.poblacion_estimada}
                onChange={handleInputChange}
                inputProps={{ min: 0 }}
                placeholder="15000"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Área (km²)"
                name="area_km2"
                type="number"
                value={formData.area_km2}
                onChange={handleInputChange}
                inputProps={{ min: 0, step: 0.01 }}
                placeholder="25.5"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={cerrarModal}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : (isEditing ? 'Actualizar' : 'Crear')}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={cerrarSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={cerrarSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default GestionZonas;