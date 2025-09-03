// frontend/src/vistas/tecnico/Dashboard.jsx - ACTUALIZADO CON FOTOS Y GPS
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Paper,
  Divider,
  Tabs,
  Tab,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  IconButton,
  Tooltip,
  LinearProgress,
  CircularProgress,
  Badge
} from '@mui/material';
import {
  Engineering as EngineeringIcon,
  Assignment as ReporteIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Comment as CommentIcon,
  PlayArrow as StartIcon,
  Pause as PauseIcon,
  Done as DoneIcon,
  History as HistoryIcon,
  Build as BuildIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  PhotoCamera as CameraIcon,
  MyLocation as GPSIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext.jsx';
import LogoutButton from '../../components/common/LogoutButton.jsx';
import tecnicoService, { 
  estadosPermitidosTecnico, 
  coloresEstados, 
  tiposSeguimiento,
  validarEvidenciaVisual,
  getEnlacesNavegacion
} from '../../services/tecnico/tecnicoService.js';

// Importar los nuevos componentes
import GaleriaFotosTecnico from '../../components/tecnico/GaleriaFotosTecnico.jsx';
import MapaUbicacionTecnico from '../../components/tecnico/MapaUbicacionTecnico.jsx';

const DashboardTecnico = () => {
  const { user, isAuthenticated, isTecnico } = useAuth();
  
  // Estados principales
  const [tabValue, setTabValue] = useState(0);
  const [reportes, setReportes] = useState([]);
  const [estadisticas, setEstadisticas] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estados para modales
  const [openCambiarEstado, setOpenCambiarEstado] = useState(false);
  const [openSeguimiento, setOpenSeguimiento] = useState(false);
  const [openHistorial, setOpenHistorial] = useState(false);
  const [openDetalles, setOpenDetalles] = useState(false); // NUEVO
  const [selectedReporte, setSelectedReporte] = useState(null);
  const [reporteDetalle, setReporteDetalle] = useState(null); // NUEVO
  const [historialReporte, setHistorialReporte] = useState([]);
  const [tabDetalles, setTabDetalles] = useState(0); // NUEVO
  
  // Estados para formularios
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [comentarioEstado, setComentarioEstado] = useState('');
  const [seguimientoData, setSeguimientoData] = useState({
    comentario: '',
    tiempo_invertido_horas: '',
    accion_tomada: ''
  });
  
  // Estados para notificaciones
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Verificación de autenticación y tipo de usuario
  useEffect(() => {
    if (!isAuthenticated) {
      setError('No estás autenticado. Redirigiendo al login...');
      return;
    }

    if (!isTecnico()) {
      setError('No tienes permisos de técnico. Contacta al administrador.');
      return;
    }

    if (!user?.id) {
      setError('No se pudo obtener tu información de usuario. Intenta cerrar sesión e iniciar nuevamente.');
      return;
    }

    // Si todo está bien, cargar los datos
    cargarDatos();
  }, [isAuthenticated, user, isTecnico]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError('');
      
      const tecnicoId = user.id;
      
      console.log(`Cargando datos para técnico ID: ${tecnicoId}, Departamento: ${user.departamento}`);
      
      const [reportesResponse, statsResponse] = await Promise.all([
        tecnicoService.getMisReportes(tecnicoId),
        tecnicoService.getEstadisticas(tecnicoId)
      ]);
      
      if (reportesResponse.success) {
        setReportes(reportesResponse.reportes || []);
        setEstadisticas(reportesResponse.estadisticas || {});
        console.log(`Cargados ${reportesResponse.reportes?.length || 0} reportes con fotos y GPS`);
      } else {
        throw new Error(reportesResponse.error || 'Error al obtener reportes');
      }
      
      if (statsResponse.success) {
        setEstadisticas(prev => ({ ...prev, ...statsResponse.estadisticas }));
      }
      
    } catch (error) {
      console.error('Error al cargar datos del técnico:', error);
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
      const response = await tecnicoService.getReporteDetalle(reporteId);
      
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
  const abrirModalCambiarEstado = (reporte) => {
    setSelectedReporte(reporte);
    setNuevoEstado('');
    setComentarioEstado('');
    setOpenCambiarEstado(true);
  };

  const abrirModalSeguimiento = (reporte) => {
    setSelectedReporte(reporte);
    setSeguimientoData({
      comentario: '',
      tiempo_invertido_horas: '',
      accion_tomada: ''
    });
    setOpenSeguimiento(true);
  };

  const abrirModalHistorial = async (reporte) => {
    setSelectedReporte(reporte);
    try {
      const response = await tecnicoService.getHistorialReporte(reporte.id);
      setHistorialReporte(response.historial || []);
      setOpenHistorial(true);
    } catch (error) {
      mostrarSnackbar('Error al cargar historial: ' + error.message, 'error');
    }
  };

  // NUEVA: Función para abrir modal de detalles completos
  const abrirModalDetalles = async (reporte) => {
    setSelectedReporte(reporte);
    setTabDetalles(0);
    setOpenDetalles(true);
    await cargarDetallesReporte(reporte.id);
  };

  // Funciones de acción
  const handleCambiarEstado = async () => {
    if (!selectedReporte || !nuevoEstado) return;
    
    try {
      setLoading(true);
      await tecnicoService.cambiarEstado(selectedReporte.id, nuevoEstado, comentarioEstado);
      mostrarSnackbar(`Estado cambiado exitosamente a "${nuevoEstado}"`, 'success');
      setOpenCambiarEstado(false);
      cargarDatos();
    } catch (error) {
      mostrarSnackbar('Error al cambiar estado: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAgregarSeguimiento = async () => {
    if (!selectedReporte || !seguimientoData.comentario) return;
    
    try {
      setLoading(true);
      await tecnicoService.agregarSeguimiento(selectedReporte.id, seguimientoData);
      mostrarSnackbar('Seguimiento agregado exitosamente', 'success');
      setOpenSeguimiento(false);
      cargarDatos();
    } catch (error) {
      mostrarSnackbar('Error al agregar seguimiento: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Funciones auxiliares
  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Asignado': return 'primary';
      case 'En Proceso': return 'warning';
      case 'Pendiente Materiales': return 'error';
      case 'Resuelto': return 'success';
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

  const getEstadosPermitidos = (estadoActual) => {
    return estadosPermitidosTecnico[estadoActual] || [];
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Verificaciones de seguridad antes de renderizar
  if (!isAuthenticated) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4}>
        <Alert severity="error">
          No estás autenticado. Redirigiendo al login...
        </Alert>
      </Box>
    );
  }

  if (!isTecnico()) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4}>
        <Alert severity="error">
          No tienes permisos de técnico. Contacta al administrador.
        </Alert>
      </Box>
    );
  }

  if (loading && reportes.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Cargando reportes asignados...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header del Panel Técnico */}
      <Box 
        bgcolor="warning.main" 
        color="white" 
        p={3}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Box>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EngineeringIcon sx={{ fontSize: 40 }} /> Panel Técnico
          </Typography>
          <Typography variant="h6">
            Técnico: {user?.nombre || 'Usuario'}
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Departamento: <strong>{user?.departamento || 'No especificado'}</strong> | 
            ID: {user?.id} | {user?.correo}
          </Typography>
        </Box>
        
        <LogoutButton variant="text" />
      </Box>

      {/* Contenido Principal */}
      <Box p={3}>
        {/* Alerta de Departamento */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <strong>Panel Técnico con Evidencia Visual:</strong> Ahora puedes ver las fotos y ubicación GPS que proporcionó el ciudadano para cada reporte de <strong>{user?.departamento}</strong>
        </Alert>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
            <Button onClick={cargarDatos} sx={{ ml: 2 }}>
              Reintentar
            </Button>
          </Alert>
        )}

        {/* Sistema de Tabs */}
        <Paper sx={{ borderRadius: 2, mb: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                minHeight: 64,
                fontSize: '0.95rem',
                fontWeight: 500
              }
            }}
          >
            <Tab 
              label="Mis Reportes" 
              icon={<ReporteIcon />}
              iconPosition="start"
            />
            <Tab 
              label="Estadísticas" 
              icon={<ScheduleIcon />}
              iconPosition="start"
            />
            <Tab 
              label="Herramientas" 
              icon={<BuildIcon />}
              iconPosition="start"
            />
          </Tabs>
        </Paper>

        {/* TAB 0: Mis Reportes */}
        {tabValue === 0 && (
          <Box>
            {/* Estadísticas mejoradas con fotos y GPS */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={2}>
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <ReporteIcon color="primary" sx={{ fontSize: 30, mb: 1 }} />
                    <Typography variant="h6" color="primary.main">
                      {estadisticas.total_asignados || 0}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Total Asignados
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={2}>
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <CameraIcon color="info" sx={{ fontSize: 30, mb: 1 }} />
                    <Typography variant="h6" color="info.main">
                      {estadisticas.con_fotos || 0}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Con Evidencia Fotográfica
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={2}>
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <GPSIcon color="success" sx={{ fontSize: 30, mb: 1 }} />
                    <Typography variant="h6" color="success.main">
                      {estadisticas.con_ubicacion || 0}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Con Ubicación GPS
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={2}>
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <CheckIcon color="success" sx={{ fontSize: 30, mb: 1 }} />
                    <Typography variant="h6" color="success.main">
                      {estadisticas.resueltos || 0}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Resueltos
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Lista de reportes mejorada */}
            {reportes.length > 0 ? (
              <Grid container spacing={3}>
                {reportes.map((reporte) => {
                  const evidencia = validarEvidenciaVisual(reporte);
                  
                  return (
                    <Grid item xs={12} md={6} key={reporte.id}>
                      <Card elevation={3}>
                        <CardContent>
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                            <Typography variant="h6" gutterBottom>
                              {reporte.titulo}
                            </Typography>
                            <Box display="flex" gap={1}>
                              <Chip 
                                label={reporte.estado}
                                color={getEstadoColor(reporte.estado)}
                                size="small"
                              />
                              {evidencia.esCompleto && (
                                <Chip 
                                  label="Evidencia Completa"
                                  color="success"
                                  size="small"
                                />
                              )}
                            </Box>
                          </Box>

                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            <strong>#{reporte.numero_reporte}</strong> | {reporte.tipo_problema}
                          </Typography>

                          <Typography variant="body2" sx={{ mb: 2 }}>
                            {reporte.descripcion.length > 100 ? 
                              `${reporte.descripcion.substring(0, 100)}...` : 
                              reporte.descripcion
                            }
                          </Typography>

                          {/* Información de ubicación con indicadores visuales */}
                          <Box display="flex" alignItems="center" mb={1}>
                            <LocationIcon fontSize="small" sx={{ mr: 1, color: 'grey.600' }} />
                            <Typography variant="body2" color="textSecondary">
                              {reporte.direccion}
                            </Typography>
                            {reporte.tiene_ubicacion_gps && (
                              <Chip 
                                icon={<GPSIcon />}
                                label="GPS"
                                size="small"
                                color="success"
                                variant="outlined"
                                sx={{ ml: 1 }}
                              />
                            )}
                          </Box>

                          {/* Evidencia visual */}
                          <Box display="flex" alignItems="center" mb={2}>
                            {reporte.tiene_fotos && (
                              <Badge badgeContent={reporte.total_fotos} color="primary">
                                <Chip 
                                  icon={<CameraIcon />}
                                  label="Fotos"
                                  size="small"
                                  color="info"
                                  variant="outlined"
                                  sx={{ mr: 1 }}
                                />
                              </Badge>
                            )}
                            
                            <Box display="flex" alignItems="center">
                              <PersonIcon fontSize="small" sx={{ mr: 0.5, color: 'grey.600' }} />
                              <Typography variant="body2" color="textSecondary">
                                {reporte.reportado_por}
                              </Typography>
                              {reporte.telefono_contacto && (
                                <PhoneIcon fontSize="small" sx={{ ml: 1, mr: 0.5, color: 'grey.600' }} />
                              )}
                            </Box>
                          </Box>

                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Chip 
                              label={`Prioridad: ${reporte.prioridad}`}
                              color={getPrioridadColor(reporte.prioridad)}
                              variant="outlined"
                              size="small"
                            />
                            <Typography variant="caption" color="textSecondary">
                              Asignado hace {reporte.dias_asignado || 0} días
                            </Typography>
                          </Box>

                          <Divider sx={{ my: 2 }} />

                          {/* Botones de acción mejorados */}
                          <Box display="flex" gap={1} flexWrap="wrap">
                            <Button
                              size="small"
                              variant="outlined"
                              color="primary"
                              startIcon={<ViewIcon />}
                              onClick={() => abrirModalDetalles(reporte)}
                            >
                              Ver Detalles
                            </Button>
                            <Button
                              size="small"
                              variant="contained"
                              color="primary"
                              startIcon={<StartIcon />}
                              onClick={() => abrirModalCambiarEstado(reporte)}
                              disabled={getEstadosPermitidos(reporte.estado).length === 0}
                            >
                              Cambiar Estado
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<CommentIcon />}
                              onClick={() => abrirModalSeguimiento(reporte)}
                            >
                              Seguimiento
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            ) : (
              <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
                <EngineeringIcon sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  No tienes reportes asignados
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Los reportes aparecerán aquí cuando los administradores te los asignen.
                </Typography>
                <Button 
                  variant="outlined" 
                  startIcon={<RefreshIcon />}
                  onClick={cargarDatos}
                  sx={{ mt: 2 }}
                >
                  Actualizar
                </Button>
              </Paper>
            )}
          </Box>
        )}

        {/* TAB 1: Estadísticas - Sin cambios */}
        {tabValue === 1 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Estadísticas de Rendimiento
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Resumen de Trabajo
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Total de reportes asignados"
                        secondary={estadisticas.total_asignados || 0}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Reportes con evidencia fotográfica"
                        secondary={`${estadisticas.con_fotos || 0} de ${estadisticas.total_asignados || 0}`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Reportes con ubicación GPS"
                        secondary={`${estadisticas.con_ubicacion || 0} de ${estadisticas.total_asignados || 0}`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Reportes resueltos"
                        secondary={estadisticas.resueltos || 0}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Promedio de días de resolución"
                        secondary={estadisticas.promedio_dias_resolucion ? 
                          `${parseFloat(estadisticas.promedio_dias_resolucion).toFixed(1)} días` : 
                          'No disponible'
                        }
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Estado Actual
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <ScheduleIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Pendientes de iniciar"
                        secondary={`${estadisticas.pendientes || 0} reportes`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <WarningIcon color="warning" />
                      </ListItemIcon>
                      <ListItemText
                        primary="En proceso"
                        secondary={`${estadisticas.en_proceso || 0} reportes`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <PauseIcon color="error" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Pendientes de materiales"
                        secondary={`${estadisticas.pendiente_materiales || 0} reportes`}
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* TAB 2: Herramientas - Sin cambios */}
        {tabValue === 2 && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Herramientas de Trabajo
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ textAlign: 'center', p: 3 }}>
                  <BuildIcon sx={{ fontSize: 50, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Lista de Materiales
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    Materiales necesarios por tipo de problema
                  </Typography>
                  <Button variant="outlined" disabled>
                    Próximamente
                  </Button>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ textAlign: 'center', p: 3 }}>
                  <CheckIcon sx={{ fontSize: 50, color: 'success.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Checklist de Procedimientos
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    Pasos para resolver cada tipo de problema
                  </Typography>
                  <Button variant="outlined" disabled>
                    Próximamente
                  </Button>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ textAlign: 'center', p: 3 }}>
                  <LocationIcon sx={{ fontSize: 50, color: 'warning.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Mapa de Reportes
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    Ubicación de reportes pendientes
                  </Typography>
                  <Button variant="outlined" disabled>
                    Próximamente
                  </Button>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
      </Box>

      {/* NUEVO: Modal Detalles Completos con Fotos y GPS */}
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
                    label={`Evidencia Fotográfica (${reporteDetalle.fotos?.length || 0})`}
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

                      {/* Evidencia visual disponible */}
                      <Alert 
                        severity={reporteDetalle.tiene_fotos && reporteDetalle.tiene_ubicacion_gps ? 'success' : 'info'} 
                        sx={{ mb: 2 }}
                      >
                        <Typography variant="body2">
                          <strong>Evidencia disponible:</strong>
                          {reporteDetalle.tiene_fotos && ' ✓ Fotos del problema'}
                          {reporteDetalle.tiene_ubicacion_gps && ' ✓ Ubicación GPS precisa'}
                          {!reporteDetalle.tiene_fotos && !reporteDetalle.tiene_ubicacion_gps && 
                            ' Solo información textual disponible'}
                        </Typography>
                      </Alert>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" gutterBottom>
                        Información del Ciudadano
                      </Typography>
                      <Typography variant="body2">
                        <strong>Nombre:</strong> {reporteDetalle.creador_nombre} {reporteDetalle.creador_apellido}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Teléfono:</strong> {reporteDetalle.creador_telefono || 'No disponible'}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Correo:</strong> {reporteDetalle.creador_correo || 'No disponible'}
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
                      <Typography variant="body2">
                        <strong>Tiempo estimado:</strong> {reporteDetalle.tiempo_estimado_dias || 'No especificado'} días
                      </Typography>

                      {/* Enlaces de navegación si hay GPS */}
                      {reporteDetalle.tiene_ubicacion_gps && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" gutterBottom>
                            <strong>Enlaces de Navegación:</strong>
                          </Typography>
                          <Box display="flex" gap={1} flexWrap="wrap">
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => window.open(getEnlacesNavegacion(reporteDetalle.latitud, reporteDetalle.longitud).googleMaps, '_blank')}
                            >
                              Google Maps
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => window.open(getEnlacesNavegacion(reporteDetalle.latitud, reporteDetalle.longitud).waze, '_blank')}
                            >
                              Waze
                            </Button>
                          </Box>
                        </Box>
                      )}
                    </Grid>
                  </Grid>
                </Box>
              )}

              {tabDetalles === 1 && reporteDetalle.tiene_fotos && (
                <GaleriaFotosTecnico 
                  fotos={reporteDetalle.fotos} 
                  maxHeight={400}
                  titulo="Evidencia Fotográfica del Ciudadano"
                />
              )}

              {tabDetalles === 2 && reporteDetalle.tiene_ubicacion_gps && (
                <MapaUbicacionTecnico 
                  latitud={reporteDetalle.latitud}
                  longitud={reporteDetalle.longitud}
                  metodo_ubicacion={reporteDetalle.metodo_ubicacion}
                  precision_metros={reporteDetalle.precision_metros}
                  direccion={reporteDetalle.direccion}
                  height={450}
                  titulo="Ubicación Exacta del Problema"
                  mostrarRuta={true}
                />
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetalles(false)}>
            Cerrar
          </Button>
          {selectedReporte && getEstadosPermitidos(selectedReporte.estado).length > 0 && (
            <Button 
              variant="contained" 
              color="warning"
              onClick={() => {
                setOpenDetalles(false);
                abrirModalCambiarEstado(selectedReporte);
              }}
            >
              Cambiar Estado
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Modal Cambiar Estado - Sin cambios */}
      <Dialog open={openCambiarEstado} onClose={() => setOpenCambiarEstado(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Cambiar Estado del Reporte
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              <strong>Reporte:</strong> {selectedReporte?.titulo}
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Estado actual: <strong>{selectedReporte?.estado}</strong>
            </Typography>
            
            <FormControl fullWidth sx={{ mt: 3, mb: 2 }}>
              <InputLabel>Nuevo Estado</InputLabel>
              <Select
                value={nuevoEstado}
                onChange={(e) => setNuevoEstado(e.target.value)}
                label="Nuevo Estado"
              >
                {getEstadosPermitidos(selectedReporte?.estado).map((estado) => (
                  <MenuItem key={estado} value={estado}>
                    {estado}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Comentario (opcional)"
              value={comentarioEstado}
              onChange={(e) => setComentarioEstado(e.target.value)}
              placeholder="Describe lo que has hecho o encontrado..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCambiarEstado(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleCambiarEstado}
            variant="contained"
            disabled={!nuevoEstado || loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Cambiar Estado'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Agregar Seguimiento - Sin cambios */}
      <Dialog open={openSeguimiento} onClose={() => setOpenSeguimiento(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Agregar Seguimiento
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              <strong>Reporte:</strong> {selectedReporte?.titulo}
            </Typography>
            
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Comentario *"
              value={seguimientoData.comentario}
              onChange={(e) => setSeguimientoData(prev => ({ ...prev, comentario: e.target.value }))}
              placeholder="Describe el trabajo realizado, problemas encontrados, etc."
              sx={{ mt: 2, mb: 2 }}
              required
            />

            <TextField
              fullWidth
              label="Tiempo invertido (horas)"
              type="number"
              value={seguimientoData.tiempo_invertido_horas}
              onChange={(e) => setSeguimientoData(prev => ({ ...prev, tiempo_invertido_horas: e.target.value }))}
              sx={{ mb: 2 }}
              inputProps={{ min: 0, step: 0.5 }}
            />

            <TextField
              fullWidth
              label="Acción tomada"
              value={seguimientoData.accion_tomada}
              onChange={(e) => setSeguimientoData(prev => ({ ...prev, accion_tomada: e.target.value }))}
              placeholder="Ej: Revisión inicial, Reparación, Solicitud de materiales..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSeguimiento(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleAgregarSeguimiento}
            variant="contained"
            disabled={!seguimientoData.comentario || loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Agregar Seguimiento'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Historial - Sin cambios */}
      <Dialog open={openHistorial} onClose={() => setOpenHistorial(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Historial del Reporte
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            <strong>Reporte:</strong> {selectedReporte?.titulo}
          </Typography>
          
          {historialReporte.length > 0 ? (
            <List>
              {historialReporte.map((evento, index) => (
                <ListItem key={index} divider>
                  <ListItemText
                    primary={
                      <Box>
                        <Typography variant="body1">
                          {evento.comentario || evento.accion_tomada || 'Cambio de estado'}
                        </Typography>
                        {evento.estado_anterior_nombre && evento.estado_nuevo_nombre && (
                          <Typography variant="body2" color="primary">
                            {evento.estado_anterior_nombre} → {evento.estado_nuevo_nombre}
                          </Typography>
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          {evento.usuario_seguimiento} - {new Date(evento.fecha_seguimiento).toLocaleString()}
                        </Typography>
                        {evento.tiempo_invertido_horas && (
                          <Typography variant="caption" color="textSecondary" display="block">
                            Tiempo: {evento.tiempo_invertido_horas} horas
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="textSecondary" textAlign="center" py={2}>
              No hay historial disponible para este reporte.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenHistorial(false)}>
            Cerrar
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

      {/* Footer Info */}
      <Box mt={4} p={2} bgcolor="warning.50" borderRadius={1} border="1px solid" borderColor="warning.200">
        <Typography variant="body2" color="textSecondary" textAlign="center">
          <strong>Panel Técnico Mejorado:</strong> Ahora puedes ver fotos y ubicación GPS del ciudadano | 
          Gestionar reportes de tu departamento | Cambiar estados | Subir evidencia | Navegación directa |
          <strong> Nuevas funciones:</strong> Vista completa de evidencia visual | Enlaces de navegación GPS | Validación de evidencia completa
        </Typography>
      </Box>
    </Box>
  );
};

export default DashboardTecnico;