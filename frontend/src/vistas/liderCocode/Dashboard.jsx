// frontend/src/vistas/liderCocode/Dashboard.jsx - VERSIÓN COMPLETAMENTE RESPONSIVA CON MAPAS
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
  Menu,
  MenuList,
  ListItemButton
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
  LocationOn as LocationIcon,
  Map as MapIcon,
  Fullscreen as FullscreenIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  ExitToApp as LogoutIcon,
  AccountCircle as AccountIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext.jsx';
import LogoutButton from '../../components/common/LogoutButton.jsx';

// Importar el componente de reportes pendientes
import ReportesPendientesAprobacion from '../../components/lider/ReportesPendientesAprobacion.jsx';

// Componente de Mapa Responsivo
const MapaReportesZona = ({ reportes, onMarkerClick, fullScreen = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [vista, setVista] = useState('satelite');
  const [filtroEstado, setFiltroEstado] = useState('todos');

  // Filtrar reportes para el mapa
  const reportesFiltrados = reportes.filter(reporte => {
    if (filtroEstado === 'todos') return true;
    return reporte.estado_actual === filtroEstado;
  });

  return (
    <Card elevation={3} sx={{ height: fullScreen ? '80vh' : { xs: 300, md: 400, lg: 500 } }}>
      <CardContent sx={{ p: { xs: 1, md: 2 }, height: '100%', position: 'relative' }}>
        {/* Header del mapa */}
        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems="center" 
          mb={1}
          flexWrap="wrap"
          gap={1}
        >
          <Typography 
            variant={isMobile ? "subtitle1" : "h6"}
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <MapIcon color="primary" />
            {isMobile ? 'Mapa Zona' : 'Mapa de Reportes - Zona'}
          </Typography>
          
          <Box display="flex" gap={1} flexWrap="wrap">
            {/* Filtro por estado */}
            <FormControl size="small" sx={{ minWidth: { xs: 100, md: 120 } }}>
              <InputLabel>Estado</InputLabel>
              <Select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                label="Estado"
              >
                <MenuItem value="todos">Todos</MenuItem>
                <MenuItem value="Nuevo">Nuevos</MenuItem>
                <MenuItem value="Aprobado por Líder">Aprobados</MenuItem>
                <MenuItem value="En Proceso">En Proceso</MenuItem>
                <MenuItem value="Resuelto">Resueltos</MenuItem>
              </Select>
            </FormControl>
            
            {/* Vista del mapa */}
            <FormControl size="small" sx={{ minWidth: { xs: 80, md: 100 } }}>
              <InputLabel>Vista</InputLabel>
              <Select
                value={vista}
                onChange={(e) => setVista(e.target.value)}
                label="Vista"
              >
                <MenuItem value="satelite">Satélite</MenuItem>
                <MenuItem value="mapa">Mapa</MenuItem>
                <MenuItem value="hibrido">Híbrido</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* Contenedor del mapa simulado */}
        <Box
          sx={{
            width: '100%',
            height: 'calc(100% - 60px)',
            bgcolor: '#e8f5e8',
            borderRadius: 1,
            border: '2px solid #4caf50',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundImage: `
              radial-gradient(circle at 20% 20%, rgba(76, 175, 80, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(33, 150, 243, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 40% 60%, rgba(255, 152, 0, 0.1) 0%, transparent 50%)
            `,
            overflow: 'hidden'
          }}
        >
          {/* Simulación de calles */}
          <Box
            sx={{
              position: 'absolute',
              width: '100%',
              height: '2px',
              bgcolor: '#666',
              top: '30%',
              opacity: 0.3
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              width: '2px',
              height: '100%',
              bgcolor: '#666',
              left: '40%',
              opacity: 0.3
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              width: '100%',
              height: '2px',
              bgcolor: '#666',
              top: '70%',
              opacity: 0.3
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              width: '2px',
              height: '100%',
              bgcolor: '#666',
              right: '30%',
              opacity: 0.3
            }}
          />

          {/* Marcadores de reportes */}
          {reportesFiltrados.slice(0, 8).map((reporte, index) => {
            const positions = [
              { top: '15%', left: '25%' },
              { top: '35%', left: '60%' },
              { top: '55%', left: '20%' },
              { top: '75%', left: '70%' },
              { top: '25%', left: '80%' },
              { top: '65%', left: '45%' },
              { top: '45%', left: '15%' },
              { top: '85%', left: '55%' }
            ];
            
            const getMarkerColor = (estado) => {
              switch (estado) {
                case 'Nuevo': return '#ff9800';
                case 'Aprobado por Líder': return '#2196f3';
                case 'En Proceso': return '#9c27b0';
                case 'Resuelto': return '#4caf50';
                case 'Rechazado por Líder': return '#f44336';
                default: return '#757575';
              }
            };

            return (
              <Box
                key={reporte.id}
                sx={{
                  position: 'absolute',
                  ...positions[index % positions.length],
                  transform: 'translate(-50%, -50%)',
                  cursor: 'pointer',
                  zIndex: 2
                }}
                onClick={() => onMarkerClick && onMarkerClick(reporte)}
              >
                <LocationIcon
                  sx={{
                    fontSize: { xs: 24, md: 32 },
                    color: getMarkerColor(reporte.estado_actual),
                    filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))',
                    '&:hover': {
                      fontSize: { xs: 28, md: 36 },
                      transition: 'all 0.2s ease'
                    }
                  }}
                />
                
                {/* Tooltip */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    bgcolor: 'rgba(0,0,0,0.8)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: 1,
                    fontSize: { xs: '0.7rem', md: '0.8rem' },
                    whiteSpace: 'nowrap',
                    opacity: 0,
                    pointerEvents: 'none',
                    transition: 'opacity 0.2s ease',
                    zIndex: 3,
                    '&:hover': {
                      opacity: 1
                    }
                  }}
                >
                  {reporte.titulo.length > 20 ? 
                    `${reporte.titulo.substring(0, 20)}...` : 
                    reporte.titulo
                  }
                </Box>
              </Box>
            );
          })}

          {/* Centro del mapa con icono de la zona */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'success.main',
              color: 'white',
              borderRadius: '50%',
              width: { xs: 40, md: 50 },
              height: { xs: 40, md: 50 },
              zIndex: 1
            }}
          >
            <GroupIcon sx={{ fontSize: { xs: 20, md: 24 } }} />
          </Box>

          {/* Texto central */}
          <Typography
            variant="h6"
            sx={{
              position: 'absolute',
              bottom: { xs: 20, md: 30 },
              left: '50%',
              transform: 'translateX(-50%)',
              color: 'success.dark',
              fontWeight: 'bold',
              textAlign: 'center',
              fontSize: { xs: '0.9rem', md: '1.1rem' },
              textShadow: '1px 1px 2px rgba(255,255,255,0.8)'
            }}
          >
            Zona {reportes.length > 0 ? '1 - Centro' : 'Sin Reportes'}
          </Typography>
        </Box>

        {/* Leyenda del mapa */}
        <Box
          sx={{
            position: 'absolute',
            bottom: { xs: 8, md: 16 },
            right: { xs: 8, md: 16 },
            bgcolor: 'rgba(255,255,255,0.9)',
            borderRadius: 1,
            p: { xs: 0.5, md: 1 },
            fontSize: { xs: '0.7rem', md: '0.8rem' }
          }}
        >
          <Typography variant="caption" fontWeight="bold" display="block">
            Leyenda:
          </Typography>
          <Box display="flex" flexDirection="column" gap={0.5}>
            <Box display="flex" alignItems="center" gap={0.5}>
              <LocationIcon sx={{ fontSize: 14, color: '#ff9800' }} />
              <Typography variant="caption">Nuevos</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={0.5}>
              <LocationIcon sx={{ fontSize: 14, color: '#2196f3' }} />
              <Typography variant="caption">Aprobados</Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={0.5}>
              <LocationIcon sx={{ fontSize: 14, color: '#4caf50' }} />
              <Typography variant="caption">Resueltos</Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const DashboardLider = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg'));
  
  const [tabValue, setTabValue] = useState(0);
  const [openNuevoReporte, setOpenNuevoReporte] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  
  // Estados para UI responsiva
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [expandedCards, setExpandedCards] = useState({});
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  
  // Estados para botones de aprobación
  const [modalAprobar, setModalAprobar] = useState(false);
  const [modalRechazar, setModalRechazar] = useState(false);
  const [reporteSeleccionado, setReporteSeleccionado] = useState(null);
  const [comentarioLider, setComentarioLider] = useState('');
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [procesando, setProcesando] = useState(false);
  
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
    ciudadanosZona: 0,
    ciudadanosVerificados: 0,
    ciudadanosPendientes: 0,
    reportesZona: 0,
    reportesActivos: 0,
    reportesResueltos: 0,
    reportesPendientesAprobacion: 0,
    reunionesRealizadas: 3,
    proximaReunion: '2025-01-15'
  });

  // Reportes reales de la zona
  const [reportesZona, setReportesZona] = useState([]);
  const [reportesPendientes, setReportesPendientes] = useState([]);

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

  // Cargar datos al montar
  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    setLoading(true);
    try {
      await Promise.all([
        cargarReportesPendientes(),
        cargarReportesZona(),
      ]);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('Error al cargar datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Cargar reportes pendientes de aprobación
  const cargarReportesPendientes = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:3001/api/lider/reportes/pendientes', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setReportesPendientes(data.reportes || []);
        setStatsComunitarias(prev => ({
          ...prev,
          reportesPendientesAprobacion: data.reportes?.length || 0
        }));
      }
    } catch (error) {
      console.error('Error al cargar reportes pendientes:', error);
    }
  };

  // Cargar todos los reportes de la zona
  const cargarReportesZona = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:3001/api/lider/reportes/zona?limit=10', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setReportesZona(data.reportes || []);
        
        // Calcular estadísticas
        const reportes = data.reportes || [];
        const activos = reportes.filter(r => 
          ['Nuevo', 'Aprobado por Líder', 'Asignado', 'En Proceso'].includes(r.estado_actual)
        ).length;
        const resueltos = reportes.filter(r => 
          ['Resuelto', 'Cerrado'].includes(r.estado_actual)
        ).length;
        
        setStatsComunitarias(prev => ({
          ...prev,
          reportesZona: reportes.length,
          reportesActivos: activos,
          reportesResueltos: resueltos
        }));
      }
    } catch (error) {
      console.error('Error al cargar reportes de zona:', error);
    }
  };

  // Toggle card expansion
  const toggleCardExpansion = (cardId) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
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
      setError('');

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(`http://localhost:3001/api/lider/reportes/${reporteSeleccionado.id}/aprobar`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          comentario_lider: comentarioLider
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al aprobar reporte');
      }

      if (data.success) {
        setMensaje(`Reporte ${data.reporte.numero_reporte} aprobado exitosamente`);
        
        // Actualizar el estado del reporte en la lista local
        setReportesZona(prev => 
          prev.map(r => 
            r.id === reporteSeleccionado.id 
              ? { ...r, estado_actual: 'Aprobado por Líder' }
              : r
          )
        );
        
        setModalAprobar(false);
        setReporteSeleccionado(null);
        setComentarioLider('');
        
        // Recargar datos
        setTimeout(() => cargarDatosIniciales(), 1000);
      }
    } catch (error) {
      console.error('Error al aprobar:', error);
      setError(error.message || 'Error al aprobar el reporte');
    } finally {
      setProcesando(false);
    }
  };

  const ejecutarRechazo = async () => {
    try {
      if (!motivoRechazo.trim()) {
        setError('Debes seleccionar un motivo de rechazo');
        return;
      }

      setProcesando(true);
      setError('');

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(`http://localhost:3001/api/lider/reportes/${reporteSeleccionado.id}/rechazar`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          motivo_rechazo: motivoRechazo,
          comentario_lider: comentarioLider
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al rechazar reporte');
      }

      if (data.success) {
        setMensaje(`Reporte ${data.reporte.numero_reporte} rechazado: ${data.motivo}`);
        
        // Actualizar el estado del reporte en la lista local
        setReportesZona(prev => 
          prev.map(r => 
            r.id === reporteSeleccionado.id 
              ? { ...r, estado_actual: 'Rechazado por Líder' }
              : r
          )
        );
        
        setModalRechazar(false);
        setReporteSeleccionado(null);
        setMotivoRechazo('');
        setComentarioLider('');
        
        // Recargar datos
        setTimeout(() => cargarDatosIniciales(), 1000);
      }
    } catch (error) {
      console.error('Error al rechazar:', error);
      setError(error.message || 'Error al rechazar el reporte');
    } finally {
      setProcesando(false);
    }
  };

  // Refrescar datos
  const handleRefrescar = async () => {
    await cargarDatosIniciales();
    setMensaje('Datos actualizados correctamente');
    setTimeout(() => setMensaje(''), 3000);
  };

  // Manejar click en marcador del mapa
  const handleMarkerClick = (reporte) => {
    setReporteSeleccionado(reporte);
    // Aquí podrías abrir un modal con detalles del reporte
  };

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
    
    if (newValue === 0) {
      cargarReportesZona();
    } else if (newValue === 4) {
      cargarReportesPendientes();
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
  };

  // Header responsivo mejorado
  const HeaderResponsivo = () => (
    <Box bgcolor="success.main" color="white">
      {/* Móvil Header */}
      {isMobile && (
        <AppBar position="static" color="transparent" elevation={0}>
          <Toolbar sx={{ minHeight: 64, px: 2 }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setMobileDrawerOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" noWrap>
                Panel Líder COCODE
              </Typography>
            </Box>

            {/* Notificaciones */}
            <Badge badgeContent={reportesPendientes.length} color="warning" sx={{ mr: 1 }}>
              <NotificationIcon />
            </Badge>

            {/* Menú usuario móvil */}
            <IconButton
              color="inherit"
              onClick={(e) => setUserMenuAnchor(e.currentTarget)}
            >
              <AccountIcon />
            </IconButton>
            
            <Menu
              anchorEl={userMenuAnchor}
              open={Boolean(userMenuAnchor)}
              onClose={() => setUserMenuAnchor(null)}
              PaperProps={{
                sx: { width: 200 }
              }}
            >
              <MenuList>
                <ListItem>
                  <ListItemIcon>
                    <AccountIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={user?.nombre}
                    secondary={user?.correo}
                    primaryTypographyProps={{ fontSize: '0.9rem' }}
                    secondaryTypographyProps={{ fontSize: '0.8rem' }}
                  />
                </ListItem>
                <Divider />
                <ListItemButton onClick={handleRefrescar}>
                  <ListItemIcon>
                    <RefreshIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Refrescar" />
                </ListItemButton>
                <ListItemButton>
                  <ListItemIcon>
                    <SettingsIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Configuración" />
                </ListItemButton>
                <Divider />
                <ListItemButton>
                  <LogoutButton 
                    variant="text" 
                    color="inherit" 
                    startIcon={<LogoutIcon />}
                    sx={{ 
                      width: '100%', 
                      justifyContent: 'flex-start',
                      color: 'error.main'
                    }}
                  />
                </ListItemButton>
              </MenuList>
            </Menu>
          </Toolbar>
        </AppBar>
      )}

      {/* Desktop Header */}
      {!isMobile && (
        <Box p={{ xs: 2, sm: 3 }}>
          <Grid container alignItems="center" spacing={2}>
            <Grid item xs={12} md={8}>
              <Stack direction="row" alignItems="center" spacing={2} mb={1}>
                <GroupIcon sx={{ fontSize: { xs: 32, md: 40 } }} />
                <Typography variant={{ xs: "h5", md: "h4" }} component="h1">
                  Panel Líder COCODE
                </Typography>
              </Stack>
              
              <Typography variant={{ xs: "subtitle1", md: "h6" }} gutterBottom>
                Líder: {user?.nombre}
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, opacity: 0.9 }}>
                <Chip 
                  label={`Zona: ${user?.zona || 'Zona 1 Centro'}`}
                  size="small"
                  sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
                <Chip 
                  label="Presidente COCODE"
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
              <Stack direction="row" spacing={2} justifyContent={{ xs: 'flex-start', md: 'flex-end' }} alignItems="center" flexWrap="wrap">
                <Badge badgeContent={reportesPendientes.length} color="warning">
                  <NotificationIcon />
                </Badge>
                
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<RefreshIcon />}
                  onClick={handleRefrescar}
                  disabled={loading}
                  size={isMobile ? "small" : "medium"}
                  sx={{ 
                    minWidth: { xs: 40, md: 120 },
                    '& .MuiButton-startIcon': { 
                      marginRight: { xs: 0, md: 1 } 
                    }
                  }}
                >
                  {isMobile ? '' : 'Refrescar'}
                </Button>
                
                {/* Menú usuario desktop */}
                <IconButton
                  color="inherit"
                  onClick={(e) => setUserMenuAnchor(e.currentTarget)}
                  sx={{ 
                    border: '1px solid rgba(255,255,255,0.3)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  <AccountIcon />
                </IconButton>
                
                <Menu
                  anchorEl={userMenuAnchor}
                  open={Boolean(userMenuAnchor)}
                  onClose={() => setUserMenuAnchor(null)}
                  PaperProps={{
                    sx: { width: 250, mt: 1 }
                  }}
                >
                  <MenuList>
                    <ListItem>
                      <ListItemIcon>
                        <AccountIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary={user?.nombre}
                        secondary={user?.correo}
                        primaryTypographyProps={{ fontWeight: 'bold' }}
                      />
                    </ListItem>
                    <Divider />
                    <ListItemButton onClick={handleRefrescar}>
                      <ListItemIcon>
                        <RefreshIcon />
                      </ListItemIcon>
                      <ListItemText primary="Refrescar datos" />
                    </ListItemButton>
                    <ListItemButton>
                      <ListItemIcon>
                        <SettingsIcon />
                      </ListItemIcon>
                      <ListItemText primary="Configuración" />
                    </ListItemButton>
                    <Divider />
                    <ListItemButton>
                      <LogoutButton 
                        variant="text" 
                        color="error" 
                        startIcon={<LogoutIcon />}
                        sx={{ 
                          width: '100%', 
                          justifyContent: 'flex-start',
                          textTransform: 'none'
                        }}
                      />
                    </ListItemButton>
                  </MenuList>
                </Menu>
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
        sx: { width: 300 }
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Menú Líder</Typography>
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
              textTransform: 'none',
              fontSize: '1rem'
            }}
          >
            Reportes de mi Zona
          </Button>
          
          <Button
            fullWidth
            variant={tabValue === 1 ? "contained" : "text"}
            startIcon={<MapIcon />}
            onClick={() => handleTabChange(null, 1)}
            size="large"
            sx={{ 
              justifyContent: 'flex-start',
              textTransform: 'none',
              fontSize: '1rem'
            }}
          >
            Mapa de la Zona
          </Button>
          
          <Button
            fullWidth
            variant={tabValue === 2 ? "contained" : "text"}
            startIcon={<PeopleIcon />}
            onClick={() => handleTabChange(null, 2)}
            size="large"
            sx={{ 
              justifyContent: 'flex-start',
              textTransform: 'none',
              fontSize: '1rem'
            }}
          >
            Ciudadanos ({ciudadanosZona.length})
          </Button>
          
          <Button
            fullWidth
            variant={tabValue === 3 ? "contained" : "text"}
            startIcon={<EngineeringIcon />}
            onClick={() => handleTabChange(null, 3)}
            size="large"
            sx={{ 
              justifyContent: 'flex-start',
              textTransform: 'none',
              fontSize: '1rem'
            }}
          >
            Coordinación
          </Button>

          <Button
            fullWidth
            variant={tabValue === 4 ? "contained" : "text"}
            startIcon={<WarningIcon />}
            onClick={() => handleTabChange(null, 4)}
            size="large"
            sx={{ 
              justifyContent: 'flex-start',
              textTransform: 'none',
              fontSize: '1rem'
            }}
          >
            Pendientes ({reportesPendientes.length})
          </Button>
        </Stack>

        <Divider sx={{ my: 2 }} />
        
        {/* Info del usuario en móvil */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Líder: {user?.nombre}
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
        {/* Mensajes de estado */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            <Typography variant="body2">{error}</Typography>
          </Alert>
        )}

        {mensaje && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMensaje('')}>
            <Typography variant="body2">{mensaje}</Typography>
          </Alert>
        )}

        {/* Alerta de Responsabilidad Comunitaria */}
        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Responsabilidad Comunitaria:</strong> Gestionas los reportes y ciudadanos de <strong>{user?.zona || 'tu zona'}</strong>. 
            Coordinas con técnicos y validas reportes comunitarios.
            {reportesPendientes.length > 0 && (
              <strong> Tienes {reportesPendientes.length} reportes pendientes de aprobación.</strong>
            )}
          </Typography>
        </Alert>

        {/* Estadísticas reales - RESPONSIVAS */}
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
                  Ciudadanos Zona
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
                  Pendientes Aprobación
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
                  Reportes Activos
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
                  Reportes Resueltos
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs - Solo desktop */}
        {!isMobile && (
          <Paper sx={{ mb: 3 }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              variant={isTablet ? "scrollable" : "fullWidth"}
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  minHeight: { xs: 56, md: 64 },
                  fontSize: { xs: '0.8rem', md: '0.95rem' },
                  fontWeight: 500,
                  px: { xs: 1, md: 2 },
                  textTransform: 'none'
                }
              }}
            >
              <Tab label="Reportes de mi Zona" />
              <Tab label="Mapa de la Zona" />
              <Tab label="Ciudadanos" />
              <Tab label="Coordinación" />
              <Tab label={`Pendientes Aprobación (${reportesPendientes.length})`} />
            </Tabs>
          </Paper>
        )}

        {/* Tab 0 - Reportes de la Zona - RESPONSIVO */}
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
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ReporteIcon color="primary" /> 
                    {isMobile ? `Reportes ${user?.zona || 'Zona'}` : `Reportes de ${user?.zona || 'mi Zona'}`}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenNuevoReporte(true)}
                    size={isMobile ? "medium" : "medium"}
                    fullWidth={isMobile}
                    sx={{ 
                      maxWidth: { xs: '100%', sm: 'auto' },
                      textTransform: 'none'
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
                                {reporte.tecnico_nombre && (
                                  <Typography 
                                    variant="body2" 
                                    sx={{ 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      gap: 0.5, 
                                      mt: 0.5,
                                      fontSize: { xs: '0.8rem', md: '0.875rem' }
                                    }}
                                  >
                                    <EngineeringIcon fontSize="small" /> 
                                    Técnico: {reporte.tecnico_nombre} {reporte.tecnico_apellido}
                                  </Typography>
                                )}
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
                          
                          {/* BOTONES CON FUNCIONALIDAD DE APROBACIÓN - RESPONSIVOS */}
                          <Box 
                            display="flex" 
                            gap={1} 
                            flexWrap="wrap"
                            flexDirection={{ xs: 'column', sm: 'row' }}
                          >
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<ViewIcon />}
                              fullWidth={isMobile}
                              sx={{ 
                                fontSize: { xs: '0.8rem', md: '0.875rem' },
                                textTransform: 'none'
                              }}
                            >
                              {isMobile ? 'Ver Detalles' : 'Ver Detalles'}
                            </Button>
                            
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<PhoneIcon />}
                              fullWidth={isMobile}
                              sx={{ 
                                fontSize: { xs: '0.8rem', md: '0.875rem' },
                                textTransform: 'none'
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
                                  size="small"
                                  variant="contained"
                                  color="success"
                                  startIcon={<CheckCircle />}
                                  onClick={() => handleAprobarReporteDirecto(reporte)}
                                  disabled={procesando}
                                  fullWidth={isMobile}
                                  sx={{ 
                                    fontSize: { xs: '0.8rem', md: '0.875rem' },
                                    textTransform: 'none'
                                  }}
                                >
                                  Aprobar
                                </Button>
                                
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="error"
                                  startIcon={<Cancel />}
                                  onClick={() => handleRechazarReporteDirecto(reporte)}
                                  disabled={procesando}
                                  fullWidth={isMobile}
                                  sx={{ 
                                    fontSize: { xs: '0.8rem', md: '0.875rem' },
                                    textTransform: 'none'
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

            {/* Panel lateral - Responsivo */}
            <Grid item xs={12} lg={4}>
              <Stack spacing={{ xs: 2, md: 3 }}>
                {/* Resumen Comunitario */}
                <Paper elevation={3} sx={{ p: { xs: 2, md: 3 } }}>
                  <Typography variant="h6" gutterBottom>
                    Resumen Comunitario
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box textAlign="center">
                        <Typography variant="body2" color="textSecondary">
                          Pendientes Aprobación
                        </Typography>
                        <Typography variant="h4" color="warning.main">
                          {statsComunitarias.reportesPendientesAprobacion}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Box textAlign="center">
                        <Typography variant="body2" color="textSecondary">
                          Reportes Activos
                        </Typography>
                        <Typography variant="h4" color="info.main">
                          {statsComunitarias.reportesActivos}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Box textAlign="center">
                        <Typography variant="body2" color="textSecondary">
                          Reportes Resueltos
                        </Typography>
                        <Typography variant="h4" color="success.main">
                          {statsComunitarias.reportesResueltos}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Box textAlign="center">
                        <Typography variant="body2" color="textSecondary">
                          Próxima Reunión
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {statsComunitarias.proximaReunion}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>

                {/* Acciones Rápidas */}
                <Paper elevation={3} sx={{ p: { xs: 2, md: 3 } }}>
                  <Typography variant="h6" gutterBottom>
                    Acciones Rápidas
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Stack spacing={1}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<RefreshIcon />}
                      onClick={handleRefrescar}
                      disabled={loading}
                      size={isMobile ? "medium" : "medium"}
                      sx={{ textTransform: 'none' }}
                    >
                      Actualizar Datos
                    </Button>
                    
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<CampaignIcon />}
                      size={isMobile ? "medium" : "medium"}
                      sx={{ textTransform: 'none' }}
                    >
                      Convocar Reunión
                    </Button>
                    
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<TrendingIcon />}
                      size={isMobile ? "medium" : "medium"}
                      sx={{ textTransform: 'none' }}
                    >
                      Reporte Comunitario
                    </Button>
                    
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<EngineeringIcon />}
                      size={isMobile ? "medium" : "medium"}
                      sx={{ textTransform: 'none' }}
                    >
                      Contactar Técnicos
                    </Button>
                  </Stack>
                </Paper>
              </Stack>
            </Grid>
          </Grid>
        )}

        {/* Tab 1 - MAPA DE LA ZONA - NUEVO TAB RESPONSIVO */}
        {tabValue === 1 && (
          <Box>
            <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MapIcon color="primary" />
                {isMobile ? `Mapa ${user?.zona || 'Zona'}` : `Mapa Interactivo de ${user?.zona || 'mi Zona'}`}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Visualiza la ubicación de todos los reportes en tu zona y su estado actual
              </Typography>
              <Divider sx={{ mb: 3 }} />

              {/* Componente de Mapa */}
              <MapaReportesZona 
                reportes={reportesZona} 
                onMarkerClick={handleMarkerClick}
              />
            </Paper>

            {/* Resumen de reportes por ubicación */}
            <Grid container spacing={{ xs: 2, md: 3 }}>
              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ p: { xs: 2, md: 3 } }}>
                  <Typography variant="h6" gutterBottom>
                    Distribución por Estado
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Stack spacing={2}>
                    {['Nuevo', 'Aprobado por Líder', 'En Proceso', 'Resuelto'].map(estado => {
                      const count = reportesZona.filter(r => r.estado_actual === estado).length;
                      return (
                        <Box key={estado} display="flex" justifyContent="space-between" alignItems="center">
                          <Box display="flex" alignItems="center" gap={1}>
                            <LocationIcon 
                              sx={{ 
                                fontSize: 16, 
                                color: estado === 'Nuevo' ? '#ff9800' : 
                                       estado === 'Aprobado por Líder' ? '#2196f3' :
                                       estado === 'En Proceso' ? '#9c27b0' : '#4caf50'
                              }} 
                            />
                            <Typography variant="body2" sx={{ fontSize: { xs: '0.85rem', md: '0.875rem' } }}>
                              {estado}
                            </Typography>
                          </Box>
                          <Chip 
                            label={count} 
                            size="small" 
                            color={count > 0 ? "primary" : "default"}
                          />
                        </Box>
                      );
                    })}
                  </Stack>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ p: { xs: 2, md: 3 } }}>
                  <Typography variant="h6" gutterBottom>
                    Zonas con Más Reportes
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Stack spacing={2}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" sx={{ fontSize: { xs: '0.85rem', md: '0.875rem' } }}>
                        Centro de la zona
                      </Typography>
                      <Chip label="5 reportes" size="small" color="warning" />
                    </Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" sx={{ fontSize: { xs: '0.85rem', md: '0.875rem' } }}>
                        Sector norte
                      </Typography>
                      <Chip label="3 reportes" size="small" color="info" />
                    </Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" sx={{ fontSize: { xs: '0.85rem', md: '0.875rem' } }}>
                        Sector sur
                      </Typography>
                      <Chip label="2 reportes" size="small" color="success" />
                    </Box>
                  </Stack>

                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<FullscreenIcon />}
                    sx={{ mt: 2, textTransform: 'none' }}
                    size={isMobile ? "medium" : "medium"}
                  >
                    Ver Mapa en Pantalla Completa
                  </Button>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Tab 2 - Gestión de Ciudadanos - RESPONSIVO */}
        {tabValue === 2 && (
          <Paper elevation={3} sx={{ p: { xs: 2, md: 3 } }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                          sx={{ fontSize: { xs: '0.7rem', md: '0.875rem' } }}
                        >
                          Reportes: {ciudadano.reportesCreados} | Registro: {ciudadano.fechaRegistro}
                        </Typography>
                      </Stack>

                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                        {!ciudadano.verificado && (
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<VerifiedIcon />}
                            onClick={() => handleVerificarCiudadano(ciudadano.id)}
                            fullWidth={isMobile}
                            sx={{ 
                              fontSize: { xs: '0.8rem', md: '0.875rem' },
                              textTransform: 'none'
                            }}
                          >
                            Verificar
                          </Button>
                        )}
                        
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<PhoneIcon />}
                          fullWidth={isMobile}
                          sx={{ 
                            fontSize: { xs: '0.8rem', md: '0.875rem' },
                            textTransform: 'none'
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

        {/* Tab 3 - Coordinación - RESPONSIVO */}
        {tabValue === 3 && (
          <Grid container spacing={{ xs: 2, md: 3 }}>
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: { xs: 2, md: 3 } }}>
                <Typography variant="h6" gutterBottom>
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
                      size="small" 
                      variant="outlined"
                      sx={{ 
                        fontSize: { xs: '0.7rem', md: '0.875rem' },
                        textTransform: 'none'
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
                      size="small" 
                      variant="contained" 
                      color="warning"
                      sx={{ 
                        fontSize: { xs: '0.7rem', md: '0.875rem' },
                        textTransform: 'none'
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
                <Typography variant="h6" gutterBottom>
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
                  sx={{ mt: 2, textTransform: 'none' }}
                  size={isMobile ? "medium" : "medium"}
                >
                  {isMobile ? 'Nueva Actividad' : 'Planificar Nueva Actividad'}
                </Button>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Tab 4 - Reportes pendientes de aprobación */}
        {tabValue === 4 && (
          <ReportesPendientesAprobacion />
        )}

        {/* Footer Info - Responsivo */}
        <Box 
          mt={4} 
          p={{ xs: 2, md: 3 }} 
          bgcolor="success.50" 
          borderRadius={1} 
          border="1px solid" 
          borderColor="success.200"
          mx={{ xs: 0, md: 0 }}
        >
          <Typography 
            variant="body2" 
            color="textSecondary" 
            textAlign="center"
            sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}
          >
            <strong>Permisos de Líder COCODE:</strong> Gestionar ciudadanos de {user?.zona || 'tu zona'} | 
            Ver y validar reportes comunitarios | Crear reportes en nombre de ciudadanos | 
            Coordinar con técnicos | Organizar actividades comunitarias |
            <strong> NO puedes:</strong> Ver reportes de otras zonas | Asignar técnicos | Cambiar configuraciones del sistema
          </Typography>
        </Box>
      </Container>

      {/* FAB para crear reporte en móvil */}
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

      {/* MODALES PARA APROBAR/RECHAZAR - RESPONSIVOS */}
      
      {/* Modal Aprobar */}
      <Dialog 
        open={modalAprobar} 
        onClose={() => setModalAprobar(false)} 
        maxWidth="sm" 
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Aprobar Reporte</Typography>
            {isMobile && (
              <IconButton onClick={() => setModalAprobar(false)}>
                <CloseIcon />
              </IconButton>
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          {reporteSeleccionado && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="body1" gutterBottom>
                <strong>Reporte:</strong> {reporteSeleccionado.titulo}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
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
          {!isMobile && (
            <Button 
              onClick={() => setModalAprobar(false)}
              disabled={procesando}
              sx={{ textTransform: 'none' }}
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
            fullWidth={isMobile}
            size={isMobile ? "large" : "medium"}
            sx={{ textTransform: 'none' }}
          >
            {procesando ? 'Aprobando...' : 'Aprobar Reporte'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Rechazar */}
      <Dialog 
        open={modalRechazar} 
        onClose={() => setModalRechazar(false)} 
        maxWidth="sm" 
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Rechazar Reporte</Typography>
            {isMobile && (
              <IconButton onClick={() => setModalRechazar(false)}>
                <CloseIcon />
              </IconButton>
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          {reporteSeleccionado && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="body1" gutterBottom>
                <strong>Reporte:</strong> {reporteSeleccionado.titulo}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                #{reporteSeleccionado.numero_reporte}
              </Typography>
              
              <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
                <InputLabel>Motivo de Rechazo *</InputLabel>
                <Select
                  value={motivoRechazo}
                  onChange={(e) => setMotivoRechazo(e.target.value)}
                  label="Motivo de Rechazo *"
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
          {!isMobile && (
            <Button 
              onClick={() => setModalRechazar(false)}
              disabled={procesando}
              sx={{ textTransform: 'none' }}
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
            fullWidth={isMobile}
            size={isMobile ? "large" : "medium"}
            sx={{ textTransform: 'none' }}
          >
            {procesando ? 'Rechazando...' : 'Rechazar Reporte'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para nuevo reporte comunitario - Responsivo */}
      <Dialog 
        open={openNuevoReporte} 
        onClose={() => setOpenNuevoReporte(false)} 
        maxWidth="md" 
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Crear Reporte Comunitario</Typography>
            {isMobile && (
              <IconButton onClick={() => setOpenNuevoReporte(false)}>
                <CloseIcon />
              </IconButton>
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
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
              rows={isMobile ? 3 : 4}
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
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, md: 3 } }}>
          {!isMobile && (
            <Button 
              onClick={() => setOpenNuevoReporte(false)}
              sx={{ textTransform: 'none' }}
            >
              Cancelar
            </Button>
          )}
          <Button 
            variant="contained" 
            onClick={() => setOpenNuevoReporte(false)}
            fullWidth={isMobile}
            size={isMobile ? "large" : "medium"}
            sx={{ textTransform: 'none' }}
          >
            Crear Reporte
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DashboardLider;