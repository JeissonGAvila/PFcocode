// frontend/src/vistas/ciudadano/Dashboard.jsx - COMPLETO CON GEOLOCALIZACIÓN
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  CircularProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Divider,
  LinearProgress,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Person as PersonIcon,
  Add as AddIcon,
  LocationOn as LocationIcon,
  MyLocation as GPSIcon,
  Map as MapIcon,
  Assignment as ReporteIcon,
  Comment as CommentIcon,
  Timeline as TimelineIcon,
  Refresh as RefreshIcon,
  Notifications as NotificationsIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext.jsx';
import LogoutButton from '../../components/common/LogoutButton.jsx';
import ciudadanoService, { geoUtils, estadosReporteCiudadano, prioridadesReporte } from '../../services/ciudadano/ciudadanoService.js';

const DashboardCiudadano = () => {
  const { user, isAuthenticated, isCiudadano } = useAuth();
  
  // Estados principales
  const [tabValue, setTabValue] = useState(0);
  const [misReportes, setMisReportes] = useState([]);
  const [tiposProblema, setTiposProblema] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    total_creados: 0,
    nuevos: 0,
    en_progreso: 0,
    resueltos: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados para modales
  const [openNuevoReporte, setOpenNuevoReporte] = useState(false);
  const [openComentario, setOpenComentario] = useState(false);
  const [selectedReporte, setSelectedReporte] = useState(null);

  // Estados para formulario de reporte
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    direccion: '',
    id_tipo_problema: '',
    prioridad: 'Media'
  });

  // Estados para geolocalización
  const [ubicacion, setUbicacion] = useState({
    lat: null,
    lng: null,
    direccion_aproximada: '',
    metodo: 'manual',
    precision: null,
    obteniendo: false
  });

  const [comentario, setComentario] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Verificación de autenticación
  useEffect(() => {
    if (!isAuthenticated) {
      setError('No estás autenticado. Redirigiendo al login...');
      return;
    }

    if (!isCiudadano()) {
      setError('No tienes permisos de ciudadano. Contacta al administrador.');
      return;
    }

    cargarDatos();
  }, [isAuthenticated, user, isCiudadano]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [reportesResponse, datosResponse] = await Promise.all([
        ciudadanoService.getMisReportes(),
        ciudadanoService.getDatosFormulario()
      ]);
      
      if (reportesResponse.success) {
        setMisReportes(reportesResponse.reportes || []);
        setEstadisticas(reportesResponse.ciudadano?.estadisticas || {});
      }
      
      if (datosResponse.success) {
        setTiposProblema(datosResponse.tipos_problema || []);
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

  // Funciones de geolocalización
  const obtenerUbicacionGPS = async () => {
    try {
      setUbicacion(prev => ({ ...prev, obteniendo: true }));
      
      const ubicacionGPS = await geoUtils.obtenerUbicacionGPS();
      
      // Intentar obtener dirección aproximada
      try {
        const direccionData = await geoUtils.coordenadasADireccion(ubicacionGPS.lat, ubicacionGPS.lng);
        ubicacionGPS.direccion_aproximada = direccionData.direccion_completa;
      } catch (error) {
        console.warn('No se pudo obtener dirección aproximada:', error);
      }
      
      setUbicacion({
        lat: ubicacionGPS.lat,
        lng: ubicacionGPS.lng,
        direccion_aproximada: ubicacionGPS.direccion_aproximada || `${ubicacionGPS.lat.toFixed(6)}, ${ubicacionGPS.lng.toFixed(6)}`,
        metodo: 'gps',
        precision: ubicacionGPS.precision,
        obteniendo: false
      });
      
      mostrarSnackbar('Ubicación GPS obtenida exitosamente', 'success');
      
    } catch (error) {
      setUbicacion(prev => ({ ...prev, obteniendo: false }));
      mostrarSnackbar(error.message, 'warning');
    }
  };

  const limpiarUbicacion = () => {
    setUbicacion({
      lat: null,
      lng: null,
      direccion_aproximada: '',
      metodo: 'manual',
      precision: null,
      obteniendo: false
    });
  };

  // Funciones de formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const abrirModalNuevoReporte = () => {
    setFormData({
      titulo: '',
      descripcion: '',
      direccion: '',
      id_tipo_problema: '',
      prioridad: 'Media'
    });
    limpiarUbicacion();
    setOpenNuevoReporte(true);
  };

  const abrirModalComentario = (reporte) => {
    setSelectedReporte(reporte);
    setComentario('');
    setOpenComentario(true);
  };

  const cerrarModales = () => {
    setOpenNuevoReporte(false);
    setOpenComentario(false);
    setSelectedReporte(null);
    setComentario('');
  };

  // Funciones de acción
  const handleCrearReporte = async () => {
    try {
      // Validaciones
      if (!formData.titulo || !formData.descripcion || !formData.direccion || !formData.id_tipo_problema) {
        mostrarSnackbar('Por favor completa todos los campos requeridos', 'error');
        return;
      }

      if (formData.direccion.length < 10) {
        mostrarSnackbar('La dirección debe ser más específica (mínimo 10 caracteres)', 'error');
        return;
      }

      setLoading(true);

      const reporteData = {
        ...formData,
        ubicacion_lat: ubicacion.lat,
        ubicacion_lng: ubicacion.lng,
        metodo_ubicacion: ubicacion.metodo,
        precision_metros: ubicacion.precision
      };

      const response = await ciudadanoService.crearReporte(reporteData);
      
      if (response.success) {
        mostrarSnackbar(`Reporte ${response.numero_reporte} creado exitosamente`, 'success');
        cerrarModales();
        cargarDatos();
      }

    } catch (error) {
      mostrarSnackbar(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAgregarComentario = async () => {
    try {
      if (!comentario.trim() || comentario.length < 5) {
        mostrarSnackbar('El comentario debe tener al menos 5 caracteres', 'error');
        return;
      }

      setLoading(true);
      await ciudadanoService.agregarComentario(selectedReporte.id, comentario);
      mostrarSnackbar('Comentario agregado exitosamente', 'success');
      cerrarModales();
      cargarDatos();

    } catch (error) {
      mostrarSnackbar(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Funciones auxiliares
  const getEstadoInfo = (estado) => {
    return estadosReporteCiudadano[estado] || { color: 'default', descripcion: estado, progreso: 0 };
  };

  const getPrioridadColor = (prioridad) => {
    const prioridadObj = prioridadesReporte.find(p => p.value === prioridad);
    return prioridadObj ? prioridadObj.color : 'default';
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Verificaciones de seguridad
  if (!isAuthenticated) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4}>
        <Alert severity="error">
          No estás autenticado. Redirigiendo al login...
        </Alert>
      </Box>
    );
  }

  if (!isCiudadano()) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4}>
        <Alert severity="error">
          No tienes permisos de ciudadano. Contacta al administrador.
        </Alert>
      </Box>
    );
  }

  if (loading && misReportes.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Cargando tus reportes...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header del Panel Ciudadano */}
      <Box 
        bgcolor="info.main" 
        color="white" 
        p={3}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Box>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon sx={{ fontSize: 40 }} /> Panel Ciudadano
          </Typography>
          <Typography variant="h6">
            {user?.nombre || 'Ciudadano'}
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Zona: <strong>{user?.zona || 'Zona 1'}</strong> | 
            Participación Activa | {user?.correo}
          </Typography>
        </Box>
        
        <Box display="flex" alignItems="center" gap={2}>
          <Badge badgeContent={estadisticas.nuevos || 0} color="warning">
            <NotificationsIcon />
          </Badge>
          <LogoutButton variant="text" />
        </Box>
      </Box>

      {/* Contenido Principal */}
      <Box p={3}>
        {/* Bienvenida personalizada */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <strong>¡Hola {user?.nombre?.split(' ')[0]}!</strong> Aquí puedes crear reportes con ubicación GPS, hacer seguimiento a tus solicitudes y participar activamente en tu comunidad.
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
              label="Crear Reporte" 
              icon={<AddIcon />}
              iconPosition="start"
            />
            <Tab 
              label="Mis Reportes" 
              icon={<ReporteIcon />}
              iconPosition="start"
            />
            <Tab 
              label="Mi Actividad" 
              icon={<TimelineIcon />}
              iconPosition="start"
            />
          </Tabs>
        </Paper>

        {/* TAB 0: Crear Reporte */}
        {tabValue === 0 && (
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12} lg={8}>
                <Paper elevation={3} sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Crear Nuevo Reporte
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                    Describe el problema de tu comunidad. Tu reporte será revisado por el líder COCODE antes de ser asignado a un técnico.
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Título del Problema *"
                        name="titulo"
                        value={formData.titulo}
                        onChange={handleInputChange}
                        placeholder="Ej: Falta de agua potable en mi cuadra"
                        required
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth required>
                        <InputLabel>Tipo de Problema</InputLabel>
                        <Select
                          name="id_tipo_problema"
                          value={formData.id_tipo_problema}
                          onChange={handleInputChange}
                          label="Tipo de Problema"
                        >
                          {tiposProblema.map((tipo) => (
                            <MenuItem key={tipo.id} value={tipo.id}>
                              {tipo.nombre} - {tipo.departamento_responsable}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Prioridad</InputLabel>
                        <Select
                          name="prioridad"
                          value={formData.prioridad}
                          onChange={handleInputChange}
                          label="Prioridad"
                        >
                          {prioridadesReporte.map((prioridad) => (
                            <MenuItem key={prioridad.value} value={prioridad.value}>
                              {prioridad.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Descripción Detallada *"
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={handleInputChange}
                        placeholder="Describe detalladamente el problema, cuándo empezó, a quiénes afecta, etc."
                        required
                      />
                    </Grid>

                    {/* SECCIÓN DE UBICACIÓN CON GPS */}
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                        Ubicación del Problema
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                    </Grid>

                    <Grid item xs={12}>
                      <Box display="flex" gap={2} mb={2}>
                        <Button
                          variant="outlined"
                          startIcon={ubicacion.obteniendo ? <CircularProgress size={16} /> : <GPSIcon />}
                          onClick={obtenerUbicacionGPS}
                          disabled={ubicacion.obteniendo || !geoUtils.soportaGeolocalizacion()}
                          color={ubicacion.lat ? 'success' : 'primary'}
                        >
                          {ubicacion.obteniendo ? 'Obteniendo...' : 
                           ubicacion.lat ? 'GPS Obtenido' : 'Usar mi ubicación GPS'}
                        </Button>
                        
                        {ubicacion.lat && (
                          <Button
                            variant="outlined"
                            color="warning"
                            onClick={limpiarUbicacion}
                          >
                            Limpiar GPS
                          </Button>
                        )}
                      </Box>

                      {ubicacion.lat && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                          <Typography variant="body2">
                            <strong>Ubicación GPS:</strong> {ubicacion.lat.toFixed(6)}, {ubicacion.lng.toFixed(6)}
                            {ubicacion.precision && ` (Precisión: ${Math.round(ubicacion.precision)}m)`}
                          </Typography>
                          {ubicacion.direccion_aproximada && (
                            <Typography variant="body2">
                              <strong>Dirección aproximada:</strong> {ubicacion.direccion_aproximada}
                            </Typography>
                          )}
                        </Alert>
                      )}

                      <TextField
                        fullWidth
                        label="Dirección Exacta *"
                        name="direccion"
                        value={formData.direccion}
                        onChange={handleInputChange}
                        placeholder="Ej: 3a Calle 4-15, Zona 1, Colonia Centro"
                        required
                        helperText="Proporciona la dirección más específica posible para que el técnico pueda ubicar el problema"
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        onClick={handleCrearReporte}
                        disabled={loading || !formData.titulo || !formData.descripcion || !formData.direccion || !formData.id_tipo_problema}
                        sx={{ mt: 2 }}
                      >
                        {loading ? <CircularProgress size={24} /> : 'Crear Reporte'}
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              <Grid item xs={12} lg={4}>
                <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Consejos Importantes
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <GPSIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Usa GPS para mayor precisión"
                        secondary="La ubicación GPS ayuda al técnico a encontrar el problema más rápido"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <LocationIcon color="warning" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Sé específico con la dirección"
                        secondary="Incluye puntos de referencia y detalles de ubicación"
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <InfoIcon color="info" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Describe claramente"
                        secondary="Mientras más detalles, mejor será la atención"
                      />
                    </ListItem>
                  </List>
                </Paper>

                <Paper elevation={3} sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Estadísticas Personales
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Card>
                        <CardContent sx={{ textAlign: 'center', py: 1 }}>
                          <Typography variant="h6" color="primary">
                            {estadisticas.total_creados || 0}
                          </Typography>
                          <Typography variant="caption">
                            Total Creados
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6}>
                      <Card>
                        <CardContent sx={{ textAlign: 'center', py: 1 }}>
                          <Typography variant="h6" color="success.main">
                            {estadisticas.resueltos || 0}
                          </Typography>
                          <Typography variant="caption">
                            Resueltos
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* TAB 1: Mis Reportes */}
        {tabValue === 1 && (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6">
                Mis Reportes ({misReportes.length} total)
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

            {misReportes.length > 0 ? (
              <Grid container spacing={3}>
                {misReportes.map((reporte) => {
                  const estadoInfo = getEstadoInfo(reporte.estado);
                  return (
                    <Grid item xs={12} md={6} key={reporte.id}>
                      <Card elevation={3}>
                        <CardContent>
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                            <Typography variant="h6" gutterBottom>
                              {reporte.titulo}
                            </Typography>
                            <Chip 
                              label={reporte.estado}
                              color={estadoInfo.color}
                              size="small"
                            />
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

                          {/* Información de ubicación */}
                          <Box display="flex" alignItems="center" mb={1}>
                            <LocationIcon fontSize="small" sx={{ mr: 1, color: 'grey.600' }} />
                            <Typography variant="body2" color="textSecondary">
                              {reporte.direccion}
                            </Typography>
                            {reporte.latitud && reporte.longitud && (
                              <Tooltip title={`GPS: ${reporte.latitud}, ${reporte.longitud}`}>
                                <GPSIcon fontSize="small" sx={{ ml: 1, color: 'success.main' }} />
                              </Tooltip>
                            )}
                          </Box>

                          {/* Progreso visual */}
                          <Box sx={{ mb: 2 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                              <Typography variant="caption" color="textSecondary">
                                Progreso
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {reporte.progreso_porcentaje || estadoInfo.progreso}%
                              </Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={reporte.progreso_porcentaje || estadoInfo.progreso}
                              color={estadoInfo.color}
                            />
                          </Box>

                          <Typography variant="caption" color="textSecondary" display="block" sx={{ mb: 2 }}>
                            {estadoInfo.descripcion}
                          </Typography>

                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Chip 
                              label={`Prioridad: ${reporte.prioridad}`}
                              color={getPrioridadColor(reporte.prioridad)}
                              variant="outlined"
                              size="small"
                            />
                            <Typography variant="caption" color="textSecondary">
                              Creado hace {reporte.dias_creado || 0} días
                            </Typography>
                          </Box>

                          {reporte.tecnico_asignado && (
                            <Alert severity="info" sx={{ mb: 2 }}>
                              <Typography variant="body2">
                                <strong>Técnico asignado:</strong> {reporte.tecnico_asignado}
                              </Typography>
                            </Alert>
                          )}

                          <Divider sx={{ my: 2 }} />

                          <Box display="flex" gap={1}>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<CommentIcon />}
                              onClick={() => abrirModalComentario(reporte)}
                            >
                              Agregar Comentario
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
                <ReporteIcon sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  No has creado reportes aún
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Crea tu primer reporte para reportar problemas en tu comunidad
                </Typography>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={() => setTabValue(0)}
                >
                  Crear Mi Primer Reporte
                </Button>
              </Paper>
            )}
          </Box>
        )}

        {/* TAB 2: Mi Actividad */}
        {tabValue === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Mi Actividad y Estadísticas
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Resumen de Participación
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Reportes creados"
                        secondary={estadisticas.total_creados || 0}
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
                        primary="Reportes en progreso"
                        secondary={estadisticas.en_progreso || 0}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Tiempo promedio de resolución"
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
                        <InfoIcon color="info" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Reportes nuevos"
                        secondary={`${estadisticas.nuevos || 0} esperando revisión`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckIcon color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Reportes aprobados"
                        secondary={`${estadisticas.aprobados || 0} listos para asignación`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <WarningIcon color="warning" />
                      </ListItemIcon>
                      <ListItemText
                        primary="En proceso de solución"
                        secondary={`${estadisticas.en_progreso || 0} siendo atendidos`}
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}
      </Box>

      {/* Modal Agregar Comentario */}
      <Dialog open={openComentario} onClose={cerrarModales} maxWidth="sm" fullWidth>
        <DialogTitle>
          Agregar Comentario
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            <strong>Reporte:</strong> {selectedReporte?.titulo}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Tu comentario"
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Agrega información adicional, cambios en el problema, o cualquier comentario relevante..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={cerrarModales}>
            Cancelar
          </Button>
          <Button
            onClick={handleAgregarComentario}
            variant="contained"
            disabled={!comentario.trim() || comentario.length < 5 || loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Agregar Comentario'}
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
      <Box mt={4} p={2} bgcolor="info.50" borderRadius={1} border="1px solid" borderColor="info.200">
        <Typography variant="body2" color="textSecondary" textAlign="center">
          <strong>Permisos de Ciudadano:</strong> Crear reportes con ubicación GPS | 
          Hacer seguimiento a tus solicitudes | Agregar comentarios a tus reportes | Ver progreso en tiempo real |
          <strong> NO puedes:</strong> Ver reportes de otros ciudadanos | Cambiar estados | Gestionar usuarios | Acceder a configuraciones administrativas
        </Typography>
      </Box>
    </Box>
  );
};

export default DashboardCiudadano;