// frontend/src/components/admin/GestionCocode.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Alert,
  Snackbar,
  CircularProgress,
  Tooltip,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  LocationCity as LocationIcon,
  Group as GroupIcon
} from '@mui/icons-material';
import cocodeService from '../../services/admin/cocodeService.js';
import zonasService from '../../services/admin/zonasService.js';

const GestionCocode = () => {
  // Estados principales
  const [cocodes, setCocodes] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados para modales
  const [openModal, setOpenModal] = useState(false);
  const [editingCocode, setEditingCocode] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Estados para formulario
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
    poblacion_estimada: '',
    id_zona: ''
  });

  // Estados para notificaciones
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Cargar COCODEs y zonas en paralelo
      const [cocodesResponse, zonasResponse] = await Promise.all([
        cocodeService.getAll(),
        zonasService.getAll()
      ]);
      
      if (cocodesResponse.success) {
        setCocodes(cocodesResponse.cocodes);
      }
      
      if (zonasResponse.success) {
        setZonas(zonasResponse.zonas);
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

  // Funciones para modales
  const abrirModalCrear = () => {
    setFormData({
      nombre: '',
      direccion: '',
      telefono: '',
      poblacion_estimada: '',
      id_zona: ''
    });
    setEditingCocode(null);
    setIsEditing(false);
    setOpenModal(true);
  };

  const abrirModalEditar = (cocode) => {
    setFormData({
      nombre: cocode.nombre || '',
      direccion: cocode.direccion || '',
      telefono: cocode.telefono || '',
      poblacion_estimada: cocode.poblacion_estimada || '',
      id_zona: cocode.id_zona || ''
    });
    setEditingCocode(cocode);
    setIsEditing(true);
    setOpenModal(true);
  };

  const cerrarModal = () => {
    setOpenModal(false);
    setEditingCocode(null);
    setIsEditing(false);
    setFormData({
      nombre: '',
      direccion: '',
      telefono: '',
      poblacion_estimada: '',
      id_zona: ''
    });
  };

  // Funciones de formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Funciones de acción
  const handleSubmit = async () => {
    try {
      // Validaciones básicas
      if (!formData.nombre || !formData.id_zona) {
        mostrarSnackbar('Nombre y zona son requeridos', 'error');
        return;
      }

      setLoading(true);

      // Convertir poblacion_estimada a número si existe
      const dataToSend = {
        ...formData,
        poblacion_estimada: formData.poblacion_estimada ? 
          parseInt(formData.poblacion_estimada) : null
      };

      if (isEditing) {
        await cocodeService.update(editingCocode.id, dataToSend);
        mostrarSnackbar('COCODE actualizado exitosamente', 'success');
      } else {
        await cocodeService.create(dataToSend);
        mostrarSnackbar('COCODE creado exitosamente', 'success');
      }

      cerrarModal();
      cargarDatos();

    } catch (error) {
      mostrarSnackbar(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (cocode) => {
    if (window.confirm(`¿Estás seguro de desactivar el COCODE "${cocode.nombre}"?`)) {
      try {
        setLoading(true);
        await cocodeService.delete(cocode.id);
        mostrarSnackbar('COCODE desactivado exitosamente', 'success');
        cargarDatos();
      } catch (error) {
        mostrarSnackbar(error.message, 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  // Función auxiliar para obtener nombre de zona
  const getNombreZona = (idZona) => {
    const zona = zonas.find(z => z.id === idZona);
    return zona ? zona.nombre : 'Sin zona';
  };

  if (loading && cocodes.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Cargando COCODEs...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
        <Button onClick={cargarDatos} sx={{ ml: 2 }}>
          Reintentar
        </Button>
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">
          <LocationIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
          Gestión de COCODEs ({cocodes.length} total)
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
            Agregar COCODE
          </Button>
        </Box>
      </Box>

      {/* Alerta informativa */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>COCODEs:</strong> Consejos Comunitarios de Desarrollo. Cada COCODE pertenece a una zona y puede tener múltiples sectores (SUBCOCODEs).
        </Typography>
      </Alert>

      {/* Tabla de COCODEs */}
      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'grey.100' }}>
              <TableCell><strong>Nombre</strong></TableCell>
              <TableCell><strong>Zona</strong></TableCell>
              <TableCell><strong>Dirección</strong></TableCell>
              <TableCell><strong>Teléfono</strong></TableCell>
              <TableCell><strong>Población Est.</strong></TableCell>
              <TableCell><strong>Sectores</strong></TableCell>
              <TableCell><strong>Líderes</strong></TableCell>
              <TableCell><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cocodes.map((cocode) => (
              <TableRow key={cocode.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {cocode.nombre}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={cocode.zona_nombre} 
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {cocode.direccion || '-'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {cocode.telefono || '-'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {cocode.poblacion_estimada 
                      ? cocode.poblacion_estimada.toLocaleString() 
                      : '-'
                    }
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={cocode.total_sectores} 
                    size="small"
                    color="secondary"
                  />
                </TableCell>
                <TableCell>
                  <Chip 
                    label={cocode.total_lideres} 
                    size="small"
                    color="success"
                  />
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    <Tooltip title="Editar COCODE">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => abrirModalEditar(cocode)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Desactivar COCODE">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(cocode)}
                        disabled={cocode.total_sectores > 0 || cocode.total_lideres > 0}
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

      {/* Modal Crear/Editar COCODE */}
      <Dialog open={openModal} onClose={cerrarModal} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <GroupIcon />
            {isEditing ? 'Editar COCODE' : 'Crear Nuevo COCODE'}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Zona</InputLabel>
                <Select
                  name="id_zona"
                  value={formData.id_zona}
                  onChange={handleInputChange}
                  label="Zona"
                >
                  {zonas.map((zona) => (
                    <MenuItem key={zona.id} value={zona.id}>
                      {zona.nombre} (Zona {zona.numero_zona})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre del COCODE *"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                required
                placeholder="Ej: COCODE Zona Central"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Dirección"
                name="direccion"
                value={formData.direccion}
                onChange={handleInputChange}
                placeholder="Ej: 5ta Avenida 3-45, Zona 1"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Teléfono"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                placeholder="7765-4321"
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
                placeholder="25000"
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

      {/* Snackbar para notificaciones */}
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

export default GestionCocode;