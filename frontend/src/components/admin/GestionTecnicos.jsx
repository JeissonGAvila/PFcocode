// frontend/src/components/admin/GestionTecnicos.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert,
  Snackbar,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Divider
} from '@mui/material';

import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  VpnKey as KeyIcon,
  Engineering as EngineeringIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';

import { tecnicosService, departamentosTecnicos, rolesTecnicos } from '../../services/admin/tecnicosService';

const GestionTecnicos = () => {
  // 📊 ESTADOS PRINCIPALES
  const [tecnicos, setTecnicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 🎛️ ESTADOS DE MODALES
  const [modalTecnico, setModalTecnico] = useState(false);
  const [modalPassword, setModalPassword] = useState(false);
  const [tecnicoSeleccionado, setTecnicoSeleccionado] = useState(null);
  const [editMode, setEditMode] = useState(false);

  // 📝 ESTADOS DEL FORMULARIO
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    contrasena: '',
    telefono: '',
    departamento: '',
    rol: '',
    puede_asignar: false
  });

  const [nuevaContrasena, setNuevaContrasena] = useState('');

  // 🔍 ESTADOS DE FILTROS
  const [filtros, setFiltros] = useState({
    departamento: '',
    busqueda: ''
  });

  // 📊 ESTADÍSTICAS
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    porDepartamento: {}
  });

  // 🔄 CARGAR TÉCNICOS AL INICIAR
  useEffect(() => {
    cargarTecnicos();
  }, []);

  // 📊 ACTUALIZAR ESTADÍSTICAS CUANDO CAMBIAN LOS TÉCNICOS
  useEffect(() => {
    actualizarEstadisticas();
  }, [tecnicos]);

  // 📋 FUNCIÓN PARA CARGAR TÉCNICOS
  const cargarTecnicos = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await tecnicosService.getAll();
      
      if (response.success) {
        setTecnicos(response.tecnicos);
      }
      
    } catch (error) {
      console.error('Error al cargar técnicos:', error);
      setError(error.message || 'Error al cargar la lista de técnicos');
    } finally {
      setLoading(false);
    }
  };

  // 📊 ACTUALIZAR ESTADÍSTICAS
  const actualizarEstadisticas = () => {
    const total = tecnicos.length;
    const porDepartamento = {};
    
    tecnicos.forEach(tecnico => {
      const dept = tecnico.departamento || 'Sin departamento';
      porDepartamento[dept] = (porDepartamento[dept] || 0) + 1;
    });

    setEstadisticas({ total, porDepartamento });
  };

  // 🔍 TÉCNICOS FILTRADOS
  const tecnicosFiltrados = tecnicos.filter(tecnico => {
    const coincideDepartamento = !filtros.departamento || tecnico.departamento === filtros.departamento;
    const coincideBusqueda = !filtros.busqueda || 
      `${tecnico.nombre} ${tecnico.apellido}`.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
      tecnico.correo.toLowerCase().includes(filtros.busqueda.toLowerCase());
    
    return coincideDepartamento && coincideBusqueda;
  });

  // ➕ ABRIR MODAL PARA CREAR
  const abrirModalCrear = () => {
    setFormData({
      nombre: '',
      apellido: '',
      correo: '',
      contrasena: '',
      telefono: '',
      departamento: '',
      rol: '',
      puede_asignar: false
    });
    setEditMode(false);
    setModalTecnico(true);
  };

  // ✏️ ABRIR MODAL PARA EDITAR
  const abrirModalEditar = (tecnico) => {
    setFormData({
      nombre: tecnico.nombre || '',
      apellido: tecnico.apellido || '',
      correo: tecnico.correo || '',
      contrasena: '', // No mostrar contraseña actual
      telefono: tecnico.telefono || '',
      departamento: tecnico.departamento || '',
      rol: tecnico.rol || '',
      puede_asignar: tecnico.puede_asignar || false
    });
    setTecnicoSeleccionado(tecnico);
    setEditMode(true);
    setModalTecnico(true);
  };

  // 🔑 ABRIR MODAL PARA CAMBIAR CONTRASEÑA
  const abrirModalPassword = (tecnico) => {
    setTecnicoSeleccionado(tecnico);
    setNuevaContrasena('');
    setModalPassword(true);
  };

  // 💾 GUARDAR TÉCNICO (CREAR O EDITAR)
  const guardarTecnico = async () => {
    try {
      setError('');
      
      if (editMode) {
        // Actualizar técnico existente
        const response = await tecnicosService.update(tecnicoSeleccionado.id, formData);
        
        if (response.success) {
          setSuccess(response.message);
          await cargarTecnicos(); // Recargar lista
          cerrarModal();
        }
        
      } else {
        // Crear nuevo técnico
        const response = await tecnicosService.create(formData);
        
        if (response.success) {
          setSuccess(response.message);
          await cargarTecnicos(); // Recargar lista
          cerrarModal();
        }
      }
      
    } catch (error) {
      console.error('Error al guardar técnico:', error);
      setError(error.message || 'Error al guardar el técnico');
    }
  };

  // 🔑 CAMBIAR CONTRASEÑA
  const cambiarContrasena = async () => {
    try {
      setError('');
      
      const response = await tecnicosService.updatePassword(tecnicoSeleccionado.id, nuevaContrasena);
      
      if (response.success) {
        setSuccess(response.message);
        setModalPassword(false);
        setNuevaContrasena('');
        setTecnicoSeleccionado(null);
      }
      
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      setError(error.message || 'Error al cambiar la contraseña');
    }
  };

  // 🗑️ DESACTIVAR TÉCNICO
  const desactivarTecnico = async (tecnico) => {
    if (!window.confirm(`¿Estás seguro de que quieres desactivar a ${tecnico.nombre} ${tecnico.apellido}?`)) {
      return;
    }

    try {
      setError('');
      
      const response = await tecnicosService.delete(tecnico.id);
      
      if (response.success) {
        setSuccess(response.message);
        await cargarTecnicos(); // Recargar lista
      }
      
    } catch (error) {
      console.error('Error al desactivar técnico:', error);
      setError(error.message || 'Error al desactivar el técnico');
    }
  };

  // 🚪 CERRAR MODAL
  const cerrarModal = () => {
    setModalTecnico(false);
    setTecnicoSeleccionado(null);
    setEditMode(false);
    setFormData({
      nombre: '',
      apellido: '',
      correo: '',
      contrasena: '',
      telefono: '',
      departamento: '',
      rol: '',
      puede_asignar: false
    });
  };

  // 📝 MANEJAR CAMBIOS EN FORMULARIO
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 🎨 OBTENER COLOR PARA DEPARTAMENTO
  const getColorDepartamento = (departamento) => {
    const colores = {
      'Energía Eléctrica': 'primary',
      'Agua Potable': 'info',
      'Drenajes': 'secondary',
      'Alumbrado Público': 'warning',
      'Recolección de Basura': 'success',
      'Mantenimiento Vial': 'error'
    };
    return colores[departamento] || 'default';
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* 🎯 ENCABEZADO */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EngineeringIcon color="primary" />
            Gestión de Técnicos
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Administra los técnicos del sistema municipal
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={cargarTecnicos}
            disabled={loading}
          >
            Actualizar
          </Button>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={abrirModalCrear}
            size="large"
          >
            Crear Técnico
          </Button>
        </Box>
      </Box>

      {/* 📊 ESTADÍSTICAS */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary">
                Total Técnicos
              </Typography>
              <Typography variant="h4">
                {estadisticas.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={9}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Por Departamento
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {Object.entries(estadisticas.porDepartamento).map(([dept, cantidad]) => (
                  <Chip
                    key={dept}
                    label={`${dept}: ${cantidad}`}
                    color={getColorDepartamento(dept)}
                    variant="outlined"
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 🔍 FILTROS */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterIcon />
            Filtros
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Departamento</InputLabel>
                <Select
                  value={filtros.departamento}
                  label="Departamento"
                  onChange={(e) => setFiltros(prev => ({ ...prev, departamento: e.target.value }))}
                >
                  <MenuItem value="">Todos los departamentos</MenuItem>
                  {departamentosTecnicos.map(dept => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Buscar técnico"
                placeholder="Buscar por nombre o correo..."
                value={filtros.busqueda}
                onChange={(e) => setFiltros(prev => ({ ...prev, busqueda: e.target.value }))}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* 📋 TABLA DE TÉCNICOS */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Lista de Técnicos ({tecnicosFiltrados.length})
          </Typography>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Técnico</strong></TableCell>
                    <TableCell><strong>Departamento</strong></TableCell>
                    <TableCell><strong>Rol</strong></TableCell>
                    <TableCell><strong>Contacto</strong></TableCell>
                    <TableCell><strong>Puede Asignar</strong></TableCell>
                    <TableCell><strong>Acciones</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tecnicosFiltrados.map((tecnico) => (
                    <TableRow key={tecnico.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {tecnico.nombre} {tecnico.apellido}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {tecnico.id}
                          </Typography>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Chip
                          label={tecnico.departamento}
                          color={getColorDepartamento(tecnico.departamento)}
                          size="small"
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2">
                          {tecnico.rol || 'Sin rol asignado'}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Box>
                          <Typography variant="body2">
                            {tecnico.correo}
                          </Typography>
                          {tecnico.telefono && (
                            <Typography variant="caption" color="text.secondary">
                              {tecnico.telefono}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Chip
                          label={tecnico.puede_asignar ? 'Sí' : 'No'}
                          color={tecnico.puede_asignar ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => abrirModalEditar(tecnico)}
                            title="Editar técnico"
                          >
                            <EditIcon />
                          </IconButton>
                          
                          <IconButton
                            size="small"
                            color="warning"
                            onClick={() => abrirModalPassword(tecnico)}
                            title="Cambiar contraseña"
                          >
                            <KeyIcon />
                          </IconButton>
                          
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => desactivarTecnico(tecnico)}
                            title="Desactivar técnico"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {tecnicosFiltrados.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          No se encontraron técnicos
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* 🎛️ MODAL CREAR/EDITAR TÉCNICO */}
      <Dialog 
        open={modalTecnico} 
        onClose={cerrarModal} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          {editMode ? 'Editar Técnico' : 'Crear Nuevo Técnico'}
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nombre *"
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Apellido *"
                value={formData.apellido}
                onChange={(e) => handleInputChange('apellido', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Correo Electrónico *"
                type="email"
                value={formData.correo}
                onChange={(e) => handleInputChange('correo', e.target.value)}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Teléfono"
                value={formData.telefono}
                onChange={(e) => handleInputChange('telefono', e.target.value)}
              />
            </Grid>
            
            {!editMode && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Contraseña *"
                  type="password"
                  value={formData.contrasena}
                  onChange={(e) => handleInputChange('contrasena', e.target.value)}
                  helperText="Mínimo 6 caracteres"
                />
              </Grid>
            )}
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Departamento *</InputLabel>
                <Select
                  value={formData.departamento}
                  label="Departamento *"
                  onChange={(e) => handleInputChange('departamento', e.target.value)}
                >
                  {departamentosTecnicos.map(dept => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Rol</InputLabel>
                <Select
                  value={formData.rol}
                  label="Rol"
                  onChange={(e) => handleInputChange('rol', e.target.value)}
                >
                  <MenuItem value="">Sin rol específico</MenuItem>
                  {rolesTecnicos.map(rol => (
                    <MenuItem key={rol} value={rol}>{rol}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.puede_asignar}
                    onChange={(e) => handleInputChange('puede_asignar', e.target.checked)}
                  />
                }
                label="¿Puede asignar reportes a otros técnicos?"
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={cerrarModal}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={guardarTecnico}>
            {editMode ? 'Actualizar' : 'Crear'} Técnico
          </Button>
        </DialogActions>
      </Dialog>

      {/* 🔑 MODAL CAMBIAR CONTRASEÑA */}
      <Dialog open={modalPassword} onClose={() => setModalPassword(false)}>
        <DialogTitle>
          Cambiar Contraseña - {tecnicoSeleccionado?.nombre} {tecnicoSeleccionado?.apellido}
        </DialogTitle>
        
        <DialogContent>
          <TextField
            fullWidth
            label="Nueva Contraseña"
            type="password"
            value={nuevaContrasena}
            onChange={(e) => setNuevaContrasena(e.target.value)}
            helperText="Mínimo 6 caracteres"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setModalPassword(false)}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={cambiarContrasena}>
            Cambiar Contraseña
          </Button>
        </DialogActions>
      </Dialog>

      {/* 🎗️ SNACKBARS PARA MENSAJES */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSuccess('')} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default GestionTecnicos;