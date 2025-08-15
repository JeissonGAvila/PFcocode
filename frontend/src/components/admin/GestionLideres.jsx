// frontend/src/components/admin/GestionLideres.jsx
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
  Grid,
  Alert,
  Snackbar,
  CircularProgress,
  Tooltip,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Lock as LockIcon,
  Refresh as RefreshIcon,
  Group as GroupIcon
} from '@mui/icons-material';
import lideresService, { tiposLiderDisponibles, cargosDisponibles } from '../../services/admin/lideresService.js';

const GestionLideres = () => {
  // Estados principales
  const [lideres, setLideres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados para datos de selects
  const [cocodesPrincipales, setCocodesPrincipales] = useState([]);
  const [subCocodes, setSubCocodes] = useState([]);

  // Estados para modales
  const [openModal, setOpenModal] = useState(false);
  const [openPasswordModal, setOpenPasswordModal] = useState(false);
  const [editingLider, setEditingLider] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Estados para formularios
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    contrasena: '',
    telefono: '',
    dpi: '',
    tipo_lider: '',
    cargo: '',
    fecha_eleccion: '',
    periodo_inicio: '',
    periodo_fin: '',
    id_cocode_principal: '',
    id_subcocode: ''
  });

  const [passwordData, setPasswordData] = useState({
    nueva_contrasena: '',
    confirmar_contrasena: ''
  });

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
      
      // Cargar líderes y datos de selects en paralelo
      const [lideresResponse, datosResponse] = await Promise.all([
        lideresService.getAll(),
        lideresService.getDatosSelect()
      ]);
      
      if (lideresResponse.success) {
        setLideres(lideresResponse.lideres);
      }
      
      if (datosResponse.success) {
        setCocodesPrincipales(datosResponse.cocode_principales);
        setSubCocodes(datosResponse.sub_cocode);
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
  const abrirModalCrear = () => {
    setFormData({
      nombre: '',
      apellido: '',
      correo: '',
      contrasena: '',
      telefono: '',
      dpi: '',
      tipo_lider: '',
      cargo: '',
      fecha_eleccion: '',
      periodo_inicio: '',
      periodo_fin: '',
      id_cocode_principal: '',
      id_subcocode: ''
    });
    setEditingLider(null);
    setIsEditing(false);
    setOpenModal(true);
  };

  const abrirModalEditar = (lider) => {
    setFormData({
      nombre: lider.nombre || '',
      apellido: lider.apellido || '',
      correo: lider.correo || '',
      contrasena: '', // No mostrar contraseña existente
      telefono: lider.telefono || '',
      dpi: lider.dpi || '',
      tipo_lider: lider.tipo_lider || '',
      cargo: lider.cargo || '',
      fecha_eleccion: lider.fecha_eleccion ? lider.fecha_eleccion.split('T')[0] : '',
      periodo_inicio: lider.periodo_inicio ? lider.periodo_inicio.split('T')[0] : '',
      periodo_fin: lider.periodo_fin ? lider.periodo_fin.split('T')[0] : '',
      id_cocode_principal: lider.id_cocode_principal || '',
      id_subcocode: lider.id_subcocode || ''
    });
    setEditingLider(lider);
    setIsEditing(true);
    setOpenModal(true);
  };

  const abrirModalPassword = (lider) => {
    setEditingLider(lider);
    setPasswordData({
      nueva_contrasena: '',
      confirmar_contrasena: ''
    });
    setOpenPasswordModal(true);
  };

  const cerrarModales = () => {
    setOpenModal(false);
    setOpenPasswordModal(false);
    setEditingLider(null);
    setIsEditing(false);
    setFormData({
      nombre: '',
      apellido: '',
      correo: '',
      contrasena: '',
      telefono: '',
      dpi: '',
      tipo_lider: '',
      cargo: '',
      fecha_eleccion: '',
      periodo_inicio: '',
      periodo_fin: '',
      id_cocode_principal: '',
      id_subcocode: ''
    });
    setPasswordData({
      nueva_contrasena: '',
      confirmar_contrasena: ''
    });
  };

  // Funciones de formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Funciones de acción
  const handleSubmit = async () => {
    try {
      // Validaciones básicas
      if (!formData.nombre || !formData.apellido || !formData.correo || !formData.tipo_lider) {
        mostrarSnackbar('Por favor completa todos los campos requeridos', 'error');
        return;
      }

      if (!isEditing && !formData.contrasena) {
        mostrarSnackbar('La contraseña es requerida para nuevos líderes', 'error');
        return;
      }

      if (formData.contrasena && formData.contrasena.length < 6) {
        mostrarSnackbar('La contraseña debe tener al menos 6 caracteres', 'error');
        return;
      }

      // Validar asignación según tipo de líder
      if (formData.tipo_lider === 'principal' && !formData.id_cocode_principal) {
        mostrarSnackbar('Debe seleccionar un COCODE principal', 'error');
        return;
      }

      if (formData.tipo_lider === 'subcocode' && !formData.id_subcocode) {
        mostrarSnackbar('Debe seleccionar un Sub-COCODE', 'error');
        return;
      }

      setLoading(true);

      if (isEditing) {
        await lideresService.update(editingLider.id, formData);
        mostrarSnackbar('Líder actualizado exitosamente', 'success');
      } else {
        await lideresService.create(formData);
        mostrarSnackbar('Líder creado exitosamente', 'success');
      }

      cerrarModales();
      cargarDatos();

    } catch (error) {
      mostrarSnackbar(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async () => {
    try {
      if (!passwordData.nueva_contrasena || !passwordData.confirmar_contrasena) {
        mostrarSnackbar('Por favor completa ambos campos de contraseña', 'error');
        return;
      }

      if (passwordData.nueva_contrasena !== passwordData.confirmar_contrasena) {
        mostrarSnackbar('Las contraseñas no coinciden', 'error');
        return;
      }

      if (passwordData.nueva_contrasena.length < 6) {
        mostrarSnackbar('La contraseña debe tener al menos 6 caracteres', 'error');
        return;
      }

      setLoading(true);
      await lideresService.updatePassword(editingLider.id, passwordData.nueva_contrasena);
      mostrarSnackbar('Contraseña actualizada exitosamente', 'success');
      cerrarModales();

    } catch (error) {
      mostrarSnackbar(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (lider) => {
    if (window.confirm(`¿Estás seguro de desactivar al líder ${lider.nombre} ${lider.apellido}?`)) {
      try {
        setLoading(true);
        await lideresService.delete(lider.id);
        mostrarSnackbar('Líder desactivado exitosamente', 'success');
        cargarDatos();
      } catch (error) {
        mostrarSnackbar(error.message, 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  // Funciones auxiliares
  const getTipoLiderColor = (tipo) => {
    switch (tipo) {
      case 'principal': return 'primary';
      case 'subcocode': return 'secondary';
      default: return 'default';
    }
  };

  const getTipoLiderLabel = (tipo) => {
    const tipoObj = tiposLiderDisponibles.find(t => t.value === tipo);
    return tipoObj ? tipoObj.label : tipo;
  };

  if (loading && lideres.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Cargando líderes COCODE...
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
          👑 Gestión de Líderes COCODE ({lideres.length} total)
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={cargarDatos}
            disabled={loading}
          >
            Actualizar
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={abrirModalCrear}
            disabled={loading}
          >
            Agregar Líder
          </Button>
        </Box>
      </Box>

      {/* Alerta informativa */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Funcionalidades:</strong> Crear, editar y desactivar líderes COCODE principales y sub-COCODE. Cambiar contraseñas y gestionar asignaciones territoriales.
        </Typography>
      </Alert>

      {/* Tabla de líderes */}
      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'grey.100' }}>
              <TableCell><strong>Nombre</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Tipo de Líder</strong></TableCell>
              <TableCell><strong>Cargo</strong></TableCell>
              <TableCell><strong>COCODE Asignado</strong></TableCell>
              <TableCell><strong>Zona</strong></TableCell>
              <TableCell><strong>Período</strong></TableCell>
              <TableCell><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lideres.map((lider) => (
              <TableRow key={lider.id} hover>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {lider.nombre} {lider.apellido}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {lider.telefono}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {lider.correo}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getTipoLiderLabel(lider.tipo_lider)}
                    color={getTipoLiderColor(lider.tipo_lider)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {lider.cargo || 'No especificado'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {lider.cocode_asignado || 'Sin asignar'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {lider.zona_nombre || 'Sin zona'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {lider.periodo_inicio && lider.periodo_fin 
                      ? `${lider.periodo_inicio.split('-')[0]} - ${lider.periodo_fin.split('-')[0]}`
                      : 'No definido'
                    }
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    <Tooltip title="Editar líder">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => abrirModalEditar(lider)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Cambiar contraseña">
                      <IconButton
                        size="small"
                        color="warning"
                        onClick={() => abrirModalPassword(lider)}
                      >
                        <LockIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Desactivar líder">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(lider)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal Crear/Editar Líder */}
      <Dialog open={openModal} onClose={cerrarModales} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <GroupIcon />
            {isEditing ? 'Editar Líder COCODE' : 'Crear Nuevo Líder COCODE'}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Información Personal */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Información Personal
              </Typography>
              <Divider />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombre *"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Apellido *"
                name="apellido"
                value={formData.apellido}
                onChange={handleInputChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Correo Electrónico *"
                name="correo"
                type="email"
                value={formData.correo}
                onChange={handleInputChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Teléfono"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                placeholder="7712-3456"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="DPI"
                name="dpi"
                value={formData.dpi}
                onChange={handleInputChange}
                placeholder="1234567890101"
              />
            </Grid>
            
            {!isEditing && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Contraseña *"
                  name="contrasena"
                  type="password"
                  value={formData.contrasena}
                  onChange={handleInputChange}
                  required={!isEditing}
                  helperText="Mínimo 6 caracteres"
                />
              </Grid>
            )}

            {/* Información de Liderazgo */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Información de Liderazgo
              </Typography>
              <Divider />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Tipo de Líder</InputLabel>
                <Select
                  name="tipo_lider"
                  value={formData.tipo_lider}
                  onChange={handleInputChange}
                  label="Tipo de Líder"
                >
                  {tiposLiderDisponibles.map((tipo) => (
                    <MenuItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Cargo</InputLabel>
                <Select
                  name="cargo"
                  value={formData.cargo}
                  onChange={handleInputChange}
                  label="Cargo"
                >
                  {cargosDisponibles.map((cargo) => (
                    <MenuItem key={cargo} value={cargo}>
                      {cargo}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Asignación Territorial */}
            {formData.tipo_lider === 'principal' && (
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>COCODE Principal</InputLabel>
                  <Select
                    name="id_cocode_principal"
                    value={formData.id_cocode_principal}
                    onChange={handleInputChange}
                    label="COCODE Principal"
                  >
                    {cocodesPrincipales.map((cocode) => (
                      <MenuItem key={cocode.id} value={cocode.id}>
                        {cocode.nombre} - {cocode.zona_nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {formData.tipo_lider === 'subcocode' && (
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Sub-COCODE</InputLabel>
                  <Select
                    name="id_subcocode"
                    value={formData.id_subcocode}
                    onChange={handleInputChange}
                    label="Sub-COCODE"
                  >
                    {subCocodes.map((subcocode) => (
                      <MenuItem key={subcocode.id} value={subcocode.id}>
                        {subcocode.nombre} ({subcocode.sector}) - {subcocode.cocode_principal}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {/* Fechas del Período */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Período de Liderazgo
              </Typography>
              <Divider />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Fecha de Elección"
                name="fecha_eleccion"
                type="date"
                value={formData.fecha_eleccion}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Inicio del Período"
                name="periodo_inicio"
                type="date"
                value={formData.periodo_inicio}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Fin del Período"
                name="periodo_fin"
                type="date"
                value={formData.periodo_fin}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={cerrarModales}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : (isEditing ? 'Actualizar' : 'Crear')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Cambiar Contraseña */}
      <Dialog open={openPasswordModal} onClose={cerrarModales} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <LockIcon />
            Cambiar Contraseña - {editingLider?.nombre} {editingLider?.apellido}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nueva Contraseña *"
                name="nueva_contrasena"
                type="password"
                value={passwordData.nueva_contrasena}
                onChange={handlePasswordInputChange}
                required
                helperText="Mínimo 6 caracteres"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Confirmar Contraseña *"
                name="confirmar_contrasena"
                type="password"
                value={passwordData.confirmar_contrasena}
                onChange={handlePasswordInputChange}
                required
                error={passwordData.confirmar_contrasena && passwordData.nueva_contrasena !== passwordData.confirmar_contrasena}
                helperText={
                  passwordData.confirmar_contrasena && passwordData.nueva_contrasena !== passwordData.confirmar_contrasena
                    ? "Las contraseñas no coinciden"
                    : "Confirma la nueva contraseña"
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={cerrarModales}>
            Cancelar
          </Button>
          <Button
            onClick={handlePasswordSubmit}
            variant="contained"
            disabled={loading || !passwordData.nueva_contrasena || !passwordData.confirmar_contrasena}
          >
            {loading ? <CircularProgress size={20} /> : 'Cambiar Contraseña'}
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

export default GestionLideres;