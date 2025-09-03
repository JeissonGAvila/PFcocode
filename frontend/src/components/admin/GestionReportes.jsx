// frontend/src/components/admin/GestionReportes.jsx - ACTUALIZADO CON FOTOS Y UBICACIÓN
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
  Alert,
  CircularProgress,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Tooltip,
  Tabs,
  Tab,
  Badge
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Assignment as AssignIcon,
  SwapHoriz as SwapHorizIcon,
  Flag as PriorityIcon,
  Refresh as RefreshIcon,
  PhotoCamera as PhotoIcon,
  MyLocation as LocationIcon,
  Phone as PhoneIcon,
  Close as CloseIcon
} from '@mui/icons-material';

// Importar los nuevos componentes
import GaleriaFotosAdmin from './GaleriaFotosAdmin.jsx';
import MapaUbicacionAdmin from './MapaUbicacionAdmin.jsx';
import reportesService from '../../services/admin/reportesService.js';

const GestionReportes = () => {
  // Estados principales
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estados para datos de selects
  const [tecnicos, setTecnicos] = useState([]);
  const [estados, setEstados] = useState([]);
  const [prioridades] = useState(['Alta', 'Media', 'Baja']);
  const [estadisticas, setEstadisticas] = useState({});
  
  // Estados para modales
  const [openAsignar, setOpenAsignar] = useState(false);
  const [openEstado, setOpenEstado] = useState(false);
  const [openPrioridad, setOpenPrioridad] = useState(false);
  const [openDetalles, setOpenDetalles] = useState(false); // NUEVO
  const [selectedReporte, setSelectedReporte] = useState(null);
  const [reporteDetalle, setReporteDetalle] = useState(null); // NUEVO
  const [tabDetalles, setTabDetalles] = useState(0); // NUEVO
  
  // Estados para formularios
  const [selectedTecnico, setSelectedTecnico] = useState('');
  const [selectedEstado, setSelectedEstado] = useState('');
  const [selectedPrioridadValue, setSelectedPrioridadValue] = useState('');
  
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
      
      // Cargar reportes y datos de selects en paralelo
      const [reportesResponse, datosResponse] = await Promise.all([
        reportesService.getAll(),
        reportesService.getDatosSelect()
      ]);
      
      if (reportesResponse.success) {
        setReportes(reportesResponse.reportes);
        setEstadisticas(reportesResponse.estadisticas || {});
      }
      
      if (datosResponse.success) {
        setTecnicos(datosResponse.tecnicos);
        setEstados(datosResponse.estados);
      }
      
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError(error.message);
      mostrarSnackbar('Error al cargar datos: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // NUEVA: Cargar detalles completos de un reporte
  const cargarDetallesReporte = async (reporteId) => {
    try {
      setLoading(true);
      const response = await reportesService.getDetalle(reporteId);
      
      if (response.success) {
        setReporteDetalle(response.reporte);
      } else {
        mostrarSnackbar('Error al cargar detalles del reporte', 'error');
      }
    } catch (error) {
      console.error('Error al cargar detalles:', error);
      mostrarSnackbar('Error al cargar detalles: ' + error.message, 'error');
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
  const abrirModalAsignar = (reporte) => {
    setSelectedReporte(reporte);
    setSelectedTecnico('');
    setOpenAsignar(true);
  };

  const abrirModalEstado = (reporte) => {
    setSelectedReporte(reporte);
    setSelectedEstado('');
    setOpenEstado(true);
  };

  const abrirModalPrioridad = (reporte) => {
    setSelectedReporte(reporte);
    setSelectedPrioridadValue(reporte.prioridad || '');
    setOpenPrioridad(true);
  };

  // NUEVA: Función para abrir modal de detalles
  const abrirModalDetalles = async (reporte) => {
    setSelectedReporte(reporte);
    setTabDetalles(0);
    setOpenDetalles(true);
    await cargarDetallesReporte(reporte.id);
  };

  // Funciones de acción
  const handleAsignar = async () => {
    if (!selectedReporte || !selectedTecnico) return;
    
    try {
      setLoading(true);
      await reportesService.asignar(selectedReporte.id, selectedTecnico);
      mostrarSnackbar('Reporte asignado exitosamente', 'success');
      setOpenAsignar(false);
      cargarDatos();
    } catch (error) {
      mostrarSnackbar('Error al asignar reporte: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarEstado = async () => {
    if (!selectedReporte || !selectedEstado) return;
    
    try {
      setLoading(true);
      await reportesService.cambiarEstado(selectedReporte.id, selectedEstado);
      mostrarSnackbar('Estado cambiado exitosamente', 'success');
      setOpenEstado(false);
      cargarDatos();
    } catch (error) {
      mostrarSnackbar('Error al cambiar estado: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarPrioridad = async () => {
    if (!selectedReporte || !selectedPrioridadValue) return;
    
    try {
      setLoading(true);
      await reportesService.cambiarPrioridad(selectedReporte.id, selectedPrioridadValue);
      mostrarSnackbar('Prioridad cambiada exitosamente', 'success');
      setOpenPrioridad(false);
      cargarDatos();
    } catch (error) {
      mostrarSnackbar('Error al cambiar prioridad: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Funciones auxiliares
  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Nuevo': return 'info';
      case 'Aprobado por Líder': return 'success';
      case 'En Revisión': return 'warning';
      case 'Asignado': return 'primary';
      case 'En Proceso': return 'warning';
      case 'Resuelto': return 'success';
      case 'Cerrado': return 'success';
      default: return 'default';
    }
  };

  const getPrioridadColor = (prioridad) => {
    switch (prioridad) {
      case 'Alta': return 'error';
      case 'Media': return 'warning';
      case 'Baja': return 'success';
      default: return 'default';
    }
  };

  if (loading && reportes.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Cargando reportes aprobados por líderes...
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
      {/* Header con estadísticas */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">
          Gestión de Reportes ({reportes.length} total)
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={cargarDatos}
          disabled={loading}
        >
          Actualizar
        </Button>
      </Box>

      {/* Estadísticas rápidas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="primary">
              {reportes.length}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Reportes Pendientes
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="info.main">
              {estadisticas.con_fotos || 0}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Con Evidencia Fotográfica
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="success.main">
              {estadisticas.con_ubicacion || 0}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Con Ubicación GPS
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="error.main">
              {estadisticas.criticos || 0}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Prioridad Alta
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Alerta informativa */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Flujo de Trabajo:</strong> Estos reportes fueron aprobados por líderes COCODE y están listos para asignación. 
          Los reportes con fotos y ubicación GPS facilitan el trabajo de los técnicos.
        </Typography>
      </Alert>

      {/* Tabla de reportes mejorada */}
      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'grey.100' }}>
              <TableCell><strong>Número</strong></TableCell>
              <TableCell><strong>Título</strong></TableCell>
              <TableCell><strong>Tipo</strong></TableCell>
              <TableCell><strong>Estado</strong></TableCell>
              <TableCell><strong>Prioridad</strong></TableCell>
              <TableCell><strong>Evidencia</strong></TableCell>
              <TableCell><strong>Técnico Asignado</strong></TableCell>
              <TableCell><strong>Zona</strong></TableCell>
              <TableCell><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reportes.map((reporte) => (
              <TableRow key={reporte.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {reporte.numero_reporte}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {new Date(reporte.fecha_reporte).toLocaleDateString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {reporte.titulo}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Por: {reporte.ciudadano_creador}
                    </Typography>
                    {reporte.ciudadano_telefono && (
                      <Typography variant="caption" display="block" color="textSecondary">
                        Tel: {reporte.ciudadano_telefono}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {reporte.tipo_problema}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {reporte.departamento_responsable}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={reporte.estado}
                    color={getEstadoColor(reporte.estado)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={reporte.prioridad}
                    color={getPrioridadColor(reporte.prioridad)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    {reporte.tiene_fotos && (
                      <Badge badgeContent={reporte.total_fotos} color="primary">
                        <Chip
                          icon={<PhotoIcon />}
                          label="Fotos"
                          size="small"
                          color="info"
                          variant="outlined"
                        />
                      </Badge>
                    )}
                    {reporte.tiene_ubicacion_gps && (
                      <Chip
                        icon={<LocationIcon />}
                        label="GPS"
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {reporte.tecnico_asignado}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {reporte.zona}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    <Tooltip title="Ver detalles completos">
                      <IconButton 
                        size="small" 
                        color="primary"
                        onClick={() => abrirModalDetalles(reporte)}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Asignar técnico">
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => abrirModalAsignar(reporte)}
                      >
                        <AssignIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Cambiar estado">
                      <IconButton
                        size="small"
                        color="warning"
                        onClick={() => abrirModalEstado(reporte)}
                      >
                        <SwapHorizIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Cambiar prioridad">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => abrirModalPrioridad(reporte)}
                      >
                        <PriorityIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* NUEVO: Modal Detalles Completos */}
      <Dialog open={openDetalles} onClose={() => setOpenDetalles(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Detalles del Reporte #{selectedReporte?.numero_reporte}
          </Typography>
          <IconButton onClick={() => setOpenDetalles(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {reporteDetalle && (
            <Box>
              <Paper sx={{ mb: 2 }}>
                <Tabs value={tabDetalles} onChange={(e, newValue) => setTabDetalles(newValue)}>
                  <Tab label="Información General" />
                  <Tab 
                    label={`Fotos (${reporteDetalle.fotos?.length || 0})`}
                    disabled={!reporteDetalle.tiene_fotos}
                  />
                  <Tab 
                    label="Ubicación GPS" 
                    disabled={!reporteDetalle.tiene_ubicacion_gps}
                  />
                </Tabs>
              </Paper>

              {tabDetalles === 0 && (
                <Box>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" gutterBottom>
                        {reporteDetalle.titulo}
                      </Typography>
                      
                      <Typography variant="body1" gutterBottom>
                        <strong>Descripción:</strong>
                      </Typography>
                      <Typography variant="body2" paragraph>
                        {reporteDetalle.descripcion}
                      </Typography>
                      
                      <Typography variant="body1" gutterBottom>
                        <strong>Dirección:</strong>
                      </Typography>
                      <Typography variant="body2" paragraph>
                        {reporteDetalle.direccion}
                      </Typography>

                      <Box display="flex" gap={1} mb={2}>
                        <Chip 
                          label={reporteDetalle.estado}
                          color={getEstadoColor(reporteDetalle.estado)}
                        />
                        <Chip 
                          label={reporteDetalle.prioridad}
                          color={getPrioridadColor(reporteDetalle.prioridad)}
                        />
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" gutterBottom>
                        Información del Ciudadano
                      </Typography>
                      <Typography variant="body2">
                        <strong>Nombre:</strong> {reporteDetalle.ciudadano_nombre} {reporteDetalle.ciudadano_apellido}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Teléfono:</strong> {reporteDetalle.ciudadano_telefono}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Correo:</strong> {reporteDetalle.ciudadano_correo}
                      </Typography>
                      
                      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                        Información Técnica
                      </Typography>
                      <Typography variant="body2">
                        <strong>Tipo:</strong> {reporteDetalle.tipo_problema}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Departamento:</strong> {reporteDetalle.departamento_responsable}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Zona:</strong> {reporteDetalle.zona_nombre}
                      </Typography>

                      {reporteDetalle.tecnico_nombre && (
                        <>
                          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                            Técnico Asignado
                          </Typography>
                          <Typography variant="body2">
                            <strong>Nombre:</strong> {reporteDetalle.tecnico_nombre} {reporteDetalle.tecnico_apellido}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Teléfono:</strong> {reporteDetalle.tecnico_telefono}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Departamento:</strong> {reporteDetalle.tecnico_departamento}
                          </Typography>
                        </>
                      )}
                    </Grid>
                  </Grid>
                </Box>
              )}

              {tabDetalles === 1 && reporteDetalle.tiene_fotos && (
                <GaleriaFotosAdmin 
                  fotos={reporteDetalle.fotos} 
                  maxHeight={400}
                  titulo="Evidencia Fotográfica del Ciudadano"
                />
              )}

              {tabDetalles === 2 && reporteDetalle.tiene_ubicacion_gps && (
                <MapaUbicacionAdmin 
                  latitud={reporteDetalle.latitud}
                  longitud={reporteDetalle.longitud}
                  metodo_ubicacion={reporteDetalle.metodo_ubicacion}
                  precision_metros={reporteDetalle.precision_metros}
                  direccion={reporteDetalle.direccion}
                  height={450}
                  titulo="Ubicación Proporcionada por el Ciudadano"
                />
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetalles(false)}>
            Cerrar
          </Button>
          {selectedReporte?.estado === 'Aprobado por Líder' && (
            <>
              <Button 
                variant="contained" 
                color="success"
                onClick={() => {
                  setOpenDetalles(false);
                  abrirModalAsignar(selectedReporte);
                }}
              >
                Asignar Técnico
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Modal Asignar Técnico */}
      <Dialog open={openAsignar} onClose={() => setOpenAsignar(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Asignar Técnico
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              <strong>Reporte:</strong> {selectedReporte?.titulo}
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {selectedReporte?.numero_reporte} | {selectedReporte?.tipo_problema}
            </Typography>
            
            <FormControl fullWidth sx={{ mt: 3 }}>
              <InputLabel>Seleccionar Técnico</InputLabel>
              <Select
                value={selectedTecnico}
                onChange={(e) => setSelectedTecnico(e.target.value)}
                label="Seleccionar Técnico"
              >
                {tecnicos
                  .filter(tecnico => tecnico.departamento === selectedReporte?.departamento_responsable)
                  .map((tecnico) => (
                    <MenuItem key={tecnico.id} value={tecnico.id}>
                      {tecnico.nombre} {tecnico.apellido} - {tecnico.departamento}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            {selectedReporte && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Solo se muestran técnicos del departamento: <strong>{selectedReporte.departamento_responsable}</strong>
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAsignar(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleAsignar}
            variant="contained"
            disabled={!selectedTecnico || loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Asignar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Cambiar Estado */}
      <Dialog open={openEstado} onClose={() => setOpenEstado(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Cambiar Estado
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              <strong>Reporte:</strong> {selectedReporte?.titulo}
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Estado actual: {selectedReporte?.estado}
            </Typography>
            
            <FormControl fullWidth sx={{ mt: 3 }}>
              <InputLabel>Nuevo Estado</InputLabel>
              <Select
                value={selectedEstado}
                onChange={(e) => setSelectedEstado(e.target.value)}
                label="Nuevo Estado"
              >
                {estados.map((estado) => (
                  <MenuItem key={estado.id} value={estado.id}>
                    {estado.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEstado(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleCambiarEstado}
            variant="contained"
            disabled={!selectedEstado || loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Cambiar Estado'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Cambiar Prioridad */}
      <Dialog open={openPrioridad} onClose={() => setOpenPrioridad(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Cambiar Prioridad
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              <strong>Reporte:</strong> {selectedReporte?.titulo}
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Prioridad actual: {selectedReporte?.prioridad}
            </Typography>
            
            <FormControl fullWidth sx={{ mt: 3 }}>
              <InputLabel>Nueva Prioridad</InputLabel>
              <Select
                value={selectedPrioridadValue}
                onChange={(e) => setSelectedPrioridadValue(e.target.value)}
                label="Nueva Prioridad"
              >
                {prioridades.map((prioridad) => (
                  <MenuItem key={prioridad} value={prioridad}>
                    {prioridad}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPrioridad(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleCambiarPrioridad}
            variant="contained"
            disabled={!selectedPrioridadValue || loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Cambiar Prioridad'}
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

export default GestionReportes;