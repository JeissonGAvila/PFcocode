// frontend/src/components/admin/GestionZonas.jsx
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
  Chip,
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
  Divider,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tabs,
  Tab
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  LocationCity as LocationIcon,
  People as PeopleIcon,
  Assignment as ReportIcon,
  Group as GroupIcon,
  ExpandMore as ExpandMoreIcon,
  Map as MapIcon,
  Home as HomeIcon,
  Phone as PhoneIcon,
  Place as PlaceIcon
} from '@mui/icons-material';
import zonasService, { tiposCobertura, sectoresComunes, validacionesZona, validacionesCocode } from '../../services/admin/zonasService.js';

const GestionZonas = () => {
  // Estados principales
  const [zonas, setZonas] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados para modales
  const [openModal, setOpenModal] = useState(false);
  const [openSubcocodeModal, setOpenSubcocodeModal] = useState(false);
  const [editingZona, setEditingZona] = useState(null);
  const [selectedZona, setSelectedZona] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Estados para tabs
  const [tabValue, setTabValue] = useState(0);

  // Estados para formularios
  const [formData, setFormData] = useState({
    // Datos de la zona
    nombre: '',
    numero_zona: '',
    descripcion: '',
    poblacion_estimada: '',
    area_km2: '',
    coordenadas_centro: '',
    // Datos del COCODE principal
    cocode_nombre: '',
    cocode_direccion: '',
    cocode_telefono: '',
    cocode_poblacion: '',
    cocode_latitud: '',
    cocode_longitud: ''
  });

  const [subcocodeData, setSubcocodeData] = useState({
    nombre: '',
    sector: '',
    aldea_canton: '',
    direccion_oficina: '',
    telefono: '',
    poblacion_estimada: '',
    latitud: '',
    longitud: '',
    area_cobertura: ''
  });

  // Estados para notificaciones
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Cargar datos iniciales
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

  // Funciones para modales
  const abrirModalCrear = () => {
    setFormData({
      nombre: '',
      numero_zona: '',
      descripcion: '',
      poblacion_estimada: '',
      area_km2: '',
      coordenadas_centro: '',
      cocode_nombre: '',
      cocode_direccion: '',
      cocode_telefono: '',
      cocode_poblacion: '',
      cocode_latitud: '',
      cocode_longitud: ''
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
      area_km2: zona.area_km2 || '',
      coordenadas_centro: zona.coordenadas_centro || '',
      cocode_nombre: zona.cocode_nombre || '',
      cocode_direccion: zona.cocode_direccion || '',
      cocode_telefono: zona.cocode_telefono || '',
      cocode_poblacion: zona.cocode_poblacion || '',
      cocode_latitud: zona.cocode_latitud || '',
      cocode_longitud: zona.cocode_longitud || ''
    });
    setEditingZona(zona);
    setIsEditing(true);
    setOpenModal(true);
  };

  const abrirModalSubcocode = (zona) => {
    setSelectedZona(zona);
    setSubcocodeData({
      nombre: '',
      sector: '',
      aldea_canton: '',
      direccion_oficina: '',
      telefono: '',
      poblacion_estimada: '',
      latitud: '',
      longitud: '',
      area_cobertura: ''
    });
    setOpenSubcocodeModal(true);
  };

  const cerrarModales = () => {
    setOpenModal(false);
    setOpenSubcocodeModal(false);
    setEditingZona(null);
    setSelectedZona(null);
    setIsEditing(false);
  };

  // Funciones de formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubcocodeInputChange = (e) => {
    const { name, value } = e.target;
    setSubcocodeData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Funciones de acción
  const handleSubmit = async () => {
    try {
      // Validaciones básicas
      if (!formData.nombre || !formData.numero_zona) {
        mostrarSnackbar('Nombre y número de zona son requeridos', 'error');
        return;
      }

      // Validar número único
      const numeroValido = await zonasService.validateNumeroZona(
        formData.numero_zona, 
        isEditing ? editingZona.id : null
      );
      
      if (!numeroValido) {
        mostrarSnackbar('Ya existe una zona con este número', 'error');
        return;
      }

      // Validar nombre único
      const nombreValido = await zonasService.validateNombreZona(
        formData.nombre, 
        isEditing ? editingZona.id : null
      );
      
      if (!nombreValido) {
        mostrarSnackbar('Ya existe una zona con este nombre', 'error');
        return;
      }

      setLoading(true);

      // Preparar datos para envío
      const dataToSend = {
        ...formData,
        numero_zona: parseInt(formData.numero_zona),
        poblacion_estimada: formData.poblacion_estimada ? parseInt(formData.poblacion_estimada) : null,
        area_km2: formData.area_km2 ? parseFloat(formData.area_km2) : null,
        cocode_poblacion: formData.cocode_poblacion ? parseInt(formData.cocode_poblacion) : null,
        cocode_latitud: formData.cocode_latitud ? parseFloat(formData.cocode_latitud) : null,
        cocode_longitud: formData.cocode_longitud ? parseFloat(formData.cocode_longitud) : null
      };

      if (isEditing) {
        await zonasService.update(editingZona.id, dataToSend);
        mostrarSnackbar('Zona actualizada exitosamente', 'success');
      } else {
        await zonasService.create(dataToSend);
        mostrarSnackbar('Zona creada exitosamente', 'success');
      }

      cerrarModales();
      cargarDatos();

    } catch (error) {
      mostrarSnackbar(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubcocodeSubmit = async () => {
    try {
      if (!subcocodeData.nombre || !subcocodeData.sector) {
        mostrarSnackbar('Nombre y sector son requeridos', 'error');
        return;
      }

      setLoading(true);

      // Preparar datos para envío
      const dataToSend = {
        ...subcocodeData,
        poblacion_estimada: subcocodeData.poblacion_estimada ? parseInt(subcocodeData.poblacion_estimada) : null,
        latitud: subcocodeData.latitud ? parseFloat(subcocodeData.latitud) : null,
        longitud: subcocodeData.longitud ? parseFloat(subcocodeData.longitud) : null
      };

      await zonasService.createSubCocode(selectedZona.id, dataToSend);
      mostrarSnackbar('Sub-COCODE creado exitosamente', 'success');
      cerrarModales();
      cargarDatos();

    } catch (error) {
      mostrarSnackbar(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (zona) => {
    if (window.confirm(`¿Estás seguro de desactivar la zona "${zona.nombre}"? Esto también desactivará sus COCODE asociados.`)) {
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

  // Funciones auxiliares
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
      {/* Estadísticas Generales */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={1}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="primary">{stats.total_zonas || 0}</Typography>
              <Typography variant="body2">Zonas Totales</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={1}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="success.main">{formatearNumero(stats.poblacion_total)}</Typography>
              <Typography variant="body2">Población Total</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={1}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="warning.main">{stats.total_lideres || 0}</Typography>
              <Typography variant="body2">Líderes COCODE</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={1}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="info.main">{stats.total_subcocode || 0}</Typography>
              <Typography variant="body2">Sub-COCODE</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Header */}
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

      {/* Tabs para diferentes vistas */}
      <Paper elevation={2} sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
          <Tab label="Vista Tabla" icon={<LocationIcon />} iconPosition="start" />
          <Tab label="Vista Detallada" icon={<MapIcon />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* TAB 0: Vista Tabla */}
      {tabValue === 0 && (
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'grey.100' }}>
                <TableCell><strong>Zona</strong></TableCell>
                <TableCell><strong>COCODE Principal</strong></TableCell>
                <TableCell><strong>Población</strong></TableCell>
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
                        Zona {zona.numero_zona}: {zona.nombre}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {zona.descripcion || 'Sin descripción'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {zona.cocode_nombre || 'Sin COCODE'}
                      </Typography>
                      {zona.cocode_telefono && (
                        <Typography variant="caption" color="textSecondary">
                          Tel: {zona.cocode_telefono}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatearNumero(zona.poblacion_estimada)} hab.
                    </Typography>
                    {zona.area_km2 && (
                      <Typography variant="caption" color="textSecondary" display="block">
                        Área: {zona.area_km2} km²
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        Sub-COCODE: {zona.total_subcocode || 0}
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
                      <Tooltip title="Crear Sub-COCODE">
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => abrirModalSubcocode(zona)}
                        >
                          <AddIcon />
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
      )}

      {/* TAB 1: Vista Detallada */}
      {tabValue === 1 && (
        <Box>
          {zonas.map((zona) => (
            <Accordion key={zona.id} elevation={2} sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box display="flex" alignItems="center" width="100%" justifyContent="space-between">
                  <Typography variant="h6">
                    Zona {zona.numero_zona}: {zona.nombre}
                  </Typography>
                  <Box display="flex" gap={1} mr={2}>
                    {getEstadoChip(zona.estado)}
                    <Chip 
                      label={`${zona.total_ciudadanos || 0} ciudadanos`} 
                      color="info" 
                      size="small" 
                    />
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={3}>
                  {/* Información General */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Información General
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon><LocationIcon /></ListItemIcon>
                        <ListItemText
                          primary="Descripción"
                          secondary={zona.descripcion || 'Sin descripción'}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><PeopleIcon /></ListItemIcon>
                        <ListItemText
                          primary="Población Estimada"
                          secondary={`${formatearNumero(zona.poblacion_estimada)} habitantes`}
                        />
                      </ListItem>
                      {zona.area_km2 && (
                        <ListItem>
                          <ListItemIcon><MapIcon /></ListItemIcon>
                          <ListItemText
                            primary="Área"
                            secondary={`${zona.area_km2} km²`}
                          />
                        </ListItem>
                      )}
                      {zona.coordenadas_centro && (
                        <ListItem>
                          <ListItemIcon><PlaceIcon /></ListItemIcon>
                          <ListItemText
                            primary="Coordenadas Centro"
                            secondary={zona.coordenadas_centro}
                          />
                        </ListItem>
                      )}
                    </List>
                  </Grid>

                  {/* COCODE Principal */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      COCODE Principal
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon><GroupIcon /></ListItemIcon>
                        <ListItemText
                          primary="Nombre"
                          secondary={zona.cocode_nombre || 'Sin COCODE'}
                        />
                      </ListItem>
                      {zona.cocode_direccion && (
                        <ListItem>
                          <ListItemIcon><HomeIcon /></ListItemIcon>
                          <ListItemText
                            primary="Dirección"
                            secondary={zona.cocode_direccion}
                          />
                        </ListItem>
                      )}
                      {zona.cocode_telefono && (
                        <ListItem>
                          <ListItemIcon><PhoneIcon /></ListItemIcon>
                          <ListItemText
                            primary="Teléfono"
                            secondary={zona.cocode_telefono}
                          />
                        </ListItem>
                      )}
                      <ListItem>
                        <ListItemIcon><PeopleIcon /></ListItemIcon>
                        <ListItemText
                          primary="Sub-COCODE"
                          secondary={`${zona.total_subcocode || 0} registrados`}
                        />
                      </ListItem>
                    </List>
                  </Grid>

                  {/* Estadísticas */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Estadísticas
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6} sm={3}>
                        <Card variant="outlined">
                          <CardContent sx={{ textAlign: 'center', py: 1 }}>
                            <Typography variant="h6" color="primary">
                              {zona.total_subcocode || 0}
                            </Typography>
                            <Typography variant="caption">Sub-COCODE</Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Card variant="outlined">
                          <CardContent sx={{ textAlign: 'center', py: 1 }}>
                            <Typography variant="h6" color="success.main">
                              {zona.total_ciudadanos || 0}
                            </Typography>
                            <Typography variant="caption">Ciudadanos</Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Card variant="outlined">
                          <CardContent sx={{ textAlign: 'center', py: 1 }}>
                            <Typography variant="h6" color="warning.main">
                              {zona.total_reportes || 0}
                            </Typography>
                            <Typography variant="caption">Reportes</Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Card variant="outlined">
                          <CardContent sx={{ textAlign: 'center', py: 1 }}>
                            <Typography variant="h6" color="info.main">
                              {zona.total_lideres || 0}
                            </Typography>
                            <Typography variant="caption">Líderes</Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Grid>

                  {/* Acciones */}
                  <Grid item xs={12}>
                    <Box display="flex" gap={2} justifyContent="flex-end">
                      <Button
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={() => abrirModalEditar(zona)}
                      >
                        Editar Zona
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => abrirModalSubcocode(zona)}
                      >
                        Crear Sub-COCODE
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}

      {/* Modal Crear/Editar Zona */}
      <Dialog open={openModal} onClose={cerrarModales} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <LocationIcon />
            {isEditing ? 'Editar Zona' : 'Crear Nueva Zona'}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Información de la Zona */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Información de la Zona
              </Typography>
              <Divider />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombre de la Zona *"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                required
                placeholder="Ej: Zona 1 Centro"
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
                rows={2}
                placeholder="Descripción general de la zona..."
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
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
            
            <Grid item xs={12} sm={4}>
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
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Coordenadas Centro"
                name="coordenadas_centro"
                value={formData.coordenadas_centro}
                onChange={handleInputChange}
                placeholder="15.3194, -91.4719"
              />
            </Grid>

            {/* Información del COCODE Principal */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                COCODE Principal
              </Typography>
              <Divider />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombre del COCODE"
                name="cocode_nombre"
                value={formData.cocode_nombre}
                onChange={handleInputChange}
                placeholder="COCODE Principal Zona 1"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Teléfono COCODE"
                name="cocode_telefono"
                value={formData.cocode_telefono}
                onChange={handleInputChange}
                placeholder="7712-3456"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Dirección de Oficina"
                name="cocode_direccion"
                value={formData.cocode_direccion}
                onChange={handleInputChange}
                placeholder="1a Avenida 2-15, Zona 1"
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Población COCODE"
                name="cocode_poblacion"
                type="number"
                value={formData.cocode_poblacion}
                onChange={handleInputChange}
                inputProps={{ min: 0 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Latitud"
                name="cocode_latitud"
                type="number"
                value={formData.cocode_latitud}
                onChange={handleInputChange}
                inputProps={{ step: 0.000001 }}
                placeholder="15.3194"
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Longitud"
                name="cocode_longitud"
                type="number"
                value={formData.cocode_longitud}
                onChange={handleInputChange}
                inputProps={{ step: 0.000001 }}
                placeholder="-91.4719"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={cerrarModales}>
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

      {/* Modal Crear Sub-COCODE */}
      <Dialog open={openSubcocodeModal} onClose={cerrarModales} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <GroupIcon />
            Crear Sub-COCODE en {selectedZona?.nombre}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombre del Sub-COCODE *"
                name="nombre"
                value={subcocodeData.nombre}
                onChange={handleSubcocodeInputChange}
                required
                placeholder="Sub-COCODE La Democracia"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Sector *"
                name="sector"
                value={subcocodeData.sector}
                onChange={handleSubcocodeInputChange}
                required
                placeholder="La Democracia"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Aldea/Cantón"
                name="aldea_canton"
                value={subcocodeData.aldea_canton}
                onChange={handleSubcocodeInputChange}
                placeholder="Aldea Centro"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Teléfono"
                name="telefono"
                value={subcocodeData.telefono}
                onChange={handleSubcocodeInputChange}
                placeholder="7712-3456"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Dirección de Oficina"
                name="direccion_oficina"
                value={subcocodeData.direccion_oficina}
                onChange={handleSubcocodeInputChange}
                placeholder="2a Calle 1-25, La Democracia"
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Población Estimada"
                name="poblacion_estimada"
                type="number"
                value={subcocodeData.poblacion_estimada}
                onChange={handleSubcocodeInputChange}
                inputProps={{ min: 0 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Latitud"
                name="latitud"
                type="number"
                value={subcocodeData.latitud}
                onChange={handleSubcocodeInputChange}
                inputProps={{ step: 0.000001 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Longitud"
                name="longitud"
                type="number"
                value={subcocodeData.longitud}
                onChange={handleSubcocodeInputChange}
                inputProps={{ step: 0.000001 }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Área de Cobertura"
                name="area_cobertura"
                value={subcocodeData.area_cobertura}
                onChange={handleSubcocodeInputChange}
                multiline
                rows={2}
                placeholder="Descripción del área que cubre este sub-COCODE..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={cerrarModales}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubcocodeSubmit}
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Crear Sub-COCODE'}
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

export default GestionZonas;