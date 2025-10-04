// frontend/src/components/admin/GestionLideres.jsx - VERSIÓN FINAL SIMPLIFICADA
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Chip, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, FormControl, InputLabel,
  Select, MenuItem, Grid, Alert, Snackbar, CircularProgress, Tooltip, Divider
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Lock as LockIcon,
  Refresh as RefreshIcon, Group as GroupIcon
} from '@mui/icons-material';
import lideresService from '../../services/admin/lideresService.js';

const GestionLideres = () => {
  const [lideres, setLideres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cocodesPrincipales, setCocodesPrincipales] = useState([]);
  const [subCocodes, setSubCocodes] = useState([]);
  const [subCocodesFiltered, setSubCocodesFiltered] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [openPasswordModal, setOpenPasswordModal] = useState(false);
  const [editingLider, setEditingLider] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '', apellido: '', correo: '', contrasena: '', telefono: '', dpi: '',
    id_cocode_principal: '', // Solo para filtrar, NO se envía al backend
    id_subcocode: '' // Este SÍ se guarda
  });
  const [passwordData, setPasswordData] = useState({ nueva_contrasena: '', confirmar_contrasena: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => { cargarDatos(); }, []);

  useEffect(() => {
    if (formData.id_cocode_principal) {
      const filtered = subCocodes.filter(sub => sub.cocode_principal_id === parseInt(formData.id_cocode_principal));
      setSubCocodesFiltered(filtered);
      if (formData.id_subcocode && !filtered.find(s => s.id === formData.id_subcocode)) {
        setFormData(prev => ({ ...prev, id_subcocode: '' }));
      }
    } else {
      setSubCocodesFiltered([]);
    }
  }, [formData.id_cocode_principal, subCocodes]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError('');
      const [lideresResponse, datosResponse] = await Promise.all([
        lideresService.getAll(),
        lideresService.getDatosSelect()
      ]);
      if (lideresResponse.success) setLideres(lideresResponse.lideres);
      if (datosResponse.success) {
        setCocodesPrincipales(datosResponse.cocode_principales);
        setSubCocodes(datosResponse.sub_cocode);
      }
    } catch (error) {
      setError(error.message);
      mostrarSnackbar('Error al cargar datos: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const mostrarSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const abrirModalCrear = () => {
    setFormData({ nombre: '', apellido: '', correo: '', contrasena: '', telefono: '', dpi: '', id_cocode_principal: '', id_subcocode: '' });
    setSubCocodesFiltered([]);
    setEditingLider(null);
    setIsEditing(false);
    setOpenModal(true);
  };

  const abrirModalEditar = (lider) => {
    // Encontrar el COCODE del subcocode para pre-llenar el filtro
    const subcocode = subCocodes.find(s => s.id === lider.id_subcocode);
    setFormData({
      nombre: lider.nombre || '', apellido: lider.apellido || '', correo: lider.correo || '',
      contrasena: '', telefono: lider.telefono || '', dpi: lider.dpi || '',
      id_cocode_principal: subcocode?.cocode_principal_id || '',
      id_subcocode: lider.id_subcocode || ''
    });
    setEditingLider(lider);
    setIsEditing(true);
    setOpenModal(true);
  };

  const abrirModalPassword = (lider) => {
    setEditingLider(lider);
    setPasswordData({ nueva_contrasena: '', confirmar_contrasena: '' });
    setOpenPasswordModal(true);
  };

  const cerrarModales = () => {
    setOpenModal(false);
    setOpenPasswordModal(false);
    setEditingLider(null);
    setIsEditing(false);
    setSubCocodesFiltered([]);
    setFormData({ nombre: '', apellido: '', correo: '', contrasena: '', telefono: '', dpi: '', id_cocode_principal: '', id_subcocode: '' });
    setPasswordData({ nueva_contrasena: '', confirmar_contrasena: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'id_cocode_principal') {
      setFormData(prev => ({ ...prev, [name]: value, id_subcocode: '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.nombre || !formData.apellido || !formData.correo) {
        mostrarSnackbar('Nombre, apellido y correo son requeridos', 'error');
        return;
      }
      if (!isEditing && !formData.contrasena) {
        mostrarSnackbar('La contraseña es requerida', 'error');
        return;
      }
      if (formData.contrasena && formData.contrasena.length < 6) {
        mostrarSnackbar('La contraseña debe tener al menos 6 caracteres', 'error');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
        mostrarSnackbar('Formato de correo inválido', 'error');
        return;
      }
      if (!formData.id_subcocode) {
        mostrarSnackbar('Debe seleccionar un Sub-COCODE (sector)', 'error');
        return;
      }

      setLoading(true);

      // IMPORTANTE: Solo enviar id_subcocode, NO enviar id_cocode_principal
      const dataToSend = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        correo: formData.correo,
        telefono: formData.telefono || null,
        dpi: formData.dpi || null,
        id_subcocode: formData.id_subcocode // Solo este campo
      };

      if (!isEditing) {
        dataToSend.contrasena = formData.contrasena;
      }

      if (isEditing) {
        await lideresService.update(editingLider.id, dataToSend);
        mostrarSnackbar('Líder actualizado exitosamente', 'success');
      } else {
        await lideresService.create(dataToSend);
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
        mostrarSnackbar('Complete ambos campos', 'error');
        return;
      }
      if (passwordData.nueva_contrasena !== passwordData.confirmar_contrasena) {
        mostrarSnackbar('Las contraseñas no coinciden', 'error');
        return;
      }
      if (passwordData.nueva_contrasena.length < 6) {
        mostrarSnackbar('Mínimo 6 caracteres', 'error');
        return;
      }
      setLoading(true);
      await lideresService.updatePassword(editingLider.id, passwordData.nueva_contrasena);
      mostrarSnackbar('Contraseña actualizada', 'success');
      cerrarModales();
    } catch (error) {
      mostrarSnackbar(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (lider) => {
    if (window.confirm(`¿Desactivar a ${lider.nombre} ${lider.apellido}?`)) {
      try {
        setLoading(true);
        await lideresService.delete(lider.id);
        mostrarSnackbar('Líder desactivado', 'success');
        cargarDatos();
      } catch (error) {
        mostrarSnackbar(error.message, 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading && lideres.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>Cargando...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold">
          Gestión de Líderes de Sector ({lideres.length})
        </Typography>
        <Box display="flex" gap={2}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={cargarDatos} disabled={loading}>
            Actualizar
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={abrirModalCrear} disabled={loading}>
            Agregar Líder
          </Button>
        </Box>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Cada líder está asignado a un sector específico (Sub-COCODE) y aprueba reportes de ese sector.
      </Alert>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'grey.100' }}>
              <TableCell><strong>Nombre</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Sector Asignado</strong></TableCell>
              <TableCell><strong>COCODE</strong></TableCell>
              <TableCell><strong>Zona</strong></TableCell>
              <TableCell><strong>Teléfono</strong></TableCell>
              <TableCell><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lideres.map((lider) => (
              <TableRow key={lider.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {lider.nombre} {lider.apellido}
                  </Typography>
                  {lider.dpi && (
                    <Typography variant="caption" color="textSecondary">DPI: {lider.dpi}</Typography>
                  )}
                </TableCell>
                <TableCell>{lider.correo}</TableCell>
                <TableCell>
                  <Chip
                    label={lider.subcocode_nombre ? `${lider.subcocode_nombre} (${lider.subcocode_sector})` : 'Sin asignar'}
                    color="primary"
                    size="small"
                  />
                </TableCell>
                <TableCell>{lider.subcocode_cocode_principal || 'N/A'}</TableCell>
                <TableCell>{lider.zona_nombre || 'N/A'}</TableCell>
                <TableCell>{lider.telefono || 'N/A'}</TableCell>
                <TableCell>
                  <Box display="flex" gap={1}>
                    <Tooltip title="Editar">
                      <IconButton size="small" color="primary" onClick={() => abrirModalEditar(lider)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Cambiar contraseña">
                      <IconButton size="small" color="warning" onClick={() => abrirModalPassword(lider)}>
                        <LockIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Desactivar">
                      <IconButton size="small" color="error" onClick={() => handleDelete(lider)}>
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

      {/* Modal Crear/Editar */}
      <Dialog open={openModal} onClose={cerrarModales} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <GroupIcon />
            {isEditing ? 'Editar Líder de Sector' : 'Crear Líder de Sector'}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}><Typography variant="subtitle1" fontWeight="bold">Información Personal</Typography><Divider /></Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Nombre *" name="nombre" value={formData.nombre} onChange={handleInputChange} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Apellido *" name="apellido" value={formData.apellido} onChange={handleInputChange} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Correo *" name="correo" type="email" value={formData.correo} onChange={handleInputChange} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Teléfono" name="telefono" value={formData.telefono} onChange={handleInputChange} placeholder="7712-3456" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="DPI" name="dpi" value={formData.dpi} onChange={handleInputChange} placeholder="1234567890101" inputProps={{ maxLength: 13 }} />
            </Grid>
            {!isEditing && (
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Contraseña *" name="contrasena" type="password" value={formData.contrasena} onChange={handleInputChange} required helperText="Mínimo 6 caracteres" />
              </Grid>
            )}
            <Grid item xs={12} sx={{ mt: 2 }}><Typography variant="subtitle1" fontWeight="bold">Asignación de Sector</Typography><Divider /></Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>COCODE (para filtrar)</InputLabel>
                <Select name="id_cocode_principal" value={formData.id_cocode_principal} onChange={handleInputChange} label="COCODE (para filtrar)">
                  <MenuItem value=""><em>Seleccione COCODE</em></MenuItem>
                  {cocodesPrincipales.map(c => (
                    <MenuItem key={c.id} value={c.id}>{c.nombre} - {c.zona_nombre}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required disabled={!formData.id_cocode_principal || subCocodesFiltered.length === 0}>
                <InputLabel>Sub-COCODE / Sector *</InputLabel>
                <Select name="id_subcocode" value={formData.id_subcocode} onChange={handleInputChange} label="Sub-COCODE / Sector *">
                  <MenuItem value=""><em>Seleccione sector</em></MenuItem>
                  {subCocodesFiltered.map(s => (
                    <MenuItem key={s.id} value={s.id}>{s.nombre} ({s.sector})</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                {!formData.id_cocode_principal ? 'Primero selecciona un COCODE' : subCocodesFiltered.length === 0 ? 'Sin sectores disponibles' : 'Sector específico del líder'}
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={cerrarModales}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : (isEditing ? 'Actualizar' : 'Crear')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Contraseña */}
      <Dialog open={openPasswordModal} onClose={cerrarModales} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <LockIcon />Cambiar Contraseña
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Nueva Contraseña *" name="nueva_contrasena" type="password" value={passwordData.nueva_contrasena} onChange={(e) => setPasswordData(prev => ({ ...prev, nueva_contrasena: e.target.value }))} helperText="Mínimo 6 caracteres" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Confirmar *" name="confirmar_contrasena" type="password" value={passwordData.confirmar_contrasena} onChange={(e) => setPasswordData(prev => ({ ...prev, confirmar_contrasena: e.target.value }))} error={passwordData.confirmar_contrasena && passwordData.nueva_contrasena !== passwordData.confirmar_contrasena} helperText={passwordData.confirmar_contrasena && passwordData.nueva_contrasena !== passwordData.confirmar_contrasena ? "No coinciden" : ""} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={cerrarModales}>Cancelar</Button>
          <Button onClick={handlePasswordSubmit} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Cambiar'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default GestionLideres;