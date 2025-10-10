// frontend/src/vistas/liderCocode/Dashboard.jsx - CORREGIDO
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
  ListItemButton,
  InputAdornment
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
  CheckCircle as CheckCircleIcon,
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
  Settings as SettingsIcon,
  Comment as CommentIcon,
  ChatBubbleOutline as ChatBubbleIcon,
  PhotoCamera as PhotoCameraIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext.jsx';
import LogoutButton from '../../components/common/LogoutButton.jsx';
import ComentariosSection from '../../components/common/ComentariosSection.jsx';
import ReportesPendientesAprobacion from '../../components/lider/ReportesPendientesAprobacion.jsx';

const DashboardLider = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg'));
  
  // Estados principales del dashboard
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  
  // Estados para filtros
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroPrioridad, setFiltroPrioridad] = useState('todas');
  const [busquedaTexto, setBusquedaTexto] = useState('');
  const [aplicandoFiltros, setAplicandoFiltros] = useState(false);
  
  // Estados para modales
  const [openDetallesReporte, setOpenDetallesReporte] = useState(false);
  const [openComentario, setOpenComentario] = useState(false);
  const [openNuevoReporte, setOpenNuevoReporte] = useState(false);
  
  // Estados para UI responsiva
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [expandedCards, setExpandedCards] = useState({});
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  
  // Estados para reportes y comentarios
  const [reporteSeleccionado, setReporteSeleccionado] = useState(null);
  const [comentario, setComentario] = useState('');
  
  // Estados de datos
  const [statsComunitarias, setStatsComunitarias] = useState({
    ciudadanosZona: 85,
    ciudadanosVerificados: 72,
    ciudadanosPendientes: 13,
    reportesZona: 0,
    reportesActivos: 0,
    reportesResueltos: 0,
    reportesPendientesAprobacion: 0,
    reunionesRealizadas: 3,
    proximaReunion: '2025-01-15'
  });
  
  const [reportesZona, setReportesZona] = useState([]);
  const [reportesPendientes, setReportesPendientes] = useState([]);
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

  // Effect para cargar datos al montar
  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  // Effect para aplicar filtros cuando cambien
  useEffect(() => {
    if (tabValue === 1) {
      cargarReportesConFiltros();
    }
  }, [filtroEstado, filtroPrioridad]);

  // FUNCIONES DE CARGA DE DATOS
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

  const cargarReportesPendientes = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://jason.hopitalbarillas.cloud/api/lider/reportes/pendientes', { //USAR NOMBRE DE DOMINIO O CONFIGURAR ARCHIVO API Ejemplo: (http://jason.hopitalbarillas.cloud/api/lider/reportes/pendientes) 
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

  const cargarReportesZona = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://jason.hopitalbarillas.cloud/api/lider/reportes/zona?limit=50', { //USAR NOMBRE DE DOMINIO O CONFIGURAR ARCHIVO API
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setReportesZona(data.reportes || []);
        
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

  const cargarReportesConFiltros = async () => {
    try {
      setAplicandoFiltros(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const params = new URLSearchParams();
      if (filtroEstado !== 'todos') params.append('estado', filtroEstado);
      if (filtroPrioridad !== 'todas') params.append('prioridad', filtroPrioridad);
      if (busquedaTexto.trim()) params.append('busqueda', busquedaTexto.trim());
      params.append('limit', '50');

      const url = `http://jason.hopitalbarillas.cloud/api/lider/reportes/zona${params.toString() ? `?${params.toString()}` : ''}`; //USAR NOMBRE DE DOMINIO O CONFIGURAR ARCHIVO API

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setReportesZona(data.reportes || []);
        
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
      console.error('Error al cargar reportes con filtros:', error);
      setError('Error al aplicar filtros');
    } finally {
      setAplicandoFiltros(false);
    }
  };

  const limpiarFiltros = () => {
    setFiltroEstado('todos');
    setFiltroPrioridad('todas');
    setBusquedaTexto('');
    setMensaje('Filtros limpiados');
    setTimeout(() => setMensaje(''), 2000);
  };

  const handleBusqueda = (e) => {
    e.preventDefault();
    cargarReportesConFiltros();
  };

  // FUNCIONES DE COMENTARIOS GENERALES
  const abrirModalComentario = (reporte) => {
    setReporteSeleccionado(reporte);
    setComentario('');
    setOpenComentario(true);
  };

  const abrirModalDetallesReporte = (reporte) => {
    setReporteSeleccionado(reporte);
    setOpenDetallesReporte(true);
  };

  const handleComentarioAgregado = (nuevoComentario) => {
    setMensaje('Comentario agregado exitosamente');
    cargarDatosIniciales();
    setTimeout(() => setMensaje(''), 3000);
  };

  const cerrarModales = () => {
    setOpenComentario(false);
    setOpenDetallesReporte(false);
    setOpenNuevoReporte(false);
    setReporteSeleccionado(null);
    setComentario('');
  };

  // FUNCIONES AUXILIARES
  const toggleCardExpansion = (cardId) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const handleRefrescar = async () => {
    await cargarDatosIniciales();
    setMensaje('Datos actualizados correctamente');
    setTimeout(() => setMensaje(''), 3000);
  };

  const handleMarkerClick = (reporte) => {
    setReporteSeleccionado(reporte);
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
      cargarReportesPendientes();
    } else if (newValue === 1) {
      cargarReportesConFiltros();
    } else if (newValue === 2) {
      // Coordinación
    } else if (newValue === 3) {
      // Gestión Ciudadanos
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

  // COMPONENTE DE MAPA RESPONSIVO
  const MapaReportesZona = ({ reportes, onMarkerClick, fullScreen = false }) => {
    const [vista, setVista] = useState('satelite');

    return (
      <Card elevation={3} sx={{ height: fullScreen ? '80vh' : { xs: 300, md: 400, lg: 500 } }}>
        <CardContent sx={{ p: { xs: 1, md: 2 }, height: '100%', position: 'relative' }}>
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
            <Box sx={{ position: 'absolute', width: '100%', height: '2px', bgcolor: '#666', top: '30%', opacity: 0.3 }} />
            <Box sx={{ position: 'absolute', width: '2px', height: '100%', bgcolor: '#666', left: '40%', opacity: 0.3 }} />
            <Box sx={{ position: 'absolute', width: '100%', height: '2px', bgcolor: '#666', top: '70%', opacity: 0.3 }} />
            <Box sx={{ position: 'absolute', width: '2px', height: '100%', bgcolor: '#666', right: '30%', opacity: 0.3 }} />

            {reportes.slice(0, 8).map((reporte, index) => {
              const positions = [
                { top: '15%', left: '25%' }, { top: '35%', left: '60%' },
                { top: '55%', left: '20%' }, { top: '75%', left: '70%' },
                { top: '25%', left: '80%' }, { top: '65%', left: '45%' },
                { top: '45%', left: '15%' }, { top: '85%', left: '55%' }
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
                      '&:hover': { fontSize: { xs: 28, md: 36 }, transition: 'all 0.2s ease' }
                    }}
                  />
                </Box>
              );
            })}

            <Box
              sx={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                bgcolor: 'success.main', color: 'white', borderRadius: '50%',
                width: { xs: 40, md: 50 }, height: { xs: 40, md: 50 }, zIndex: 1
              }}
            >
              <GroupIcon sx={{ fontSize: { xs: 20, md: 24 } }} />
            </Box>

            <Typography
              variant="h6"
              sx={{
                position: 'absolute', bottom: { xs: 20, md: 30 }, left: '50%',
                transform: 'translateX(-50%)', color: 'success.dark', fontWeight: 'bold',
                textAlign: 'center', fontSize: { xs: '0.9rem', md: '1.1rem' },
                textShadow: '1px 1px 2px rgba(255,255,255,0.8)'
              }}
            >
              Zona {reportes.length > 0 ? '1 - Centro' : 'Sin Reportes'}
            </Typography>
          </Box>

          <Box
            sx={{
              position: 'absolute', bottom: { xs: 8, md: 16 }, right: { xs: 8, md: 16 },
              bgcolor: 'rgba(255,255,255,0.9)', borderRadius: 1,
              p: { xs: 0.5, md: 1 }, fontSize: { xs: '0.7rem', md: '0.8rem' }
            }}
          >
            <Typography variant="caption" fontWeight="bold" display="block">Leyenda:</Typography>
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

  // HEADER RESPONSIVO
  const HeaderResponsivo = () => (
    <Box bgcolor="success.main" color="white">
      {isMobile && (
        <AppBar position="static" color="transparent" elevation={0}>
          <Toolbar sx={{ minHeight: 64, px: 2 }}>
            <IconButton color="inherit" edge="start" onClick={() => setMobileDrawerOpen(true)} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
            
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" noWrap>Panel Líder COCODE</Typography>
            </Box>

            <Badge badgeContent={reportesPendientes.length} color="warning" sx={{ mr: 1 }}>
              <NotificationIcon />
            </Badge>

            <IconButton color="inherit" onClick={(e) => setUserMenuAnchor(e.currentTarget)}>
              <AccountIcon />
            </IconButton>
            
            <Menu
              anchorEl={userMenuAnchor}
              open={Boolean(userMenuAnchor)}
              onClose={() => setUserMenuAnchor(null)}
              PaperProps={{ sx: { width: 200 } }}
            >
              <MenuList>
                <ListItem>
                  <ListItemIcon><AccountIcon fontSize="small" /></ListItemIcon>
                  <ListItemText 
                    primary={user?.nombre}
                    secondary={user?.correo}
                    primaryTypographyProps={{ fontSize: '0.9rem' }}
                    secondaryTypographyProps={{ fontSize: '0.8rem' }}
                  />
                </ListItem>
                <Divider />
                <ListItemButton onClick={handleRefrescar}>
                  <ListItemIcon><RefreshIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Refrescar" />
                </ListItemButton>
                <ListItemButton>
                  <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Configuración" />
                </ListItemButton>
                <Divider />
                <ListItemButton>
                  <LogoutButton 
                    variant="text" color="inherit" startIcon={<LogoutIcon />}
                    sx={{ width: '100%', justifyContent: 'flex-start', color: 'error.main' }}
                  />
                </ListItemButton>
              </MenuList>
            </Menu>
          </Toolbar>
        </AppBar>
      )}

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
                <Chip 
                  label="Sistema Comentarios"
                  size="small"
                  icon={<CommentIcon sx={{ fontSize: 14 }} />}
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
                  variant="outlined" color="inherit" startIcon={<RefreshIcon />}
                  onClick={handleRefrescar} disabled={loading}
                  size={isMobile ? "small" : "medium"}
                  sx={{ 
                    minWidth: { xs: 40, md: 120 },
                    '& .MuiButton-startIcon': { marginRight: { xs: 0, md: 1 } }
                  }}
                >
                  {isMobile ? '' : 'Refrescar'}
                </Button>
                
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
                  PaperProps={{ sx: { width: 250, mt: 1 } }}
                >
                  <MenuList>
                    <ListItem>
                      <ListItemIcon><AccountIcon /></ListItemIcon>
                      <ListItemText 
                        primary={user?.nombre}
                        secondary={user?.correo}
                        primaryTypographyProps={{ fontWeight: 'bold' }}
                      />
                    </ListItem>
                    <Divider />
                    <ListItemButton onClick={handleRefrescar}>
                      <ListItemIcon><RefreshIcon /></ListItemIcon>
                      <ListItemText primary="Refrescar datos" />
                    </ListItemButton>
                    <ListItemButton>
                      <ListItemIcon><SettingsIcon /></ListItemIcon>
                      <ListItemText primary="Configuración" />
                    </ListItemButton>
                    <Divider />
                    <ListItemButton>
                      <LogoutButton 
                        variant="text" color="error" startIcon={<LogoutIcon />}
                        sx={{ width: '100%', justifyContent: 'flex-start', textTransform: 'none' }}
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

  // NAVIGATION DRAWER PARA MÓVIL
  const NavigationDrawer = () => (
    <Drawer
      anchor="left"
      open={mobileDrawerOpen}
      onClose={() => setMobileDrawerOpen(false)}
      PaperProps={{ sx: { width: 300 } }}
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
            fullWidth variant={tabValue === 0 ? "contained" : "text"} startIcon={<WarningIcon />}
            onClick={() => handleTabChange(null, 0)} size="large"
            sx={{ justifyContent: 'flex-start', textTransform: 'none', fontSize: '1rem' }}
          >
            Pendientes Aprobación ({reportesPendientes.length})
          </Button>
          
          <Button
            fullWidth variant={tabValue === 1 ? "contained" : "text"} startIcon={<MapIcon />}
            onClick={() => handleTabChange(null, 1)} size="large"
            sx={{ justifyContent: 'flex-start', textTransform: 'none', fontSize: '1rem' }}
          >
            Mapa de la Zona
          </Button>
          
          <Button
            fullWidth variant={tabValue === 2 ? "contained" : "text"} startIcon={<EngineeringIcon />}
            onClick={() => handleTabChange(null, 2)} size="large"
            sx={{ justifyContent: 'flex-start', textTransform: 'none', fontSize: '1rem' }}
          >
            Coordinación
          </Button>

          <Button
            fullWidth variant={tabValue === 3 ? "contained" : "text"} startIcon={<PeopleIcon />}
            onClick={() => handleTabChange(null, 3)} size="large"
            sx={{ justifyContent: 'flex-start', textTransform: 'none', fontSize: '1rem' }}
          >
            Gestión Ciudadanos
          </Button>
        </Stack>

        <Divider sx={{ my: 2 }} />
        
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Líder: {user?.nombre}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {user?.correo}
          </Typography>
          <Chip label={`Zona: ${user?.zona || 'Zona 1'}`} size="small" sx={{ mt: 1 }} />
        </Box>
      </Box>
    </Drawer>
  );

  return (
    <Box>
      <HeaderResponsivo />
      <NavigationDrawer />

      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
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

        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Responsabilidad Comunitaria:</strong> Gestionas los reportes y ciudadanos de <strong>{user?.zona || 'tu zona'}</strong>. 
            Coordinas con técnicos, validas reportes comunitarios y puedes ver/agregar comentarios en tiempo real.
            {reportesPendientes.length > 0 && (
              <strong> Tienes {reportesPendientes.length} reportes pendientes de aprobación.</strong>
            )}
          </Typography>
        </Alert>

        <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: 4 }}>
          <Grid item xs={6} sm={3}>
            <Card elevation={3}>
              <CardContent sx={{ textAlign: 'center', py: { xs: 1.5, md: 2 } }}>
                <WarningIcon color="warning" sx={{ fontSize: { xs: 30, md: 40 }, mb: 1 }} />
                <Typography variant={{ xs: "h5", md: "h4" }} color="warning.main">
                  {statsComunitarias.reportesPendientesAprobacion}
                </Typography>
                <Typography color="textSecondary" variant="body2" sx={{ fontSize: { xs: '0.7rem', md: '0.875rem' } }}>
                  Pendientes Aprobación
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Card elevation={3}>
              <CardContent sx={{ textAlign: 'center', py: { xs: 1.5, md: 2 } }}>
                <ReporteIcon color="info" sx={{ fontSize: { xs: 30, md: 40 }, mb: 1 }} />
                <Typography variant={{ xs: "h5", md: "h4" }} color="info.main">
                  {statsComunitarias.reportesActivos}
                </Typography>
                <Typography color="textSecondary" variant="body2" sx={{ fontSize: { xs: '0.7rem', md: '0.875rem' } }}>
                  Reportes Activos
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Card elevation={3}>
              <CardContent sx={{ textAlign: 'center', py: { xs: 1.5, md: 2 } }}>
                <CheckIcon color="success" sx={{ fontSize: { xs: 30, md: 40 }, mb: 1 }} />
                <Typography variant={{ xs: "h5", md: "h4" }} color="success.main">
                  {statsComunitarias.reportesResueltos}
                </Typography>
                <Typography color="textSecondary" variant="body2" sx={{ fontSize: { xs: '0.7rem', md: '0.875rem' } }}>
                  Reportes Resueltos
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Card elevation={3}>
              <CardContent sx={{ textAlign: 'center', py: { xs: 1.5, md: 2 } }}>
                <PeopleIcon color="primary" sx={{ fontSize: { xs: 30, md: 40 }, mb: 1 }} />
                <Typography variant={{ xs: "h5", md: "h4" }} color="primary">
                  {statsComunitarias.ciudadanosZona}
                </Typography>
                <Typography color="textSecondary" variant="body2" sx={{ fontSize: { xs: '0.7rem', md: '0.875rem' } }}>
                  Ciudadanos Zona
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

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
              <Tab label={`Pendientes Aprobación (${reportesPendientes.length})`} />
              <Tab label="Mapa de la Zona" />
              <Tab label="Coordinación" />
              <Tab label="Gestión Ciudadanos" />
            </Tabs>
          </Paper>
        )}

        {tabValue === 0 && (
          <ReportesPendientesAprobacion />
        )}

        {tabValue === 1 && (
          <Box>
            <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={2}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FilterIcon color="primary" />
                  Filtros de Reportes
                </Typography>
                
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<ClearIcon />}
                  onClick={limpiarFiltros}
                  sx={{ textTransform: 'none' }}
                >
                  Limpiar Filtros
                </Button>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom sx={{ mb: 1, fontWeight: 600 }}>
                    Por Estado:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    <Chip
                      label="Todos"
                      color={filtroEstado === 'todos' ? 'primary' : 'default'}
                      onClick={() => setFiltroEstado('todos')}
                      sx={{ 
                        cursor: 'pointer',
                        fontWeight: filtroEstado === 'todos' ? 600 : 400
                      }}
                    />
                    <Chip
                      label="Nuevos"
                      icon={<WarningIcon />}
                      color={filtroEstado === 'Nuevo' ? 'warning' : 'default'}
                      onClick={() => setFiltroEstado('Nuevo')}
                      sx={{ 
                        cursor: 'pointer',
                        fontWeight: filtroEstado === 'Nuevo' ? 600 : 400
                      }}
                    />
                    <Chip
                      label="Aprobados por Líder"
                      icon={<CheckCircleIcon />}
                      color={filtroEstado === 'Aprobado por Líder' ? 'info' : 'default'}
                      onClick={() => setFiltroEstado('Aprobado por Líder')}
                      sx={{ 
                        cursor: 'pointer',
                        fontWeight: filtroEstado === 'Aprobado por Líder' ? 600 : 400
                      }}
                    />
                    <Chip
                      label="En Proceso"
                      color={filtroEstado === 'En Proceso' ? 'secondary' : 'default'}
                      onClick={() => setFiltroEstado('En Proceso')}
                      sx={{ 
                        cursor: 'pointer',
                        fontWeight: filtroEstado === 'En Proceso' ? 600 : 400
                      }}
                    />
                    <Chip
                      label="Resueltos"
                      icon={<CheckIcon />}
                      color={filtroEstado === 'Resuelto' ? 'success' : 'default'}
                      onClick={() => setFiltroEstado('Resuelto')}
                      sx={{ 
                        cursor: 'pointer',
                        fontWeight: filtroEstado === 'Resuelto' ? 600 : 400
                      }}
                    />
                    <Chip
                      label="Cerrados"
                      color={filtroEstado === 'Cerrado' ? 'success' : 'default'}
                      onClick={() => setFiltroEstado('Cerrado')}
                      sx={{ 
                        cursor: 'pointer',
                        fontWeight: filtroEstado === 'Cerrado' ? 600 : 400
                      }}
                    />
                    <Chip
                      label="Rechazados"
                      icon={<Cancel />}
                      color={filtroEstado === 'Rechazado por Líder' ? 'error' : 'default'}
                      onClick={() => setFiltroEstado('Rechazado por Líder')}
                      sx={{ 
                        cursor: 'pointer',
                        fontWeight: filtroEstado === 'Rechazado por Líder' ? 600 : 400
                      }}
                    />
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Prioridad</InputLabel>
                    <Select
                      value={filtroPrioridad}
                      onChange={(e) => setFiltroPrioridad(e.target.value)}
                      label="Prioridad"
                      startAdornment={<SortIcon sx={{ mr: 1, color: 'action.active' }} />}
                    >
                      <MenuItem value="todas">Todas las prioridades</MenuItem>
                      <MenuItem value="Alta">
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'error.main' }} />
                          Alta
                        </Box>
                      </MenuItem>
                      <MenuItem value="Media">
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'warning.main' }} />
                          Media
                        </Box>
                      </MenuItem>
                      <MenuItem value="Baja">
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'success.main' }} />
                          Baja
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={8}>
                  <Box component="form" onSubmit={handleBusqueda} sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Buscar por título o descripción..."
                      value={busquedaTexto}
                      onChange={(e) => setBusquedaTexto(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                        endAdornment: busquedaTexto && (
                          <InputAdornment position="end">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setBusquedaTexto('');
                                cargarReportesConFiltros();
                              }}
                            >
                              <ClearIcon fontSize="small" />
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      sx={{ textTransform: 'none', minWidth: { xs: 80, md: 100 } }}
                      disabled={aplicandoFiltros}
                    >
                      {aplicandoFiltros ? <CircularProgress size={20} /> : 'Buscar'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>

              {(filtroEstado !== 'todos' || filtroPrioridad !== 'todas' || busquedaTexto) && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Filtros activos:
                    </Typography>
                    {filtroEstado !== 'todos' && (
                      <Chip label={`Estado: ${filtroEstado}`} size="small" color="primary" onDelete={() => setFiltroEstado('todos')} />
                    )}
                    {filtroPrioridad !== 'todas' && (
                      <Chip label={`Prioridad: ${filtroPrioridad}`} size="small" color="primary" onDelete={() => setFiltroPrioridad('todas')} />
                    )}
                    {busquedaTexto && (
                      <Chip label={`Búsqueda: "${busquedaTexto}"`} size="small" color="primary" onDelete={() => {
                        setBusquedaTexto('');
                        cargarReportesConFiltros();
                      }} />
                    )}
                  </Box>
                </Alert>
              )}

              <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="textSecondary">
                  <strong>{reportesZona.length}</strong> reporte{reportesZona.length !== 1 ? 's' : ''} encontrado{reportesZona.length !== 1 ? 's' : ''}
                </Typography>
                {aplicandoFiltros && <CircularProgress size={16} />}
              </Box>
            </Paper>

            <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MapIcon color="primary" />
                {isMobile ? `Mapa ${user?.zona || 'Zona'}` : `Mapa Interactivo de ${user?.zona || 'mi Zona'}`}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Visualiza la ubicación de los reportes filtrados en tu zona
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <MapaReportesZona reportes={reportesZona} onMarkerClick={handleMarkerClick} />
            </Paper>

            <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ReporteIcon color="primary" />
                Lista de Reportes
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {reportesZona.length === 0 ? (
                <Alert severity="info">
                  No se encontraron reportes con los filtros seleccionados.
                </Alert>
              ) : (
                <Stack spacing={2}>
                  {reportesZona.map((reporte) => (
                    <Card key={reporte.id} elevation={2}>
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                          <Box flex={1}>
                            <Box display="flex" alignItems="center" gap={1} mb={1} flexWrap="wrap">
                              <Typography variant="h6" sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>
                                {reporte.titulo}
                              </Typography>
                              <Chip 
                                label={reporte.estado_actual}
                                color={getEstadoColor(reporte.estado_actual)}
                                size="small"
                              />
                              <Chip 
                                label={reporte.prioridad}
                                color={getPrioridadColor(reporte.prioridad)}
                                size="small"
                              />
                            </Box>
                            
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                              #{reporte.numero_reporte} | {new Date(reporte.fecha_reporte).toLocaleDateString()} | {reporte.tipo_problema}
                            </Typography>
                            
                            <Typography variant="body1" gutterBottom sx={{ mt: 1 }}>
                              {reporte.descripcion}
                            </Typography>
                            
                            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                              <Box display="flex" alignItems="center" gap={0.5}>
                                <HomeIcon fontSize="small" color="action" />
                                <Typography variant="body2" color="textSecondary">
                                  {reporte.direccion}
                                </Typography>
                              </Box>
                              
                              {reporte.tiene_ubicacion_gps && (
                                <Chip 
                                  icon={<LocationIcon />}
                                  label="GPS"
                                  size="small"
                                  color="success"
                                  variant="outlined"
                                />
                              )}
                              
                              {reporte.tiene_fotos && (
                                <Chip 
                                  icon={<PhotoCameraIcon />}
                                  label={`${reporte.total_fotos} foto${reporte.total_fotos !== 1 ? 's' : ''}`}
                                  size="small"
                                  color="info"
                                  variant="outlined"
                                />
                              )}

                              {reporte.comentarios_count > 0 && (
                                <Chip 
                                  icon={<CommentIcon />}
                                  label={`${reporte.comentarios_count} comentario${reporte.comentarios_count !== 1 ? 's' : ''}`}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                              )}
                            </Box>

                            <Box sx={{ mt: 1 }}>
                              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                <PersonIcon fontSize="small" /> {reporte.ciudadano_nombre} {reporte.ciudadano_apellido}
                              </Typography>
                              {reporte.tecnico_nombre && (
                                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }} color="textSecondary">
                                  <EngineeringIcon fontSize="small" /> Técnico: {reporte.tecnico_nombre} {reporte.tecnico_apellido}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </Box>

                        <Divider sx={{ mb: 2 }} />
                        
                        <Box display="flex" gap={1} justifyContent="flex-end" flexWrap="wrap">
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => abrirModalDetallesReporte(reporte)}
                            sx={{ textTransform: 'none' }}
                          >
                            Ver Detalles
                          </Button>
                          
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<CommentIcon />}
                            onClick={() => abrirModalComentario(reporte)}
                            sx={{ textTransform: 'none' }}
                          >
                            Comentar
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              )}
            </Paper>

            <Grid container spacing={{ xs: 2, md: 3 }}>
              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ p: { xs: 2, md: 3 } }}>
                  <Typography variant="h6" gutterBottom>Distribución por Estado</Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Stack spacing={2}>
                    {['Nuevo', 'Aprobado por Líder', 'En Proceso', 'Resuelto', 'Cerrado'].map(estado => {
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
                          <Chip label={count} size="small" color={count > 0 ? "primary" : "default"} />
                        </Box>
                      );
                    })}
                  </Stack>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper elevation={3} sx={{ p: { xs: 2, md: 3 } }}>
                  <Typography variant="h6" gutterBottom>Distribución por Prioridad</Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Stack spacing={2}>
                    {['Alta', 'Media', 'Baja'].map(prioridad => {
                      const count = reportesZona.filter(r => r.prioridad === prioridad).length;
                      return (
                        <Box key={prioridad} display="flex" justifyContent="space-between" alignItems="center">
                          <Box display="flex" alignItems="center" gap={1}>
                            <Box 
                              sx={{ 
                                width: 12, 
                                height: 12, 
                                borderRadius: '50%', 
                                bgcolor: prioridad === 'Alta' ? 'error.main' : 
                                         prioridad === 'Media' ? 'warning.main' : 'success.main'
                              }} 
                            />
                            <Typography variant="body2" sx={{ fontSize: { xs: '0.85rem', md: '0.875rem' } }}>
                              Prioridad {prioridad}
                            </Typography>
                          </Box>
                          <Chip label={count} size="small" color={count > 0 ? getPrioridadColor(prioridad) : "default"} />
                        </Box>
                      );
                    })}
                  </Stack>

                  <Button
                    fullWidth variant="outlined" startIcon={<FullscreenIcon />}
                    sx={{ mt: 3, textTransform: 'none' }}
                    size={isMobile ? "medium" : "medium"}
                  >
                    Ver Mapa en Pantalla Completa
                  </Button>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {tabValue === 2 && (
          <Grid container spacing={{ xs: 2, md: 3 }}>
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: { xs: 2, md: 3 } }}>
                <Typography variant="h6" gutterBottom>Coordinación con Técnicos</Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontSize: { xs: '0.85rem', md: '0.875rem' } }}>
                    Facilita el acceso de técnicos a tu zona para resolver reportes
                  </Typography>
                </Alert>
                
                <List>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon><EngineeringIcon color="primary" /></ListItemIcon>
                    <ListItemText
                      primary="Técnico de Energía Eléctrica"
                      secondary="2 reportes pendientes en tu zona"
                      primaryTypographyProps={{ fontSize: { xs: '0.9rem', md: '1rem' } }}
                      secondaryTypographyProps={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}
                    />
                    <Button size="small" variant="outlined"
                      sx={{ fontSize: { xs: '0.7rem', md: '0.875rem' }, textTransform: 'none' }}
                    >
                      {isMobile ? 'Coordinar' : 'Coordinar Visita'}
                    </Button>
                  </ListItem>
                  
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon><EngineeringIcon color="primary" /></ListItemIcon>
                    <ListItemText
                      primary="Técnico de Infraestructura"
                      secondary="1 reporte urgente - bache en calle principal"
                      primaryTypographyProps={{ fontSize: { xs: '0.9rem', md: '1rem' } }}
                      secondaryTypographyProps={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}
                    />
                    <Button size="small" variant="contained" color="warning"
                      sx={{ fontSize: { xs: '0.7rem', md: '0.875rem' }, textTransform: 'none' }}
                    >
                      {isMobile ? 'Urgente' : 'Coordinar Urgente'}
                    </Button>
                  </ListItem>
                </List>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: { xs: 2, md: 3 } }}>
                <Typography variant="h6" gutterBottom>Actividades Comunitarias</Typography>
                <Divider sx={{ mb: 2 }} />
                
                <List>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon><EventIcon color="success" /></ListItemIcon>
                    <ListItemText
                      primary="Reunión Mensual COCODE"
                      secondary="Próxima: 15 de Enero, 6:00 PM"
                      primaryTypographyProps={{ fontSize: { xs: '0.9rem', md: '1rem' } }}
                      secondaryTypographyProps={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}
                    />
                  </ListItem>
                  
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon><CampaignIcon color="warning" /></ListItemIcon>
                    <ListItemText
                      primary="Campaña de Limpieza"
                      secondary="Sábado 20 de Enero, 8:00 AM"
                      primaryTypographyProps={{ fontSize: { xs: '0.9rem', md: '1rem' } }}
                      secondaryTypographyProps={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}
                    />
                  </ListItem>
                </List>

                <Button
                  fullWidth variant="contained" color="primary" startIcon={<AddIcon />}
                  sx={{ mt: 2, textTransform: 'none' }}
                  size={isMobile ? "medium" : "medium"}
                >
                  {isMobile ? 'Nueva Actividad' : 'Planificar Nueva Actividad'}
                </Button>
              </Paper>
            </Grid>
          </Grid>
        )}

        {tabValue === 3 && (
          <Grid container spacing={{ xs: 2, md: 3 }}>
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
                    <PeopleIcon color="primary" /> 
                    {isMobile ? `Ciudadanos ${user?.zona || 'Zona'}` : `Ciudadanos de ${user?.zona || 'mi Zona'}`}
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
                    {isMobile ? 'Registrar Ciudadano' : 'Registrar Nuevo Ciudadano'}
                  </Button>
                </Box>
                <Divider sx={{ mb: 3 }} />
                
                {loading ? (
                  <Box display="flex" justifyContent="center" p={3}>
                    <CircularProgress />
                  </Box>
                ) : ciudadanosZona.length === 0 ? (
                  <Alert severity="info">
                    No hay ciudadanos registrados en tu zona actualmente.
                  </Alert>
                ) : (
                  <Stack spacing={2}>
                    {ciudadanosZona.map((ciudadano) => (
                      <Card key={ciudadano.id} elevation={2}>
                        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
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
                                  {ciudadano.nombre}
                                </Typography>
                                
                                {ciudadano.verificado ? (
                                  <Chip 
                                    label="VERIFICADO"
                                    color="success" 
                                    size="small"
                                    icon={<VerifiedIcon />}
                                  />
                                ) : (
                                  <Chip 
                                    label="PENDIENTE VERIFICACIÓN"
                                    color="warning" 
                                    size="small"
                                    icon={<ScheduleIcon />}
                                  />
                                )}
                              </Box>
                              
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
                                <EmailIcon fontSize="small" /> 
                                {ciudadano.correo}
                              </Typography>
                              
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
                                <PhoneIcon fontSize="small" /> 
                                {ciudadano.telefono}
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
                                <HomeIcon fontSize="small" /> 
                                {isMobile && ciudadano.direccion?.length > 30 ? 
                                  `${ciudadano.direccion.substring(0, 30)}...` : 
                                  ciudadano.direccion
                                }
                              </Typography>

                              <Typography 
                                variant="body2" 
                                color="textSecondary" 
                                sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}
                              >
                                Reportes creados: {ciudadano.reportesCreados} | 
                                Registrado: {new Date(ciudadano.fechaRegistro).toLocaleDateString()}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ ml: { xs: 0, sm: 2 }, mt: { xs: 2, sm: 0 }, textAlign: { xs: 'left', sm: 'right' } }}>
                              {ciudadano.verificado ? (
                                <Avatar sx={{ bgcolor: 'success.main', width: { xs: 40, md: 50 }, height: { xs: 40, md: 50 } }}>
                                  <VerifiedIcon />
                                </Avatar>
                              ) : (
                                <Avatar sx={{ bgcolor: 'warning.main', width: { xs: 40, md: 50 }, height: { xs: 40, md: 50 } }}>
                                  <ScheduleIcon />
                                </Avatar>
                              )}
                            </Box>
                          </Box>

                          <Divider sx={{ mb: 2 }} />
                          
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
                              onClick={() => abrirModalDetallesReporte(ciudadano)}
                              fullWidth={isMobile}
                              sx={{ 
                                fontSize: { xs: '0.8rem', md: '0.875rem' },
                                textTransform: 'none'
                              }}
                            >
                              Ver Detalles
                            </Button>
                            
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<CommentIcon />}
                              onClick={() => abrirModalComentario(ciudadano)}
                              fullWidth={isMobile}
                              sx={{ 
                                fontSize: { xs: '0.8rem', md: '0.875rem' },
                                textTransform: 'none'
                              }}
                            >
                              {isMobile ? 'Contactar' : 'Contactar Ciudadano'}
                            </Button>
                            
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
                                {isMobile ? 'Verificar' : 'Verificar Ciudadano'}
                              </Button>
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                )}
              </Paper>
            </Grid>

            <Grid item xs={12} lg={4}>
              <Stack spacing={{ xs: 2, md: 3 }}>
                <Paper elevation={3} sx={{ p: { xs: 2, md: 3 } }}>
                  <Typography variant="h6" gutterBottom>
                    Resumen de Ciudadanos
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box textAlign="center">
                        <Typography variant="body2" color="textSecondary">
                          Total Ciudadanos
                        </Typography>
                        <Typography variant="h4" color="primary">
                          {statsComunitarias.ciudadanosZona}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Box textAlign="center">
                        <Typography variant="body2" color="textSecondary">
                          Verificados
                        </Typography>
                        <Typography variant="h4" color="success.main">
                          {statsComunitarias.ciudadanosVerificados}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Box textAlign="center">
                        <Typography variant="body2" color="textSecondary">
                          Pendientes
                        </Typography>
                        <Typography variant="h4" color="warning.main">
                          {statsComunitarias.ciudadanosPendientes}
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

                <Paper elevation={3} sx={{ p: { xs: 2, md: 3 } }}>
                  <Typography variant="h6" gutterBottom>
                    Acciones de Gestión
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Stack spacing={1}>
                    <Button
                      fullWidth variant="outlined" startIcon={<AddIcon />}
                      onClick={() => setOpenNuevoReporte(true)}
                      size={isMobile ? "medium" : "medium"}
                      sx={{ textTransform: 'none' }}
                    >
                      Registrar Nuevo Ciudadano
                    </Button>
                    
                    <Button
                      fullWidth variant="outlined" startIcon={<VerifiedIcon />}
                      size={isMobile ? "medium" : "medium"}
                      sx={{ textTransform: 'none' }}
                    >
                      Verificar Pendientes
                    </Button>
                    
                    <Button
                      fullWidth variant="outlined" startIcon={<CampaignIcon />}
                      size={isMobile ? "medium" : "medium"}
                      sx={{ textTransform: 'none' }}
                    >
                      Notificar Comunidad
                    </Button>
                    
                    <Button
                      fullWidth variant="outlined" startIcon={<TrendingIcon />}
                      size={isMobile ? "medium" : "medium"}
                      sx={{ textTransform: 'none' }}
                    >
                      Reporte de Participación
                    </Button>
                    
                    <Button
                      fullWidth variant="outlined" startIcon={<EventIcon />}
                      size={isMobile ? "medium" : "medium"}
                      sx={{ textTransform: 'none' }}
                    >
                      Organizar Actividad
                    </Button>
                  </Stack>
                </Paper>
              </Stack>
            </Grid>
          </Grid>
        )}

        <Box mt={4} p={{ xs: 2, md: 3 }} bgcolor="success.50" borderRadius={1} border="1px solid" borderColor="success.200">
          <Typography variant="body2" color="textSecondary" textAlign="center" sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
            <strong>Permisos de Líder COCODE:</strong> Gestionar ciudadanos de {user?.zona || 'tu zona'} | 
            Ver y validar reportes comunitarios | Crear reportes en nombre de ciudadanos | 
            Coordinar con técnicos | Ver/agregar comentarios en tiempo real | Organizar actividades comunitarias |
            <strong> NO puedes:</strong> Ver reportes de otras zonas | Asignar técnicos | Cambiar configuraciones del sistema
          </Typography>
        </Box>
      </Container>

      {isMobile && (
        <Fab
          color="primary"
          onClick={() => setOpenNuevoReporte(true)}
          sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}
        >
          <AddIcon />
        </Fab>
      )}

      <Dialog open={openComentario} onClose={cerrarModales} maxWidth="sm" fullWidth fullScreen={isMobile && !isTablet}>
        <DialogTitle sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
          <Box display="flex" alignItems="center" gap={1}>
            <CommentIcon />
            Agregar Comentario
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}>
            <strong>Ciudadano:</strong> {reporteSeleccionado?.nombre || reporteSeleccionado?.titulo}
          </Typography>
          <TextField
            fullWidth multiline rows={isMobile ? 3 : 4}
            label="Tu comentario como Líder"
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Agrega información sobre coordinación comunitaria o seguimiento..."
            sx={{ mt: 2 }}
            size={isMobile ? "small" : "medium"}
            inputProps={{ maxLength: 1000 }}
            helperText={`${comentario.length}/1000 caracteres`}
          />
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, md: 3 } }}>
          <Button onClick={cerrarModales} size={isMobile ? "small" : "medium"}>Cancelar</Button>
          <Button
            variant="contained"
            disabled={!comentario.trim() || loading}
            size={isMobile ? "small" : "medium"}
            sx={{ textTransform: 'none' }}
            startIcon={loading ? <CircularProgress size={16} /> : <CommentIcon />}
          >
            {loading ? 'Agregando...' : 'Agregar Comentario'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDetallesReporte} onClose={cerrarModales} maxWidth="md" fullWidth fullScreen={isMobile}>
        <DialogTitle sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={1}>
              <ViewIcon />
              Detalles del Reporte
            </Box>
            {isMobile && (
              <IconButton onClick={cerrarModales}>
                <CloseIcon />
              </IconButton>
            )}
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2, md: 3 } }}>
          {reporteSeleccionado && (
            <Box>
              <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {reporteSeleccionado.nombre || reporteSeleccionado.titulo}
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                  {reporteSeleccionado.numero_reporte ? (
                    <>
                      <Chip label={`#${reporteSeleccionado.numero_reporte}`} color="primary" size="small" />
                      <Chip 
                        label={reporteSeleccionado.estado_actual || reporteSeleccionado.estado} 
                        color={getEstadoColor(reporteSeleccionado.estado_actual || reporteSeleccionado.estado)}
                        size="small" 
                      />
                      <Chip 
                        label={reporteSeleccionado.prioridad} 
                        color={getPrioridadColor(reporteSeleccionado.prioridad)}
                        size="small" 
                      />
                    </>
                  ) : (
                    <>
                      <Chip 
                        label={reporteSeleccionado.verificado ? "VERIFICADO" : "PENDIENTE VERIFICACIÓN"} 
                        color={reporteSeleccionado.verificado ? "success" : "warning"} 
                        size="small"
                        icon={reporteSeleccionado.verificado ? <VerifiedIcon /> : <ScheduleIcon />}
                      />
                    </>
                  )}
                </Box>
                
                {reporteSeleccionado.numero_reporte ? (
                  <>
                    <Typography variant="body2" paragraph>
                      <strong>Descripción:</strong> {reporteSeleccionado.descripcion}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Dirección:</strong> {reporteSeleccionado.direccion}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Ciudadano:</strong> {reporteSeleccionado.ciudadano_nombre} {reporteSeleccionado.ciudadano_apellido}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Creado:</strong> {new Date(reporteSeleccionado.fecha_reporte).toLocaleDateString()}
                    </Typography>
                  </>
                ) : (
                  <>
                    <Typography variant="body2" paragraph>
                      <strong>Correo:</strong> {reporteSeleccionado.correo}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Teléfono:</strong> {reporteSeleccionado.telefono}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Dirección:</strong> {reporteSeleccionado.direccion}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>Reportes creados:</strong> {reporteSeleccionado.reportesCreados}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Registrado:</strong> {new Date(reporteSeleccionado.fechaRegistro).toLocaleDateString()}
                    </Typography>
                  </>
                )}
              </Paper>

              {reporteSeleccionado.numero_reporte ? (
                <ComentariosSection 
                  reporteId={reporteSeleccionado.id}
                  onComentarioAgregado={handleComentarioAgregado}
                />
              ) : (
                <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
                  <PeopleIcon sx={{ fontSize: 40, color: 'grey.400', mb: 1 }} />
                  <Typography variant="body1" gutterBottom>
                    Información del Ciudadano
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    Los comentarios solo están disponibles para reportes específicos.
                    Para comunicarte con este ciudadano, usa los datos de contacto.
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<PhoneIcon />}
                    size="small"
                    sx={{ mr: 1, textTransform: 'none' }}
                  >
                    Llamar
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<EmailIcon />}
                    size="small"
                    sx={{ textTransform: 'none' }}
                  >
                    Enviar Email
                  </Button>
                </Paper>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, md: 3 } }}>
          <Button onClick={cerrarModales} size={isMobile ? "small" : "medium"}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openNuevoReporte} onClose={cerrarModales} maxWidth="md" fullWidth fullScreen={isMobile}>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Registrar Nuevo Ciudadano</Typography>
            {isMobile && (
              <IconButton onClick={cerrarModales}>
                <CloseIcon />
              </IconButton>
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={{ xs: 2, md: 3 }} sx={{ mt: 1 }}>
            <TextField
              fullWidth label="Nombre Completo" variant="outlined"
              placeholder="Ej: Juan Carlos Pérez López"
              size={isMobile ? "medium" : "medium"}
            />
            <TextField
              fullWidth label="Correo Electrónico" variant="outlined"
              placeholder="ejemplo@correo.com"
              size={isMobile ? "medium" : "medium"}
            />
            <TextField
              fullWidth label="Número de Teléfono" variant="outlined"
              placeholder="Ej: 7712-3456"
              size={isMobile ? "medium" : "medium"}
            />
            <TextField
              fullWidth label="Dirección Completa" variant="outlined"
              placeholder="Dirección exacta del ciudadano"
              size={isMobile ? "medium" : "medium"}
            />
            <TextField
              fullWidth multiline rows={isMobile ? 2 : 3}
              label="Comentarios Adicionales (opcional)" variant="outlined"
              placeholder="Información adicional sobre el ciudadano..."
              size={isMobile ? "medium" : "medium"}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, md: 3 } }}>
          {!isMobile && (
            <Button onClick={cerrarModales} sx={{ textTransform: 'none' }}>
              Cancelar
            </Button>
          )}
          <Button 
            variant="contained" 
            onClick={cerrarModales}
            fullWidth={isMobile}
            size={isMobile ? "large" : "medium"}
            sx={{ textTransform: 'none' }}
          >
            Registrar Ciudadano
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DashboardLider; 