import { useEffect, useState } from 'react';
import {
  Container, Typography, TextField, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Stack, Alert, Box,
  CircularProgress, Switch, FormControlLabel, Chip
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon
} from '@mui/icons-material';
import { styles } from './EstadosReporte.styles';

const EstadosReporte = () => {
  const [estados, setEstados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [orden, setOrden] = useState('');
  const [esFinal, setEsFinal] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [editId, setEditId] = useState(null);

  // Cargar estados al montar el componente
  useEffect(() => {
    fetchEstados();
  }, []);

  const fetchEstados = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/estados-reporte');
      const data = await response.json();
      setEstados(data);
      setLoading(false);
    } catch (error) {
      console.error('Error al obtener estados:', error);
      setMensaje('Error al obtener estados de reporte');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');

    if (!nombre.trim() || !descripcion.trim() || !orden.trim()) {
      setMensaje('Por favor completa todos los campos obligatorios.');
      return;
    }

    const ordenNumber = parseInt(orden);
    if (isNaN(ordenNumber) || ordenNumber <= 0) {
      setMensaje('El orden debe ser un número positivo.');
      return;
    }

    try {
      if (editId) {
        // Editar estado existente
        const response = await fetch(`http://localhost:3001/api/estados-reporte/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre,
            descripcion,
            color,
            orden: ordenNumber,
            es_final: esFinal,
            usuario_modifica: 'admin'
          })
        });

        if (!response.ok) throw new Error('Error al actualizar');

        const actualizado = await response.json();
        setEstados(estados.map(est => est.id === editId ? actualizado : est).sort((a, b) => a.orden - b.orden));
        setMensaje('¡Estado actualizado exitosamente!');
        limpiarFormulario();
      } else {
        // Crear nuevo estado
        const response = await fetch('http://localhost:3001/api/estados-reporte', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre,
            descripcion,
            color,
            orden: ordenNumber,
            es_final: esFinal,
            usuario_ingreso: 'admin'
          })
        });

        if (!response.ok) throw new Error('Error al crear');

        const nuevo = await response.json();
        setEstados([...estados, nuevo].sort((a, b) => a.orden - b.orden));
        setMensaje('¡Estado creado exitosamente!');
        limpiarFormulario();
      }
    } catch (error) {
      console.error('Error:', error);
      setMensaje('Ocurrió un error al procesar la solicitud.');
    }
  };

  const handleEditar = (estado) => {
    setEditId(estado.id);
    setNombre(estado.nombre);
    setDescripcion(estado.descripcion);
    setColor(estado.color || '#3B82F6');
    setOrden(estado.orden?.toString() || '');
    setEsFinal(estado.es_final || false);
    setMensaje('');
  };

  const handleDesactivar = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres desactivar este estado?')) {
      try {
        const response = await fetch(`http://localhost:3001/api/estados-reporte/${id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usuario_modifica: 'admin' })
        });

        if (!response.ok) throw new Error('Error al desactivar');

        setEstados(estados.filter(est => est.id !== id));
        setMensaje('Estado desactivado exitosamente.');
      } catch (error) {
        console.error('Error:', error);
        setMensaje('Error al desactivar el estado.');
      }
    }
  };

  const limpiarFormulario = () => {
    setEditId(null);
    setNombre('');
    setDescripcion('');
    setColor('#3B82F6');
    setOrden('');
    setEsFinal(false);
  };

  const handleCancelar = () => {
    limpiarFormulario();
    setMensaje('');
  };

  // Función para obtener el siguiente orden disponible
  const getSiguienteOrden = () => {
    if (estados.length === 0) return 1;
    const maxOrden = Math.max(...estados.map(e => e.orden || 0));
    return maxOrden + 1;
  };

  // Auto-llenar orden si está vacío
  useEffect(() => {
    if (!editId && orden === '') {
      setOrden(getSiguienteOrden().toString());
    }
  }, [estados, editId, orden]);

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
        Estados de Reporte
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
                placeholder="Ej: En Proceso"
              />
              
              <TextField
                label="Descripción *"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                required
                multiline
                rows={2}
                sx={styles.descriptionField}
                placeholder="Describe qué significa este estado en el flujo de trabajo"
              />

              <TextField
                label="Orden *"
                type="number"
                value={orden}
                onChange={(e) => setOrden(e.target.value)}
                required
                sx={styles.numberField}
                placeholder="1"
                inputProps={{ min: 1, step: 1 }}
              />
            </Box>

            {/* Segunda fila: Color, Estado Final y Botones */}
            <Box sx={styles.formRow}>
              <Box sx={styles.colorContainer}>
                <Typography variant="body2" fontWeight="medium" color="text.secondary">
                  Color *
                </Typography>
                <Box sx={styles.colorField}>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    title="Selecciona un color para el estado"
                  />
                </Box>
              </Box>

              <Box sx={styles.switchContainer}>
                <Typography variant="body2" fontWeight="medium" color="text.secondary">
                  Estado Final
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={esFinal}
                      onChange={(e) => setEsFinal(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={esFinal ? 'Sí' : 'No'}
                  sx={styles.switchField}
                />
              </Box>

              <Box sx={styles.buttonContainer}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  size="large"
                  sx={styles.submitButton}
                >
                  {editId ? 'Actualizar' : 'Crear Estado'}
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
              <TableCell>Orden</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Color</TableCell>
              <TableCell align="center">Estado Final</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {estados.map((estado) => (
              <TableRow key={estado.id} hover>
                <TableCell sx={styles.tableCell}>
                  <Box sx={styles.ordenCell}>
                    <Box sx={styles.ordenBadge}>
                      {estado.orden}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell sx={styles.tableCell}>
                  <strong>{estado.nombre}</strong>
                </TableCell>
                <TableCell sx={styles.tableCell}>
                  {estado.descripcion}
                </TableCell>
                <TableCell sx={styles.tableCell}>
                  <Box sx={styles.colorCell}>
                    <Box 
                      sx={{
                        ...styles.colorChip,
                        backgroundColor: estado.color
                      }}
                    />
                    <Typography variant="caption">
                      {estado.color}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="center" sx={styles.tableCell}>
                  <Box sx={styles.estadoFinalCell}>
                    <Chip
                      icon={estado.es_final ? <CheckCircleIcon /> : <RadioButtonUncheckedIcon />}
                      label={estado.es_final ? 'Final' : 'Proceso'}
                      color={estado.es_final ? 'success' : 'default'}
                      variant={estado.es_final ? 'filled' : 'outlined'}
                      sx={styles.estadoFinalChip}
                    />
                  </Box>
                </TableCell>
                <TableCell align="center" sx={styles.tableCell}>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    onClick={() => handleEditar(estado)}
                    sx={styles.actionButton}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleDesactivar(estado.id)}
                    sx={styles.actionButton}
                  >
                    Desactivar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {estados.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} sx={styles.emptyTableMessage}>
                  No hay estados de reporte registrados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default EstadosReporte;