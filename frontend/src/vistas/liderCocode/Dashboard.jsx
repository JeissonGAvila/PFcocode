// frontend/src/vistas/liderCocode/Dashboard.jsx - COMPLETO CON BOTONES DE APROBACIÓN
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
  ListItemButton,
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
  MenuItem
} from '@mui/material';
import {
  Group as GroupIcon,
  LocationCity as CityIcon,
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
  Cancel
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext.jsx';
import LogoutButton from '../../components/common/LogoutButton.jsx';

// Importar el componente de reportes pendientes
import ReportesPendientesAprobacion from '../../components/lider/ReportesPendientesAprobacion.jsx';

const DashboardLider = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [openNuevoReporte, setOpenNuevoReporte] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  
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

  // Estados para ciudadanos (mantener mock por ahora)
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
    
    if (newValue === 0) {
      cargarReportesZona();
    } else if (newValue === 3) {
      cargarReportesPendientes();
    }
  };

  const handleValidarReporte = (reporteId) => {
    setReportesZona(prev => 
      prev.map(reporte => 
        reporte.id === reporteId 
          ? { ...reporte, validadoLider: true }
          : reporte
      )
    );
    console.log(`Reporte ${reporteId} validado por líder`);
  };

  const handleVerificarCiudadano = (ciudadanoId) => {
    setCiudadanosZona(prev => 
      prev.map(ciudadano => 
        ciudadano.id === ciudadanoId 
          ? { ...ciudadano, verificado: true }
          : ciudadano
      )
    );
    console.log(`Ciudadano ${ciudadanoId} verificado`);
  };

  return (
    <Box>
      {/* Header del Panel Líder */}
      <Box 
        bgcolor="success.main" 
        color="white" 
        p={3}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Box>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <GroupIcon sx={{ fontSize: 40 }} /> Panel Líder COCODE
          </Typography>
          <Typography variant="h6">
            Líder: {user?.nombre}
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Zona: <strong>{user?.zona || 'Zona 1 Centro'}</strong> | 
            Cargo: <strong>Presidente COCODE</strong> | {user?.correo}
          </Typography>
        </Box>
        
        <Box display="flex" alignItems="center" gap={2}>
          <Badge badgeContent={reportesPendientes.length} color="warning">
            <NotificationIcon />
          </Badge>
          
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<RefreshIcon />}
            onClick={handleRefrescar}
            disabled={loading}
          >
            Refrescar
          </Button>
          
          <LogoutButton variant="text" />
        </Box>
      </Box>

      {/* Contenido Principal */}
      <Box p={3}>
        {/* Mensajes de estado */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {mensaje && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMensaje('')}>
            {mensaje}
          </Alert>
        )}

        {/* Alerta de Responsabilidad Comunitaria */}
        <Alert severity="success" sx={{ mb: 3 }}>
          <strong>Responsabilidad Comunitaria:</strong> Gestionas los reportes y ciudadanos de <strong>{user?.zona || 'tu zona'}</strong>. 
          Coordinas con técnicos y validas reportes comunitarios.
          {reportesPendientes.length > 0 && (
            <strong> Tienes {reportesPendientes.length} reportes pendientes de aprobación.</strong>
          )}
        </Alert>

        {/* Estadísticas reales */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={3}>
              <CardContent sx={{ textAlign: 'center' }}>
                <PeopleIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" color="primary">
                  {statsComunitarias.ciudadanosZona}
                </Typography>
                <Typography color="textSecondary" variant="body2">
                  Ciudadanos Zona
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={3}>
              <CardContent sx={{ textAlign: 'center' }}>
                <WarningIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" color="warning.main">
                  {statsComunitarias.reportesPendientesAprobacion}
                </Typography>
                <Typography color="textSecondary" variant="body2">
                  Pendientes Aprobación
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={3}>
              <CardContent sx={{ textAlign: 'center' }}>
                <ReporteIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" color="info.main">
                  {statsComunitarias.reportesActivos}
                </Typography>
                <Typography color="textSecondary" variant="body2">
                  Reportes Activos
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={3}>
              <CardContent sx={{ textAlign: 'center' }}>
                <CheckIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h4" color="success.main">
                  {statsComunitarias.reportesResueltos}
                </Typography>
                <Typography color="textSecondary" variant="body2">
                  Reportes Resueltos
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs actualizados */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Reportes de mi Zona" />
            <Tab label="Ciudadanos" />
            <Tab label="Coordinación" />
            <Tab label={`Pendientes Aprobación (${reportesPendientes.length})`} />
          </Tabs>
        </Paper>

        {/* Tab 0 - Reportes de la Zona con datos reales */}
        {tabValue === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ReporteIcon color="primary" /> Reportes de {user?.zona || 'mi Zona'}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenNuevoReporte(true)}
                  >
                    Crear Reporte Comunitario
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
                  reportesZona.map((reporte) => (
                    <Card key={reporte.id} sx={{ mb: 2 }}>
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                          <Box flex={1}>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                              <Typography variant="h6">
                                {reporte.titulo}
                              </Typography>
                            </Box>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                              #{reporte.numero_reporte} | {new Date(reporte.fecha_reporte).toLocaleDateString()} | {reporte.tipo_problema}
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                              {reporte.descripcion}
                            </Typography>
                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <HomeIcon fontSize="small" /> {reporte.direccion}
                            </Typography>
                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                              <PhoneIcon fontSize="small" /> {reporte.ciudadano_nombre} {reporte.ciudadano_apellido} - {reporte.ciudadano_telefono}
                            </Typography>
                            {reporte.tecnico_nombre && (
                              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                <EngineeringIcon fontSize="small" /> Técnico: {reporte.tecnico_nombre} {reporte.tecnico_apellido}
                              </Typography>
                            )}
                          </Box>
                          
                          <Box sx={{ ml: 2, textAlign: 'right' }}>
                            <Chip 
                              label={reporte.estado_actual}
                              color={getEstadoColor(reporte.estado_actual)}
                              sx={{ mb: 1, display: 'block' }}
                            />
                            <Chip 
                              label={reporte.prioridad}
                              color={getPrioridadColor(reporte.prioridad)}
                              size="small"
                            />
                          </Box>
                        </Box>

                        <Divider sx={{ mb: 2 }} />
                        
                        {/* BOTONES CON FUNCIONALIDAD DE APROBACIÓN */}
                        <Box display="flex" gap={1} flexWrap="wrap">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<ViewIcon />}
                          >
                            Ver Detalles
                          </Button>
                          
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<PhoneIcon />}
                          >
                            Contactar Ciudadano
                          </Button>

                          {/* BOTONES PARA APROBAR/RECHAZAR - SOLO SI ESTÁ EN ESTADO "Nuevo" */}
                          {reporte.estado_actual === 'Nuevo' && (
                            <>
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                startIcon={<CheckCircle />}
                                onClick={() => handleAprobarReporteDirecto(reporte)}
                                disabled={procesando}
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
                              >
                                Rechazar
                              </Button>
                            </>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  ))
                )}
              </Paper>
            </Grid>

            {/* Panel lateral con información comunitaria real */}
            <Grid item xs={12} lg={4}>
              <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Resumen Comunitario
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box mb={2}>
                  <Typography variant="body2" color="textSecondary">
                    Reportes Pendientes Aprobación
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {statsComunitarias.reportesPendientesAprobacion}
                  </Typography>
                </Box>
                
                <Box mb={2}>
                  <Typography variant="body2" color="textSecondary">
                    Reportes Activos
                  </Typography>
                  <Typography variant="h4" color="info.main">
                    {statsComunitarias.reportesActivos}
                  </Typography>
                </Box>
                
                <Box mb={2}>
                  <Typography variant="body2" color="textSecondary">
                    Reportes Resueltos
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {statsComunitarias.reportesResueltos}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Próxima Reunión
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {statsComunitarias.proximaReunion}
                  </Typography>
                </Box>
              </Paper>

              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Acciones Rápidas
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box display="flex" flexDirection="column" gap={1}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={handleRefrescar}
                    disabled={loading}
                  >
                    Actualizar Datos
                  </Button>
                  
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<CampaignIcon />}
                  >
                    Convocar Reunión
                  </Button>
                  
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<TrendingIcon />}
                  >
                    Reporte Comunitario
                  </Button>
                  
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<EngineeringIcon />}
                  >
                    Contactar Técnicos
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Tab 1 - Gestión de Ciudadanos (mantener como estaba) */}
        {tabValue === 1 && (
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PeopleIcon color="primary" /> Ciudadanos de {user?.zona || 'mi Zona'}
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={2}>
              {ciudadanosZona.map((ciudadano) => (
                <Grid item xs={12} md={6} lg={4} key={ciudadano.id}>
                  <Card>
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={2}>
                        <Avatar sx={{ bgcolor: ciudadano.verificado ? 'success.main' : 'warning.main', mr: 2 }}>
                          {ciudadano.nombre.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                        <Box flex={1}>
                          <Typography variant="h6">
                            {ciudadano.nombre}
                          </Typography>
                          <Chip 
                            label={ciudadano.verificado ? "Verificado" : "Pendiente"}
                            color={ciudadano.verificado ? "success" : "warning"}
                            size="small"
                          />
                        </Box>
                      </Box>
                      
                      <Box mb={2}>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                          <EmailIcon fontSize="small" /> {ciudadano.correo}
                        </Typography>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                          <PhoneIcon fontSize="small" /> {ciudadano.telefono}
                        </Typography>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                          <HomeIcon fontSize="small" /> {ciudadano.direccion}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Reportes: {ciudadano.reportesCreados} | Registro: {ciudadano.fechaRegistro}
                        </Typography>
                      </Box>

                      <Box display="flex" gap={1}>
                        {!ciudadano.verificado && (
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<VerifiedIcon />}
                            onClick={() => handleVerificarCiudadano(ciudadano.id)}
                          >
                            Verificar
                          </Button>
                        )}
                        
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<PhoneIcon />}
                        >
                          Contactar
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}

        {/* Tab 2 - Coordinación (mantener como estaba) */}
        {tabValue === 2 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Coordinación con Técnicos
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Alert severity="info" sx={{ mb: 2 }}>
                  Facilita el acceso de técnicos a tu zona para resolver reportes
                </Alert>
                
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <EngineeringIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Técnico de Energía Eléctrica"
                      secondary="2 reportes pendientes en tu zona"
                    />
                    <Button size="small" variant="outlined">
                      Coordinar Visita
                    </Button>
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <EngineeringIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Técnico de Infraestructura"
                      secondary="1 reporte urgente - bache en calle principal"
                    />
                    <Button size="small" variant="contained" color="warning">
                      Coordinar Urgente
                    </Button>
                  </ListItem>
                </List>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Actividades Comunitarias
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <EventIcon color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Reunión Mensual COCODE"
                      secondary="Próxima: 15 de Enero, 6:00 PM"
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <CampaignIcon color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Campaña de Limpieza"
                      secondary="Sábado 20 de Enero, 8:00 AM"
                    />
                  </ListItem>
                </List>

                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  sx={{ mt: 2 }}
                >
                  Planificar Nueva Actividad
                </Button>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Tab 3 - Reportes pendientes de aprobación */}
        {tabValue === 3 && (
          <ReportesPendientesAprobacion />
        )}

        {/* Footer Info */}
        <Box mt={4} p={2} bgcolor="success.50" borderRadius={1} border="1px solid" borderColor="success.200">
          <Typography variant="body2" color="textSecondary" textAlign="center">
            <strong>Permisos de Líder COCODE:</strong> Gestionar ciudadanos de {user?.zona || 'tu zona'} | 
            Ver y validar reportes comunitarios | Crear reportes en nombre de ciudadanos | 
            Coordinar con técnicos | Organizar actividades comunitarias |
            <strong> NO puedes:</strong> Ver reportes de otras zonas | Asignar técnicos | Cambiar configuraciones del sistema
          </Typography>
        </Box>
      </Box>

      {/* MODALES PARA APROBAR/RECHAZAR */}
      
      {/* Modal Aprobar */}
      <Dialog open={modalAprobar} onClose={() => setModalAprobar(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Aprobar Reporte
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
                rows={3}
                value={comentarioLider}
                onChange={(e) => setComentarioLider(e.target.value)}
                placeholder="Agregar comentarios sobre la aprobación..."
                sx={{ mt: 2 }}
              />
              
              <Alert severity="info" sx={{ mt: 2 }}>
                Al aprobar, el reporte será enviado al administrador para asignación a técnico.
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setModalAprobar(false)}
            disabled={procesando}
          >
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            color="success"
            onClick={ejecutarAprobacion}
            disabled={procesando}
            startIcon={procesando ? <CircularProgress size={16} /> : <CheckCircle />}
          >
            {procesando ? 'Aprobando...' : 'Aprobar Reporte'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Rechazar */}
      <Dialog open={modalRechazar} onClose={() => setModalRechazar(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Rechazar Reporte
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
                      {motivo}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                label="Comentario adicional (opcional)"
                multiline
                rows={3}
                value={comentarioLider}
                onChange={(e) => setComentarioLider(e.target.value)}
                placeholder="Explicar el motivo del rechazo..."
              />
              
              <Alert severity="warning" sx={{ mt: 2 }}>
                Al rechazar, el ciudadano será notificado del motivo.
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setModalRechazar(false)}
            disabled={procesando}
          >
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            color="error"
            onClick={ejecutarRechazo}
            disabled={procesando || !motivoRechazo}
            startIcon={procesando ? <CircularProgress size={16} /> : <Cancel />}
          >
            {procesando ? 'Rechazando...' : 'Rechazar Reporte'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para nuevo reporte comunitario */}
      <Dialog open={openNuevoReporte} onClose={() => setOpenNuevoReporte(false)} maxWidth="md" fullWidth>
        <DialogTitle>Crear Reporte Comunitario</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              fullWidth
              label="Título del Problema"
              variant="outlined"
              placeholder="Ej: Falta de alumbrado en parque central"
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Descripción Detallada"
              variant="outlined"
              placeholder="Describe el problema detalladamente..."
            />
            <TextField
              fullWidth
              label="Ubicación/Dirección"
              variant="outlined"
              placeholder="Dirección exacta del problema"
            />
            <TextField
              fullWidth
              label="Ciudadano Reportante (opcional)"
              variant="outlined"
              placeholder="Nombre del ciudadano que reportó"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNuevoReporte(false)}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={() => setOpenNuevoReporte(false)}>
            Crear Reporte
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DashboardLider;