import { useEffect, useState } from 'react';
import {
  Container, Typography, TextField, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Stack, Alert
} from '@mui/material';

function App() {
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3001/api/tipos-problema')
      .then(res => res.json())
      .then(data => {
        setTipos(data);
        setLoading(false);
      })
      .catch(err => {
        setMensaje('Error al obtener tipos de problema');
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    if (!nombre.trim() || !descripcion.trim()) {
      setMensaje('Por favor llena todos los campos.');
      return;
    }
    if (editId) {
      // Editar
      try {
        const res = await fetch(`http://localhost:3001/api/tipos-problema/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre,
            descripcion,
            usuario_modifica: 'admin'
          })
        });
        if (!res.ok) throw new Error();
        const actualizado = await res.json();
        setTipos(tipos.map(t => t.id === editId ? actualizado : t));
        setMensaje('¡Tipo de problema editado!');
        setEditId(null);
        setNombre('');
        setDescripcion('');
      } catch {
        setMensaje('Ocurrió un error al editar el tipo de problema.');
      }
    } else {
      // Crear
      try {
        const res = await fetch('http://localhost:3001/api/tipos-problema', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre,
            descripcion,
            usuario_ingreso: 'admin'
          })
        });
        if (!res.ok) throw new Error();
        const nuevo = await res.json();
        setTipos([...tipos, nuevo]);
        setNombre('');
        setDescripcion('');
        setMensaje('¡Tipo de problema creado!');
      } catch {
        setMensaje('Ocurrió un error al crear el tipo de problema.');
      }
    }
  };

  const handleDesactivar = async (id) => {
    if (window.confirm('¿Seguro que quieres desactivar este tipo de problema?')) {
      try {
        const res = await fetch(`http://localhost:3001/api/tipos-problema/${id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usuario_modifica: 'admin' })
        });
        if (!res.ok) throw new Error();
        setTipos(tipos.filter(t => t.id !== id));
      } catch {
        setMensaje('Ocurrió un error al desactivar el tipo de problema.');
      }
    }
  };

  const handleEditar = (tipo) => {
    setEditId(tipo.id);
    setNombre(tipo.nombre);
    setDescripcion(tipo.descripcion);
    setMensaje('');
  };

  const handleCancelar = () => {
    setEditId(null);
    setNombre('');
    setDescripcion('');
    setMensaje('');
  };

  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Typography variant="h3" align="center" gutterBottom>
        Tipos de Problema
      </Typography>
      <Paper sx={{ p: 3, mb: 4 }}>
        <form onSubmit={handleSubmit}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <TextField
              label="Nombre"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              required
            />
            <TextField
              label="Descripción"
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              required
            />
            <Button type="submit" variant="contained" color="primary">
              {editId ? 'Guardar cambios' : 'Agregar'}
            </Button>
            {editId && (
              <Button variant="outlined" color="secondary" onClick={handleCancelar}>
                Cancelar
              </Button>
            )}
          </Stack>
        </form>
        {mensaje && (
          <Alert severity={mensaje.startsWith('¡') ? 'success' : 'error'} sx={{ mt: 2 }}>
            {mensaje}
          </Alert>
        )}
      </Paper>
      {loading ? (
        <Typography>Cargando...</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><b>Nombre</b></TableCell>
                <TableCell><b>Descripción</b></TableCell>
                <TableCell align="center"><b>Acciones</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tipos.map(tipo => (
                <TableRow key={tipo.id}>
                  <TableCell>{tipo.nombre}</TableCell>
                  <TableCell>{tipo.descripcion}</TableCell>
                  <TableCell align="center">
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      onClick={() => handleEditar(tipo)}
                      sx={{ mr: 1 }}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleDesactivar(tipo.id)}
                    >
                      Desactivar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {tipos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    No hay tipos de problema registrados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}

export default App;