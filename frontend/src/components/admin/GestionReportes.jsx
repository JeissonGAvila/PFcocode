// frontend/src/components/admin/GestionReportes.jsx
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
  Tooltip
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Assignment as AssignIcon,
  SwapHoriz as SwapHorizIcon,
  Flag as PriorityIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import reportesService from '../../services/admin/reportesService.js';

const GestionReportes = () => {
  // Estados principales
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estados para datos de selects
  const [tecnicos, setTecnicos] = useState([]);
  const [estados, setEstados] = useState([]);
  const [prioridades] = useState(['Alta', 'Media', 'Baja']);
  
  // Estados para modales
  const [openAsignar, setOpenAsignar] = useState(false);
  const [openEstado, setOpenEstado] = useState(false);
  const [openPrioridad, setOpenPrioridad] = useState(false);
  const [selectedReporte, setSelectedReporte] = useState(null);
  
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

  const mostrarSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const cerrarSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
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
      case 'En Revisión': return 'warning';
      case 'Asignado': return 'primary';
      case 'En Proceso': return 'warning';
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

  if (loading && reportes.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Cargando reportes...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
        <Button onClick={cargarDatos} sx={{ ml: 2 }}>
          Reintentar
        </Button>
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">
          📊 Gestión de Reportes ({reportes.length} total)
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

      {/* Alerta informativa */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Funcionalidades:</strong> Ver todos los reportes del sistema, asignar técnicos, cambiar estados y establecer prioridades.
        </Typography>
      </Alert>

      {/* Tabla de reportes */}
      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'grey.100' }}>
              <TableCell><strong>Número</strong></TableCell>
              <TableCell><strong>Título</strong></TableCell>
              <TableCell><strong>Tipo</strong></TableCell>
              <TableCell><strong>Estado</strong></TableCell>
              <TableCell><strong>Prioridad</strong></TableCell>
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
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {reporte.titulo}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {reporte.ciudadano_creador}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {reporte.tipo_problema}
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
                    <Tooltip title="Ver detalles">
                      <IconButton size="small" color="primary">
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

      {/* Modal Asignar Técnico */}
      <Dialog open={openAsignar} onClose={() => setOpenAsignar(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          🔧 Asignar Técnico
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              <strong>Reporte:</strong> {selectedReporte?.titulo}
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {selectedReporte?.numero_reporte} | {selectedReporte?.tipo_problema}
            </Typography>
            
            <FormControl fullWidth sx={{ mt: 3 }}>
              <InputLabel>Seleccionar Técnico</InputLabel>
              <Select
                value={selectedTecnico}
                onChange={(e) => setSelectedTecnico(e.target.value)}
                label="Seleccionar Técnico"
              >
                {tecnicos.map((tecnico) => (
                  <MenuItem key={tecnico.id} value={tecnico.id}>
                    {tecnico.nombre} {tecnico.apellido} - {tecnico.departamento}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAsignar(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleAsignar}
            variant="contained"
            disabled={!selectedTecnico || loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Asignar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Cambiar Estado */}
      <Dialog open={openEstado} onClose={() => setOpenEstado(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          🔄 Cambiar Estado
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              <strong>Reporte:</strong> {selectedReporte?.titulo}
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Estado actual: {selectedReporte?.estado}
            </Typography>
            
            <FormControl fullWidth sx={{ mt: 3 }}>
              <InputLabel>Nuevo Estado</InputLabel>
              <Select
                value={selectedEstado}
                onChange={(e) => setSelectedEstado(e.target.value)}
                label="Nuevo Estado"
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
        <DialogActions>
          <Button onClick={() => setOpenEstado(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleCambiarEstado}
            variant="contained"
            disabled={!selectedEstado || loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Cambiar Estado'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Cambiar Prioridad */}
      <Dialog open={openPrioridad} onClose={() => setOpenPrioridad(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          ⚡ Cambiar Prioridad
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              <strong>Reporte:</strong> {selectedReporte?.titulo}
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Prioridad actual: {selectedReporte?.prioridad}
            </Typography>
            
            <FormControl fullWidth sx={{ mt: 3 }}>
              <InputLabel>Nueva Prioridad</InputLabel>
              <Select
                value={selectedPrioridadValue}
                onChange={(e) => setSelectedPrioridadValue(e.target.value)}
                label="Nueva Prioridad"
              >
                {prioridades.map((prioridad) => (
                  <MenuItem key={prioridad} value={prioridad}>
                    {prioridad}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPrioridad(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleCambiarPrioridad}
            variant="contained"
            disabled={!selectedPrioridadValue || loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Cambiar Prioridad'}
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
    </Box>
  );
};

export default GestionReportes;