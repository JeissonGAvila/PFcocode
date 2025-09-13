// frontend/src/vistas/tecnico/Dashboard.jsx - VERSIÓN RESPONSIVA MEJORADA
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
  Badge,
  Stack,
  Container,
  useTheme,
  useMediaQuery,
  Collapse
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
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Menu as MenuIcon
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const isLaptop = useMediaQuery(theme.breakpoints.up('lg'));
  
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
  const [openDetalles, setOpenDetalles] = useState(false);
  const [selectedReporte, setSelectedReporte] = useState(null);
  const [reporteDetalle, setReporteDetalle] = useState(null);
  const [historialReporte, setHistorialReporte] = useState([]);
  const [tabDetalles, setTabDetalles] = useState(0);
  
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

  // Estados para UI responsiva
  const [expandedCard, setExpandedCard] = useState(null);
  const [showUserInfo, setShowUserInfo] = useState(false);

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

  const toggleCardExpansion = (cardId) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

  // Verificaciones de seguridad antes de renderizar
  if (!isAuthenticated) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert severity="error">
          No estás autenticado. Redirigiendo al login...
        </Alert>
      </Container>
    );
  }

  if (!isTecnico()) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert severity="error">
          No tienes permisos de técnico. Contacta al administrador.
        </Alert>
      </Container>
    );
  }

  if (loading && reportes.length === 0) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Box display="flex" flexDirection="column" alignItems="center" p={4}>
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2, textAlign: 'center' }}>
            Cargando reportes asignados...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      {/* Header del Panel Técnico - Responsivo */}
      <Box 
        bgcolor="warning.main" 
        color="white" 
        sx={{
          p: { xs: 2, sm: 3 },
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: { xs: 2, sm: 1 }
        }}
      >
        <Box sx={{ width: { xs: '100%', sm: 'auto' } }}>
          <Typography 
            variant={isMobile ? "h5" : "h4"} 
            gutterBottom 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              flexWrap: 'wrap'
            }}
          >
            <EngineeringIcon sx={{ fontSize: { xs: 30, sm: 40 } }} /> 
            Panel Técnico
          </Typography>
          
          {/* Información del usuario - Colapsible en móvil */}
          <Box sx={{ display: { xs: 'block', sm: 'block' } }}>
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={{ xs: 0.5, sm: 2 }}
              divider={!isMobile && <Typography>|</Typography>}
            >
              <Typography variant={isMobile ? "body2" : "h6"}>
                Técnico: {user?.nombre || 'Usuario'}
              </Typography>
              <Typography variant={isMobile ? "body2" : "body1"} sx={{ opacity: 0.9 }}>
                Departamento: <strong>{user?.departamento || 'No especificado'}</strong>
              </Typography>
              {!isMobile && (
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  ID: {user?.id} | {user?.correo}
                </Typography>
              )}
            </Stack>
            
            {isMobile && (
              <Box sx={{ mt: 1 }}>
                <Button
                  size="small"
                  variant="text"
                  sx={{ color: 'white', p: 0, minWidth: 'auto' }}
                  onClick={() => setShowUserInfo(!showUserInfo)}
                  endIcon={showUserInfo ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                >
                  {showUserInfo ? 'Menos info' : 'Más info'}
                </Button>
                <Collapse in={showUserInfo}>
                  <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
                    ID: {user?.id} | {user?.correo}
                  </Typography>
                </Collapse>
              </Box>
            )}
          </Box>
        </Box>
        
        <Box sx={{ 
          alignSelf: { xs: 'flex-end', sm: 'center' },
          mt: { xs: 1, sm: 0 }
        }}>
          <LogoutButton 
            variant="text" 
            size={isMobile ? "small" : "medium"}
            sx={{ color: 'white' }}
          />
        </Box>
      </Box>

      {/* Contenido Principal */}
      <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3 } }}>
        {/* Alerta de Departamento */}
        <Alert 
          severity="info" 
          sx={{ 
            mb: 3,
            '& .MuiAlert-message': {
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }
          }}
        >
          <Typography variant="body2" component="div">
            <strong>Panel Técnico con Evidencia Visual:</strong> Ahora puedes ver las fotos y ubicación GPS que proporcionó el ciudadano para cada reporte de <strong>{user?.departamento}</strong>
          </Typography>
        </Alert>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: { xs: 1, sm: 2 }
            }}>
              <Typography variant="body2" sx={{ flex: 1 }}>
                {error}
              </Typography>
              <Button 
                onClick={cargarDatos} 
                size="small"
                variant="outlined"
                sx={{ mt: { xs: 1, sm: 0 } }}
              >
                Reintentar
              </Button>
            </Box>
          </Alert>
        )}

        {/* Sistema de Tabs - Responsivo */}
        <Paper sx={{ borderRadius: 2, mb: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant={isMobile ? "scrollable" : "fullWidth"}
            scrollButtons={isMobile ? "auto" : false}
            allowScrollButtonsMobile
            sx={{
              '& .MuiTab-root': {
                minHeight: { xs: 48, sm: 64 },
                fontSize: { xs: '0.8rem', sm: '0.95rem' },
                fontWeight: 500,
                minWidth: { xs: 120, sm: 'auto' }
              },
              '& .MuiTab-iconWrapper': {
                fontSize: { xs: '1.2rem', sm: '1.5rem' }
              }
            }}
          >
            <Tab 
              label="Mis Reportes" 
              icon={<ReporteIcon />}
              iconPosition={isMobile ? "top" : "start"}
            />
            <Tab 
              label="Estadísticas" 
              icon={<ScheduleIcon />}
              iconPosition={isMobile ? "top" : "start"}
            />
            <Tab 
              label="Herramientas" 
              icon={<BuildIcon />}
              iconPosition={isMobile ? "top" : "start"}
            />
          </Tabs>
        </Paper>

        {/* TAB 0: Mis Reportes */}
        {tabValue === 0 && (
          <Box>
            {/* Estadísticas mejoradas con fotos y GPS - Grid Responsivo */}
            <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ mb: 3 }}>
              <Grid item xs={6} sm={6} md={3}>
                <Card elevation={2}>
                  <CardContent sx={{ 
                    textAlign: 'center', 
                    py: { xs: 1.5, sm: 2 },
                    px: { xs: 1, sm: 2 }
                  }}>
                    <ReporteIcon 
                      color="primary" 
                      sx={{ fontSize: { xs: 24, sm: 30 }, mb: 1 }} 
                    />
                    <Typography 
                      variant={isMobile ? "h6" : "h6"} 
                      color="primary.main"
                      sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
                    >
                      {estadisticas.total_asignados || 0}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="textSecondary"
                      sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
                    >
                      Total Asignados
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={6} md={3}>
                <Card elevation={2}>
                  <CardContent sx={{ 
                    textAlign: 'center', 
                    py: { xs: 1.5, sm: 2 },
                    px: { xs: 1, sm: 2 }
                  }}>
                    <CameraIcon 
                      color="info" 
                      sx={{ fontSize: { xs: 24, sm: 30 }, mb: 1 }} 
                    />
                    <Typography 
                      variant={isMobile ? "h6" : "h6"} 
                      color="info.main"
                      sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
                    >
                      {estadisticas.con_fotos || 0}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="textSecondary"
                      sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
                    >
                      Con Evidencia Fotográfica
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={6} md={3}>
                <Card elevation={2}>
                  <CardContent sx={{ 
                    textAlign: 'center', 
                    py: { xs: 1.5, sm: 2 },
                    px: { xs: 1, sm: 2 }
                  }}>
                    <GPSIcon 
                      color="success" 
                      sx={{ fontSize: { xs: 24, sm: 30 }, mb: 1 }} 
                    />
                    <Typography 
                      variant={isMobile ? "h6" : "h6"} 
                      color="success.main"
                      sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
                    >
                      {estadisticas.con_ubicacion || 0}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="textSecondary"
                      sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
                    >
                      Con Ubicación GPS
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={6} md={3}>
                <Card elevation={2}>
                  <CardContent sx={{ 
                    textAlign: 'center', 
                    py: { xs: 1.5, sm: 2 },
                    px: { xs: 1, sm: 2 }
                  }}>
                    <CheckIcon 
                      color="success" 
                      sx={{ fontSize: { xs: 24, sm: 30 }, mb: 1 }} 
                    />
                    <Typography 
                      variant={isMobile ? "h6" : "h6"} 
                      color="success.main"
                      sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
                    >
                      {estadisticas.resueltos || 0}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="textSecondary"
                      sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
                    >
                      Resueltos
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Lista de reportes mejorada - Completamente responsiva */}
            {reportes.length > 0 ? (
              <Grid container spacing={{ xs: 2, sm: 3 }}>
                {reportes.map((reporte) => {
                  const evidencia = validarEvidenciaVisual(reporte);
                  const isExpanded = expandedCard === reporte.id;
                  
                  return (
                    <Grid item xs={12} lg={6} key={reporte.id}>
                      <Card 
                        elevation={3}
                        sx={{
                          height: 'auto',
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                      >
                        <CardContent sx={{ 
                          flex: 1,
                          p: { xs: 2, sm: 3 }
                        }}>
                          {/* Header del reporte */}
                          <Stack 
                            direction={{ xs: 'column', sm: 'row' }}
                            justifyContent="space-between" 
                            alignItems={{ xs: 'flex-start', sm: 'flex-start' }}
                            spacing={1}
                            sx={{ mb: 2 }}
                          >
                            <Typography 
                              variant="h6" 
                              sx={{ 
                                fontSize: { xs: '1rem', sm: '1.25rem' },
                                lineHeight: 1.2,
                                flex: 1
                              }}
                            >
                              {reporte.titulo}
                            </Typography>
                            <Stack 
                              direction={{ xs: 'row', sm: 'column' }} 
                              spacing={0.5}
                              sx={{ 
                                alignItems: { xs: 'flex-start', sm: 'flex-end' },
                                flexWrap: 'wrap'
                              }}
                            >
                              <Chip 
                                label={reporte.estado}
                                color={getEstadoColor(reporte.estado)}
                                size="small"
                                sx={{ fontSize: { xs: '0.7rem', sm: '0.8125rem' } }}
                              />
                              {evidencia.esCompleto && (
                                <Chip 
                                  label="Evidencia Completa"
                                  color="success"
                                  size="small"
                                  sx={{ fontSize: { xs: '0.7rem', sm: '0.8125rem' } }}
                                />
                              )}
                            </Stack>
                          </Stack>

                          <Typography 
                            variant="body2" 
                            color="textSecondary" 
                            gutterBottom
                            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                          >
                            <strong>#{reporte.numero_reporte}</strong> | {reporte.tipo_problema}
                          </Typography>

                          {/* Descripción con expansión en móvil */}
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              mb: 2,
                              fontSize: { xs: '0.8rem', sm: '0.875rem' },
                              lineHeight: 1.4
                            }}
                          >
                            {isMobile ? (
                              <>
                                {isExpanded || reporte.descripcion.length <= 80 
                                  ? reporte.descripcion 
                                  : `${reporte.descripcion.substring(0, 80)}...`
                                }
                                {reporte.descripcion.length > 80 && (
                                  <Button
                                    size="small"
                                    sx={{ 
                                      p: 0, 
                                      minWidth: 'auto', 
                                      ml: 1,
                                      fontSize: '0.7rem'
                                    }}
                                    onClick={() => toggleCardExpansion(reporte.id)}
                                  >
                                    {isExpanded ? 'Ver menos' : 'Ver más'}
                                  </Button>
                                )}
                              </>
                            ) : (
                              reporte.descripcion.length > 100 ? 
                                `${reporte.descripcion.substring(0, 100)}...` : 
                                reporte.descripcion
                            )}
                          </Typography>

                          {/* Información de ubicación con indicadores visuales */}
                          <Stack 
                            direction="row" 
                            alignItems="center" 
                            spacing={1}
                            sx={{ mb: 2 }}
                          >
                            <LocationIcon 
                              fontSize="small" 
                              sx={{ color: 'grey.600', fontSize: { xs: '1rem', sm: '1.25rem' } }} 
                            />
                            <Typography 
                              variant="body2" 
                              color="textSecondary"
                              sx={{ 
                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                flex: 1
                              }}
                            >
                              {isMobile && reporte.direccion.length > 40 
                                ? `${reporte.direccion.substring(0, 40)}...`
                                : reporte.direccion
                              }
                            </Typography>
                            {reporte.tiene_ubicacion_gps && (
                              <Chip 
                                icon={<GPSIcon sx={{ fontSize: '0.8rem !important' }} />}
                                label="GPS"
                                size="small"
                                color="success"
                                variant="outlined"
                                sx={{ 
                                  height: { xs: 20, sm: 24 },
                                  fontSize: { xs: '0.6rem', sm: '0.75rem' },
                                  '& .MuiChip-icon': {
                                    fontSize: { xs: '0.7rem', sm: '0.8rem' }
                                  }
                                }}
                              />
                            )}
                          </Stack>

                          {/* Evidencia visual y contacto */}
                          <Stack 
                            direction={{ xs: 'column', sm: 'row' }}
                            alignItems={{ xs: 'flex-start', sm: 'center' }}
                            spacing={1}
                            sx={{ mb: 2 }}
                          >
                            <Stack direction="row" spacing={1} alignItems="center">
                              {reporte.tiene_fotos && (
                                <Badge badgeContent={reporte.total_fotos} color="primary">
                                  <Chip 
                                    icon={<CameraIcon sx={{ fontSize: '0.8rem !important' }} />}
                                    label="Fotos"
                                    size="small"
                                    color="info"
                                    variant="outlined"
                                    sx={{ 
                                      height: { xs: 20, sm: 24 },
                                      fontSize: { xs: '0.6rem', sm: '0.75rem' }
                                    }}
                                  />
                                </Badge>
                              )}
                            </Stack>
                            
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                              <PersonIcon 
                                fontSize="small" 
                                sx={{ 
                                  color: 'grey.600',
                                  fontSize: { xs: '0.9rem', sm: '1.1rem' }
                                }} 
                              />
                              <Typography 
                                variant="body2" 
                                color="textSecondary"
                                sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
                              >
                                {isMobile && reporte.reportado_por.length > 15 
                                  ? `${reporte.reportado_por.substring(0, 15)}...`
                                  : reporte.reportado_por
                                }
                              </Typography>
                              {reporte.telefono_contacto && (
                                <PhoneIcon 
                                  fontSize="small" 
                                  sx={{ 
                                    color: 'grey.600',
                                    fontSize: { xs: '0.8rem', sm: '1rem' }
                                  }} 
                                />
                              )}
                            </Stack>
                          </Stack>

                          {/* Prioridad y tiempo asignado */}
                          <Stack 
                            direction={{ xs: 'column', sm: 'row' }}
                            justifyContent="space-between" 
                            alignItems={{ xs: 'flex-start', sm: 'center' }}
                            spacing={1}
                            sx={{ mb: 2 }}
                          >
                            <Chip 
                              label={`Prioridad: ${reporte.prioridad}`}
                              color={getPrioridadColor(reporte.prioridad)}
                              variant="outlined"
                              size="small"
                              sx={{ fontSize: { xs: '0.6rem', sm: '0.75rem' } }}
                            />
                            <Typography 
                              variant="caption" 
                              color="textSecondary"
                              sx={{ fontSize: { xs: '0.6rem', sm: '0.75rem' } }}
                            >
                              Asignado hace {reporte.dias_asignado || 0} días
                            </Typography>
                          </Stack>

                          <Divider sx={{ my: 2 }} />

                          {/* Botones de acción - Completamente responsivos */}
                          <Stack 
                            direction={{ xs: 'column', sm: 'row' }}
                            spacing={{ xs: 1, sm: 1 }}
                            sx={{ 
                              '& .MuiButton-root': {
                                fontSize: { xs: '0.7rem', sm: '0.8rem' },
                                py: { xs: 0.5, sm: 0.75 },
                                px: { xs: 1, sm: 1.5 }
                              }
                            }}
                          >
                            <Button
                              fullWidth={isMobile}
                              size="small"
                              variant="outlined"
                              color="primary"
                              startIcon={<ViewIcon sx={{ fontSize: { xs: '0.9rem', sm: '1.1rem' } }} />}
                              onClick={() => abrirModalDetalles(reporte)}
                            >
                              Ver Detalles
                            </Button>
                            <Button
                              fullWidth={isMobile}
                              size="small"
                              variant="contained"
                              color="primary"
                              startIcon={<StartIcon sx={{ fontSize: { xs: '0.9rem', sm: '1.1rem' } }} />}
                              onClick={() => abrirModalCambiarEstado(reporte)}
                              disabled={getEstadosPermitidos(reporte.estado).length === 0}
                            >
                              Cambiar Estado
                            </Button>
                            <Button
                              fullWidth={isMobile}
                              size="small"
                              variant="outlined"
                              startIcon={<CommentIcon sx={{ fontSize: { xs: '0.9rem', sm: '1.1rem' } }} />}
                              onClick={() => abrirModalSeguimiento(reporte)}
                            >
                              Seguimiento
                            </Button>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            ) : (
              <Paper 
                elevation={2} 
                sx={{ 
                  p: { xs: 3, sm: 4 }, 
                  textAlign: 'center',
                  mx: { xs: 0, sm: 2 }
                }}
              >
                <EngineeringIcon 
                  sx={{ 
                    fontSize: { xs: 50, sm: 60 }, 
                    color: 'grey.400', 
                    mb: 2 
                  }} 
                />
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
                >
                  No tienes reportes asignados
                </Typography>
                <Typography 
                  variant="body2" 
                  color="textSecondary"
                  sx={{ 
                    mb: 2,
                    fontSize: { xs: '0.8rem', sm: '0.875rem' }
                  }}
                >
                  Los reportes aparecerán aquí cuando los administradores te los asignen.
                </Typography>
                <Button 
                  variant="outlined" 
                  startIcon={<RefreshIcon />}
                  onClick={cargarDatos}
                  size={isMobile ? "small" : "medium"}
                  sx={{ mt: 2 }}
                >
                  Actualizar
                </Button>
              </Paper>
            )}
          </Box>
        )}

        {/* TAB 1: Estadísticas - Responsivo */}
        {tabValue === 1 && (
          <Box>
            <Typography 
              variant="h5" 
              gutterBottom
              sx={{ fontSize: { xs: '1.3rem', sm: '1.5rem' } }}
            >
              Estadísticas de Rendimiento
            </Typography>
            
            <Grid container spacing={{ xs: 2, sm: 3 }}>
              <Grid item xs={12} md={6}>
                <Paper 
                  elevation={3} 
                  sx={{ p: { xs: 2, sm: 3 } }}
                >
                  <Typography 
                    variant="h6" 
                    gutterBottom
                    sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
                  >
                    Resumen de Trabajo
                  </Typography>
                  <List dense={isMobile}>
                    <ListItem sx={{ px: { xs: 0, sm: 2 } }}>
                      <ListItemText
                        primary="Total de reportes asignados"
                        secondary={estadisticas.total_asignados || 0}
                        primaryTypographyProps={{
                          fontSize: { xs: '0.85rem', sm: '1rem' }
                        }}
                      />
                    </ListItem>
                    <ListItem sx={{ px: { xs: 0, sm: 2 } }}>
                      <ListItemText
                        primary="Reportes con evidencia fotográfica"
                        secondary={`${estadisticas.con_fotos || 0} de ${estadisticas.total_asignados || 0}`}
                        primaryTypographyProps={{
                          fontSize: { xs: '0.85rem', sm: '1rem' }
                        }}
                      />
                    </ListItem>
                    <ListItem sx={{ px: { xs: 0, sm: 2 } }}>
                      <ListItemText
                        primary="Reportes con ubicación GPS"
                        secondary={`${estadisticas.con_ubicacion || 0} de ${estadisticas.total_asignados || 0}`}
                        primaryTypographyProps={{
                          fontSize: { xs: '0.85rem', sm: '1rem' }
                        }}
                      />
                    </ListItem>
                    <ListItem sx={{ px: { xs: 0, sm: 2 } }}>
                      <ListItemText
                        primary="Reportes resueltos"
                        secondary={estadisticas.resueltos || 0}
                        primaryTypographyProps={{
                          fontSize: { xs: '0.85rem', sm: '1rem' }
                        }}
                      />
                    </ListItem>
                    <ListItem sx={{ px: { xs: 0, sm: 2 } }}>
                      <ListItemText
                        primary="Promedio de días de resolución"
                        secondary={estadisticas.promedio_dias_resolucion ? 
                          `${parseFloat(estadisticas.promedio_dias_resolucion).toFixed(1)} días` : 
                          'No disponible'
                        }
                        primaryTypographyProps={{
                          fontSize: { xs: '0.85rem', sm: '1rem' }
                        }}
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper 
                  elevation={3} 
                  sx={{ p: { xs: 2, sm: 3 } }}
                >
                  <Typography 
                    variant="h6" 
                    gutterBottom
                    sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
                  >
                    Estado Actual
                  </Typography>
                  <List dense={isMobile}>
                    <ListItem sx={{ px: { xs: 0, sm: 2 } }}>
                      <ListItemIcon sx={{ minWidth: { xs: 36, sm: 56 } }}>
                        <ScheduleIcon color="primary" sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Pendientes de iniciar"
                        secondary={`${estadisticas.pendientes || 0} reportes`}
                        primaryTypographyProps={{
                          fontSize: { xs: '0.85rem', sm: '1rem' }
                        }}
                      />
                    </ListItem>
                    <ListItem sx={{ px: { xs: 0, sm: 2 } }}>
                      <ListItemIcon sx={{ minWidth: { xs: 36, sm: 56 } }}>
                        <WarningIcon color="warning" sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="En proceso"
                        secondary={`${estadisticas.en_proceso || 0} reportes`}
                        primaryTypographyProps={{
                          fontSize: { xs: '0.85rem', sm: '1rem' }
                        }}
                      />
                    </ListItem>
                    <ListItem sx={{ px: { xs: 0, sm: 2 } }}>
                      <ListItemIcon sx={{ minWidth: { xs: 36, sm: 56 } }}>
                        <PauseIcon color="error" sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Pendientes de materiales"
                        secondary={`${estadisticas.pendiente_materiales || 0} reportes`}
                        primaryTypographyProps={{
                          fontSize: { xs: '0.85rem', sm: '1rem' }
                        }}
                      />
                    </ListItem>
                  </List>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* TAB 2: Herramientas - Responsivo */}
        {tabValue === 2 && (
          <Box>
            <Typography 
              variant="h5" 
              gutterBottom
              sx={{ fontSize: { xs: '1.3rem', sm: '1.5rem' } }}
            >
              Herramientas de Trabajo
            </Typography>
            
            <Grid container spacing={{ xs: 2, sm: 3 }}>
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ 
                  textAlign: 'center', 
                  p: { xs: 2, sm: 3 },
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <BuildIcon 
                    sx={{ 
                      fontSize: { xs: 40, sm: 50 }, 
                      color: 'primary.main', 
                      mb: 2 
                    }} 
                  />
                  <Typography 
                    variant="h6" 
                    gutterBottom
                    sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                  >
                    Lista de Materiales
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="textSecondary" 
                    sx={{ 
                      mb: 2, 
                      flex: 1,
                      fontSize: { xs: '0.8rem', sm: '0.875rem' }
                    }}
                  >
                    Materiales necesarios por tipo de problema
                  </Typography>
                  <Button 
                    variant="outlined" 
                    disabled
                    size={isMobile ? "small" : "medium"}
                  >
                    Próximamente
                  </Button>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ 
                  textAlign: 'center', 
                  p: { xs: 2, sm: 3 },
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <CheckIcon 
                    sx={{ 
                      fontSize: { xs: 40, sm: 50 }, 
                      color: 'success.main', 
                      mb: 2 
                    }} 
                  />
                  <Typography 
                    variant="h6" 
                    gutterBottom
                    sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                  >
                    Checklist de Procedimientos
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="textSecondary" 
                    sx={{ 
                      mb: 2, 
                      flex: 1,
                      fontSize: { xs: '0.8rem', sm: '0.875rem' }
                    }}
                  >
                    Pasos para resolver cada tipo de problema
                  </Typography>
                  <Button 
                    variant="outlined" 
                    disabled
                    size={isMobile ? "small" : "medium"}
                  >
                    Próximamente
                  </Button>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ 
                  textAlign: 'center', 
                  p: { xs: 2, sm: 3 },
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <LocationIcon 
                    sx={{ 
                      fontSize: { xs: 40, sm: 50 }, 
                      color: 'warning.main', 
                      mb: 2 
                    }} 
                  />
                  <Typography 
                    variant="h6" 
                    gutterBottom
                    sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                  >
                    Mapa de Reportes
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="textSecondary" 
                    sx={{ 
                      mb: 2, 
                      flex: 1,
                      fontSize: { xs: '0.8rem', sm: '0.875rem' }
                    }}
                  >
                    Ubicación de reportes pendientes
                  </Typography>
                  <Button 
                    variant="outlined" 
                    disabled
                    size={isMobile ? "small" : "medium"}
                  >
                    Próximamente
                  </Button>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
      </Container>

      {/* MODAL: Detalles Completos con Fotos y GPS - Responsivo */}
      <Dialog 
        open={openDetalles} 
        onClose={() => setOpenDetalles(false)} 
        maxWidth="lg" 
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            m: isMobile ? 0 : 2,
            maxHeight: isMobile ? '100vh' : '90vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          p: { xs: 2, sm: 3 }
        }}>
          <Typography 
            variant="h6"
            sx={{ 
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
              pr: 2
            }}
          >
            Detalles del Reporte #{selectedReporte?.numero_reporte}
          </Typography>
          <IconButton 
            onClick={() => setOpenDetalles(false)}
            size={isMobile ? "small" : "medium"}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent 
          dividers
          sx={{ 
            p: { xs: 1, sm: 3 },
            overflow: 'auto'
          }}
        >
          {reporteDetalle && (
            <Box>
              <Paper sx={{ mb: 2 }}>
                <Tabs 
                  value={tabDetalles} 
                  onChange={(e, newValue) => setTabDetalles(newValue)}
                  variant={isMobile ? "scrollable" : "fullWidth"}
                  scrollButtons={isMobile ? "auto" : false}
                  allowScrollButtonsMobile
                  sx={{
                    '& .MuiTab-root': {
                      fontSize: { xs: '0.8rem', sm: '0.9rem' },
                      minHeight: { xs: 48, sm: 64 }
                    }
                  }}
                >
                  <Tab label="Información General" />
                  <Tab 
                    label={isMobile ? 
                      `Fotos (${reporteDetalle.fotos?.length || 0})` :
                      `Evidencia Fotográfica (${reporteDetalle.fotos?.length || 0})`
                    }
                    disabled={!reporteDetalle.tiene_fotos}
                  />
                  <Tab 
                    label={isMobile ? "GPS" : "Ubicación GPS"}
                    disabled={!reporteDetalle.tiene_ubicacion_gps}
                  />
                </Tabs>
              </Paper>

              {tabDetalles === 0 && (
                <Box>
                  <Grid container spacing={{ xs: 2, sm: 3 }}>
                    <Grid item xs={12} md={6}>
                      <Typography 
                        variant="h6" 
                        gutterBottom
                        sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
                      >
                        {reporteDetalle.titulo}
                      </Typography>
                      
                      <Typography 
                        variant="body1" 
                        gutterBottom
                        sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                      >
                        <strong>Descripción:</strong>
                      </Typography>
                      <Typography 
                        variant="body2" 
                        paragraph
                        sx={{ 
                          fontSize: { xs: '0.8rem', sm: '0.875rem' },
                          lineHeight: 1.5
                        }}
                      >
                        {reporteDetalle.descripcion}
                      </Typography>
                      
                      <Typography 
                        variant="body1" 
                        gutterBottom
                        sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                      >
                        <strong>Dirección:</strong>
                      </Typography>
                      <Typography 
                        variant="body2" 
                        paragraph
                        sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                      >
                        {reporteDetalle.direccion}
                      </Typography>

                      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
                        <Chip 
                          label={reporteDetalle.estado}
                          color={getEstadoColor(reporteDetalle.estado)}
                          size={isMobile ? "small" : "medium"}
                        />
                        <Chip 
                          label={reporteDetalle.prioridad}
                          color={getPrioridadColor(reporteDetalle.prioridad)}
                          size={isMobile ? "small" : "medium"}
                        />
                      </Stack>

                      <Alert 
                        severity={reporteDetalle.tiene_fotos && reporteDetalle.tiene_ubicacion_gps ? 'success' : 'info'} 
                        sx={{ mb: 2 }}
                      >
                        <Typography 
                          variant="body2"
                          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                        >
                          <strong>Evidencia disponible:</strong>
                          {reporteDetalle.tiene_fotos && ' ✓ Fotos del problema'}
                          {reporteDetalle.tiene_ubicacion_gps && ' ✓ Ubicación GPS precisa'}
                          {!reporteDetalle.tiene_fotos && !reporteDetalle.tiene_ubicacion_gps && 
                            ' Solo información textual disponible'}
                        </Typography>
                      </Alert>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Typography 
                        variant="h6" 
                        gutterBottom
                        sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
                      >
                        Información del Ciudadano
                      </Typography>
                      <Stack spacing={0.5}>
                        <Typography 
                          variant="body2"
                          sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                        >
                          <strong>Nombre:</strong> {reporteDetalle.creador_nombre} {reporteDetalle.creador_apellido}
                        </Typography>
                        <Typography 
                          variant="body2"
                          sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                        >
                          <strong>Teléfono:</strong> {reporteDetalle.creador_telefono || 'No disponible'}
                        </Typography>
                        <Typography 
                          variant="body2"
                          sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                        >
                          <strong>Correo:</strong> {reporteDetalle.creador_correo || 'No disponible'}
                        </Typography>
                      </Stack>
                      
                      <Typography 
                        variant="h6" 
                        gutterBottom 
                        sx={{ 
                          mt: 3,
                          fontSize: { xs: '1.1rem', sm: '1.25rem' }
                        }}
                      >
                        Información Técnica
                      </Typography>
                      <Stack spacing={0.5}>
                        <Typography 
                          variant="body2"
                          sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                        >
                          <strong>Tipo:</strong> {reporteDetalle.tipo_problema}
                        </Typography>
                        <Typography 
                          variant="body2"
                          sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                        >
                          <strong>Departamento:</strong> {reporteDetalle.departamento_responsable}
                        </Typography>
                        <Typography 
                          variant="body2"
                          sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                        >
                          <strong>Zona:</strong> {reporteDetalle.zona_nombre}
                        </Typography>
                        <Typography 
                          variant="body2"
                          sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                        >
                          <strong>Tiempo estimado:</strong> {reporteDetalle.tiempo_estimado_dias || 'No especificado'} días
                        </Typography>
                      </Stack>

                      {reporteDetalle.tiene_ubicacion_gps && (
                        <Box sx={{ mt: 2 }}>
                          <Typography 
                            variant="body2" 
                            gutterBottom
                            sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                          >
                            <strong>Enlaces de Navegación:</strong>
                          </Typography>
                          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                            <Button
                              size="small"
                              variant="outlined"
                              fullWidth={isMobile}
                              onClick={() => window.open(getEnlacesNavegacion(reporteDetalle.latitud, reporteDetalle.longitud).googleMaps, '_blank')}
                            >
                              Google Maps
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              fullWidth={isMobile}
                              onClick={() => window.open(getEnlacesNavegacion(reporteDetalle.latitud, reporteDetalle.longitud).waze, '_blank')}
                            >
                              Waze
                            </Button>
                          </Stack>
                        </Box>
                      )}
                    </Grid>
                  </Grid>
                </Box>
              )}

              {tabDetalles === 1 && reporteDetalle.tiene_fotos && (
                <GaleriaFotosTecnico 
                  fotos={reporteDetalle.fotos} 
                  maxHeight={isMobile ? 300 : 400}
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
                  height={isMobile ? 350 : 450}
                  titulo="Ubicación Exacta del Problema"
                  mostrarRuta={true}
                />
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ 
          p: { xs: 2, sm: 3 },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 0 }
        }}>
          <Button 
            onClick={() => setOpenCambiarEstado(false)}
            fullWidth={isMobile}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleCambiarEstado}
            variant="contained"
            disabled={!nuevoEstado || loading}
            fullWidth={isMobile}
          >
            {loading ? <CircularProgress size={20} /> : 'Cambiar Estado'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL: Agregar Seguimiento - Responsivo */}
      <Dialog 
        open={openSeguimiento} 
        onClose={() => setOpenSeguimiento(false)} 
        maxWidth="sm" 
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            m: isMobile ? 0 : 2
          }
        }}
      >
        <DialogTitle sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography 
            variant="h6"
            sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
          >
            Agregar Seguimiento
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box sx={{ mt: 2 }}>
            <Typography 
              variant="body1" 
              gutterBottom
              sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
            >
              <strong>Reporte:</strong> {selectedReporte?.titulo}
            </Typography>
            
            <TextField
              fullWidth
              multiline
              rows={isMobile ? 3 : 4}
              label="Comentario *"
              value={seguimientoData.comentario}
              onChange={(e) => setSeguimientoData(prev => ({ ...prev, comentario: e.target.value }))}
              placeholder="Describe el trabajo realizado, problemas encontrados, etc."
              sx={{ mt: 2, mb: 2 }}
              required
              size={isMobile ? "small" : "medium"}
            />

            <TextField
              fullWidth
              label="Tiempo invertido (horas)"
              type="number"
              value={seguimientoData.tiempo_invertido_horas}
              onChange={(e) => setSeguimientoData(prev => ({ ...prev, tiempo_invertido_horas: e.target.value }))}
              sx={{ mb: 2 }}
              inputProps={{ min: 0, step: 0.5 }}
              size={isMobile ? "small" : "medium"}
            />

            <TextField
              fullWidth
              label="Acción tomada"
              value={seguimientoData.accion_tomada}
              onChange={(e) => setSeguimientoData(prev => ({ ...prev, accion_tomada: e.target.value }))}
              placeholder="Ej: Revisión inicial, Reparación, Solicitud de materiales..."
              size={isMobile ? "small" : "medium"}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          p: { xs: 2, sm: 3 },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 0 }
        }}>
          <Button 
            onClick={() => setOpenSeguimiento(false)}
            fullWidth={isMobile}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleAgregarSeguimiento}
            variant="contained"
            disabled={!seguimientoData.comentario || loading}
            fullWidth={isMobile}
          >
            {loading ? <CircularProgress size={20} /> : 'Agregar Seguimiento'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL: Historial - Responsivo */}
      <Dialog 
        open={openHistorial} 
        onClose={() => setOpenHistorial(false)} 
        maxWidth="md" 
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            m: isMobile ? 0 : 2,
            maxHeight: isMobile ? '100vh' : '90vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          p: { xs: 2, sm: 3 }
        }}>
          <Typography 
            variant="h6"
            sx={{ 
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
              pr: 2
            }}
          >
            Historial del Reporte
          </Typography>
          {isMobile && (
            <IconButton 
              onClick={() => setOpenHistorial(false)}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          )}
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 1, sm: 3 } }}>
          <Typography 
            variant="body1" 
            gutterBottom
            sx={{ 
              fontSize: { xs: '0.9rem', sm: '1rem' },
              px: { xs: 2, sm: 0 }
            }}
          >
            <strong>Reporte:</strong> {selectedReporte?.titulo}
          </Typography>
          
          {historialReporte.length > 0 ? (
            <List dense={isMobile}>
              {historialReporte.map((evento, index) => (
                <ListItem 
                  key={index} 
                  divider
                  sx={{ px: { xs: 2, sm: 2 } }}
                >
                  <ListItemText
                    primary={
                      <Box>
                        <Typography 
                          variant="body1"
                          sx={{ fontSize: { xs: '0.85rem', sm: '1rem' } }}
                        >
                          {evento.comentario || evento.accion_tomada || 'Cambio de estado'}
                        </Typography>
                        {evento.estado_anterior_nombre && evento.estado_nuevo_nombre && (
                          <Typography 
                            variant="body2" 
                            color="primary"
                            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                          >
                            {evento.estado_anterior_nombre} → {evento.estado_nuevo_nombre}
                          </Typography>
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography 
                          variant="caption" 
                          color="textSecondary"
                          sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                        >
                          {evento.usuario_seguimiento} - {new Date(evento.fecha_seguimiento).toLocaleString()}
                        </Typography>
                        {evento.tiempo_invertido_horas && (
                          <Typography 
                            variant="caption" 
                            color="textSecondary" 
                            display="block"
                            sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                          >
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
            <Typography 
              variant="body2" 
              color="textSecondary" 
              textAlign="center" 
              py={4}
              sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
            >
              No hay historial disponible para este reporte.
            </Typography>
          )}
        </DialogContent>
        {!isMobile && (
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenHistorial(false)}>
              Cerrar
            </Button>
          </DialogActions>
        )}
      </Dialog>

      {/* Snackbar para notificaciones - Responsivo */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={cerrarSnackbar}
        anchorOrigin={{ 
          vertical: 'bottom', 
          horizontal: isMobile ? 'center' : 'right' 
        }}
        sx={{
          '& .MuiSnackbarContent-root': {
            fontSize: { xs: '0.8rem', sm: '0.875rem' }
          }
        }}
      >
        <Alert 
          onClose={cerrarSnackbar} 
          severity={snackbar.severity} 
          sx={{ 
            width: '100%',
            fontSize: { xs: '0.8rem', sm: '0.875rem' }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Footer Info - Responsivo */}
      <Container maxWidth="xl" sx={{ mt: 4, pb: 3 }}>
        <Box 
          p={{ xs: 2, sm: 3 }} 
          bgcolor="warning.50" 
          borderRadius={1} 
          border="1px solid" 
          borderColor="warning.200"
        >
          <Typography 
            variant="body2" 
            color="textSecondary" 
            textAlign="center"
            sx={{ 
              fontSize: { xs: '0.7rem', sm: '0.875rem' },
              lineHeight: { xs: 1.4, sm: 1.6 }
            }}
          >
            <strong>Panel Técnico Mejorado:</strong> Ahora puedes ver fotos y ubicación GPS del ciudadano | 
            Gestionar reportes de tu departamento | Cambiar estados | Subir evidencia | Navegación directa |{' '}
            <strong>Nuevas funciones:</strong> Vista completa de evidencia visual | Enlaces de navegación GPS | Validación de evidencia completa
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default DashboardTecnico;