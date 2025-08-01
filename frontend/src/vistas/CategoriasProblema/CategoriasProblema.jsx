import { useEffect, useState } from 'react';
import {
  Container, Typography, TextField, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Stack, Alert, Box,
  Select, MenuItem, FormControl, InputLabel, CircularProgress
} from '@mui/material';
import {
  Construction as ConstructionIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Nature as NatureIcon,
  LocalHospital as LocalHospitalIcon,
  School as SchoolIcon,
  Home as HomeIcon,
  Work as WorkIcon,
  Sports as SportsIcon,
  DirectionsCar as DirectionsCarIcon
} from '@mui/icons-material';
import { styles } from './CategoriasProblema.styles';

// Iconos disponibles para seleccionar
const iconosDisponibles = [
  { value: 'construction', label: 'Construcción', icon: <ConstructionIcon /> },
  { value: 'settings', label: 'Configuración', icon: <SettingsIcon /> },
  { value: 'shield', label: 'Seguridad', icon: <SecurityIcon /> },
  { value: 'leaf', label: 'Naturaleza', icon: <NatureIcon /> },
  { value: 'heart', label: 'Salud', icon: <LocalHospitalIcon /> },
  { value: 'book', label: 'Educación', icon: <SchoolIcon /> },
  { value: 'home', label: 'Hogar', icon: <HomeIcon /> },
  { value: 'work', label: 'Trabajo', icon: <WorkIcon /> },
  { value: 'sports', label: 'Deportes', icon: <SportsIcon /> },
  { value: 'car', label: 'Transporte', icon: <DirectionsCarIcon /> }
];

// Función para obtener el icono por su valor
const obtenerIcono = (iconValue) => {
  const iconData = iconosDisponibles.find(icon => icon.value === iconValue);
  return iconData ? iconData.icon : <HomeIcon />;
};

const CategoriasProblema = () => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [icono, setIcono] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [mensaje, setMensaje] = useState('');
  const [editId, setEditId] = useState(null);

  // Cargar categorías al montar el componente
  useEffect(() => {
    fetchCategorias();
  }, []);

  const fetchCategorias = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/categorias-problema');
      const data = await response.json();
      setCategorias(data);
      setLoading(false);
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      setMensaje('Error al obtener categorías de problema');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');

    if (!nombre.trim() || !descripcion.trim() || !icono) {
      setMensaje('Por favor completa todos los campos obligatorios.');
      return;
    }

    try {
      if (editId) {
        // Editar categoría existente
        const response = await fetch(`http://localhost:3001/api/categorias-problema/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre,
            descripcion,
            icono,
            color,
            usuario_modifica: 'admin'
          })
        });

        if (!response.ok) throw new Error('Error al actualizar');

        const actualizada = await response.json();
        setCategorias(categorias.map(cat => cat.id === editId ? actualizada : cat));
        setMensaje('¡Categoría actualizada exitosamente!');
        limpiarFormulario();
      } else {
        // Crear nueva categoría
        const response = await fetch('http://localhost:3001/api/categorias-problema', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre,
            descripcion,
            icono,
            color,
            usuario_ingreso: 'admin'
          })
        });

        if (!response.ok) throw new Error('Error al crear');

        const nueva = await response.json();
        setCategorias([...categorias, nueva]);
        setMensaje('¡Categoría creada exitosamente!');
        limpiarFormulario();
      }
    } catch (error) {
      console.error('Error:', error);
      setMensaje('Ocurrió un error al procesar la solicitud.');
    }
  };

  const handleEditar = (categoria) => {
    setEditId(categoria.id);
    setNombre(categoria.nombre);
    setDescripcion(categoria.descripcion);
    setIcono(categoria.icono || '');
    setColor(categoria.color || '#3B82F6');
    setMensaje('');
  };

  const handleDesactivar = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres desactivar esta categoría?')) {
      try {
        const response = await fetch(`http://localhost:3001/api/categorias-problema/${id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usuario_modifica: 'admin' })
        });

        if (!response.ok) throw new Error('Error al desactivar');

        setCategorias(categorias.filter(cat => cat.id !== id));
        setMensaje('Categoría desactivada exitosamente.');
      } catch (error) {
        console.error('Error:', error);
        setMensaje('Error al desactivar la categoría.');
      }
    }
  };

  const limpiarFormulario = () => {
    setEditId(null);
    setNombre('');
    setDescripcion('');
    setIcono('');
    setColor('#3B82F6');
  };

  const handleCancelar = () => {
    limpiarFormulario();
    setMensaje('');
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={styles.container}>
        <Box sx={styles.loadingContainer}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={styles.container}>
      <Typography variant="h4" sx={styles.titulo}>
        Categorías de Problema
      </Typography>

      {/* Formulario */}
      <Paper sx={styles.formPaper}>
        <form onSubmit={handleSubmit}>
          <Stack sx={styles.formStack}>
            {/* Primera fila: Campos principales */}
            <Box sx={styles.formRow}>
              <TextField
                label="Nombre *"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                sx={styles.textField}
                placeholder="Ej: Infraestructura"
              />
              
              <TextField
                label="Descripción *"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                required
                multiline
                rows={2}
                sx={styles.descriptionField}
                placeholder="Describe el tipo de problemas que abarca esta categoría"
              />
            </Box>

            {/* Segunda fila: Icono, Color y Botones */}
            <Box sx={styles.formRow}>
              <FormControl sx={styles.iconSelect}>
                <InputLabel>Icono *</InputLabel>
                <Select
                  value={icono}
                  onChange={(e) => setIcono(e.target.value)}
                  label="Icono *"
                  required
                >
                  {iconosDisponibles.map((iconItem) => (
                    <MenuItem key={iconItem.value} value={iconItem.value}>
                      <Box sx={styles.iconOption}>
                        {iconItem.icon}
                        <span>{iconItem.label}</span>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box sx={styles.colorContainer}>
                <Typography variant="body2" fontWeight="medium" color="text.secondary">
                  Color *
                </Typography>
                <Box sx={styles.colorField}>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    title="Selecciona un color para la categoría"
                  />
                </Box>
              </Box>

              <Box sx={styles.buttonContainer}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  size="large"
                  sx={styles.submitButton}
                >
                  {editId ? 'Actualizar' : 'Crear Categoría'}
                </Button>

                {editId && (
                  <Button 
                    variant="outlined" 
                    color="secondary" 
                    onClick={handleCancelar}
                    size="large"
                    sx={styles.cancelButton}
                  >
                    Cancelar
                  </Button>
                )}
              </Box>
            </Box>
          </Stack>
        </form>

        {mensaje && (
          <Alert 
            severity={mensaje.startsWith('¡') ? 'success' : 'error'} 
            sx={styles.alert}
          >
            {mensaje}
          </Alert>
        )}
      </Paper>

      {/* Tabla */}
      <TableContainer component={Paper} sx={styles.tablePaper}>
        <Table sx={styles.table}>
          <TableHead sx={styles.tableHead}>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Icono</TableCell>
              <TableCell>Color</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categorias.map((categoria) => (
              <TableRow key={categoria.id} hover>
                <TableCell sx={styles.tableCell}>
                  {categoria.id}
                </TableCell>
                <TableCell sx={styles.tableCell}>
                  <strong>{categoria.nombre}</strong>
                </TableCell>
                <TableCell sx={styles.tableCell}>
                  {categoria.descripcion}
                </TableCell>
                <TableCell sx={styles.tableCell}>
                  <Box sx={styles.iconCell}>
                    {obtenerIcono(categoria.icono)}
                    <Typography variant="caption">
                      {categoria.icono}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell sx={styles.tableCell}>
                  <Box sx={styles.colorCell}>
                    <Box 
                      sx={{
                        ...styles.colorChip,
                        backgroundColor: categoria.color
                      }}
                    />
                    <Typography variant="caption">
                      {categoria.color}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="center" sx={styles.tableCell}>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    onClick={() => handleEditar(categoria)}
                    sx={styles.actionButton}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleDesactivar(categoria.id)}
                    sx={styles.actionButton}
                  >
                    Desactivar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {categorias.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} sx={styles.emptyTableMessage}>
                  No hay categorías de problema registradas.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default CategoriasProblema;