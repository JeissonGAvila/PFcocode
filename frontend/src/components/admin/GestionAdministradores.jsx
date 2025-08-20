// frontend/src/components/admin/GestionAdministradores.jsx
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
  Divider,
  FormControlLabel,
  Switch
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Lock as LockIcon,
  Refresh as RefreshIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import administradoresService, { tiposUsuarioDisponibles, rolesDisponibles, departamentosDisponibles } from '../../services/admin/administradoresService.js';

const GestionAdministradores = () => {
  // Estados principales
  const [administradores, setAdministradores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados para modales
  const [openModal, setOpenModal] = useState(false);
  const [openPasswordModal, setOpenPasswordModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Estados para formularios
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    contrasena: '',
    telefono: '',
    tipo_usuario: '',
    rol: '',
    departamento: '',
    puede_asignar: false,
    zonas_responsabilidad: ''
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
      
      const response = await administradoresService.getAll();
      
      if (response.success) {
        setAdministradores(response.administradores);
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
      tipo_usuario: '',
      rol: '',
      departamento: '',
      puede_asignar: false,
      zonas_responsabilidad: ''
    });
    setEditingAdmin(null);
    setIsEditing(false);
    setOpenModal(true);
  };

  const abrirModalEditar = (admin) => {
    setFormData({
      nombre: admin.nombre || '',
      apellido: admin.apellido || '',
      correo: admin.correo || '',
      contrasena: '', // No mostrar contraseña existente
      telefono: admin.telefono || '',
      tipo_usuario: admin.tipo_usuario || '',
      rol: admin.rol || '',
      departamento: admin.departamento || '',
      puede_asignar: admin.puede_asignar || false,
      zonas_responsabilidad: admin.zonas_responsabilidad || ''
    });
    setEditingAdmin(admin);
    setIsEditing(true);
    setOpenModal(true);
  };

  const abrirModalPassword = (admin) => {
    setEditingAdmin(admin);
    setPasswordData({
      nueva_contrasena: '',
      confirmar_contrasena: ''
    });
    setOpenPasswordModal(true);
  };

  const cerrarModales = () => {
    setOpenModal(false);
    setOpenPasswordModal(false);
    setEditingAdmin(null);
    setIsEditing(false);
    setFormData({
      nombre: '',
      apellido: '',
      correo: '',
      contrasena: '',
      telefono: '',
      tipo_usuario: '',
      rol: '',
      departamento: '',
      puede_asignar: false,
      zonas_responsabilidad: ''
    });
    setPasswordData({
      nueva_contrasena: '',
      confirmar_contrasena: ''
    });
  };

  // Funciones de formulario
  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
      if (!formData.nombre || !formData.apellido || !formData.correo || !formData.tipo_usuario) {
        mostrarSnackbar('Por favor completa todos los campos requeridos', 'error');
        return;
      }

      if (!isEditing && !formData.contrasena) {
        mostrarSnackbar('La contraseña es requerida para nuevos administradores', 'error');
        return;
      }

      if (formData.contrasena && formData.contrasena.length < 6) {
        mostrarSnackbar('La contraseña debe tener al menos 6 caracteres', 'error');
        return;
      }

      setLoading(true);

      if (isEditing) {
        await administradoresService.update(editingAdmin.id, formData);
        mostrarSnackbar('Administrador actualizado exitosamente', 'success');
      } else {
        await administradoresService.create(formData);
        mostrarSnackbar('Administrador creado exitosamente', 'success');
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
      await administradoresService.updatePassword(editingAdmin.id, passwordData.nueva_contrasena);
      mostrarSnackbar('Contraseña actualizada exitosamente', 'success');
      cerrarModales();

    } catch (error) {
      mostrarSnackbar(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (admin) => {
    if (window.confirm(`¿Estás seguro de desactivar al administrador ${admin.nombre} ${admin.apellido}?`)) {
      try {
        setLoading(true);
        await administradoresService.delete(admin.id);
        mostrarSnackbar('Administrador desactivado exitosamente', 'success');
        cargarDatos();
      } catch (error) {
        mostrarSnackbar(error.message, 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  // Funciones auxiliares
  const getTipoUsuarioColor = (tipo) => {
    switch (tipo) {
      case 'administrador': return 'primary';
      case 'tecnico': return 'secondary';
      default: return 'default';
    }
  };

  const getTipoUsuarioLabel = (tipo) => {
    const tipoObj = tiposUsuarioDisponibles.find(t => t.value === tipo);
    return tipoObj ? tipoObj.label : tipo;
  };

  if (loading && administradores.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Cargando administradores...
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
          👑 Gestión de Administradores ({administradores.length} total)
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
            Agregar Administrador
          </Button>
        </Box>
      </Box>

      {/* Alerta informativa */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Funcionalidades:</strong> Crear, editar y desactivar administradores del sistema. Cambiar contraseñas y gestionar permisos de asignación.
        </Typography>
      </Alert>

      {/* Tabla de administradores */}
      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'grey.100' }}>
              <TableCell><strong>Nombre</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Tipo de Usuario</strong></TableCell>
              <TableCell><strong>Rol</strong></TableCell>
              <TableCell><strong>Departamento</strong></TableCell>
              <TableCell><strong>Permisos</strong></TableCell>
              <TableCell><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {administradores.map((admin) => (
              <TableRow key={admin.id} hover>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {admin.nombre} {admin.apellido}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {admin.telefono || 'Sin teléfono'}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {admin.correo}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getTipoUsuarioLabel(admin.tipo_usuario)}
                    color={getTipoUsuarioColor(admin.tipo_usuario)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {admin.rol || 'No especificado'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {admin.departamento || 'Sin departamento'}
                  </Typography>
                  {admin.zonas_responsabilidad && (
                    <Typography variant="caption" color="textSecondary" display="block">
                      Zonas: {admin.zonas_responsabilidad}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {admin.puede_asignar && (
                    <Chip
                      label="Puede Asignar"
                      color="success"
                      size="small"
                      variant="outlined"
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    <Tooltip title="Editar administrador">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => abrirModalEditar(admin)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Cambiar contraseña">
                      <IconButton
                        size="small"
                        color="warning"
                        onClick={() => abrirModalPassword(admin)}
                      >
                        <LockIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Desactivar administrador">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(admin)}
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

      {/* Modal Crear/Editar Administrador */}
      <Dialog open={openModal} onClose={cerrarModales} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <AdminIcon />
            {isEditing ? 'Editar Administrador' : 'Crear Nuevo Administrador'}
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
            
            {!isEditing && (
              <Grid item xs={12}>
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

            {/* Información del Sistema */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Información del Sistema
              </Typography>
              <Divider />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Tipo de Usuario</InputLabel>
                <Select
                  name="tipo_usuario"
                  value={formData.tipo_usuario}
                  onChange={handleInputChange}
                  label="Tipo de Usuario"
                >
                  {tiposUsuarioDisponibles.map((tipo) => (
                    <MenuItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Rol</InputLabel>
                <Select
                  name="rol"
                  value={formData.rol}
                  onChange={handleInputChange}
                  label="Rol"
                >
                  {rolesDisponibles.map((rol) => (
                    <MenuItem key={rol} value={rol}>
                      {rol}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Departamento</InputLabel>
                <Select
                  name="departamento"
                  value={formData.departamento}
                  onChange={handleInputChange}
                  label="Departamento"
                >
                  {departamentosDisponibles.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Zonas de Responsabilidad"
                name="zonas_responsabilidad"
                value={formData.zonas_responsabilidad}
                onChange={handleInputChange}
                placeholder="Ej: Zona 1, Zona 2"
                helperText="Separar múltiples zonas con comas"
              />
            </Grid>

            {/* Permisos */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Permisos
              </Typography>
              <Divider />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    name="puede_asignar"
                    checked={formData.puede_asignar}
                    onChange={handleInputChange}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      Puede Asignar Reportes
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Permitir que este usuario asigne reportes a técnicos
                    </Typography>
                  </Box>
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
            Cambiar Contraseña - {editingAdmin?.nombre} {editingAdmin?.apellido}
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

export default GestionAdministradores;