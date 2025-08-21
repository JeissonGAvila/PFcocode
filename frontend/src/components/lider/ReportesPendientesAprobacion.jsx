// frontend/src/components/lider/ReportesPendientesAprobacion.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Divider,
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
  CircularProgress,
  Grid,
  Paper
} from '@mui/material';
import {
  CheckCircle as AprobarIcon,
  Cancel as RechazarIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  Phone as PhoneIcon,
  Assignment as ReporteIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { liderReportesService } from '../../services/lider/reportesService.js';

const ReportesPendientesAprobacion = () => {
  // Estados principales
  const [reportesPendientes, setReportesPendientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  // Estados para modales
  const [modalAprobar, setModalAprobar] = useState(false);
  const [modalRechazar, setModalRechazar] = useState(false);
  const [reporteSeleccionado, setReporteSeleccionado] = useState(null);
  const [comentarioLider, setComentarioLider] = useState('');
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [procesando, setProcesando] = useState(false);

  // Motivos de rechazo predefinidos
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

  // Cargar reportes pendientes al montar
  useEffect(() => {
    cargarReportesPendientes();
  }, []);

  const cargarReportesPendientes = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await liderReportesService.getPendientesAprobacion();
      
      if (response.success) {
        setReportesPendientes(response.reportes || []);
      } else {
        setError('Error al cargar reportes pendientes');
      }
    } catch (error) {
      console.error('Error al cargar reportes:', error);
      setError(error.message || 'Error al cargar reportes pendientes');
    } finally {
      setLoading(false);
    }
  };

  const handleAbrirModalAprobar = (reporte) => {
    setReporteSeleccionado(reporte);
    setComentarioLider('');
    setModalAprobar(true);
  };

  const handleAbrirModalRechazar = (reporte) => {
    setReporteSeleccionado(reporte);
    setMotivoRechazo('');
    setComentarioLider('');
    setModalRechazar(true);
  };

  const handleAprobarReporte = async () => {
    try {
      setProcesando(true);
      setMensaje('');

      const response = await liderReportesService.aprobarReporte(
        reporteSeleccionado.id,
        comentarioLider
      );

      if (response.success) {
        setMensaje(`✅ Reporte ${response.reporte.numero_reporte} aprobado exitosamente`);
        
        // Remover de la lista de pendientes
        setReportesPendientes(prev => 
          prev.filter(r => r.id !== reporteSeleccionado.id)
        );
        
        setModalAprobar(false);
        setReporteSeleccionado(null);
        setComentarioLider('');
      }
    } catch (error) {
      console.error('Error al aprobar reporte:', error);
      setError(error.message || 'Error al aprobar el reporte');
    } finally {
      setProcesando(false);
    }
  };

  const handleRechazarReporte = async () => {
    try {
      if (!motivoRechazo.trim()) {
        setError('Debes seleccionar un motivo de rechazo');
        return;
      }

      setProcesando(true);
      setMensaje('');

      const response = await liderReportesService.rechazarReporte(
        reporteSeleccionado.id,
        motivoRechazo,
        comentarioLider
      );

      if (response.success) {
        setMensaje(`❌ Reporte ${response.reporte.numero_reporte} rechazado: ${response.motivo}`);
        
        // Remover de la lista de pendientes
        setReportesPendientes(prev => 
          prev.filter(r => r.id !== reporteSeleccionado.id)
        );
        
        setModalRechazar(false);
        setReporteSeleccionado(null);
        setMotivoRechazo('');
        setComentarioLider('');
      }
    } catch (error) {
      console.error('Error al rechazar reporte:', error);
      setError(error.message || 'Error al rechazar el reporte');
    } finally {
      setProcesando(false);
    }
  };

  const getPrioridadColor = (prioridad) => {
    switch (prioridad?.toLowerCase()) {
      case 'alta': return 'error';
      case 'media': return 'warning';
      case 'baja': return 'success';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography ml={2}>Cargando reportes pendientes...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box mb={3}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="warning" /> Reportes Pendientes de Aprobación
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Revisa y aprueba/rechaza los reportes creados por ciudadanos de tu zona
        </Typography>
      </Box>

      {/* Mensajes */}
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

      {/* Estadísticas rápidas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="warning.main">
              {reportesPendientes.length}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Pendientes Aprobación
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="error.main">
              {reportesPendientes.filter(r => r.prioridad === 'Alta').length}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Prioridad Alta
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Lista de reportes pendientes */}
      {reportesPendientes.length === 0 ? (
        <Alert severity="info">
          <strong>✨ ¡Excelente trabajo!</strong> No hay reportes pendientes de aprobación en tu zona.
        </Alert>
      ) : (
        <Box>
          {reportesPendientes.map((reporte) => (
            <Card key={reporte.id} sx={{ mb: 2, border: '1px solid', borderColor: 'warning.light' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box flex={1}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Typography variant="h6">
                        {reporte.titulo}
                      </Typography>
                      <Chip 
                        label="PENDIENTE APROBACIÓN"
                        color="warning" 
                        size="small"
                        icon={<ScheduleIcon />}
                      />
                    </Box>
                    
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      #{reporte.numero_reporte} | {new Date(reporte.fecha_reporte).toLocaleDateString()} | {reporte.tipo_problema}
                    </Typography>
                    
                    <Typography variant="body1" gutterBottom sx={{ mt: 1 }}>
                      {reporte.descripcion}
                    </Typography>
                    
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                        <HomeIcon fontSize="small" /> {reporte.direccion_completa}
                      </Typography>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                        <PersonIcon fontSize="small" /> {reporte.ciudadano_nombre} {reporte.ciudadano_apellido}
                      </Typography>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PhoneIcon fontSize="small" /> {reporte.ciudadano_telefono}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ ml: 2, textAlign: 'right' }}>
                    <Chip 
                      label={reporte.prioridad || 'Media'}
                      color={getPrioridadColor(reporte.prioridad)}
                      sx={{ mb: 1, display: 'block' }}
                    />
                    <Typography variant="caption" color="textSecondary">
                      Departamento: {reporte.departamento_responsable}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ mb: 2 }} />
                
                <Box display="flex" gap={1} justifyContent="flex-end">
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<AprobarIcon />}
                    onClick={() => handleAbrirModalAprobar(reporte)}
                  >
                    Aprobar
                  </Button>
                  
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<RechazarIcon />}
                    onClick={() => handleAbrirModalRechazar(reporte)}
                  >
                    Rechazar
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Modal Aprobar Reporte */}
      <Dialog open={modalAprobar} onClose={() => setModalAprobar(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AprobarIcon color="success" />
          Aprobar Reporte
        </DialogTitle>
        <DialogContent>
          {reporteSeleccionado && (
            <Box>
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
            onClick={handleAprobarReporte}
            disabled={procesando}
            startIcon={procesando ? <CircularProgress size={20} /> : <AprobarIcon />}
          >
            {procesando ? 'Aprobando...' : 'Aprobar Reporte'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Rechazar Reporte */}
      <Dialog open={modalRechazar} onClose={() => setModalRechazar(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <RechazarIcon color="error" />
          Rechazar Reporte
        </DialogTitle>
        <DialogContent>
          {reporteSeleccionado && (
            <Box>
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
                Al rechazar, el ciudadano será notificado del motivo y podrá crear un nuevo reporte.
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
            onClick={handleRechazarReporte}
            disabled={procesando || !motivoRechazo}
            startIcon={procesando ? <CircularProgress size={20} /> : <RechazarIcon />}
          >
            {procesando ? 'Rechazando...' : 'Rechazar Reporte'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReportesPendientesAprobacion;