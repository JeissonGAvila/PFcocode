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
  Toolbar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Fab,
  SpeedDial,
  SpeedDialIcon,
  SpeedDialAction,
  Avatar,
  CardActions
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
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
  Logout as LogoutIcon,
  Home as HomeIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Dashboard as DashboardIcon,
  Category as CategoryIcon,
  PriorityHigh as PriorityIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext.jsx';
import LogoutButton from '../../components/common/LogoutButton.jsx';
import ciudadanoService, { geoUtils, estadosReporteCiudadano, prioridadesReporte } from '../../services/ciudadano/ciudadanoService.js';
import MapaUbicacion from '../../components/ciudadano/MapaUbicacion.jsx';
import SubidaFotos from '../../components/ciudadano/SubidaFotos.jsx';

const DashboardCiudadano = () => {
  const { user, isAuthenticated, isCiudadano, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Estados principales
  const [tabValue, setTabValue] = useState(0);
  const [misReportes, setMisReportes] = useState([]);
  const [tiposProblema, setTiposProblema] = useState([]);
  const [categoriasProblema, setCategoriasProblema] = useState([]);
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
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Estados para formulario de reporte
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    direccion: '',
    id_categoria_problema: '',
    id_tipo_problema: '',
    prioridad: 'Media'
  });

  // Estados para fotos Firebase
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
  const [expandedSections, setExpandedSections] = useState({
    ubicacion: !isMobile,
    fotos: !isMobile,
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

  // Ajustar secciones expandidas según el dispositivo
  useEffect(() => {
    if (isMobile) {
      setExpandedSections({
        ubicacion: false,
        fotos: false,
        consejos: false
      });
    } else {
      setExpandedSections({
        ubicacion: true,
        fotos: true,
        consejos: false
      });
    }
  }, [isMobile]);

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
        setCategoriasProblema(datosResponse.categorias_problema || []);
        
        // DEBUG: Verificar datos recibidos
        console.log('✅ Datos recibidos del backend:');
        console.log('📋 Categorías:', datosResponse.categorias_problema?.length || 0);
        console.log('🔧 Tipos:', datosResponse.tipos_problema?.length || 0);
        console.log('📊 Estructura categorías:', datosResponse.categorias_problema?.[0]);
        console.log('📊 Estructura tipos:', datosResponse.tipos_problema?.[0]);
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
    
    // Limpiar tipo de problema cuando cambia la categoría
    if (name === 'id_categoria_problema') {
      setFormData(prev => ({ ...prev, id_tipo_problema: '' }));
    }
  };

  const abrirModalNuevoReporte = () => {
    setFormData({
      titulo: '',
      descripcion: '',
      direccion: '',
      id_categoria_problema: '',
      id_tipo_problema: '',
      prioridad: 'Media'
    });
    limpiarUbicacion();
    setFotosReporte([]);
    setOpenNuevoReporte(true);
    setMobileDrawerOpen(false);
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

  // Función para manejar cambios en ubicación
  const handleUbicacionChange = (nuevaUbicacion) => {
    setUbicacion(prev => ({
      ...prev,
      ...nuevaUbicacion
    }));
  };

  // Toggle secciones expandibles
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // FUNCIÓN ACTUALIZADA PARA CREAR REPORTE CON RECARGA AUTOMÁTICA
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

      // Datos base del reporte
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

      // Decidir método según si hay fotos
      if (fotosReporte.length > 0) {
        // CON FOTOS: usar Firebase Storage
        console.log('🔥 Creando reporte con Firebase Storage...');
        const response = await ciudadanoService.crearReporteConFotos(reporteData, fotosReporte);
        
        if (response.success) {
          mostrarSnackbar(`Reporte ${response.numero_reporte} creado exitosamente con ${fotosReporte.length} foto(s)`, 'success');
          cerrarModales();
          // RECARGA AUTOMÁTICA SIN CERRAR SESIÓN
          await cargarDatos();
          setTabValue(1); // Cambiar a la pestaña de "Mis Reportes"
        }

      } else {
        // SIN FOTOS: usar método normal
        const response = await ciudadanoService.crearReporte(reporteData);
        
        if (response.success) {
          mostrarSnackbar(`Reporte ${response.numero_reporte} creado exitosamente`, 'success');
          cerrarModales();
          // RECARGA AUTOMÁTICA SIN CERRAR SESIÓN
          await cargarDatos();
          setTabValue(1); // Cambiar a la pestaña de "Mis Reportes"
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

  // Función para cerrar sesión
  const handleLogout = () => {
    logout();
  };

  // Filtrar tipos de problema por categoría seleccionada
  const tiposProblemaFiltrados = tiposProblema.filter(
    tipo => !formData.id_categoria_problema || tipo.id_categoria === parseInt(formData.id_categoria_problema)
  );

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

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* HEADER RESPONSIVO */}
      <AppBar position="static" color="primary" elevation={0}>
        <Toolbar sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
          {/* Lado izquierdo */}
          <Box display="flex" alignItems="center" flexGrow={1}>
            {/* Icono del panel */}
            <PersonIcon sx={{ 
              fontSize: { xs: 28, md: 35 }, 
              mr: { xs: 1, md: 2 } 
            }} />
            
            {/* Texto del header - Responsivo */}
            <Box>
              <Typography 
                variant={isMobile ? "h6" : "h4"} 
                component="h1"
                sx={{ 
                  fontSize: { xs: '1.1rem', sm: '1.3rem', md: '2rem' },
                  fontWeight: 'bold',
                  lineHeight: 1.2
                }}
              >
                {isMobile ? 'Panel Ciudadano' : 'Panel Ciudadano Firebase'}
              </Typography>
              
              {/* Info del usuario - Oculta en móviles muy pequeños */}
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography 
                  variant="subtitle1"
                  sx={{ 
                    opacity: 0.9,
                    fontSize: { sm: '0.9rem', md: '1rem' }
                  }}
                >
                  {user?.nombre || 'Ciudadano'}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Lado derecho - Responsivo */}
          <Box display="flex" alignItems="center" gap={{ xs: 0.5, md: 1 }}>
            {/* Notificaciones */}
            <IconButton color="inherit" size={isMobile ? "small" : "medium"}>
              <Badge badgeContent={estadisticas.nuevos || 0} color="warning">
                <NotificationsIcon sx={{ fontSize: { xs: 20, md: 24 } }} />
              </Badge>
            </IconButton>

            {/* Botón logout - REPOSICIONADO PARA MÓVILES */}
            {isMobile ? (
              <IconButton 
                color="inherit" 
                onClick={handleLogout}
                size="small"
                sx={{ ml: 1 }}
              >
                <LogoutIcon sx={{ fontSize: 20 }} />
              </IconButton>
            ) : (
              <LogoutButton variant="text" color="inherit" />
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* INFO ADICIONAL MÓVIL */}
      {isMobile && (
        <Box bgcolor="primary.dark" color="white" px={2} py={1}>
          <Typography variant="caption" display="block">
            {user?.nombre} • {user?.correo}
          </Typography>
          <Box display="flex" gap={1} mt={0.5}>
            <Chip 
              label={`Zona: ${user?.zona || 'Zona 1'}`}
              size="small"
              sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '0.7rem' }}
            />
            <Chip 
              label="Firebase Storage"
              size="small"
              icon={<CloudUploadIcon sx={{ fontSize: 12 }} />}
              sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '0.7rem' }}
            />
          </Box>
        </Box>
      )}

      {/* CONTENIDO PRINCIPAL */}
      <Container 
        maxWidth="xl" 
        sx={{ 
          py: { xs: 2, md: 3 },
          px: { xs: 1, sm: 2, md: 3 }
        }}
      >
        {/* Bienvenida */}
        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
            <strong>Hola {user?.nombre?.split(' ')[0]}!</strong> {
              isMobile 
                ? 'Crea reportes con fotos y GPS.' 
                : 'Ahora puedes crear reportes con Firebase Storage para fotos optimizadas, ubicación GPS/mapa y seguimiento en tiempo real.'
            }
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

        {/* SISTEMA DE TABS RESPONSIVO */}
        <Paper sx={{ borderRadius: 2, mb: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant={isMobile ? "scrollable" : "fullWidth"}
            scrollButtons={isMobile ? "auto" : false}
            sx={{
              '& .MuiTab-root': {
                minHeight: { xs: 56, md: 64 },
                fontSize: { xs: '0.8rem', md: '0.875rem' },
                textTransform: 'none'
              }
            }}
          >
            <Tab 
              label={isMobile ? "Crear" : "Crear Reporte"}
              icon={<AddIcon />}
              iconPosition="start"
            />
            <Tab 
              label={isMobile ? "Reportes" : "Mis Reportes"}
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

        {/* TAB 0: CREAR REPORTE - COMPLETAMENTE RESPONSIVO */}
        {tabValue === 0 && (
          <Grid container spacing={{ xs: 2, md: 3 }}>
            {/* Formulario Principal */}
            <Grid item xs={12} lg={8}>
              <Paper elevation={3} sx={{ p: { xs: 2, md: 3 } }}>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <Typography 
                    variant={isMobile ? "h6" : "h5"}
                    sx={{ fontSize: { xs: '1.1rem', md: '1.5rem' } }}
                  >
                    Crear Nuevo Reporte
                  </Typography>
                  <Chip 
                    label="Firebase"
                    size="small"
                    icon={<CloudUploadIcon />}
                    color="success"
                  />
                </Box>
                
                <Typography 
                  variant="body2" 
                  color="textSecondary" 
                  sx={{ 
                    mb: 3,
                    fontSize: { xs: '0.8rem', md: '0.875rem' }
                  }}
                >
                  {isMobile 
                    ? 'Describe el problema. Las fotos se guardan en Firebase.' 
                    : 'Describe el problema de tu comunidad. Las fotos se guardan automáticamente en Firebase Storage.'
                  }
                </Typography>

                <Grid container spacing={{ xs: 2, md: 3 }}>
                  {/* Título */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Título del Problema *"
                      name="titulo"
                      value={formData.titulo}
                      onChange={handleInputChange}
                      placeholder="Ej: Falta de agua potable en mi cuadra"
                      required
                      size={isMobile ? "small" : "medium"}
                      sx={{
                        '& .MuiInputBase-root': {
                          fontSize: { xs: '0.9rem', md: '1rem' }
                        }
                      }}
                    />
                  </Grid>

                  {/* Categoría de Problema */}
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required size={isMobile ? "small" : "medium"}>
                      <InputLabel>Categoría de Problema</InputLabel>
                      <Select
                        name="id_categoria_problema"
                        value={formData.id_categoria_problema}
                        onChange={handleInputChange}
                        label="Categoría de Problema"
                      >
                        {categoriasProblema.map((categoria) => (
                          <MenuItem key={categoria.id} value={categoria.id}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <CategoryIcon sx={{ fontSize: 16, color: categoria.color }} />
                              <Box>
                                <Typography variant="body2">
                                  {categoria.nombre}
                                </Typography>
                                {!isMobile && (
                                  <Typography variant="caption" color="textSecondary">
                                    {categoria.descripcion}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Tipo de Problema */}
                  <Grid item xs={12} sm={6}>
                    <FormControl 
                      fullWidth 
                      required 
                      size={isMobile ? "small" : "medium"}
                      disabled={!formData.id_categoria_problema}
                    >
                      <InputLabel>Tipo de Problema</InputLabel>
                      <Select
                        name="id_tipo_problema"
                        value={formData.id_tipo_problema}
                        onChange={handleInputChange}
                        label="Tipo de Problema"
                      >
                        {tiposProblemaFiltrados.map((tipo) => (
                          <MenuItem key={tipo.id} value={tipo.id}>
                            <Box>
                              <Typography variant="body2">
                                {tipo.nombre}
                              </Typography>
                              {!isMobile && (
                                <Typography variant="caption" color="textSecondary">
                                  {tipo.departamento_responsable}
                                </Typography>
                              )}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Prioridad */}
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                      <InputLabel>Prioridad</InputLabel>
                      <Select
                        name="prioridad"
                        value={formData.prioridad}
                        onChange={handleInputChange}
                        label="Prioridad"
                      >
                        {prioridadesReporte.map((prioridad) => (
                          <MenuItem key={prioridad.value} value={prioridad.value}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <PriorityIcon sx={{ fontSize: 16, color: theme.palette[prioridad.color]?.main }} />
                              {prioridad.label}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Descripción */}
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
                      size={isMobile ? "small" : "medium"}
                    />
                  </Grid>

                  {/* Dirección */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Dirección Exacta *"
                      name="direccion"
                      value={formData.direccion}
                      onChange={handleInputChange}
                      placeholder="Ej: 3a Calle 4-15, Zona 1, Colonia Centro"
                      required
                      size={isMobile ? "small" : "medium"}
                      helperText="Proporciona la dirección más específica posible"
                    />
                  </Grid>

                  {/* MAPA DE UBICACIÓN - RESPONSIVO */}
                  <Grid item xs={12}>
                    <Accordion 
                      expanded={expandedSections.ubicacion}
                      onChange={() => toggleSection('ubicacion')}
                    >
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <MapIcon color="primary" />
                          <Typography variant="h6">
                            Ubicación del Problema
                          </Typography>
                          {ubicacion.lat && (
                            <Chip 
                              label="GPS Obtenido" 
                              color="success" 
                              size="small"
                              icon={<GPSIcon />}
                            />
                          )}
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <MapaUbicacion
                          ubicacion={ubicacion}
                          onUbicacionChange={handleUbicacionChange}
                          onUbicacionGPS={obtenerUbicacionGPS}
                          loading={ubicacion.obteniendo}
                          height={isMobile ? 250 : 350}
                          showControls={true}
                          allowManualSelection={true}
                        />
                      </AccordionDetails>
                    </Accordion>
                  </Grid>

                  {/* SECCIÓN DE FOTOS FIREBASE - RESPONSIVA */}
                  <Grid item xs={12}>
                    <Accordion 
                      expanded={expandedSections.fotos}
                      onChange={() => toggleSection('fotos')}
                    >
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <PhotoCameraIcon color="primary" />
                          <Typography variant="h6">
                            Evidencia Fotográfica
                          </Typography>
                          <Chip 
                            label="Firebase"
                            size="small"
                            icon={<CloudUploadIcon />}
                            color="success"
                          />
                          {fotosReporte.length > 0 && (
                            <Chip 
                              label={`${fotosReporte.length} foto(s)`}
                              size="small"
                              color="info"
                            />
                          )}
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <SubidaFotos
                          fotos={fotosReporte}
                          onFotosChange={handleFotosChange}
                          maxFotos={3}
                          disabled={loading}
                        />
                      </AccordionDetails>
                    </Accordion>
                  </Grid>

                  {/* Botón Crear - RESPONSIVO */}
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="contained"
                      size={isMobile ? "medium" : "large"}
                      onClick={handleCrearReporte}
                      disabled={loading || !formData.titulo || !formData.descripcion || !formData.direccion || !formData.id_tipo_problema}
                      sx={{ 
                        mt: 2, 
                        py: { xs: 1.5, md: 2 },
                        fontSize: { xs: '0.9rem', md: '1rem' },
                        textTransform: 'none'
                      }}
                      startIcon={loading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                    >
                      {loading ? 'Creando Reporte...' : 
                        (isMobile ? 
                          `Crear Reporte${fotosReporte.length > 0 ? ` (${fotosReporte.length} fotos)` : ''}` :
                          `Crear Reporte${fotosReporte.length > 0 ? ` con ${fotosReporte.length} foto(s) Firebase` : ''}`
                        )
                      }
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* SIDEBAR RESPONSIVO */}
            <Grid item xs={12} lg={4}>
              <Stack spacing={{ xs: 2, md: 3 }}>
                {/* Consejos Firebase */}
                <Paper elevation={3} sx={{ p: { xs: 2, md: 3 } }}>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <CloudUploadIcon color="success" />
                    <Typography variant="h6" sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>
                      Firebase Storage
                    </Typography>
                  </Box>
                  
                  <List dense>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <CloudUploadIcon color="success" sx={{ fontSize: { xs: 16, md: 20 } }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Subida Automática"
                        secondary="Fotos se suben automáticamente a la nube Firebase"
                        primaryTypographyProps={{ fontSize: { xs: '0.85rem', md: '0.9rem' } }}
                        secondaryTypographyProps={{ fontSize: { xs: '0.75rem', md: '0.8rem' } }}
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <PhotoCameraIcon color="primary" sx={{ fontSize: { xs: 16, md: 20 } }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Optimización Inteligente"
                        secondary="Imágenes se comprimen y redimensionan automáticamente"
                        primaryTypographyProps={{ fontSize: { xs: '0.85rem', md: '0.9rem' } }}
                        secondaryTypographyProps={{ fontSize: { xs: '0.75rem', md: '0.8rem' } }}
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <CheckIcon color="success" sx={{ fontSize: { xs: 16, md: 20 } }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Sin Límites de Servidor"
                        secondary="Firebase maneja el almacenamiento y la velocidad"
                        primaryTypographyProps={{ fontSize: { xs: '0.85rem', md: '0.9rem' } }}
                        secondaryTypographyProps={{ fontSize: { xs: '0.75rem', md: '0.8rem' } }}
                      />
                    </ListItem>
                  </List>
                </Paper>

                {/* Estadísticas */}
                <Paper elevation={3} sx={{ p: { xs: 2, md: 3 } }}>
                  <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>
                    Estadísticas Personales
                  </Typography>
                  <Grid container spacing={{ xs: 1, md: 2 }}>
                    <Grid item xs={6}>
                      <Card>
                        <CardContent sx={{ textAlign: 'center', py: { xs: 1, md: 2 } }}>
                          <Typography variant="h6" color="primary" sx={{ fontSize: { xs: '1.2rem', md: '1.5rem' } }}>
                            {estadisticas.total_creados || 0}
                          </Typography>
                          <Typography variant="caption" sx={{ fontSize: { xs: '0.7rem', md: '0.8rem' } }}>
                            Total Creados
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6}>
                      <Card>
                        <CardContent sx={{ textAlign: 'center', py: { xs: 1, md: 2 } }}>
                          <Typography variant="h6" color="success.main" sx={{ fontSize: { xs: '1.2rem', md: '1.5rem' } }}>
                            {estadisticas.resueltos || 0}
                          </Typography>
                          <Typography variant="caption" sx={{ fontSize: { xs: '0.7rem', md: '0.8rem' } }}>
                            Resueltos
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  {/* Info de fotos Firebase */}
                  {fotosReporte.length > 0 && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                      <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
                        <strong>Fotos Firebase:</strong> {fotosReporte.length}/3
                      </Typography>
                      <Typography variant="caption" sx={{ fontSize: { xs: '0.7rem', md: '0.75rem' } }}>
                        Se subirán automáticamente a Firebase Storage
                      </Typography>
                    </Alert>
                  )}
                </Paper>
              </Stack>
            </Grid>
          </Grid>
        )}

        {/* TAB 1: MIS REPORTES - COMPLETAMENTE RESPONSIVO */}
        {tabValue === 1 && (
          <Box>
            <Box 
              display="flex" 
              justifyContent="space-between" 
              alignItems="center" 
              mb={3}
              flexDirection={{ xs: 'column', sm: 'row' }}
              gap={{ xs: 2, sm: 0 }}
            >
              <Typography variant="h6" sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
                Mis Reportes ({misReportes.length} total)
              </Typography>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={cargarDatos}
                disabled={loading}
                size={isMobile ? "small" : "medium"}
                sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}
              >
                Actualizar
              </Button>
            </Box>

            {misReportes.length > 0 ? (
              <Grid container spacing={{ xs: 2, md: 3 }}>
                {misReportes.map((reporte) => {
                  const estadoInfo = getEstadoInfo(reporte.estado);
                  return (
                    <Grid item xs={12} sm={6} lg={4} key={reporte.id}>
                      <Card 
                        elevation={3} 
                        sx={{ 
                          height: '100%', 
                          display: 'flex', 
                          flexDirection: 'column',
                          borderLeft: isMobile ? 'none' : `4px solid ${theme.palette[estadoInfo.color]?.main || theme.palette.primary.main}`
                        }}
                      >
                        <CardContent sx={{ flexGrow: 1, p: { xs: 2, md: 3 } }}>
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                            <Typography 
                              variant="h6" 
                              gutterBottom
                              sx={{ 
                                fontSize: { xs: '0.95rem', md: '1.1rem' },
                                lineHeight: 1.3
                              }}
                            >
                              {isMobile && reporte.titulo.length > 40 
                                ? `${reporte.titulo.substring(0, 40)}...`
                                : reporte.titulo
                              }
                            </Typography>
                            <Chip 
                              label={reporte.estado}
                              color={estadoInfo.color}
                              size="small"
                              sx={{ fontSize: { xs: '0.7rem', md: '0.75rem' } }}
                            />
                          </Box>

                          <Box display="flex" alignItems="center" gap={1} mb={2} flexWrap="wrap">
                            <Typography variant="body2" color="textSecondary">
                              <strong>#{reporte.numero_reporte}</strong>
                            </Typography>
                            {reporte.fotos_firebase > 0 && (
                              <Chip 
                                label={`${reporte.fotos_firebase} Firebase`}
                                size="small"
                                icon={<CloudUploadIcon />}
                                color="success"
                                variant="outlined"
                                sx={{ fontSize: { xs: '0.65rem', md: '0.7rem' } }}
                              />
                            )}
                            <Chip 
                              label={reporte.prioridad}
                              size="small"
                              color={getPrioridadColor(reporte.prioridad)}
                              variant="outlined"
                              sx={{ fontSize: { xs: '0.65rem', md: '0.7rem' } }}
                            />
                          </Box>

                          <Typography 
                            variant="body2" 
                            sx={{ 
                              mb: 2,
                              fontSize: { xs: '0.8rem', md: '0.875rem' }
                            }}
                          >
                            {isMobile && reporte.descripcion.length > 80
                              ? `${reporte.descripcion.substring(0, 80)}...`
                              : reporte.descripcion.substring(0, 120) + (reporte.descripcion.length > 120 ? '...' : '')
                            }
                          </Typography>

                          <LinearProgress 
                            variant="determinate" 
                            value={reporte.progreso_porcentaje || estadoInfo.progreso}
                            color={estadoInfo.color}
                            sx={{ height: { xs: 4, md: 6 }, borderRadius: 3, mb: 2 }}
                          />

                          <Typography 
                            variant="caption" 
                            color="textSecondary"
                            sx={{ fontSize: { xs: '0.7rem', md: '0.75rem' } }}
                          >
                            {estadoInfo.descripcion}
                          </Typography>

                          {/* Información adicional solo en desktop */}
                          {!isMobile && (
                            <Box mt={2}>
                              <Typography variant="caption" color="textSecondary" display="block">
                                <LocationIcon sx={{ fontSize: 12, mr: 0.5 }} />
                                {reporte.direccion}
                              </Typography>
                              <Typography variant="caption" color="textSecondary" display="block">
                                Creado: {new Date(reporte.fecha_reporte).toLocaleDateString()}
                              </Typography>
                            </Box>
                          )}
                        </CardContent>

                        <CardActions sx={{ p: { xs: 2, md: 3 }, pt: 0 }}>
                          <Button
                            fullWidth
                            size="small"
                            variant="outlined"
                            startIcon={<CommentIcon />}
                            onClick={() => abrirModalComentario(reporte)}
                            sx={{ 
                              fontSize: { xs: '0.75rem', md: '0.8rem' },
                              textTransform: 'none'
                            }}
                          >
                            {isMobile ? 'Comentar' : 'Agregar Comentario'}
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            ) : (
              <Paper elevation={2} sx={{ p: { xs: 3, md: 4 }, textAlign: 'center' }}>
                <ReporteIcon sx={{ fontSize: { xs: 50, md: 60 }, color: 'grey.400', mb: 2 }} />
                <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>
                  No has creado reportes aún
                </Typography>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={() => setTabValue(0)}
                  size={isMobile ? "medium" : "large"}
                  sx={{ 
                    mt: 2,
                    fontSize: { xs: '0.9rem', md: '1rem' },
                    textTransform: 'none'
                  }}
                >
                  Crear Mi Primer Reporte
                </Button>
              </Paper>
            )}
          </Box>
        )}

        {/* TAB 2: MI ACTIVIDAD - RESPONSIVO */}
        {tabValue === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
              Mi Actividad y Estadísticas
            </Typography>
            
            <Grid container spacing={{ xs: 2, md: 3 }}>
              {/* Resumen de Participación */}
              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ p: { xs: 2, md: 3 } }}>
                  <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>
                    Resumen de Participación
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <ReporteIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Reportes creados"
                        secondary={estadisticas.total_creados || 0}
                        primaryTypographyProps={{ fontSize: { xs: '0.9rem', md: '1rem' } }}
                        secondaryTypographyProps={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CheckIcon color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Reportes resueltos"
                        secondary={estadisticas.resueltos || 0}
                        primaryTypographyProps={{ fontSize: { xs: '0.9rem', md: '1rem' } }}
                        secondaryTypographyProps={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <TimelineIcon color="info" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Reportes en proceso"
                        secondary={estadisticas.en_progreso || 0}
                        primaryTypographyProps={{ fontSize: { xs: '0.9rem', md: '1rem' } }}
                        secondaryTypographyProps={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>

              {/* Información del Perfil */}
              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ p: { xs: 2, md: 3 } }}>
                  <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>
                    Mi Perfil
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <PersonIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Nombre"
                        secondary={user?.nombre || 'Ciudadano'}
                        primaryTypographyProps={{ fontSize: { xs: '0.9rem', md: '1rem' } }}
                        secondaryTypographyProps={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <EmailIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Correo"
                        secondary={user?.correo}
                        primaryTypographyProps={{ fontSize: { xs: '0.9rem', md: '1rem' } }}
                        secondaryTypographyProps={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <LocationIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Zona"
                        secondary={user?.zona || 'Zona 1'}
                        primaryTypographyProps={{ fontSize: { xs: '0.9rem', md: '1rem' } }}
                        secondaryTypographyProps={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}
      </Container>

      {/* FLOATING ACTION BUTTON PARA MÓVILES */}
      {isMobile && tabValue !== 0 && (
        <Fab
          color="primary"
          aria-label="crear reporte"
          onClick={abrirModalNuevoReporte}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000
          }}
        >
          <AddIcon />
        </Fab>
      )}

      {/* MODAL COMENTARIO - RESPONSIVO */}
      <Dialog 
        open={openComentario} 
        onClose={cerrarModales} 
        maxWidth="sm" 
        fullWidth
        fullScreen={isSmallMobile}
      >
        <DialogTitle sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
          Agregar Comentario
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}>
            <strong>Reporte:</strong> {selectedReporte?.titulo}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={isMobile ? 3 : 4}
            label="Tu comentario"
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Agrega información adicional, cambios en el problema, o cualquier comentario relevante..."
            sx={{ mt: 2 }}
            size={isMobile ? "small" : "medium"}
          />
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, md: 3 } }}>
          <Button onClick={cerrarModales} size={isMobile ? "small" : "medium"}>
            Cancelar
          </Button>
          <Button
            onClick={handleAgregarComentario}
            variant="contained"
            disabled={!comentario.trim() || loading}
            size={isMobile ? "small" : "medium"}
            sx={{ textTransform: 'none' }}
          >
            {loading ? <CircularProgress size={20} /> : 'Agregar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR RESPONSIVO */}
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
          sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* FOOTER RESPONSIVO */}
      <Box mt={4} p={{ xs: 2, md: 3 }} bgcolor="success.50" borderRadius={1}>
        <Typography 
          variant="body2" 
          color="textSecondary" 
          textAlign="center"
          sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}
        >
          <strong>Firebase Storage:</strong> {
            isMobile 
              ? 'Fotos optimizadas | Almacenamiento en la nube | URLs seguras'
              : 'Fotos optimizadas automáticamente | Almacenamiento en la nube | URLs seguras | Compatible con todos los paneles | Migración exitosa de Multer a Firebase completada'
          }
        </Typography>
      </Box>
    </Box>
  );
};

export default DashboardCiudadano;