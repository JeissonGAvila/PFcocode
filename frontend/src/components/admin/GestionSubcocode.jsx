// frontend/src/components/admin/GestionSubcocode.jsx
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
  AccountTree as SectorIcon,
  Group as GroupIcon
} from '@mui/icons-material';
import subcocodeService from '../../services/admin/subcocodeService.js';
import cocodeService from '../../services/admin/cocodeService.js';
import zonasService from '../../services/admin/zonasService.js';

const GestionSubcocode = () => {
  // Estados principales
  const [subcocodes, setSubcocodes] = useState([]);
  const [cocodes, setCocodes] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados para modales
  const [openModal, setOpenModal] = useState(false);
  const [editingSubcocode, setEditingSubcocode] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Estados para formulario
  const [formData, setFormData] = useState({
    nombre: '',
    sector: '',
    direccion: '',
    poblacion_estimada: '',
    id_zona: '',
    id_cocode_principal: ''
  });

  // Estados para filtrado de COCODEs
  const [cocodesFiltrados, setCocodesFiltrados] = useState([]);

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

  // Filtrar COCODEs cuando cambia la zona seleccionada
  useEffect(() => {
    if (formData.id_zona) {
      const cocodesDeLaZona = cocodes.filter(c => c.id_zona === parseInt(formData.id_zona));
      setCocodesFiltrados(cocodesDeLaZona);
      
      // Si el COCODE seleccionado no pertenece a la nueva zona, limpiarlo
      if (formData.id_cocode_principal) {
        const cocodeValido = cocodesDeLaZona.find(c => c.id === formData.id_cocode_principal);
        if (!cocodeValido) {
          setFormData(prev => ({ ...prev, id_cocode_principal: '' }));
        }
      }
    } else {
      setCocodesFiltrados([]);
      setFormData(prev => ({ ...prev, id_cocode_principal: '' }));
    }
  }, [formData.id_zona, cocodes]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Cargar Sectores, COCODEs y zonas en paralelo
      const [subcocodesResponse, cocodesResponse, zonasResponse] = await Promise.all([
        subcocodeService.getAll(),
        cocodeService.getAll(),
        zonasService.getAll()
      ]);
      
      if (subcocodesResponse.success) {
        setSubcocodes(subcocodesResponse.subcocodes);
      }
      
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
      sector: '',
      direccion: '',
      poblacion_estimada: '',
      id_zona: '',
      id_cocode_principal: ''
    });
    setEditingSubcocode(null);
    setIsEditing(false);
    setOpenModal(true);
  };

  const abrirModalEditar = (subcocode) => {
    setFormData({
      nombre: subcocode.nombre || '',
      sector: subcocode.sector || '',
      direccion: subcocode.direccion || '',
      poblacion_estimada: subcocode.poblacion_estimada || '',
      id_zona: subcocode.id_zona || '',
      id_cocode_principal: subcocode.id_cocode_principal || ''
    });
    setEditingSubcocode(subcocode);
    setIsEditing(true);
    setOpenModal(true);
  };

  const cerrarModal = () => {
    setOpenModal(false);
    setEditingSubcocode(null);
    setIsEditing(false);
    setFormData({
      nombre: '',
      sector: '',
      direccion: '',
      poblacion_estimada: '',
      id_zona: '',
      id_cocode_principal: ''
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
      if (!formData.nombre || !formData.id_cocode_principal) {
        mostrarSnackbar('Nombre y COCODE principal son requeridos', 'error');
        return;
      }

      setLoading(true);

      // Convertir poblacion_estimada a número si existe
      const dataToSend = {
        nombre: formData.nombre,
        sector: formData.sector || null,
        direccion: formData.direccion || null,
        poblacion_estimada: formData.poblacion_estimada ? 
          parseInt(formData.poblacion_estimada) : null,
        id_cocode_principal: formData.id_cocode_principal
      };

      if (isEditing) {
        await subcocodeService.update(editingSubcocode.id, dataToSend);
        mostrarSnackbar('Sector actualizado exitosamente', 'success');
      } else {
        await subcocodeService.create(dataToSend);
        mostrarSnackbar('Sector creado exitosamente', 'success');
      }

      cerrarModal();
      cargarDatos();

    } catch (error) {
      mostrarSnackbar(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (subcocode) => {
    if (window.confirm(`¿Estás seguro de desactivar el Sector "${subcocode.nombre}"?`)) {
      try {
        setLoading(true);
        await subcocodeService.delete(subcocode.id);
        mostrarSnackbar('Sector desactivado exitosamente', 'success');
        cargarDatos();
      } catch (error) {
        mostrarSnackbar(error.message, 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading && subcocodes.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Cargando Sectores...
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
          <SectorIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
          Gestión de Sectores/SUBCOCODEs ({subcocodes.length} total)
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
            Agregar Sector
          </Button>
        </Box>
      </Box>

      {/* Alerta informativa */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Sectores/SUBCOCODEs:</strong> Subdivisiones de un COCODE principal. Cada sector puede tener su propio líder y ciudadanos asignados.
        </Typography>
      </Alert>

      {/* Tabla de Sectores */}
      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'grey.100' }}>
              <TableCell><strong>Nombre</strong></TableCell>
              <TableCell><strong>Sector</strong></TableCell>
              <TableCell><strong>COCODE</strong></TableCell>
              <TableCell><strong>Zona</strong></TableCell>
              <TableCell><strong>Dirección</strong></TableCell>
              <TableCell><strong>Población Est.</strong></TableCell>
              <TableCell><strong>Líderes</strong></TableCell>
              <TableCell><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {subcocodes.map((subcocode) => (
              <TableRow key={subcocode.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {subcocode.nombre}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={subcocode.sector || 'Sin sector'} 
                    size="small"
                    color="secondary"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {subcocode.cocode_nombre}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={subcocode.zona_nombre} 
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {subcocode.direccion || '-'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {subcocode.poblacion_estimada 
                      ? subcocode.poblacion_estimada.toLocaleString() 
                      : '-'
                    }
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={subcocode.total_lideres} 
                    size="small"
                    color="success"
                  />
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    <Tooltip title="Editar Sector">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => abrirModalEditar(subcocode)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Desactivar Sector">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(subcocode)}
                        disabled={subcocode.total_lideres > 0}
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

      {/* Modal Crear/Editar Sector */}
      <Dialog open={openModal} onClose={cerrarModal} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <GroupIcon />
            {isEditing ? 'Editar Sector/SUBCOCODE' : 'Crear Nuevo Sector/SUBCOCODE'}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Selección en cascada: Zona → COCODE */}
            <Grid item xs={12} sm={6}>
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

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required disabled={!formData.id_zona}>
                <InputLabel>COCODE Principal</InputLabel>
                <Select
                  name="id_cocode_principal"
                  value={formData.id_cocode_principal}
                  onChange={handleInputChange}
                  label="COCODE Principal"
                >
                  {cocodesFiltrados.map((cocode) => (
                    <MenuItem key={cocode.id} value={cocode.id}>
                      {cocode.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombre del Sector *"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                required
                placeholder="Ej: Sector Norte"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Identificador del Sector"
                name="sector"
                value={formData.sector}
                onChange={handleInputChange}
                placeholder="Ej: Sector A, Norte, etc."
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Dirección"
                name="direccion"
                value={formData.direccion}
                onChange={handleInputChange}
                placeholder="Ej: Barrio El Centro, 2da Calle 1-20"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Población Estimada"
                name="poblacion_estimada"
                type="number"
                value={formData.poblacion_estimada}
                onChange={handleInputChange}
                placeholder="5000"
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
            disabled={loading || !formData.id_zona || !formData.id_cocode_principal}
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

export default GestionSubcocode;