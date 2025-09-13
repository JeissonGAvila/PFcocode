// frontend/src/vistas/ciudadano/Dashboard.jsx - VERSIÓN COMPLETAMENTE RESPONSIVA
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
  Badge,
  Stack,
  Container,
  Collapse,
  useTheme,
  useMediaQuery,
  Drawer,
  AppBar,
  Toolbar
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
  Info as InfoIcon,
  PhotoCamera as PhotoCameraIcon,
  Menu as MenuIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext.jsx';
import LogoutButton from '../../components/common/LogoutButton.jsx';
import ciudadanoService, { geoUtils, estadosReporteCiudadano, prioridadesReporte } from '../../services/ciudadano/ciudadanoService.js';
import MapaUbicacion from '../../components/ciudadano/MapaUbicacion.jsx';
import SubidaFotos from '../../components/ciudadano/SubidaFotos.jsx';

const DashboardCiudadano = () => {
  const { user, isAuthenticated, isCiudadano } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  
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

  // Estados para fotos
  const [fotosReporte, setFotosReporte] = useState([]);

  // Estados para geolocalización
  const [ubicacion, setUbicacion] = useState({
    lat: null,
    lng: null,
    direccion_aproximada: '',
    metodo: 'gps',
    precision: null,
    obteniendo: false
  });

  // Estados para UI responsiva
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    ubicacion: true,
    fotos: true,
    consejos: false
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
      metodo: 'gps',
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
    setFotosReporte([]);
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
    // Limpiar fotos y liberar memoria
    fotosReporte.forEach(foto => {
      if (foto.preview) {
        URL.revokeObjectURL(foto.preview);
      }
    });
    setFotosReporte([]);
  };

  // Función para manejar cambios en fotos
  const handleFotosChange = (nuevasFotos) => {
    setFotosReporte(nuevasFotos);
  };

  // Toggle secciones expandibles (móvil)
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // FUNCIÓN CORREGIDA PARA MANEJAR FOTOS
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

      // Decidir qué método usar según si hay fotos
      if (fotosReporte.length > 0) {
        // CON FOTOS: usar FormData y endpoint especial
        const reporteData = new FormData();
        reporteData.append('titulo', formData.titulo);
        reporteData.append('descripcion', formData.descripcion);
        reporteData.append('direccion', formData.direccion);
        reporteData.append('id_tipo_problema', formData.id_tipo_problema);
        reporteData.append('prioridad', formData.prioridad);
        
        if (ubicacion.lat && ubicacion.lng) {
          reporteData.append('ubicacion_lat', ubicacion.lat);
          reporteData.append('ubicacion_lng', ubicacion.lng);
          reporteData.append('metodo_ubicacion', ubicacion.metodo);
          reporteData.append('precision_metros', ubicacion.precision);
        }

        // Agregar fotos con el nombre correcto que espera multer
        fotosReporte.forEach((foto) => {
          reporteData.append('fotos', foto.file);
        });

        const response = await ciudadanoService.crearReporteConFotos(reporteData);
        
        if (response.success) {
          mostrarSnackbar(`Reporte ${response.numero_reporte} creado exitosamente con ${fotosReporte.length} foto(s)`, 'success');
          cerrarModales();
          cargarDatos();
        }

      } else {
        // SIN FOTOS: usar JSON normal
        const reporteData = {
          titulo: formData.titulo,
          descripcion: formData.descripcion,
          direccion: formData.direccion,
          id_tipo_problema: formData.id_tipo_problema,
          prioridad: formData.prioridad,
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
      }

    } catch (error) {
      console.error('Error creando reporte:', error);
      mostrarSnackbar('Error: ' + error.message, 'error');
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
    if (isMobile) {
      setMobileDrawerOpen(false);
    }
  };

  // Verificaciones de seguridad
  if (!isAuthenticated) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert severity="error">
          No estás autenticado. Redirigiendo al login...
        </Alert>
      </Container>
    );
  }

  if (!isCiudadano()) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert severity="error">
          No tienes permisos de ciudadano. Contacta al administrador.
        </Alert>
      </Container>
    );
  }

  if (loading && misReportes.length === 0) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" p={4}>
          <CircularProgress />
          <Typography variant="body1" sx={{ ml: 2 }}>
            Cargando tus reportes...
          </Typography>
        </Box>
      </Container>
    );
  }

  // Header responsivo
  const HeaderResponsivo = () => (
    <Box 
      bgcolor="info.main" 
      color="white"
    >
      {/* Móvil Header */}
      {isMobile && (
        <AppBar position="static" color="transparent" elevation={0}>
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setMobileDrawerOpen(true)}
            >
              <MenuIcon />
            </IconButton>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" noWrap>
                Panel Ciudadano
              </Typography>
            </Box>
            <Badge badgeContent={estadisticas.nuevos || 0} color="warning">
              <NotificationsIcon />
            </Badge>
          </Toolbar>
        </AppBar>
      )}

      {/* Desktop Header */}
      {!isMobile && (
        <Box p={{ xs: 2, sm: 3 }}>
          <Grid container alignItems="center" spacing={2}>
            <Grid item xs={12} md={8}>
              <Stack direction="row" alignItems="center" spacing={2} mb={1}>
                <PersonIcon sx={{ fontSize: { xs: 32, md: 40 } }} />
                <Typography variant={{ xs: "h5", md: "h4" }} component="h1">
                  Panel Ciudadano
                </Typography>
              </Stack>
              
              <Typography variant={{ xs: "subtitle1", md: "h6" }} gutterBottom>
                {user?.nombre || 'Ciudadano'}
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, opacity: 0.9 }}>
                <Chip 
                  label={`Zona: ${user?.zona || 'Zona 1'}`}
                  size="small"
                  sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
                <Chip 
                  label="Participación Activa"
                  size="small"
                  sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
                {!isMobile && (
                  <Chip 
                    label={user?.correo}
                    size="small"
                    sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  />
                )}
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Stack direction="row" spacing={2} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                <Badge badgeContent={estadisticas.nuevos || 0} color="warning">
                  <NotificationsIcon />
                </Badge>
                <LogoutButton variant="text" color="inherit" />
              </Stack>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );

  // Navigation Drawer para móvil
  const NavigationDrawer = () => (
    <Drawer
      anchor="left"
      open={mobileDrawerOpen}
      onClose={() => setMobileDrawerOpen(false)}
      PaperProps={{
        sx: { width: 280 }
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Menú</Typography>
          <IconButton onClick={() => setMobileDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        
        <Stack spacing={1}>
          <Button
            fullWidth
            variant={tabValue === 0 ? "contained" : "text"}
            startIcon={<AddIcon />}
            onClick={() => handleTabChange(null, 0)}
            size="large"
            sx={{ justifyContent: 'flex-start' }}
          >
            Crear Reporte
          </Button>
          
          <Button
            fullWidth
            variant={tabValue === 1 ? "contained" : "text"}
            startIcon={<ReporteIcon />}
            onClick={() => handleTabChange(null, 1)}
            size="large"
            sx={{ justifyContent: 'flex-start' }}
          >
            Mis Reportes ({misReportes.length})
          </Button>
          
          <Button
            fullWidth
            variant={tabValue === 2 ? "contained" : "text"}
            startIcon={<TimelineIcon />}
            onClick={() => handleTabChange(null, 2)}
            size="large"
            sx={{ justifyContent: 'flex-start' }}
          >
            Mi Actividad
          </Button>
        </Stack>

        <Divider sx={{ my: 2 }} />
        
        {/* Info del usuario en móvil */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            {user?.nombre}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {user?.correo}
          </Typography>
          <Chip 
            label={`Zona: ${user?.zona || 'Zona 1'}`}
            size="small"
            sx={{ mt: 1 }}
          />
        </Box>
      </Box>
    </Drawer>
  );

  return (
    <Box>
      {/* Header Responsivo */}
      <HeaderResponsivo />
      
      {/* Navigation Drawer para móvil */}
      <NavigationDrawer />

      {/* Contenido Principal */}
      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
        {/* Bienvenida personalizada */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Hola {user?.nombre?.split(' ')[0]}!</strong> Aquí puedes crear reportes con ubicación GPS/mapa, subir fotos del problema, hacer seguimiento a tus solicitudes y participar activamente en tu comunidad.
          </Typography>
        </Alert>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="body2">{error}</Typography>
            <Button onClick={cargarDatos} sx={{ ml: 2 }} size="small">
              Reintentar
            </Button>
          </Alert>
        )}

        {/* Sistema de Tabs - Solo desktop */}
        {!isMobile && (
          <Paper sx={{ borderRadius: 2, mb: 3 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              variant={isTablet ? "scrollable" : "fullWidth"}
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  minHeight: { xs: 56, md: 64 },
                  fontSize: { xs: '0.85rem', md: '0.95rem' },
                  fontWeight: 500,
                  px: { xs: 1, md: 3 }
                }
              }}
            >
              <Tab 
                label={isMobile ? "Crear" : "Crear Reporte"}
                icon={<AddIcon />}
                iconPosition="start"
              />
              <Tab 
                label={isMobile ? `Reportes (${misReportes.length})` : "Mis Reportes"}
                icon={<ReporteIcon />}
                iconPosition="start"
              />
              <Tab 
                label={isMobile ? "Actividad" : "Mi Actividad"}
                icon={<TimelineIcon />}
                iconPosition="start"
              />
            </Tabs>
          </Paper>
        )}

        {/* TAB 0: Crear Reporte - COMPLETAMENTE RESPONSIVO */}
        {tabValue === 0 && (
          <Box>
            <Grid container spacing={{ xs: 2, md: 3 }}>
              {/* Formulario Principal */}
              <Grid item xs={12} lg={8}>
                <Paper elevation={3} sx={{ p: { xs: 2, md: 3 } }}>
                  <Typography variant="h6" gutterBottom>
                    Crear Nuevo Reporte
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                    Describe el problema de tu comunidad. Tu reporte será revisado por el líder COCODE antes de ser asignado a un técnico.
                  </Typography>

                  <Grid container spacing={{ xs: 2, md: 3 }}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Título del Problema *"
                        name="titulo"
                        value={formData.titulo}
                        onChange={handleInputChange}
                        placeholder="Ej: Falta de agua potable en mi cuadra"
                        required
                        size={isMobile ? "medium" : "medium"}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth required size={isMobile ? "medium" : "medium"}>
                        <InputLabel>Tipo de Problema</InputLabel>
                        <Select
                          name="id_tipo_problema"
                          value={formData.id_tipo_problema}
                          onChange={handleInputChange}
                          label="Tipo de Problema"
                        >
                          {tiposProblema.map((tipo) => (
                            <MenuItem key={tipo.id} value={tipo.id}>
                              <Box>
                                <Typography variant="body2">
                                  {tipo.nombre}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {tipo.departamento_responsable}
                                </Typography>
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth size={isMobile ? "medium" : "medium"}>
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
                        rows={isMobile ? 3 : 4}
                        label="Descripción Detallada *"
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={handleInputChange}
                        placeholder="Describe detalladamente el problema, cuándo empezó, a quiénes afecta, etc."
                        required
                        size={isMobile ? "medium" : "medium"}
                      />
                    </Grid>

                    {/* SECCIÓN DE UBICACIÓN - RESPONSIVA */}
                    <Grid item xs={12}>
                      <Paper 
                        variant="outlined" 
                        sx={{ 
                          p: { xs: 2, md: 3 }, 
                          mt: 2,
                          border: '2px solid',
                          borderColor: 'primary.light'
                        }}
                      >
                        <Box 
                          display="flex" 
                          justifyContent="space-between" 
                          alignItems="center"
                          mb={2}
                        >
                          <Typography variant="subtitle1" component="h3">
                            Ubicación del Problema
                          </Typography>
                          
                          {isMobile && (
                            <IconButton 
                              onClick={() => toggleSection('ubicacion')}
                              size="small"
                            >
                              {expandedSections.ubicacion ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </IconButton>
                          )}
                        </Box>
                        
                        <Collapse in={!isMobile || expandedSections.ubicacion}>
                          {/* Tabs para alternar entre métodos - Responsivos */}
                          <Box sx={{ mb: 2 }}>
                            <Tabs 
                              value={ubicacion.metodo === 'gps' ? 0 : ubicacion.metodo === 'mapa' ? 1 : 2} 
                              onChange={(e, newValue) => {
                                const metodos = ['gps', 'mapa', 'manual'];
                                setUbicacion(prev => ({ ...prev, metodo: metodos[newValue] }));
                              }}
                              variant="scrollable"
                              scrollButtons="auto"
                              sx={{
                                '& .MuiTab-root': {
                                  minHeight: { xs: 48, md: 56 },
                                  fontSize: { xs: '0.8rem', md: '0.9rem' },
                                  px: { xs: 1, md: 2 }
                                }
                              }}
                            >
                              <Tab 
                                label={isMobile ? "GPS" : "GPS Automático"}
                                icon={<GPSIcon />} 
                                iconPosition={isMobile ? "top" : "start"}
                              />
                              <Tab 
                                label={isMobile ? "Mapa" : "Seleccionar en Mapa"}
                                icon={<MapIcon />} 
                                iconPosition={isMobile ? "top" : "start"}
                              />
                              <Tab 
                                label={isMobile ? "Manual" : "Solo Dirección"}
                                icon={<LocationIcon />} 
                                iconPosition={isMobile ? "top" : "start"}
                              />
                            </Tabs>
                          </Box>

                          {/* Mostrar GPS/Mapa según el método seleccionado */}
                          {(ubicacion.metodo === 'gps' || ubicacion.metodo === 'mapa') && (
                            <Box sx={{ mb: 3 }}>
                              <MapaUbicacion
                                ubicacion={ubicacion}
                                onUbicacionChange={(nuevaUbicacion) => {
                                  setUbicacion(prev => ({
                                    ...prev,
                                    ...nuevaUbicacion,
                                    obteniendo: false
                                  }));
                                }}
                                onUbicacionGPS={obtenerUbicacionGPS}
                                loading={ubicacion.obteniendo}
                                height={isMobile ? 300 : 400}
                                allowManualSelection={ubicacion.metodo === 'mapa'}
                              />
                            </Box>
                          )}

                          {/* Información de ubicación obtenida */}
                          {ubicacion.lat && ubicacion.lng && (
                            <Alert severity="success" sx={{ mb: 2 }}>
                              <Typography variant="body2">
                                <strong>Ubicación {ubicacion.metodo === 'gps' ? 'GPS' : 'seleccionada'}:</strong> 
                                {ubicacion.lat.toFixed(6)}, {ubicacion.lng.toFixed(6)}
                                {ubicacion.precision && ` (Precisión: ${Math.round(ubicacion.precision)}m)`}
                              </Typography>
                              {ubicacion.direccion_aproximada && (
                                <Typography variant="body2">
                                  <strong>Dirección aproximada:</strong> {ubicacion.direccion_aproximada}
                                </Typography>
                              )}
                            </Alert>
                          )}

                          {/* Campo de dirección (siempre visible) */}
                          <TextField
                            fullWidth
                            label="Dirección Exacta *"
                            name="direccion"
                            value={formData.direccion}
                            onChange={handleInputChange}
                            placeholder="Ej: 3a Calle 4-15, Zona 1, Colonia Centro"
                            required
                            helperText="Proporciona la dirección más específica posible. La ubicación GPS/mapa es complementaria."
                            sx={{ mb: 2 }}
                            size={isMobile ? "medium" : "medium"}
                          />
                        </Collapse>
                      </Paper>
                    </Grid>

                    {/* SECCIÓN DE SUBIDA DE FOTOS - RESPONSIVA */}
                    <Grid item xs={12}>
                      <Paper 
                        variant="outlined" 
                        sx={{ 
                          p: { xs: 2, md: 3 }, 
                          border: '2px solid',
                          borderColor: 'secondary.light'
                        }}
                      >
                        <Box 
                          display="flex" 
                          justifyContent="space-between" 
                          alignItems="center"
                          mb={2}
                        >
                          <Typography variant="subtitle1" component="h3">
                            Evidencia Fotográfica
                          </Typography>
                          
                          {isMobile && (
                            <IconButton 
                              onClick={() => toggleSection('fotos')}
                              size="small"
                            >
                              {expandedSections.fotos ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </IconButton>
                          )}
                        </Box>
                        
                        <Collapse in={!isMobile || expandedSections.fotos}>
                          <SubidaFotos
                            fotos={fotosReporte}
                            onFotosChange={handleFotosChange}
                            maxFotos={3}
                            disabled={loading}
                          />
                        </Collapse>
                      </Paper>
                    </Grid>

                    {/* Botón Crear Reporte - Responsivo */}
                    <Grid item xs={12}>
                      <Button
                        fullWidth
                        variant="contained"
                        size={isMobile ? "large" : "large"}
                        onClick={handleCrearReporte}
                        disabled={loading || !formData.titulo || !formData.descripcion || !formData.direccion || !formData.id_tipo_problema}
                        sx={{ 
                          mt: 3, 
                          py: { xs: 1.5, md: 2 },
                          fontSize: { xs: '1rem', md: '1.1rem' }
                        }}
                        startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
                      >
                        {loading ? 'Creando Reporte...' : `Crear Reporte${fotosReporte.length > 0 ? ` con ${fotosReporte.length} foto(s)` : ''}`}
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Sidebar con consejos y estadísticas */}
              <Grid item xs={12} lg={4}>
                <Stack spacing={{ xs: 2, md: 3 }}>
                  {/* Consejos Importantes - Colapsible en móvil */}
                  <Paper elevation={3} sx={{ p: { xs: 2, md: 3 } }}>
                    <Box 
                      display="flex" 
                      justifyContent="space-between" 
                      alignItems="center"
                      mb={2}
                    >
                      <Typography variant="h6">
                        Consejos Importantes
                      </Typography>
                      
                      {isMobile && (
                        <IconButton 
                          onClick={() => toggleSection('consejos')}
                          size="small"
                        >
                          {expandedSections.consejos ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      )}
                    </Box>
                    
                    <Collapse in={!isMobile || expandedSections.consejos}>
                      <List dense>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemIcon>
                            <PhotoCameraIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Subir fotos del problema"
                            secondary="Las imágenes optimizadas ayudan al técnico a entender mejor el problema"
                            primaryTypographyProps={{ 
                              fontSize: { xs: '0.9rem', md: '1rem' }
                            }}
                            secondaryTypographyProps={{ 
                              fontSize: { xs: '0.8rem', md: '0.875rem' }
                            }}
                          />
                        </ListItem>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemIcon>
                            <MapIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Usa GPS o Mapa para precisión"
                            secondary="La ubicación visual ayuda al técnico a encontrar el problema más rápido"
                            primaryTypographyProps={{ 
                              fontSize: { xs: '0.9rem', md: '1rem' }
                            }}
                            secondaryTypographyProps={{ 
                              fontSize: { xs: '0.8rem', md: '0.875rem' }
                            }}
                          />
                        </ListItem>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemIcon>
                            <LocationIcon color="warning" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Sé específico con la dirección"
                            secondary="Incluye puntos de referencia y detalles de ubicación"
                            primaryTypographyProps={{ 
                              fontSize: { xs: '0.9rem', md: '1rem' }
                            }}
                            secondaryTypographyProps={{ 
                              fontSize: { xs: '0.8rem', md: '0.875rem' }
                            }}
                          />
                        </ListItem>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemIcon>
                            <InfoIcon color="info" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Describe claramente"
                            secondary="Mientras más detalles, mejor será la atención"
                            primaryTypographyProps={{ 
                              fontSize: { xs: '0.9rem', md: '1rem' }
                            }}
                            secondaryTypographyProps={{ 
                              fontSize: { xs: '0.8rem', md: '0.875rem' }
                            }}
                          />
                        </ListItem>
                      </List>
                    </Collapse>
                  </Paper>

                  {/* Estadísticas Personales */}
                  <Paper elevation={3} sx={{ p: { xs: 2, md: 3 } }}>
                    <Typography variant="h6" gutterBottom>
                      Estadísticas Personales
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Card>
                          <CardContent sx={{ textAlign: 'center', py: { xs: 1.5, md: 2 } }}>
                            <Typography variant="h6" color="primary">
                              {estadisticas.total_creados || 0}
                            </Typography>
                            <Typography variant="caption" sx={{ fontSize: { xs: '0.7rem', md: '0.75rem' } }}>
                              Total Creados
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={6}>
                        <Card>
                          <CardContent sx={{ textAlign: 'center', py: { xs: 1.5, md: 2 } }}>
                            <Typography variant="h6" color="success.main">
                              {estadisticas.resueltos || 0}
                            </Typography>
                            <Typography variant="caption" sx={{ fontSize: { xs: '0.7rem', md: '0.75rem' } }}>
                              Resueltos
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>

                    {/* Información sobre fotos */}
                    {fotosReporte.length > 0 && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
                          <strong>Fotos listas:</strong> {fotosReporte.length}/3
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: { xs: '0.7rem', md: '0.75rem' } }}>
                          Total optimizado: {fotosReporte.reduce((acc, foto) => acc + foto.tamaño, 0) > 1024 
                            ? `${(fotosReporte.reduce((acc, foto) => acc + foto.tamaño, 0) / 1024 / 1024).toFixed(1)} MB`
                            : `${Math.round(fotosReporte.reduce((acc, foto) => acc + foto.tamaño, 0) / 1024)} KB`}
                        </Typography>
                      </Alert>
                    )}
                  </Paper>
                </Stack>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* TAB 1: Mis Reportes - COMPLETAMENTE RESPONSIVO */}
        {tabValue === 1 && (
          <Box>
            {/* Header con botón actualizar */}
            <Box 
              display="flex" 
              justifyContent="space-between" 
              alignItems="center" 
              mb={3}
              flexDirection={{ xs: 'column', sm: 'row' }}
              gap={{ xs: 2, sm: 0 }}
            >
              <Typography variant="h6">
                Mis Reportes ({misReportes.length} total)
              </Typography>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={cargarDatos}
                disabled={loading}
                size={isMobile ? "medium" : "medium"}
                fullWidth={isMobile}
              >
                Actualizar
              </Button>
            </Box>

            {misReportes.length > 0 ? (
              <Grid container spacing={{ xs: 2, md: 3 }}>
                {misReportes.map((reporte) => {
                  const estadoInfo = getEstadoInfo(reporte.estado);
                  return (
                    <Grid item xs={12} md={6} lg={4} key={reporte.id}>
                      <Card 
                        elevation={3}
                        sx={{ 
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                      >
                        <CardContent sx={{ flexGrow: 1, p: { xs: 2, md: 3 } }}>
                          {/* Header del reporte */}
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                            <Typography 
                              variant="h6" 
                              gutterBottom
                              sx={{ 
                                fontSize: { xs: '1rem', md: '1.25rem' },
                                lineHeight: 1.2,
                                pr: 1
                              }}
                            >
                              {reporte.titulo.length > 50 && isMobile ? 
                                `${reporte.titulo.substring(0, 50)}...` : 
                                reporte.titulo
                              }
                            </Typography>
                            <Chip 
                              label={reporte.estado}
                              color={estadoInfo.color}
                              size="small"
                              sx={{ fontSize: { xs: '0.7rem', md: '0.75rem' } }}
                            />
                          </Box>

                          {/* Info del reporte */}
                          <Typography variant="body2" color="textSecondary" gutterBottom>
                            <strong>#{reporte.numero_reporte}</strong> | {reporte.tipo_problema}
                          </Typography>

                          <Typography 
                            variant="body2" 
                            sx={{ 
                              mb: 2,
                              fontSize: { xs: '0.85rem', md: '0.875rem' }
                            }}
                          >
                            {reporte.descripcion.length > (isMobile ? 80 : 100) ? 
                              `${reporte.descripcion.substring(0, isMobile ? 80 : 100)}...` : 
                              reporte.descripcion
                            }
                          </Typography>

                          {/* Información de ubicación - Responsiva */}
                          <Box display="flex" alignItems="center" mb={1} flexWrap="wrap" gap={0.5}>
                            <LocationIcon fontSize="small" sx={{ color: 'grey.600' }} />
                            <Typography 
                              variant="body2" 
                              color="textSecondary"
                              sx={{ 
                                fontSize: { xs: '0.8rem', md: '0.875rem' },
                                flex: 1,
                                minWidth: 0
                              }}
                              noWrap={!isMobile}
                            >
                              {isMobile && reporte.direccion.length > 30 ? 
                                `${reporte.direccion.substring(0, 30)}...` : 
                                reporte.direccion
                              }
                            </Typography>
                            
                            <Box display="flex" gap={0.5} alignItems="center">
                              {reporte.latitud && reporte.longitud && (
                                <Tooltip title={`GPS: ${reporte.latitud}, ${reporte.longitud}`}>
                                  <GPSIcon fontSize="small" sx={{ color: 'success.main' }} />
                                </Tooltip>
                              )}
                              {reporte.tiene_fotos && (
                                <Tooltip title="Incluye fotos">
                                  <PhotoCameraIcon fontSize="small" sx={{ color: 'info.main' }} />
                                </Tooltip>
                              )}
                            </Box>
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
                              sx={{ height: 6, borderRadius: 3 }}
                            />
                          </Box>

                          <Typography 
                            variant="caption" 
                            color="textSecondary" 
                            display="block" 
                            sx={{ 
                              mb: 2,
                              fontSize: { xs: '0.7rem', md: '0.75rem' }
                            }}
                          >
                            {estadoInfo.descripcion}
                          </Typography>

                          {/* Info adicional */}
                          <Box 
                            display="flex" 
                            justifyContent="space-between" 
                            alignItems="center" 
                            mb={2}
                            flexDirection={{ xs: 'column', sm: 'row' }}
                            gap={{ xs: 1, sm: 0 }}
                          >
                            <Chip 
                              label={`Prioridad: ${reporte.prioridad}`}
                              color={getPrioridadColor(reporte.prioridad)}
                              variant="outlined"
                              size="small"
                              sx={{ fontSize: { xs: '0.7rem', md: '0.75rem' } }}
                            />
                            <Typography 
                              variant="caption" 
                              color="textSecondary"
                              sx={{ fontSize: { xs: '0.7rem', md: '0.75rem' } }}
                            >
                              Creado hace {reporte.dias_creado || 0} días
                            </Typography>
                          </Box>

                          {/* Técnico asignado */}
                          {reporte.tecnico_asignado && (
                            <Alert severity="info" sx={{ mb: 2 }}>
                              <Typography 
                                variant="body2"
                                sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}
                              >
                                <strong>Técnico asignado:</strong> {reporte.tecnico_asignado}
                              </Typography>
                            </Alert>
                          )}
                        </CardContent>

                        {/* Acciones */}
                        <Box sx={{ p: { xs: 2, md: 3 }, pt: 0 }}>
                          <Divider sx={{ mb: 2 }} />
                          <Button
                            fullWidth
                            size="small"
                            variant="outlined"
                            startIcon={<CommentIcon />}
                            onClick={() => abrirModalComentario(reporte)}
                            sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}
                          >
                            Agregar Comentario
                          </Button>
                        </Box>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            ) : (
              <Paper elevation={2} sx={{ p: { xs: 3, md: 4 }, textAlign: 'center' }}>
                <ReporteIcon sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  No has creado reportes aún
                </Typography>
                <Typography 
                  variant="body2" 
                  color="textSecondary" 
                  sx={{ 
                    mb: 2,
                    fontSize: { xs: '0.85rem', md: '0.875rem' }
                  }}
                >
                  Crea tu primer reporte para reportar problemas en tu comunidad
                </Typography>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={() => setTabValue(0)}
                  size={isMobile ? "large" : "medium"}
                  fullWidth={isMobile}
                  sx={{ maxWidth: { xs: '100%', sm: 300 } }}
                >
                  Crear Mi Primer Reporte
                </Button>
              </Paper>
            )}
          </Box>
        )}

        {/* TAB 2: Mi Actividad - RESPONSIVO */}
        {tabValue === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Mi Actividad y Estadísticas
            </Typography>
            
            <Grid container spacing={{ xs: 2, md: 3 }}>
              {/* Resumen de Participación */}
              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ p: { xs: 2, md: 3 } }}>
                  <Typography variant="h6" gutterBottom>
                    Resumen de Participación
                  </Typography>
                  <List>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText
                        primary="Reportes creados"
                        secondary={estadisticas.total_creados || 0}
                        primaryTypographyProps={{ 
                          fontSize: { xs: '0.9rem', md: '1rem' }
                        }}
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText
                        primary="Reportes resueltos"
                        secondary={estadisticas.resueltos || 0}
                        primaryTypographyProps={{ 
                          fontSize: { xs: '0.9rem', md: '1rem' }
                        }}
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText
                        primary="Reportes en progreso"
                        secondary={estadisticas.en_progreso || 0}
                        primaryTypographyProps={{ 
                          fontSize: { xs: '0.9rem', md: '1rem' }
                        }}
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText
                        primary="Tiempo promedio de resolución"
                        secondary={estadisticas.promedio_dias_resolucion ? 
                          `${parseFloat(estadisticas.promedio_dias_resolucion).toFixed(1)} días` : 
                          'No disponible'
                        }
                        primaryTypographyProps={{ 
                          fontSize: { xs: '0.9rem', md: '1rem' }
                        }}
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
              
              {/* Estado Actual */}
              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ p: { xs: 2, md: 3 } }}>
                  <Typography variant="h6" gutterBottom>
                    Estado Actual
                  </Typography>
                  <List>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <InfoIcon color="info" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Reportes nuevos"
                        secondary={`${estadisticas.nuevos || 0} esperando revisión`}
                        primaryTypographyProps={{ 
                          fontSize: { xs: '0.9rem', md: '1rem' }
                        }}
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <CheckIcon color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Reportes aprobados"
                        secondary={`${estadisticas.aprobados || 0} listos para asignación`}
                        primaryTypographyProps={{ 
                          fontSize: { xs: '0.9rem', md: '1rem' }
                        }}
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <WarningIcon color="warning" />
                      </ListItemIcon>
                      <ListItemText
                        primary="En proceso de solución"
                        secondary={`${estadisticas.en_progreso || 0} siendo atendidos`}
                        primaryTypographyProps={{ 
                          fontSize: { xs: '0.9rem', md: '1rem' }
                        }}
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}
      </Container>

      {/* Modal Agregar Comentario - Responsivo */}
      <Dialog 
        open={openComentario} 
        onClose={cerrarModales} 
        maxWidth="sm" 
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Agregar Comentario</Typography>
            {isMobile && (
              <IconButton onClick={cerrarModales}>
                <CloseIcon />
              </IconButton>
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            <strong>Reporte:</strong> {selectedReporte?.titulo}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={isMobile ? 4 : 4}
            label="Tu comentario"
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Agrega información adicional, cambios en el problema, o cualquier comentario relevante..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, md: 3 } }}>
          {!isMobile && (
            <Button onClick={cerrarModales}>
              Cancelar
            </Button>
          )}
          <Button
            onClick={handleAgregarComentario}
            variant="contained"
            disabled={!comentario.trim() || comentario.length < 5 || loading}
            fullWidth={isMobile}
            size={isMobile ? "large" : "medium"}
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
        anchorOrigin={{ 
          vertical: 'bottom', 
          horizontal: isMobile ? 'center' : 'right' 
        }}
      >
        <Alert 
          onClose={cerrarSnackbar} 
          severity={snackbar.severity} 
          sx={{ 
            width: '100%',
            fontSize: { xs: '0.85rem', md: '0.875rem' }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Footer Info - Responsivo */}
      <Box 
        mt={4} 
        p={{ xs: 2, md: 3 }} 
        bgcolor="info.50" 
        borderRadius={1} 
        border="1px solid" 
        borderColor="info.200"
        mx={{ xs: 2, md: 0 }}
      >
        <Typography 
          variant="body2" 
          color="textSecondary" 
          textAlign="center"
          sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}
        >
          <strong>Permisos de Ciudadano:</strong> Crear reportes con ubicación GPS/mapa y fotos | 
          Hacer seguimiento a tus solicitudes | Agregar comentarios a tus reportes | Ver progreso en tiempo real |
          <strong> NO puedes:</strong> Ver reportes de otros ciudadanos | Cambiar estados | Gestionar usuarios | Acceder a configuraciones administrativas
        </Typography>
      </Box>
    </Box>
  );
};

export default DashboardCiudadano;