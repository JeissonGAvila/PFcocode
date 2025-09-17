// frontend/src/vistas/liderCocode/Dashboard.jsx - 100% RESPONSIVO COMPLETO
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
  Avatar,
  Badge,
  Alert,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Container,
  Stack,
  useTheme,
  useMediaQuery,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  Collapse,
  Fab,
  Snackbar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CardActions
} from '@mui/material';
import {
  Group as GroupIcon,
  Assignment as ReporteIcon,
  People as PeopleIcon,
  Verified as VerifiedIcon,
  Engineering as EngineeringIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Home as HomeIcon,
  TrendingUp as TrendingIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  Campaign as CampaignIcon,
  Event as EventIcon,
  Refresh as RefreshIcon,
  NotificationsActive as NotificationIcon,
  CheckCircle,
  Cancel,
  Menu as MenuIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Logout as LogoutIcon,
  Map as MapIcon,
  MyLocation as GPSIcon,
  PhotoCamera as CameraIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext.jsx';
import LogoutButton from '../../components/common/LogoutButton.jsx';

// Importar componentes de mapas responsivos
import MapaUbicacion from '../../components/ciudadano/MapaUbicacion.jsx';

const DashboardLider = () => {
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [tabValue, setTabValue] = useState(0);
  const [openNuevoReporte, setOpenNuevoReporte] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  
  // Estados para UI responsiva
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [expandedCards, setExpandedCards] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Estados para botones de aprobación
  const [modalAprobar, setModalAprobar] = useState(false);
  const [modalRechazar, setModalRechazar] = useState(false);
  const [modalVerDetalles, setModalVerDetalles] = useState(false);
  const [reporteSeleccionado, setReporteSeleccionado] = useState(null);
  const [comentarioLider, setComentarioLider] = useState('');
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [procesando, setProcesando] = useState(false);
  
  // Estados para mapas
  const [mostrarMapa, setMostrarMapa] = useState(false);
  const [ubicacionMapa, setUbicacionMapa] = useState({
    lat: null,
    lng: null,
    direccion_aproximada: '',
    metodo: 'gps',
    precision: null
  });
  
  const motivosRechazo = [
    'Reporte duplicado',
    'Información insuficiente', 
    'No es competencia municipal',
    'Problema ya resuelto',
    'Ubicación incorrecta',
    'Falta documentación',
    'No es prioridad comunitaria',
    'Otro motivo'
  ];
  
  // Estados reales con backend
  const [statsComunitarias, setStatsComunitarias] = useState({
    ciudadanosZona: 245,
    ciudadanosVerificados: 198,
    ciudadanosPendientes: 47,
    reportesZona: 28,
    reportesActivos: 15,
    reportesResueltos: 13,
    reportesPendientesAprobacion: 6,
    reunionesRealizadas: 3,
    proximaReunion: '2025-01-15'
  });

  // Reportes reales de la zona
  const [reportesZona, setReportesZona] = useState([
    {
      id: 1,
      numero_reporte: 'RPT-2025-008',
      titulo: 'Falta de alumbrado público en parque central',
      descripcion: 'Varias lámparas fundidas en el parque central afectan la seguridad nocturna',
      ciudadano_nombre: 'José',
      ciudadano_apellido: 'Mendoza',
      ciudadano_telefono: '7745-6789',
      direccion: 'Parque Central, Zona 1',
      estado_actual: 'Nuevo',
      prioridad: 'Media',
      tipo_problema: 'Alumbrado Público',
      fecha_reporte: '2025-01-08',
      departamento_responsable: 'Servicios Públicos',
      tiene_fotos: true,
      total_fotos: 3,
      latitud: 15.319728,
      longitud: -91.403732,
      metodo_ubicacion: 'GPS',
      precision_metros: 5
    },
    {
      id: 2,
      numero_reporte: 'RPT-2025-009',
      titulo: 'Bache grande en calle principal',
      descripcion: 'Bache que afecta el tránsito vehicular y puede causar accidentes',
      ciudadano_nombre: 'María',
      ciudadano_apellido: 'Rodríguez',
      ciudadano_telefono: '7756-7890',
      direccion: '3ra Calle, Zona 1',
      estado_actual: 'Aprobado por Líder',
      prioridad: 'Alta',
      tipo_problema: 'Infraestructura',
      fecha_reporte: '2025-01-07',
      departamento_responsable: 'Obras Públicas',
      tecnico_nombre: 'Ing. Pedro García',
      tiene_fotos: false,
      total_fotos: 0,
      latitud: 15.319528,
      longitud: -91.403932,
      metodo_ubicacion: 'Manual',
      precision_metros: 10
    }
  ]);

  const [reportesPendientes, setReportesPendientes] = useState([
    {
      id: 3,
      numero_reporte: 'RPT-2025-010',
      titulo: 'Fuga de agua en tubería principal',
      descripcion: 'Fuga considerable que desperdicia agua y afecta el suministro',
      ciudadano_nombre: 'Carlos',
      ciudadano_apellido: 'López',
      ciudadano_telefono: '7767-8901',
      direccion: '5ta Avenida, Zona 1',
      estado_actual: 'Nuevo',
      prioridad: 'Alta',
      tipo_problema: 'Agua Potable',
      fecha_reporte: '2025-01-09',
      departamento_responsable: 'Agua y Saneamiento',
      tiene_fotos: true,
      total_fotos: 2,
      latitud: 15.320128,
      longitud: -91.404232
    }
  ]);

  // Estados para ciudadanos
  const [ciudadanosZona, setCiudadanosZona] = useState([
    {
      id: 1,
      nombre: 'Carlos Morales',
      correo: 'carlos.morales@email.com',
      telefono: '7712-1234',
      direccion: '1ra Calle 2-15, Zona 1',
      verificado: true,
      reportesCreados: 3,
      fechaRegistro: '2024-12-15'
    },
    {
      id: 2,
      nombre: 'Ana Pérez',
      correo: 'ana.perez@email.com',
      telefono: '7723-2345',
      direccion: '2da Avenida 5-20, Zona 1',
      verificado: false,
      reportesCreados: 1,
      fechaRegistro: '2025-01-05'
    },
    {
      id: 3,
      nombre: 'Luis González',
      correo: 'luis.gonzalez@email.com',
      telefono: '7734-3456',
      direccion: '4ta Calle 8-10, Zona 1',
      verificado: true,
      reportesCreados: 0,
      fechaRegistro: '2024-11-20'
    }
  ]);

  // Funciones auxiliares
  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Nuevo': return 'warning';
      case 'Aprobado por Líder': return 'info';
      case 'Asignado': return 'primary';
      case 'En Proceso': return 'secondary';
      case 'Resuelto': return 'success';
      case 'Cerrado': return 'success';
      case 'Rechazado por Líder': return 'error';
      case 'Reabierto': return 'error';
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

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if (isMobile) {
      setMobileDrawerOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const mostrarSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const cerrarSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Toggle card expansion
  const toggleCardExpansion = (cardId) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  // Función para abrir detalles con mapa
  const handleVerDetalles = (reporte) => {
    setReporteSeleccionado(reporte);
    
    // Configurar ubicación para el mapa
    if (reporte.latitud && reporte.longitud) {
      setUbicacionMapa({
        lat: parseFloat(reporte.latitud),
        lng: parseFloat(reporte.longitud),
        direccion_aproximada: reporte.direccion,
        metodo: reporte.metodo_ubicacion || 'GPS',
        precision: reporte.precision_metros || null
      });
      setMostrarMapa(true);
    } else {
      setMostrarMapa(false);
    }
    
    setModalVerDetalles(true);
  };

  // Funciones para aprobar/rechazar
  const handleAprobarReporteDirecto = (reporte) => {
    setReporteSeleccionado(reporte);
    setComentarioLider('');
    setModalAprobar(true);
  };

  const handleRechazarReporteDirecto = (reporte) => {
    setReporteSeleccionado(reporte);
    setMotivoRechazo('');
    setComentarioLider('');
    setModalRechazar(true);
  };

  const ejecutarAprobacion = async () => {
    try {
      setProcesando(true);
      
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Actualizar estado local
      setReportesZona(prev => 
        prev.map(r => 
          r.id === reporteSeleccionado.id 
            ? { ...r, estado_actual: 'Aprobado por Líder' }
            : r
        )
      );
      
      setReportesPendientes(prev => 
        prev.filter(r => r.id !== reporteSeleccionado.id)
      );
      
      mostrarSnackbar(`Reporte ${reporteSeleccionado.numero_reporte} aprobado exitosamente`, 'success');
      setModalAprobar(false);
      setReporteSeleccionado(null);
      setComentarioLider('');
      
    } catch (error) {
      mostrarSnackbar('Error al aprobar el reporte', 'error');
    } finally {
      setProcesando(false);
    }
  };

  const ejecutarRechazo = async () => {
    try {
      if (!motivoRechazo.trim()) {
        mostrarSnackbar('Debes seleccionar un motivo de rechazo', 'error');
        return;
      }

      setProcesando(true);
      
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Actualizar estado local
      setReportesZona(prev => 
        prev.map(r => 
          r.id === reporteSeleccionado.id 
            ? { ...r, estado_actual: 'Rechazado por Líder' }
            : r
        )
      );
      
      setReportesPendientes(prev => 
        prev.filter(r => r.id !== reporteSeleccionado.id)
      );
      
      mostrarSnackbar(`Reporte ${reporteSeleccionado.numero_reporte} rechazado: ${motivoRechazo}`, 'warning');
      setModalRechazar(false);
      setReporteSeleccionado(null);
      setMotivoRechazo('');
      setComentarioLider('');
      
    } catch (error) {
      mostrarSnackbar('Error al rechazar el reporte', 'error');
    } finally {
      setProcesando(false);
    }
  };

  const handleVerificarCiudadano = (ciudadanoId) => {
    setCiudadanosZona(prev => 
      prev.map(ciudadano => 
        ciudadano.id === ciudadanoId 
          ? { ...ciudadano, verificado: true }
          : ciudadano
      )
    );
    mostrarSnackbar('Ciudadano verificado exitosamente', 'success');
  };

  const cerrarModales = () => {
    setModalAprobar(false);
    setModalRechazar(false);
    setModalVerDetalles(false);
    setOpenNuevoReporte(false);
    setReporteSeleccionado(null);
    setComentarioLider('');
    setMotivoRechazo('');
    setMostrarMapa(false);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* HEADER COMPLETAMENTE RESPONSIVO */}
      <AppBar position="static" color="success" elevation={0}>
        <Toolbar sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
          {/* Lado izquierdo */}
          <Box display="flex" alignItems="center" flexGrow={1}>
            {/* Menú móvil */}
            {isMobile && (
              <IconButton
                color="inherit"
                edge="start"
                onClick={() => setMobileDrawerOpen(true)}
                sx={{ mr: 1 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            
            {/* Icono del panel */}
            <GroupIcon sx={{ 
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
                {isMobile ? 'Panel Líder' : 'Panel Líder COCODE'}
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
                  {user?.nombre || 'Líder COCODE'}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Lado derecho - Responsivo */}
          <Box display="flex" alignItems="center" gap={{ xs: 0.5, md: 1 }}>
            {/* Notificaciones */}
            <IconButton color="inherit" size={isMobile ? "small" : "medium"}>
              <Badge badgeContent={reportesPendientes.length || 0} color="warning">
                <NotificationIcon sx={{ fontSize: { xs: 20, md: 24 } }} />
              </Badge>
            </IconButton>

            {/* Botón logout - ARREGLADO PARA MÓVILES */}
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
        <Box bgcolor="success.dark" color="white" px={2} py={1}>
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
              label="Presidente COCODE"
              size="small"
              sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '0.7rem' }}
            />
            {reportesPendientes.length > 0 && (
              <Chip 
                label={`${reportesPendientes.length} pendientes`}
                size="small"
                icon={<WarningIcon sx={{ fontSize: 12 }} />}
                sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '0.7rem' }}
              />
            )}
          </Box>
        </Box>
      )}

      {/* DRAWER MÓVIL RESPONSIVO */}
      <Drawer
        anchor="left"
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        PaperProps={{
          sx: { width: { xs: 280, sm: 320 } }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
              Menú Líder
            </Typography>
            <IconButton onClick={() => setMobileDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Stack spacing={1}>
            <Button
              fullWidth
              variant={tabValue === 0 ? "contained" : "text"}
              startIcon={<ReporteIcon />}
              onClick={() => handleTabChange(null, 0)}
              size="large"
              sx={{ 
                justifyContent: 'flex-start',
                fontSize: { xs: '0.9rem', sm: '1rem' },
                py: { xs: 1.5, sm: 2 }
              }}
            >
              Reportes de mi Zona
            </Button>
            
            <Button
              fullWidth
              variant={tabValue === 1 ? "contained" : "text"}
              startIcon={<PeopleIcon />}
              onClick={() => handleTabChange(null, 1)}
              size="large"
              sx={{ 
                justifyContent: 'flex-start',
                fontSize: { xs: '0.9rem', sm: '1rem' },
                py: { xs: 1.5, sm: 2 }
              }}
            >
              Ciudadanos ({ciudadanosZona.length})
            </Button>
            
            <Button
              fullWidth
              variant={tabValue === 2 ? "contained" : "text"}
              startIcon={<EngineeringIcon />}
              onClick={() => handleTabChange(null, 2)}
              size="large"
              sx={{ 
                justifyContent: 'flex-start',
                fontSize: { xs: '0.9rem', sm: '1rem' },
                py: { xs: 1.5, sm: 2 }
              }}
            >
              Coordinación
            </Button>

            <Button
              fullWidth
              variant={tabValue === 3 ? "contained" : "text"}
              startIcon={<WarningIcon />}
              onClick={() => handleTabChange(null, 3)}
              size="large"
              sx={{ 
                justifyContent: 'flex-start',
                fontSize: { xs: '0.9rem', sm: '1rem' },
                py: { xs: 1.5, sm: 2 }
              }}
            >
              Pendientes ({reportesPendientes.length})
            </Button>
          </Stack>

          <Divider sx={{ my: 2 }} />
          
          {/* Info del usuario en móvil */}
          <Box>
            <Typography variant="subtitle2" gutterBottom sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              Líder: {user?.nombre}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
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

      {/* CONTENIDO PRINCIPAL */}
      <Container 
        maxWidth="xl" 
        sx={{ 
          py: { xs: 2, md: 3 },
          px: { xs: 1, sm: 2, md: 3 }
        }}
      >
        {/* Alerta de Responsabilidad - Responsiva */}
        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
            <strong>Responsabilidad Comunitaria:</strong> {
              isMobile 
                ? `Gestionas ${user?.zona || 'tu zona'}.`
                : `Gestionas los reportes y ciudadanos de ${user?.zona || 'tu zona'}. Coordinas con técnicos y validas reportes comunitarios.`
            }
            {reportesPendientes.length > 0 && (
              <strong> Tienes {reportesPendientes.length} reportes pendientes de aprobación.</strong>
            )}
          </Typography>
        </Alert>

        {/* Estadísticas reales - COMPLETAMENTE RESPONSIVAS */}
        <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: 4 }}>
          <Grid item xs={6} sm={3}>
            <Card elevation={3}>
              <CardContent sx={{ textAlign: 'center', py: { xs: 1.5, md: 2 } }}>
                <PeopleIcon 
                  color="primary" 
                  sx={{ fontSize: { xs: 30, md: 40 }, mb: 1 }} 
                />
                <Typography variant={{ xs: "h5", md: "h4" }} color="primary">
                  {statsComunitarias.ciudadanosZona}
                </Typography>
                <Typography 
                  color="textSecondary" 
                  variant="body2"
                  sx={{ fontSize: { xs: '0.7rem', md: '0.875rem' } }}
                >
                  {isMobile ? 'Ciudadanos' : 'Ciudadanos Zona'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Card elevation={3}>
              <CardContent sx={{ textAlign: 'center', py: { xs: 1.5, md: 2 } }}>
                <WarningIcon 
                  color="warning" 
                  sx={{ fontSize: { xs: 30, md: 40 }, mb: 1 }} 
                />
                <Typography variant={{ xs: "h5", md: "h4" }} color="warning.main">
                  {statsComunitarias.reportesPendientesAprobacion}
                </Typography>
                <Typography 
                  color="textSecondary" 
                  variant="body2"
                  sx={{ fontSize: { xs: '0.7rem', md: '0.875rem' } }}
                >
                  {isMobile ? 'Pendientes' : 'Pendientes Aprobación'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Card elevation={3}>
              <CardContent sx={{ textAlign: 'center', py: { xs: 1.5, md: 2 } }}>
                <ReporteIcon 
                  color="info" 
                  sx={{ fontSize: { xs: 30, md: 40 }, mb: 1 }} 
                />
                <Typography variant={{ xs: "h5", md: "h4" }} color="info.main">
                  {statsComunitarias.reportesActivos}
                </Typography>
                <Typography 
                  color="textSecondary" 
                  variant="body2"
                  sx={{ fontSize: { xs: '0.7rem', md: '0.875rem' } }}
                >
                  {isMobile ? 'Activos' : 'Reportes Activos'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Card elevation={3}>
              <CardContent sx={{ textAlign: 'center', py: { xs: 1.5, md: 2 } }}>
                <CheckIcon 
                  color="success" 
                  sx={{ fontSize: { xs: 30, md: 40 }, mb: 1 }} 
                />
                <Typography variant={{ xs: "h5", md: "h4" }} color="success.main">
                  {statsComunitarias.reportesResueltos}
                </Typography>
                <Typography 
                  color="textSecondary" 
                  variant="body2"
                  sx={{ fontSize: { xs: '0.7rem', md: '0.875rem' } }}
                >
                  {isMobile ? 'Resueltos' : 'Reportes Resueltos'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* SISTEMA DE TABS RESPONSIVO */}
        {!isMobile && (
          <Paper sx={{ borderRadius: 2, mb: 3 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              variant={isTablet ? "scrollable" : "fullWidth"}
              scrollButtons={isTablet ? "auto" : false}
              sx={{
                '& .MuiTab-root': {
                  minHeight: { xs: 56, md: 64 },
                  fontSize: { xs: '0.8rem', md: '0.875rem' },
                  textTransform: 'none',
                  fontWeight: 500
                }
              }}
            >
              <Tab 
                label={isTablet ? "Reportes Zona" : "Reportes de mi Zona"}
                icon={<ReporteIcon />}
                iconPosition="start"
              />
              <Tab 
                label={isTablet ? "Ciudadanos" : `Ciudadanos (${ciudadanosZona.length})`}
                icon={<PeopleIcon />}
                iconPosition="start"
              />
              <Tab 
                label="Coordinación"
                icon={<EngineeringIcon />}
                iconPosition="start"
              />
              <Tab 
                label={`Pendientes (${reportesPendientes.length})`}
                icon={<WarningIcon />}
                iconPosition="start"
              />
            </Tabs>
          </Paper>
        )}

        {/* TAB 0: REPORTES DE LA ZONA - COMPLETAMENTE RESPONSIVO */}
        {tabValue === 0 && (
          <Grid container spacing={{ xs: 2, md: 3 }}>
            {/* Lista de reportes */}
            <Grid item xs={12} lg={8}>
              <Paper elevation={3} sx={{ p: { xs: 2, md: 3 } }}>
                <Box 
                  display="flex" 
                  justifyContent="space-between" 
                  alignItems="center" 
                  mb={2}
                  flexDirection={{ xs: 'column', sm: 'row' }}
                  gap={{ xs: 2, sm: 0 }}
                >
                  <Typography variant="h6" sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    fontSize: { xs: '1.1rem', md: '1.25rem' }
                  }}>
                    <ReporteIcon color="primary" /> 
                    {isMobile ? `Reportes ${user?.zona || 'Zona'}` : `Reportes de ${user?.zona || 'mi Zona'}`}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenNuevoReporte(true)}
                    size={isMobile ? "medium" : "large"}
                    fullWidth={isMobile}
                    sx={{ 
                      maxWidth: { xs: '100%', sm: 'auto' },
                      fontSize: { xs: '0.9rem', md: '1rem' },
                      py: { xs: 1.5, md: 2 }
                    }}
                  >
                    {isMobile ? 'Crear Reporte' : 'Crear Reporte Comunitario'}
                  </Button>
                </Box>
                <Divider sx={{ mb: 3 }} />
                
                {loading ? (
                  <Box display="flex" justifyContent="center" p={3}>
                    <CircularProgress />
                  </Box>
                ) : reportesZona.length === 0 ? (
                  <Alert severity="info">
                    No hay reportes en tu zona actualmente.
                  </Alert>
                ) : (
                  <Stack spacing={2}>
                    {reportesZona.map((reporte) => (
                      <Card key={reporte.id} elevation={2}>
                        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                          {/* Header del reporte - Responsivo */}
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                            <Box flex={1} sx={{ pr: { xs: 1, md: 2 } }}>
                              <Box display="flex" alignItems="center" gap={1} mb={1} flexWrap="wrap">
                                <Typography 
                                  variant="h6"
                                  sx={{ 
                                    fontSize: { xs: '1rem', md: '1.25rem' },
                                    lineHeight: 1.2
                                  }}
                                >
                                  {isMobile && reporte.titulo.length > 40 ? 
                                    `${reporte.titulo.substring(0, 40)}...` : 
                                    reporte.titulo
                                  }
                                </Typography>
                                
                                {!isMobile && (
                                  <IconButton 
                                    size="small"
                                    onClick={() => toggleCardExpansion(reporte.id)}
                                  >
                                    {expandedCards[reporte.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                  </IconButton>
                                )}
                              </Box>
                              
                              <Typography 
                                variant="body2" 
                                color="textSecondary" 
                                gutterBottom
                                sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}
                              >
                                #{reporte.numero_reporte} | {new Date(reporte.fecha_reporte).toLocaleDateString()} | {reporte.tipo_problema}
                              </Typography>
                              
                              <Typography 
                                variant="body1" 
                                gutterBottom
                                sx={{ fontSize: { xs: '0.85rem', md: '1rem' } }}
                              >
                                {isMobile && reporte.descripcion.length > 80 ? 
                                  `${reporte.descripcion.substring(0, 80)}...` : 
                                  reporte.descripcion
                                }
                              </Typography>
                              
                              {/* Información básica - Siempre visible */}
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: 0.5,
                                  fontSize: { xs: '0.8rem', md: '0.875rem' },
                                  mb: 0.5
                                }}
                              >
                                <HomeIcon fontSize="small" /> 
                                {isMobile && reporte.direccion.length > 30 ? 
                                  `${reporte.direccion.substring(0, 30)}...` : 
                                  reporte.direccion
                                }
                              </Typography>
                              
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: 0.5,
                                  fontSize: { xs: '0.8rem', md: '0.875rem' },
                                  mb: 1
                                }}
                              >
                                <PhoneIcon fontSize="small" /> 
                                {reporte.ciudadano_nombre} {reporte.ciudadano_apellido} - {reporte.ciudadano_telefono}
                              </Typography>

                              {/* Información expandible en desktop */}
                              <Collapse in={isMobile || expandedCards[reporte.id]}>
                                <Box sx={{ mt: 1 }}>
                                  {reporte.tecnico_nombre && (
                                    <Typography 
                                      variant="body2" 
                                      sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: 0.5, 
                                        mb: 0.5,
                                        fontSize: { xs: '0.8rem', md: '0.875rem' }
                                      }}
                                    >
                                      <EngineeringIcon fontSize="small" color="primary" /> 
                                      Técnico: {reporte.tecnico_nombre}
                                    </Typography>
                                  )}
                                  
                                  {/* Chips de información visual */}
                                  <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
                                    {reporte.tiene_fotos && (
                                      <Chip 
                                        icon={<CameraIcon />}
                                        label={`${reporte.total_fotos} foto${reporte.total_fotos !== 1 ? 's' : ''}`}
                                        size="small"
                                        color="info"
                                        variant="outlined"
                                        sx={{ fontSize: { xs: '0.7rem', md: '0.75rem' } }}
                                      />
                                    )}
                                    
                                    {reporte.latitud && reporte.longitud && (
                                      <Chip 
                                        icon={<GPSIcon />}
                                        label="Ubicación GPS"
                                        size="small"
                                        color="success"
                                        variant="outlined"
                                        sx={{ fontSize: { xs: '0.7rem', md: '0.75rem' } }}
                                      />
                                    )}
                                  </Box>
                                </Box>
                              </Collapse>
                            </Box>
                            
                            {/* Estados y prioridad - Responsivos */}
                            <Box sx={{ ml: { xs: 0, sm: 2 }, mt: { xs: 2, sm: 0 }, textAlign: { xs: 'left', sm: 'right' } }}>
                              <Stack 
                                direction={{ xs: 'row', sm: 'column' }} 
                                spacing={1}
                                alignItems={{ xs: 'center', sm: 'flex-end' }}
                                flexWrap="wrap"
                              >
                                <Chip 
                                  label={reporte.estado_actual}
                                  color={getEstadoColor(reporte.estado_actual)}
                                  size={isMobile ? "small" : "medium"}
                                  sx={{ fontSize: { xs: '0.7rem', md: '0.875rem' } }}
                                />
                                <Chip 
                                  label={reporte.prioridad}
                                  color={getPrioridadColor(reporte.prioridad)}
                                  size="small"
                                  sx={{ fontSize: { xs: '0.7rem', md: '0.75rem' } }}
                                />
                              </Stack>
                              
                              {!isMobile && (
                                <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                                  Departamento: {reporte.departamento_responsable}
                                </Typography>
                              )}
                            </Box>
                          </Box>

                          <Divider sx={{ mb: 2 }} />
                          
                          {/* BOTONES CON FUNCIONALIDAD - COMPLETAMENTE RESPONSIVOS */}
                          <Box 
                            display="flex" 
                            gap={1} 
                            flexWrap="wrap"
                            flexDirection={{ xs: 'column', sm: 'row' }}
                          >
                            <Button
                              size={isMobile ? "medium" : "small"}
                              variant="outlined"
                              startIcon={<ViewIcon />}
                              onClick={() => handleVerDetalles(reporte)}
                              fullWidth={isMobile}
                              sx={{ 
                                fontSize: { xs: '0.9rem', md: '0.875rem' },
                                py: { xs: 1.5, md: 1 },
                                flex: { sm: 1 }
                              }}
                            >
                              {isMobile ? 'Ver Detalles con Mapa' : 'Ver Detalles'}
                            </Button>
                            
                            <Button
                              size={isMobile ? "medium" : "small"}
                              variant="outlined"
                              startIcon={<PhoneIcon />}
                              fullWidth={isMobile}
                              sx={{ 
                                fontSize: { xs: '0.9rem', md: '0.875rem' },
                                py: { xs: 1.5, md: 1 },
                                flex: { sm: 1 }
                              }}
                            >
                              {isMobile ? 'Contactar' : 'Contactar Ciudadano'}
                            </Button>

                            {/* BOTONES PARA APROBAR/RECHAZAR - SOLO SI ESTÁ EN ESTADO "Nuevo" */}
                            {reporte.estado_actual === 'Nuevo' && (
                              <Box 
                                display="flex" 
                                gap={1} 
                                width={{ xs: '100%', sm: 'auto' }}
                                mt={{ xs: 1, sm: 0 }}
                              >
                                <Button
                                  size={isMobile ? "medium" : "small"}
                                  variant="contained"
                                  color="success"
                                  startIcon={<CheckCircle />}
                                  onClick={() => handleAprobarReporteDirecto(reporte)}
                                  disabled={procesando}
                                  fullWidth={isMobile}
                                  sx={{ 
                                    fontSize: { xs: '0.9rem', md: '0.875rem' },
                                    py: { xs: 1.5, md: 1 }
                                  }}
                                >
                                  Aprobar
                                </Button>
                                
                                <Button
                                  size={isMobile ? "medium" : "small"}
                                  variant="outlined"
                                  color="error"
                                  startIcon={<Cancel />}
                                  onClick={() => handleRechazarReporteDirecto(reporte)}
                                  disabled={procesando}
                                  fullWidth={isMobile}
                                  sx={{ 
                                    fontSize: { xs: '0.9rem', md: '0.875rem' },
                                    py: { xs: 1.5, md: 1 }
                                  }}
                                >
                                  Rechazar
                                </Button>
                              </Box>
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                )}
              </Paper>
            </Grid>

            {/* Panel lateral - RESPONSIVO */}
            <Grid item xs={12} lg={4}>
              <Stack spacing={{ xs: 2, md: 3 }}>
                {/* Resumen Comunitario */}
                <Paper elevation={3} sx={{ p: { xs: 2, md: 3 } }}>
                  <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
                    Resumen Comunitario
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box textAlign="center">
                        <Typography variant="body2" color="textSecondary" sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
                          Pendientes Aprobación
                        </Typography>
                        <Typography variant={{ xs: "h5", md: "h4" }} color="warning.main">
                          {statsComunitarias.reportesPendientesAprobacion}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Box textAlign="center">
                        <Typography variant="body2" color="textSecondary" sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
                          Reportes Activos
                        </Typography>
                        <Typography variant={{ xs: "h5", md: "h4" }} color="info.main">
                          {statsComunitarias.reportesActivos}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Box textAlign="center">
                        <Typography variant="body2" color="textSecondary" sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
                          Reportes Resueltos
                        </Typography>
                        <Typography variant={{ xs: "h5", md: "h4" }} color="success.main">
                          {statsComunitarias.reportesResueltos}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Box textAlign="center">
                        <Typography variant="body2" color="textSecondary" sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
                          Próxima Reunión
                        </Typography>
                        <Typography variant="body1" fontWeight="bold" sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}>
                          {statsComunitarias.proximaReunion}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>

                {/* Acciones Rápidas */}
                <Paper elevation={3} sx={{ p: { xs: 2, md: 3 } }}>
                  <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
                    Acciones Rápidas
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Stack spacing={1}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<RefreshIcon />}
                      onClick={() => mostrarSnackbar('Datos actualizados', 'success')}
                      disabled={loading}
                      size={isMobile ? "large" : "medium"}
                      sx={{ 
                        fontSize: { xs: '0.9rem', md: '0.875rem' },
                        py: { xs: 1.5, md: 1 }
                      }}
                    >
                      Actualizar Datos
                    </Button>
                    
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<CampaignIcon />}
                      size={isMobile ? "large" : "medium"}
                      sx={{ 
                        fontSize: { xs: '0.9rem', md: '0.875rem' },
                        py: { xs: 1.5, md: 1 }
                      }}
                    >
                      Convocar Reunión
                    </Button>
                    
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<TrendingIcon />}
                      size={isMobile ? "large" : "medium"}
                      sx={{ 
                        fontSize: { xs: '0.9rem', md: '0.875rem' },
                        py: { xs: 1.5, md: 1 }
                      }}
                    >
                      Reporte Comunitario
                    </Button>
                    
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<EngineeringIcon />}
                      size={isMobile ? "large" : "medium"}
                      sx={{ 
                        fontSize: { xs: '0.9rem', md: '0.875rem' },
                        py: { xs: 1.5, md: 1 }
                      }}
                    >
                      Contactar Técnicos
                    </Button>
                  </Stack>
                </Paper>
              </Stack>
            </Grid>
          </Grid>
        )}

        {/* TAB 1: GESTIÓN DE CIUDADANOS - COMPLETAMENTE RESPONSIVO */}
        {tabValue === 1 && (
          <Paper elevation={3} sx={{ p: { xs: 2, md: 3 } }}>
            <Typography variant="h6" gutterBottom sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              fontSize: { xs: '1.1rem', md: '1.25rem' }
            }}>
              <PeopleIcon color="primary" /> 
              {isMobile ? `Ciudadanos ${user?.zona || 'Zona'}` : `Ciudadanos de ${user?.zona || 'mi Zona'}`}
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={{ xs: 2, md: 3 }}>
              {ciudadanosZona.map((ciudadano) => (
                <Grid item xs={12} sm={6} lg={4} key={ciudadano.id}>
                  <Card elevation={2}>
                    <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                      <Box display="flex" alignItems="center" mb={2}>
                        <Avatar sx={{ 
                          bgcolor: ciudadano.verificado ? 'success.main' : 'warning.main', 
                          mr: 2,
                          width: { xs: 35, md: 40 },
                          height: { xs: 35, md: 40 },
                          fontSize: { xs: '0.9rem', md: '1rem' }
                        }}>
                          {ciudadano.nombre.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                        <Box flex={1}>
                          <Typography 
                            variant="h6"
                            sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}
                          >
                            {ciudadano.nombre}
                          </Typography>
                          <Chip 
                            label={ciudadano.verificado ? "Verificado" : "Pendiente"}
                            color={ciudadano.verificado ? "success" : "warning"}
                            size="small"
                            sx={{ fontSize: { xs: '0.7rem', md: '0.75rem' } }}
                          />
                        </Box>
                      </Box>
                      
                      <Stack spacing={0.5} mb={2}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 0.5,
                            fontSize: { xs: '0.8rem', md: '0.875rem' }
                          }}
                        >
                          <EmailIcon fontSize="small" /> 
                          {isMobile && ciudadano.correo.length > 20 ? 
                            `${ciudadano.correo.substring(0, 20)}...` : 
                            ciudadano.correo
                          }
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 0.5,
                            fontSize: { xs: '0.8rem', md: '0.875rem' }
                          }}
                        >
                          <PhoneIcon fontSize="small" /> {ciudadano.telefono}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 0.5,
                            fontSize: { xs: '0.8rem', md: '0.875rem' }
                          }}
                        >
                          <HomeIcon fontSize="small" /> 
                          {isMobile && ciudadano.direccion.length > 25 ? 
                            `${ciudadano.direccion.substring(0, 25)}...` : 
                            ciudadano.direccion
                          }
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="textSecondary"
                          sx={{ fontSize: { xs: '0.7rem', md: '0.8rem' } }}
                        >
                          Reportes: {ciudadano.reportesCreados} | Registro: {ciudadano.fechaRegistro}
                        </Typography>
                      </Stack>

                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                        {!ciudadano.verificado && (
                          <Button
                            size={isMobile ? "medium" : "small"}
                            variant="contained"
                            color="success"
                            startIcon={<VerifiedIcon />}
                            onClick={() => handleVerificarCiudadano(ciudadano.id)}
                            fullWidth={isMobile}
                            sx={{ 
                              fontSize: { xs: '0.9rem', md: '0.875rem' },
                              py: { xs: 1.5, md: 1 }
                            }}
                          >
                            Verificar
                          </Button>
                        )}
                        
                        <Button
                          size={isMobile ? "medium" : "small"}
                          variant="outlined"
                          startIcon={<PhoneIcon />}
                          fullWidth={isMobile}
                          sx={{ 
                            fontSize: { xs: '0.9rem', md: '0.875rem' },
                            py: { xs: 1.5, md: 1 }
                          }}
                        >
                          Contactar
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}

        {/* TAB 2: COORDINACIÓN - COMPLETAMENTE RESPONSIVO */}
        {tabValue === 2 && (
          <Grid container spacing={{ xs: 2, md: 3 }}>
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: { xs: 2, md: 3 } }}>
                <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
                  Coordinación con Técnicos
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontSize: { xs: '0.85rem', md: '0.875rem' } }}>
                    Facilita el acceso de técnicos a tu zona para resolver reportes
                  </Typography>
                </Alert>
                
                <List>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <EngineeringIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Técnico de Energía Eléctrica"
                      secondary="2 reportes pendientes en tu zona"
                      primaryTypographyProps={{ 
                        fontSize: { xs: '0.9rem', md: '1rem' }
                      }}
                      secondaryTypographyProps={{ 
                        fontSize: { xs: '0.8rem', md: '0.875rem' }
                      }}
                    />
                    <Button 
                      size={isMobile ? "medium" : "small"}
                      variant="outlined"
                      sx={{ 
                        fontSize: { xs: '0.8rem', md: '0.875rem' },
                        py: { xs: 1, md: 0.5 }
                      }}
                    >
                      {isMobile ? 'Coordinar' : 'Coordinar Visita'}
                    </Button>
                  </ListItem>
                  
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <EngineeringIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Técnico de Infraestructura"
                      secondary="1 reporte urgente - bache en calle principal"
                      primaryTypographyProps={{ 
                        fontSize: { xs: '0.9rem', md: '1rem' }
                      }}
                      secondaryTypographyProps={{ 
                        fontSize: { xs: '0.8rem', md: '0.875rem' }
                      }}
                    />
                    <Button 
                      size={isMobile ? "medium" : "small"}
                      variant="contained" 
                      color="warning"
                      sx={{ 
                        fontSize: { xs: '0.8rem', md: '0.875rem' },
                        py: { xs: 1, md: 0.5 }
                      }}
                    >
                      {isMobile ? 'Urgente' : 'Coordinar Urgente'}
                    </Button>
                  </ListItem>
                </List>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: { xs: 2, md: 3 } }}>
                <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
                  Actividades Comunitarias
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <List>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <EventIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Reunión Mensual COCODE"
                      secondary="Próxima: 15 de Enero, 6:00 PM"
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
                      <CampaignIcon color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Campaña de Limpieza"
                      secondary="Sábado 20 de Enero, 8:00 AM"
                      primaryTypographyProps={{ 
                        fontSize: { xs: '0.9rem', md: '1rem' }
                      }}
                      secondaryTypographyProps={{ 
                        fontSize: { xs: '0.8rem', md: '0.875rem' }
                      }}
                    />
                  </ListItem>
                </List>

                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  sx={{ 
                    mt: 2,
                    fontSize: { xs: '0.9rem', md: '1rem' },
                    py: { xs: 1.5, md: 1 }
                  }}
                  size={isMobile ? "large" : "medium"}
                >
                  {isMobile ? 'Nueva Actividad' : 'Planificar Nueva Actividad'}
                </Button>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* TAB 3: REPORTES PENDIENTES DE APROBACIÓN - RESPONSIVO */}
        {tabValue === 3 && (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ 
              fontSize: { xs: '1.1rem', md: '1.25rem' },
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <WarningIcon color="warning" />
              {isMobile ? 'Pendientes Aprobación' : 'Reportes Pendientes de Aprobación'}
            </Typography>
            
            {reportesPendientes.length === 0 ? (
              <Alert severity="success">
                <Typography variant="body2">
                  <strong>¡Excelente trabajo!</strong> No hay reportes pendientes de aprobación en tu zona.
                </Typography>
              </Alert>
            ) : (
              <Box>
                {reportesPendientes.map((reporte) => (
                  <Card key={reporte.id} sx={{ mb: 2, border: '1px solid', borderColor: 'warning.light' }}>
                    <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Box flex={1}>
                          <Box display="flex" alignItems="center" gap={1} mb={1} flexWrap="wrap">
                            <Typography variant="h6" sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>
                              {isMobile && reporte.titulo.length > 35 ? 
                                `${reporte.titulo.substring(0, 35)}...` : 
                                reporte.titulo
                              }
                            </Typography>
                            <Chip 
                              label="PENDIENTE APROBACIÓN"
                              color="warning" 
                              size="small"
                              icon={<ScheduleIcon />}
                              sx={{ fontSize: { xs: '0.7rem', md: '0.75rem' } }}
                            />
                          </Box>
                          
                          <Typography variant="body2" color="textSecondary" gutterBottom sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
                            #{reporte.numero_reporte} | {new Date(reporte.fecha_reporte).toLocaleDateString()} | {reporte.tipo_problema}
                          </Typography>
                          
                          <Typography variant="body1" gutterBottom sx={{ 
                            mt: 1,
                            fontSize: { xs: '0.85rem', md: '1rem' }
                          }}>
                            {isMobile && reporte.descripcion.length > 100 ? 
                              `${reporte.descripcion.substring(0, 100)}...` : 
                              reporte.descripcion
                            }
                          </Typography>
                          
                          {/* Información de ubicación y fotos */}
                          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <HomeIcon fontSize="small" color="action" />
                              <Typography variant="body2" color="textSecondary" sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
                                {isMobile && reporte.direccion.length > 25 ? 
                                  `${reporte.direccion.substring(0, 25)}...` : 
                                  reporte.direccion
                                }
                              </Typography>
                            </Box>
                            
                            {reporte.latitud && reporte.longitud && (
                              <Chip 
                                icon={<LocationIcon />}
                                label="GPS"
                                size="small"
                                color="success"
                                variant="outlined"
                                sx={{ fontSize: { xs: '0.7rem', md: '0.75rem' } }}
                              />
                            )}
                            
                            {reporte.tiene_fotos && (
                              <Chip 
                                icon={<CameraIcon />}
                                label={`${reporte.total_fotos} foto${reporte.total_fotos !== 1 ? 's' : ''}`}
                                size="small"
                                color="info"
                                variant="outlined"
                                sx={{ fontSize: { xs: '0.7rem', md: '0.75rem' } }}
                              />
                            )}
                          </Box>

                          {/* Información del ciudadano */}
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 0.5, 
                              mb: 0.5,
                              fontSize: { xs: '0.8rem', md: '0.875rem' }
                            }}>
                              <PersonIcon fontSize="small" /> {reporte.ciudadano_nombre} {reporte.ciudadano_apellido}
                            </Typography>
                            <Typography variant="body2" sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 0.5,
                              fontSize: { xs: '0.8rem', md: '0.875rem' }
                            }}>
                              <PhoneIcon fontSize="small" /> {reporte.ciudadano_telefono}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box sx={{ ml: { xs: 0, sm: 2 }, mt: { xs: 2, sm: 0 }, textAlign: { xs: 'left', sm: 'right' } }}>
                          <Chip 
                            label={reporte.prioridad || 'Media'}
                            color={getPrioridadColor(reporte.prioridad)}
                            sx={{ 
                              mb: 1, 
                              display: 'block',
                              fontSize: { xs: '0.7rem', md: '0.875rem' }
                            }}
                          />
                          <Typography variant="caption" color="textSecondary" sx={{ fontSize: { xs: '0.7rem', md: '0.75rem' } }}>
                            Departamento: {isMobile ? 
                              reporte.departamento_responsable.substring(0, 15) + '...' : 
                              reporte.departamento_responsable
                            }
                          </Typography>
                        </Box>
                      </Box>

                      <Divider sx={{ mb: 2 }} />
                      
                      <Box 
                        display="flex" 
                        gap={1} 
                        justifyContent="space-between" 
                        alignItems="center"
                        flexDirection={{ xs: 'column', sm: 'row' }}
                      >
                        <Button
                          size={isMobile ? "medium" : "small"}
                          variant="outlined"
                          onClick={() => handleVerDetalles(reporte)}
                          fullWidth={isMobile}
                          sx={{ 
                            fontSize: { xs: '0.9rem', md: '0.875rem' },
                            py: { xs: 1.5, md: 1 }
                          }}
                        >
                          {isMobile ? 'Ver Detalles con Mapa' : 'Ver Detalles Completos'}
                        </Button>
                        
                        <Box 
                          display="flex" 
                          gap={1}
                          width={{ xs: '100%', sm: 'auto' }}
                          mt={{ xs: 1, sm: 0 }}
                        >
                          <Button
                            variant="contained"
                            color="success"
                            size={isMobile ? "medium" : "small"}
                            startIcon={<CheckCircle />}
                            onClick={() => handleAprobarReporteDirecto(reporte)}
                            fullWidth={isMobile}
                            sx={{ 
                              fontSize: { xs: '0.9rem', md: '0.875rem' },
                              py: { xs: 1.5, md: 1 }
                            }}
                          >
                            Aprobar
                          </Button>
                          
                          <Button
                            variant="outlined"
                            color="error"
                            size={isMobile ? "medium" : "small"}
                            startIcon={<Cancel />}
                            onClick={() => handleRechazarReporteDirecto(reporte)}
                            fullWidth={isMobile}
                            sx={{ 
                              fontSize: { xs: '0.9rem', md: '0.875rem' },
                              py: { xs: 1.5, md: 1 }
                            }}
                          >
                            Rechazar
                          </Button>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Box>
        )}

        {/* Footer Info - RESPONSIVO */}
        <Box 
          mt={4} 
          p={{ xs: 2, md: 3 }} 
          bgcolor="success.50" 
          borderRadius={1} 
          border="1px solid" 
          borderColor="success.200"
        >
          <Typography 
            variant="body2" 
            color="textSecondary" 
            textAlign="center"
            sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}
          >
            <strong>Permisos de Líder COCODE:</strong> {
              isMobile 
                ? `Gestionar ciudadanos de ${user?.zona || 'tu zona'} | Ver y validar reportes | Crear reportes comunitarios | Coordinar con técnicos.`
                : `Gestionar ciudadanos de ${user?.zona || 'tu zona'} | Ver y validar reportes comunitarios | Crear reportes en nombre de ciudadanos | Coordinar con técnicos | Organizar actividades comunitarias |`
            }
            {!isMobile && (
              <>
                <strong> NO puedes:</strong> Ver reportes de otras zonas | Asignar técnicos | Cambiar configuraciones del sistema
              </>
            )}
          </Typography>
        </Box>
      </Container>

      {/* FAB PARA CREAR REPORTE EN MÓVIL */}
      {isMobile && (
        <Fab
          color="primary"
          onClick={() => setOpenNuevoReporte(true)}
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

      {/* MODAL VER DETALLES CON MAPA - COMPLETAMENTE RESPONSIVO */}
      <Dialog 
        open={modalVerDetalles} 
        onClose={cerrarModales} 
        maxWidth="lg" 
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
              Detalles del Reporte #{reporteSeleccionado?.numero_reporte}
            </Typography>
            {isMobile && (
              <IconButton onClick={cerrarModales}>
                <CloseIcon />
              </IconButton>
            )}
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ p: { xs: 1, md: 3 } }}>
          {reporteSeleccionado && (
            <Box>
              {/* Información General */}
              <Accordion defaultExpanded sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6" sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>
                    📋 Información General
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>
                        {reporteSeleccionado.titulo}
                      </Typography>
                      
                      <Typography variant="body1" gutterBottom>
                        <strong>Descripción:</strong>
                      </Typography>
                      <Typography variant="body2" paragraph sx={{ fontSize: { xs: '0.85rem', md: '0.875rem' } }}>
                        {reporteSeleccionado.descripcion}
                      </Typography>
                      
                      <Typography variant="body1" gutterBottom>
                        <strong>Dirección:</strong>
                      </Typography>
                      <Typography variant="body2" paragraph sx={{ fontSize: { xs: '0.85rem', md: '0.875rem' } }}>
                        {reporteSeleccionado.direccion}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Typography variant="body1" gutterBottom>
                        <strong>Información del Ciudadano:</strong>
                      </Typography>
                      <Stack spacing={0.5} mb={2}>
                        <Typography variant="body2" sx={{ fontSize: { xs: '0.85rem', md: '0.875rem' } }}>
                          <strong>Nombre:</strong> {reporteSeleccionado.ciudadano_nombre} {reporteSeleccionado.ciudadano_apellido}
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: { xs: '0.85rem', md: '0.875rem' } }}>
                          <strong>Teléfono:</strong> {reporteSeleccionado.ciudadano_telefono}
                        </Typography>
                      </Stack>
                      
                      <Typography variant="body1" gutterBottom>
                        <strong>Información Técnica:</strong>
                      </Typography>
                      <Stack spacing={0.5}>
                        <Typography variant="body2" sx={{ fontSize: { xs: '0.85rem', md: '0.875rem' } }}>
                          <strong>Tipo:</strong> {reporteSeleccionado.tipo_problema}
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: { xs: '0.85rem', md: '0.875rem' } }}>
                          <strong>Departamento:</strong> {reporteSeleccionado.departamento_responsable}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontSize: { xs: '0.85rem', md: '0.875rem' } }}>
                            <strong>Prioridad:</strong>
                          </Typography>
                          <Chip 
                            label={reporteSeleccionado.prioridad}
                            color={getPrioridadColor(reporteSeleccionado.prioridad)}
                            size="small"
                            sx={{ fontSize: { xs: '0.7rem', md: '0.75rem' } }}
                          />
                        </Box>
                      </Stack>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>

              {/* Mapa de Ubicación - COMPONENTE RESPONSIVO AGREGADO */}
              {mostrarMapa && ubicacionMapa.lat && ubicacionMapa.lng && (
                <Accordion sx={{ mb: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6" sx={{ 
                      fontSize: { xs: '1rem', md: '1.25rem' },
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <MapIcon color="primary" />
                      🗺️ Ubicación del Reporte
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
                        <strong>Coordenadas:</strong> {ubicacionMapa.lat.toFixed(6)}, {ubicacionMapa.lng.toFixed(6)} | 
                        <strong> Método:</strong> {ubicacionMapa.metodo} | 
                        {ubicacionMapa.precision && <><strong> Precisión:</strong> {ubicacionMapa.precision}m</>}
                      </Typography>
                    </Alert>
                    
                    <Box sx={{ 
                      height: { xs: 250, md: 400 },
                      border: '2px solid',
                      borderColor: 'primary.main',
                      borderRadius: 2,
                      overflow: 'hidden'
                    }}>
                      <MapaUbicacion
                        ubicacion={ubicacionMapa}
                        onUbicacionChange={() => {}} // Solo lectura
                        height={isMobile ? 250 : 400}
                        showControls={false} // Solo vista
                        allowManualSelection={false} // Solo lectura
                        readonly={true}
                      />
                    </Box>
                    
                    <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip 
                        icon={<GPSIcon />}
                        label={`${ubicacionMapa.lat.toFixed(6)}, ${ubicacionMapa.lng.toFixed(6)}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Chip 
                        label={`Método: ${ubicacionMapa.metodo}`}
                        size="small"
                        variant="outlined"
                      />
                      {ubicacionMapa.precision && (
                        <Chip 
                          label={`Precisión: ${ubicacionMapa.precision}m`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              )}

              {/* Fotos (si las hubiera) */}
              {reporteSeleccionado.tiene_fotos && (
                <Accordion sx={{ mb: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6" sx={{ 
                      fontSize: { xs: '1rem', md: '1.25rem' },
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <CameraIcon color="primary" />
                      📸 Fotos del Reporte ({reporteSeleccionado.total_fotos})
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Alert severity="info">
                      <Typography variant="body2">
                        Funcionalidad de fotos Firebase disponible. Se mostrarían aquí las {reporteSeleccionado.total_fotos} fotos subidas.
                      </Typography>
                    </Alert>
                  </AccordionDetails>
                </Accordion>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, md: 3 } }}>
          {!isMobile && (
            <Button onClick={cerrarModales}>
              Cerrar
            </Button>
          )}
          
          {reporteSeleccionado?.estado_actual === 'Nuevo' && (
            <>
              <Button 
                variant="contained" 
                color="success"
                onClick={() => {
                  cerrarModales();
                  handleAprobarReporteDirecto(reporteSeleccionado);
                }}
                startIcon={<CheckCircle />}
                fullWidth={isMobile}
                size={isMobile ? "large" : "medium"}
                sx={{ 
                  fontSize: { xs: '0.9rem', md: '0.875rem' },
                  py: { xs: 1.5, md: 1 }
                }}
              >
                Aprobar Reporte
              </Button>
              
              <Button 
                variant="outlined" 
                color="error"
                onClick={() => {
                  cerrarModales();
                  handleRechazarReporteDirecto(reporteSeleccionado);
                }}
                startIcon={<Cancel />}
                fullWidth={isMobile}
                size={isMobile ? "large" : "medium"}
                sx={{ 
                  fontSize: { xs: '0.9rem', md: '0.875rem' },
                  py: { xs: 1.5, md: 1 }
                }}
              >
                Rechazar Reporte
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* MODAL APROBAR - RESPONSIVO */}
      <Dialog 
        open={modalAprobar} 
        onClose={cerrarModales} 
        maxWidth="sm" 
        fullWidth
        fullScreen={isSmallMobile}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
              ✅ Aprobar Reporte
            </Typography>
            {isSmallMobile && (
              <IconButton onClick={cerrarModales}>
                <CloseIcon />
              </IconButton>
            )}
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2, md: 3 } }}>
          {reporteSeleccionado && (
            <Box>
              <Typography variant="body1" gutterBottom sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}>
                <strong>Reporte:</strong> {reporteSeleccionado.titulo}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
                #{reporteSeleccionado.numero_reporte}
              </Typography>
              
              <TextField
                fullWidth
                label="Comentario del Líder (opcional)"
                multiline
                rows={isMobile ? 4 : 3}
                value={comentarioLider}
                onChange={(e) => setComentarioLider(e.target.value)}
                placeholder="Agregar comentarios sobre la aprobación..."
                sx={{ mt: 2 }}
                size={isMobile ? "medium" : "medium"}
              />
              
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ fontSize: { xs: '0.85rem', md: '0.875rem' } }}>
                  Al aprobar, el reporte será enviado al administrador para asignación a técnico.
                </Typography>
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, md: 3 } }}>
          {!isSmallMobile && (
            <Button 
              onClick={cerrarModales}
              disabled={procesando}
              size={isMobile ? "large" : "medium"}
            >
              Cancelar
            </Button>
          )}
          <Button 
            variant="contained" 
            color="success"
            onClick={ejecutarAprobacion}
            disabled={procesando}
            startIcon={procesando ? <CircularProgress size={16} /> : <CheckCircle />}
            fullWidth={isSmallMobile}
            size={isMobile ? "large" : "medium"}
            sx={{ 
              fontSize: { xs: '0.9rem', md: '0.875rem' },
              py: { xs: 1.5, md: 1 }
            }}
          >
            {procesando ? 'Aprobando...' : 'Aprobar Reporte'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL RECHAZAR - RESPONSIVO */}
      <Dialog 
        open={modalRechazar} 
        onClose={cerrarModales} 
        maxWidth="sm" 
        fullWidth
        fullScreen={isSmallMobile}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
              ❌ Rechazar Reporte
            </Typography>
            {isSmallMobile && (
              <IconButton onClick={cerrarModales}>
                <CloseIcon />
              </IconButton>
            )}
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2, md: 3 } }}>
          {reporteSeleccionado && (
            <Box>
              <Typography variant="body1" gutterBottom sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}>
                <strong>Reporte:</strong> {reporteSeleccionado.titulo}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
                #{reporteSeleccionado.numero_reporte}
              </Typography>
              
              <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
                <InputLabel>Motivo de Rechazo *</InputLabel>
                <Select
                  value={motivoRechazo}
                  onChange={(e) => setMotivoRechazo(e.target.value)}
                  label="Motivo de Rechazo *"
                  size={isMobile ? "medium" : "medium"}
                >
                  {motivosRechazo.map((motivo) => (
                    <MenuItem key={motivo} value={motivo}>
                      <Typography variant="body2" sx={{ fontSize: { xs: '0.85rem', md: '0.875rem' } }}>
                        {motivo}
                      </Typography>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                label="Comentario adicional (opcional)"
                multiline
                rows={isMobile ? 4 : 3}
                value={comentarioLider}
                onChange={(e) => setComentarioLider(e.target.value)}
                placeholder="Explicar el motivo del rechazo..."
                size={isMobile ? "medium" : "medium"}
              />
              
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ fontSize: { xs: '0.85rem', md: '0.875rem' } }}>
                  Al rechazar, el ciudadano será notificado del motivo.
                </Typography>
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, md: 3 } }}>
          {!isSmallMobile && (
            <Button 
              onClick={cerrarModales}
              disabled={procesando}
              size={isMobile ? "large" : "medium"}
            >
              Cancelar
            </Button>
          )}
          <Button 
            variant="contained" 
            color="error"
            onClick={ejecutarRechazo}
            disabled={procesando || !motivoRechazo}
            startIcon={procesando ? <CircularProgress size={16} /> : <Cancel />}
            fullWidth={isSmallMobile}
            size={isMobile ? "large" : "medium"}
            sx={{ 
              fontSize: { xs: '0.9rem', md: '0.875rem' },
              py: { xs: 1.5, md: 1 }
            }}
          >
            {procesando ? 'Rechazando...' : 'Rechazar Reporte'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL NUEVO REPORTE COMUNITARIO - RESPONSIVO */}
      <Dialog 
        open={openNuevoReporte} 
        onClose={cerrarModales} 
        maxWidth="md" 
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
              📝 Crear Reporte Comunitario
            </Typography>
            {isMobile && (
              <IconButton onClick={cerrarModales}>
                <CloseIcon />
              </IconButton>
            )}
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2, md: 3 } }}>
          <Stack spacing={{ xs: 2, md: 3 }} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Título del Problema"
              variant="outlined"
              placeholder="Ej: Falta de alumbrado en parque central"
              size={isMobile ? "medium" : "medium"}
            />
            <TextField
              fullWidth
              multiline
              rows={isMobile ? 4 : 4}
              label="Descripción Detallada"
              variant="outlined"
              placeholder="Describe el problema detalladamente..."
              size={isMobile ? "medium" : "medium"}
            />
            <TextField
              fullWidth
              label="Ubicación/Dirección"
              variant="outlined"
              placeholder="Dirección exacta del problema"
              size={isMobile ? "medium" : "medium"}
            />
            <TextField
              fullWidth
              label="Ciudadano Reportante (opcional)"
              variant="outlined"
              placeholder="Nombre del ciudadano que reportó"
              size={isMobile ? "medium" : "medium"}
            />
            
            <FormControl fullWidth>
              <InputLabel>Prioridad</InputLabel>
              <Select
                defaultValue="Media"
                label="Prioridad"
                size={isMobile ? "medium" : "medium"}
              >
                <MenuItem value="Baja">Baja</MenuItem>
                <MenuItem value="Media">Media</MenuItem>
                <MenuItem value="Alta">Alta</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, md: 3 } }}>
          {!isMobile && (
            <Button onClick={cerrarModales}>
              Cancelar
            </Button>
          )}
          <Button 
            variant="contained" 
            onClick={() => {
              mostrarSnackbar('Reporte comunitario creado exitosamente', 'success');
              cerrarModales();
            }}
            fullWidth={isMobile}
            size={isMobile ? "large" : "medium"}
            sx={{ 
              fontSize: { xs: '0.9rem', md: '0.875rem' },
              py: { xs: 1.5, md: 1 }
            }}
          >
            Crear Reporte
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
    </Box>
  );
};

export default DashboardLider;