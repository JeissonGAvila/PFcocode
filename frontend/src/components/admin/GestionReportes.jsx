// frontend/src/components/admin/GestionReportes.jsx - VERSIÓN COMPLETAMENTE RESPONSIVA
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
  Badge,
  Card,
  CardContent,
  Stack,
  Container,
  useTheme,
  useMediaQuery,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  AppBar,
  Toolbar
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
  Close as CloseIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Schedule as ScheduleIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';

// Importar los componentes
import GaleriaFotosAdmin from './GaleriaFotosAdmin.jsx';
import MapaUbicacionAdmin from './MapaUbicacionAdmin.jsx';
import reportesService from '../../services/admin/reportesService.js';

const GestionReportes = () => {
  const theme = useTheme();
  
  // Breakpoints responsivos
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

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
  const [openDetalles, setOpenDetalles] = useState(false);
  const [selectedReporte, setSelectedReporte] = useState(null);
  const [reporteDetalle, setReporteDetalle] = useState(null);
  const [tabDetalles, setTabDetalles] = useState(0);
  
  // Estados para UI responsiva
  const [expandedCards, setExpandedCards] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  
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

  // Cargar detalles completos de un reporte
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

  // Toggle para expandir cards en móvil
  const toggleCardExpanded = (reporteId) => {
    setExpandedCards(prev => ({
      ...prev,
      [reporteId]: !prev[reporteId]
    }));
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

  // Función para abrir modal de detalles
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
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
          <Typography variant="body1" sx={{ ml: 2 }}>
            Cargando reportes aprobados por líderes...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
          <Button onClick={cargarDatos} sx={{ ml: 2 }}>
            Reintentar
          </Button>
        </Alert>
      </Container>
    );
  }

  // Vista móvil como cards
  const ReportesCardView = () => (
    <Stack spacing={2}>
      {reportes.map((reporte) => {
        const isExpanded = expandedCards[reporte.id];
        return (
          <Card key={reporte.id} elevation={2} sx={{ position: 'relative' }}>
            <CardContent sx={{ pb: 1 }}>
              {/* Header del card */}
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                <Box flex={1}>
                  <Typography variant="h6" sx={{ fontSize: '1rem', lineHeight: 1.2 }}>
                    #{reporte.numero_reporte}
                  </Typography>
                  <Typography variant="body2" fontWeight="medium" sx={{ mb: 0.5 }}>
                    {reporte.titulo}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Por: {reporte.ciudadano_creador}
                  </Typography>
                </Box>
                
                <IconButton 
                  size="small" 
                  onClick={() => toggleCardExpanded(reporte.id)}
                >
                  {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>

              {/* Información básica siempre visible */}
              <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                <Chip
                  label={reporte.estado}
                  color={getEstadoColor(reporte.estado)}
                  size="small"
                />
                <Chip
                  label={reporte.prioridad}
                  color={getPrioridadColor(reporte.prioridad)}
                  size="small"
                />
              </Box>

              {/* Información expandible */}
              <Collapse in={isExpanded}>
                <Box>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Tipo:</strong> {reporte.tipo_problema}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Departamento:</strong> {reporte.departamento_responsable}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Zona:</strong> {reporte.zona}
                  </Typography>
                  
                  {reporte.ciudadano_telefono && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Teléfono:</strong> {reporte.ciudadano_telefono}
                    </Typography>
                  )}
                  
                  {reporte.tecnico_asignado && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Técnico:</strong> {reporte.tecnico_asignado}
                    </Typography>
                  )}

                  {/* Evidencia */}
                  <Box display="flex" gap={1} mb={2} flexWrap="wrap">
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

                  <Typography variant="caption" color="textSecondary" display="block" sx={{ mb: 2 }}>
                    Creado: {new Date(reporte.fecha_reporte).toLocaleDateString()}
                  </Typography>
                </Box>
              </Collapse>

              {/* Acciones */}
              <Box display="flex" justifyContent="space-between" alignItems="center" pt={1}>
                <Button
                  size="small"
                  startIcon={<ViewIcon />}
                  onClick={() => abrirModalDetalles(reporte)}
                  variant="outlined"
                >
                  Ver Detalles
                </Button>
                
                <Box display="flex" gap={0.5}>
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
              </Box>
            </CardContent>
          </Card>
        );
      })}
    </Stack>
  );

  // Vista desktop como tabla
  const ReportesTableView = () => (
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
  );

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
      {/* Header con estadísticas - Responsivo */}
      <Box 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center" 
        mb={3}
        flexDirection={{ xs: 'column', sm: 'row' }}
        gap={{ xs: 2, sm: 0 }}
      >
        <Typography variant={isMobile ? "h6" : "h5"}>
          Gestión de Reportes ({reportes.length} total)
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={cargarDatos}
          disabled={loading}
          size={isMobile ? "medium" : "medium"}
        >
          Actualizar
        </Button>
      </Box>

      {/* Estadísticas rápidas - Grid responsivo */}
      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent sx={{ textAlign: 'center', py: { xs: 2, md: 2 } }}>
              <Typography 
                variant={isMobile ? "h6" : "h4"} 
                color="primary"
                sx={{ fontSize: { xs: '1.25rem', sm: '1.75rem', md: '2.125rem' } }}
              >
                {reportes.length}
              </Typography>
              <Typography 
                variant="body2" 
                color="textSecondary"
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                Reportes Pendientes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent sx={{ textAlign: 'center', py: { xs: 2, md: 2 } }}>
              <Typography 
                variant={isMobile ? "h6" : "h4"} 
                color="info.main"
                sx={{ fontSize: { xs: '1.25rem', sm: '1.75rem', md: '2.125rem' } }}
              >
                {estadisticas.con_fotos || 0}
              </Typography>
              <Typography 
                variant="body2" 
                color="textSecondary"
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                Con Evidencia
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent sx={{ textAlign: 'center', py: { xs: 2, md: 2 } }}>
              <Typography 
                variant={isMobile ? "h6" : "h4"} 
                color="success.main"
                sx={{ fontSize: { xs: '1.25rem', sm: '1.75rem', md: '2.125rem' } }}
              >
                {estadisticas.con_ubicacion || 0}
              </Typography>
              <Typography 
                variant="body2" 
                color="textSecondary"
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                Con GPS
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent sx={{ textAlign: 'center', py: { xs: 2, md: 2 } }}>
              <Typography 
                variant={isMobile ? "h6" : "h4"} 
                color="error.main"
                sx={{ fontSize: { xs: '1.25rem', sm: '1.75rem', md: '2.125rem' } }}
              >
                {estadisticas.criticos || 0}
              </Typography>
              <Typography 
                variant="body2" 
                color="textSecondary"
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                Prioridad Alta
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alerta informativa */}
      <Alert 
        severity="info" 
        sx={{ 
          mb: 3,
          '& .MuiAlert-message': {
            fontSize: { xs: '0.8rem', sm: '0.875rem' }
          }
        }}
      >
        <Typography variant="body2">
          <strong>Flujo de Trabajo:</strong> Estos reportes fueron aprobados por líderes COCODE y están listos para asignación. 
          Los reportes con fotos y ubicación GPS facilitan el trabajo de los técnicos.
        </Typography>
      </Alert>

      {/* Vista condicional según dispositivo */}
      {isMobile ? <ReportesCardView /> : <ReportesTableView />}

      {/* Modal Detalles Completos - Responsivo */}
      <Dialog 
        open={openDetalles} 
        onClose={() => setOpenDetalles(false)} 
        maxWidth="lg" 
        fullWidth
        fullScreen={isMobile}
      >
        {isMobile && (
          <AppBar position="relative" color="primary">
            <Toolbar>
              <Typography variant="h6" sx={{ flex: 1 }}>
                Reporte #{selectedReporte?.numero_reporte}
              </Typography>
              <IconButton 
                edge="end" 
                color="inherit" 
                onClick={() => setOpenDetalles(false)}
              >
                <CloseIcon />
              </IconButton>
            </Toolbar>
          </AppBar>
        )}
        
        {!isMobile && (
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Detalles del Reporte #{selectedReporte?.numero_reporte}
            </Typography>
            <IconButton onClick={() => setOpenDetalles(false)}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
        )}
        
        <DialogContent dividers sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
          {reporteDetalle && (
            <Box>
              <Paper sx={{ mb: 2 }}>
                <Tabs 
                  value={tabDetalles} 
                  onChange={(e, newValue) => setTabDetalles(newValue)}
                  variant={isMobile ? "scrollable" : "fullWidth"}
                  scrollButtons="auto"
                  sx={{
                    '& .MuiTab-root': {
                      fontSize: { xs: '0.8rem', sm: '0.875rem' },
                      minHeight: { xs: 48, sm: 56 },
                      px: { xs: 1, sm: 2 }
                    }
                  }}
                >
                  <Tab label={isMobile ? "Info" : "Información General"} />
                  <Tab 
                    label={isMobile ? `Fotos (${reporteDetalle.fotos?.length || 0})` : `Fotos (${reporteDetalle.fotos?.length || 0})`}
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
                  <Grid container spacing={{ xs: 2, md: 3 }}>
                    <Grid item xs={12} md={6}>
                      <Typography 
                        variant={isMobile ? "h6" : "h6"} 
                        gutterBottom
                      >
                        {reporteDetalle.titulo}
                      </Typography>
                      
                      <Typography variant="body1" gutterBottom>
                        <strong>Descripción:</strong>
                      </Typography>
                      <Typography 
                        variant="body2" 
                        paragraph
                        sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}
                      >
                        {reporteDetalle.descripcion}
                      </Typography>
                      
                      <Typography variant="body1" gutterBottom>
                        <strong>Dirección:</strong>
                      </Typography>
                      <Typography 
                        variant="body2" 
                        paragraph
                        sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}
                      >
                        {reporteDetalle.direccion}
                      </Typography>

                      <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                        <Chip 
                          label={reporteDetalle.prioridad}
                          color={getPrioridadColor(reporteDetalle.prioridad)}
                          size={isMobile ? "small" : "medium"}
                        />
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Typography 
                        variant={isMobile ? "subtitle1" : "h6"} 
                        gutterBottom
                      >
                        Información del Ciudadano
                      </Typography>
                      <Typography 
                        variant="body2"
                        sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}
                      >
                        <strong>Nombre:</strong> {reporteDetalle.ciudadano_nombre} {reporteDetalle.ciudadano_apellido}
                      </Typography>
                      <Typography 
                        variant="body2"
                        sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}
                      >
                        <strong>Teléfono:</strong> {reporteDetalle.ciudadano_telefono}
                      </Typography>
                      <Typography 
                        variant="body2"
                        sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}
                      >
                        <strong>Correo:</strong> {reporteDetalle.ciudadano_correo}
                      </Typography>
                      
                      <Typography 
                        variant={isMobile ? "subtitle1" : "h6"} 
                        gutterBottom 
                        sx={{ mt: 3 }}
                      >
                        Información Técnica
                      </Typography>
                      <Typography 
                        variant="body2"
                        sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}
                      >
                        <strong>Tipo:</strong> {reporteDetalle.tipo_problema}
                      </Typography>
                      <Typography 
                        variant="body2"
                        sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}
                      >
                        <strong>Departamento:</strong> {reporteDetalle.departamento_responsable}
                      </Typography>
                      <Typography 
                        variant="body2"
                        sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}
                      >
                        <strong>Zona:</strong> {reporteDetalle.zona_nombre}
                      </Typography>

                      {reporteDetalle.tecnico_nombre && (
                        <>
                          <Typography 
                            variant={isMobile ? "subtitle1" : "h6"} 
                            gutterBottom 
                            sx={{ mt: 3 }}
                          >
                            Técnico Asignado
                          </Typography>
                          <Typography 
                            variant="body2"
                            sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}
                          >
                            <strong>Nombre:</strong> {reporteDetalle.tecnico_nombre} {reporteDetalle.tecnico_apellido}
                          </Typography>
                          <Typography 
                            variant="body2"
                            sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}
                          >
                            <strong>Teléfono:</strong> {reporteDetalle.tecnico_telefono}
                          </Typography>
                          <Typography 
                            variant="body2"
                            sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}
                          >
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
                  maxHeight={isMobile ? 300 : 400}
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
                  height={isMobile ? 350 : 450}
                  titulo="Ubicación Proporcionada por el Ciudadano"
                />
              )}
            </Box>
          )}
        </DialogContent>
        
        {!isMobile && (
          <DialogActions sx={{ p: { xs: 2, md: 3 } }}>
            <Button onClick={() => setOpenDetalles(false)}>
              Cerrar
            </Button>
            {selectedReporte?.estado === 'Aprobado por Líder' && (
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
            )}
          </DialogActions>
        )}

        {/* Botones flotantes en móvil */}
        {isMobile && selectedReporte?.estado === 'Aprobado por Líder' && (
          <Box 
            sx={{ 
              position: 'fixed', 
              bottom: 16, 
              right: 16, 
              zIndex: 1000 
            }}
          >
            <Button
              variant="contained"
              color="success"
              onClick={() => {
                setOpenDetalles(false);
                abrirModalAsignar(selectedReporte);
              }}
              sx={{ borderRadius: '50px' }}
            >
              Asignar Técnico
            </Button>
          </Box>
        )}
      </Dialog>

      {/* Modal Asignar Técnico - Responsivo */}
      <Dialog 
        open={openAsignar} 
        onClose={() => setOpenAsignar(false)} 
        maxWidth="sm" 
        fullWidth
        fullScreen={isMobile}
      >
        {isMobile && (
          <AppBar position="relative">
            <Toolbar>
              <Typography variant="h6" sx={{ flex: 1 }}>
                Asignar Técnico
              </Typography>
              <IconButton 
                edge="end" 
                color="inherit" 
                onClick={() => setOpenAsignar(false)}
              >
                <CloseIcon />
              </IconButton>
            </Toolbar>
          </AppBar>
        )}

        {!isMobile && (
          <DialogTitle>
            Asignar Técnico
          </DialogTitle>
        )}
        
        <DialogContent sx={{ p: { xs: 2, md: 3 } }}>
          <Box sx={{ mt: { xs: 1, md: 2 } }}>
            <Typography variant="body1" gutterBottom>
              <strong>Reporte:</strong> {selectedReporte?.titulo}
            </Typography>
            <Typography 
              variant="body2" 
              color="textSecondary" 
              gutterBottom
              sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}
            >
              {selectedReporte?.numero_reporte} | {selectedReporte?.tipo_problema}
            </Typography>
            
            <FormControl fullWidth sx={{ mt: 3 }}>
              <InputLabel>Seleccionar Técnico</InputLabel>
              <Select
                value={selectedTecnico}
                onChange={(e) => setSelectedTecnico(e.target.value)}
                label="Seleccionar Técnico"
                size={isMobile ? "medium" : "medium"}
              >
                {tecnicos
                  .filter(tecnico => tecnico.departamento === selectedReporte?.departamento_responsable)
                  .map((tecnico) => (
                    <MenuItem key={tecnico.id} value={tecnico.id}>
                      <Box>
                        <Typography variant="body2">
                          {tecnico.nombre} {tecnico.apellido}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {tecnico.departamento}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            {selectedReporte && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography 
                  variant="body2"
                  sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                >
                  Solo se muestran técnicos del departamento: <strong>{selectedReporte.departamento_responsable}</strong>
                </Typography>
              </Alert>
            )}
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: { xs: 2, md: 3 } }}>
          {!isMobile && (
            <Button onClick={() => setOpenAsignar(false)}>
              Cancelar
            </Button>
          )}
          <Button
            onClick={handleAsignar}
            variant="contained"
            disabled={!selectedTecnico || loading}
            fullWidth={isMobile}
            size={isMobile ? "large" : "medium"}
          >
            {loading ? <CircularProgress size={20} /> : 'Asignar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Cambiar Estado - Responsivo */}
      <Dialog 
        open={openEstado} 
        onClose={() => setOpenEstado(false)} 
        maxWidth="sm" 
        fullWidth
        fullScreen={isMobile}
      >
        {isMobile && (
          <AppBar position="relative">
            <Toolbar>
              <Typography variant="h6" sx={{ flex: 1 }}>
                Cambiar Estado
              </Typography>
              <IconButton 
                edge="end" 
                color="inherit" 
                onClick={() => setOpenEstado(false)}
              >
                <CloseIcon />
              </IconButton>
            </Toolbar>
          </AppBar>
        )}

        {!isMobile && (
          <DialogTitle>
            Cambiar Estado
          </DialogTitle>
        )}
        
        <DialogContent sx={{ p: { xs: 2, md: 3 } }}>
          <Box sx={{ mt: { xs: 1, md: 2 } }}>
            <Typography variant="body1" gutterBottom>
              <strong>Reporte:</strong> {selectedReporte?.titulo}
            </Typography>
            <Typography 
              variant="body2" 
              color="textSecondary" 
              gutterBottom
              sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}
            >
              Estado actual: {selectedReporte?.estado}
            </Typography>
            
            <FormControl fullWidth sx={{ mt: 3 }}>
              <InputLabel>Nuevo Estado</InputLabel>
              <Select
                value={selectedEstado}
                onChange={(e) => setSelectedEstado(e.target.value)}
                label="Nuevo Estado"
                size={isMobile ? "medium" : "medium"}
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
        
        <DialogActions sx={{ p: { xs: 2, md: 3 } }}>
          {!isMobile && (
            <Button onClick={() => setOpenEstado(false)}>
              Cancelar
            </Button>
          )}
          <Button
            onClick={handleCambiarEstado}
            variant="contained"
            disabled={!selectedEstado || loading}
            fullWidth={isMobile}
            size={isMobile ? "large" : "medium"}
          >
            {loading ? <CircularProgress size={20} /> : 'Cambiar Estado'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Cambiar Prioridad - Responsivo */}
      <Dialog 
        open={openPrioridad} 
        onClose={() => setOpenPrioridad(false)} 
        maxWidth="sm" 
        fullWidth
        fullScreen={isMobile}
      >
        {isMobile && (
          <AppBar position="relative">
            <Toolbar>
              <Typography variant="h6" sx={{ flex: 1 }}>
                Cambiar Prioridad
              </Typography>
              <IconButton 
                edge="end" 
                color="inherit" 
                onClick={() => setOpenPrioridad(false)}
              >
                <CloseIcon />
              </IconButton>
            </Toolbar>
          </AppBar>
        )}

        {!isMobile && (
          <DialogTitle>
            Cambiar Prioridad
          </DialogTitle>
        )}
        
        <DialogContent sx={{ p: { xs: 2, md: 3 } }}>
          <Box sx={{ mt: { xs: 1, md: 2 } }}>
            <Typography variant="body1" gutterBottom>
              <strong>Reporte:</strong> {selectedReporte?.titulo}
            </Typography>
            <Typography 
              variant="body2" 
              color="textSecondary" 
              gutterBottom
              sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}
            >
              Prioridad actual: {selectedReporte?.prioridad}
            </Typography>
            
            <FormControl fullWidth sx={{ mt: 3 }}>
              <InputLabel>Nueva Prioridad</InputLabel>
              <Select
                value={selectedPrioridadValue}
                onChange={(e) => setSelectedPrioridadValue(e.target.value)}
                label="Nueva Prioridad"
                size={isMobile ? "medium" : "medium"}
              >
                {prioridades.map((prioridad) => (
                  <MenuItem key={prioridad} value={prioridad}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip
                        label={prioridad}
                        color={getPrioridadColor(prioridad)}
                        size="small"
                      />
                      <Typography variant="body2">
                        {prioridad}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: { xs: 2, md: 3 } }}>
          {!isMobile && (
            <Button onClick={() => setOpenPrioridad(false)}>
              Cancelar
            </Button>
          )}
          <Button
            onClick={handleCambiarPrioridad}
            variant="contained"
            disabled={!selectedPrioridadValue || loading}
            fullWidth={isMobile}
            size={isMobile ? "large" : "medium"}
          >
            {loading ? <CircularProgress size={20} /> : 'Cambiar Prioridad'}
          </Button>
        </DialogActions>
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
    </Container>
  );
};

export default GestionReportes;