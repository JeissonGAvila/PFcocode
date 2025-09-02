// frontend/src/components/lider/GaleriaFotos.jsx - COMPLETO CORREGIDO
import React, { useState } from 'react';
import {
  Box,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  IconButton,
  Dialog,
  DialogContent,
  Chip,
  Typography,
  Paper,
  Alert
} from '@mui/material';
import {
  ZoomIn as ZoomIcon,
  Close as CloseIcon,
  PhotoCamera as CameraIcon,
  BrokenImage as BrokenImageIcon
} from '@mui/icons-material';

const GaleriaFotos = ({ fotos = [], maxHeight = 200 }) => {
  const [open, setOpen] = useState(false);
  const [fotoSeleccionada, setFotoSeleccionada] = useState(null);
  const [erroresImagenes, setErroresImagenes] = useState({});

  if (!fotos || fotos.length === 0) {
    return (
      <Paper elevation={1} sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.50' }}>
        <CameraIcon sx={{ fontSize: 40, color: 'grey.400', mb: 1 }} />
        <Typography variant="body2" color="textSecondary">
          No hay fotos disponibles
        </Typography>
      </Paper>
    );
  }

  const handleErrorImagen = (fotoId) => {
    setErroresImagenes(prev => ({ ...prev, [fotoId]: true }));
  };

  const abrirModal = (foto) => {
    setFotoSeleccionada(foto);
    setOpen(true);
  };

  const cerrarModal = () => {
    setOpen(false);
    setFotoSeleccionada(null);
  };

  // Función para construir la URL correcta de la imagen
  const getImageUrl = (foto) => {
    if (!foto.url_archivo) {
      console.warn('Foto sin url_archivo:', foto);
      return '';
    }
    
    // Si la URL ya es completa (http://), usarla directamente
    if (foto.url_archivo.startsWith('http')) {
      return foto.url_archivo;
    }
    
    // Si es una ruta relativa, construir la URL completa
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? window.location.origin 
      : 'http://localhost:3001';
    
    // Asegurar que la ruta empiece con /
    const ruta = foto.url_archivo.startsWith('/') 
      ? foto.url_archivo 
      : `/${foto.url_archivo}`;
    
    const urlCompleta = `${baseUrl}${ruta}`;
    console.log('URL de imagen construida:', urlCompleta);
    return urlCompleta;
  };

  return (
    <Box>
      {/* Información de debug */}
      {process.env.NODE_ENV === 'development' && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="caption">
            Debug: {fotos.length} fotos encontradas. 
            URLs: {fotos.map(f => f.url_archivo).join(', ')}
          </Typography>
        </Alert>
      )}

      {/* Galería en miniatura */}
      <ImageList sx={{ maxHeight, overflow: 'auto' }} cols={3} gap={8}>
        {fotos.map((foto, index) => {
          const imageUrl = getImageUrl(foto);
          const tieneError = erroresImagenes[foto.id || index];
          const fotoId = foto.id || `foto-${index}`;
          
          return (
            <ImageListItem key={fotoId} sx={{ cursor: 'pointer' }}>
              {tieneError ? (
                <Box
                  sx={{
                    height: 80,
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'grey.100',
                    borderRadius: 1,
                    border: '1px dashed grey'
                  }}
                  onClick={() => abrirModal(foto)}
                >
                  <BrokenImageIcon color="error" />
                  <Typography variant="caption" sx={{ ml: 1 }}>
                    Error
                  </Typography>
                </Box>
              ) : (
                <img
                  src={imageUrl}
                  alt={`Evidencia ${index + 1}`}
                  loading="lazy"
                  style={{ 
                    height: 80, 
                    width: '100%', 
                    objectFit: 'cover',
                    borderRadius: 4
                  }}
                  onClick={() => abrirModal(foto)}
                  onError={() => {
                    console.error('Error cargando imagen:', imageUrl);
                    handleErrorImagen(fotoId);
                  }}
                  onLoad={() => console.log('Imagen cargada exitosamente:', imageUrl)}
                />
              )}
              <ImageListItemBar
                title={`Foto ${index + 1}`}
                subtitle={foto.tamano_kb ? `${foto.tamano_kb} KB` : ''}
                actionIcon={
                  <IconButton
                    sx={{ color: 'white' }}
                    onClick={() => abrirModal(foto)}
                    size="small"
                  >
                    <ZoomIcon />
                  </IconButton>
                }
              />
            </ImageListItem>
          );
        })}
      </ImageList>

      {/* Contador de fotos */}
      <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Chip 
          icon={<CameraIcon />}
          label={`${fotos.length} foto${fotos.length !== 1 ? 's' : ''}`}
          size="small"
          color="primary"
          variant="outlined"
        />
        <Typography variant="caption" color="textSecondary">
          Haz clic para ampliar
        </Typography>
      </Box>

      {/* Modal para vista ampliada */}
      <Dialog open={open} onClose={cerrarModal} maxWidth="lg" fullWidth>
        <DialogContent sx={{ position: 'relative', p: 0 }}>
          {fotoSeleccionada && (
            <>
              <IconButton
                onClick={cerrarModal}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: 'rgba(0,0,0,0.5)',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(0,0,0,0.7)'
                  }
                }}
              >
                <CloseIcon />
              </IconButton>
              
              <Box
                component="img"
                src={getImageUrl(fotoSeleccionada)}
                alt="Evidencia ampliada"
                sx={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '80vh',
                  objectFit: 'contain'
                }}
                onError={(e) => {
                  console.error('Error en modal con imagen:', getImageUrl(fotoSeleccionada));
                  e.target.style.display = 'none';
                }}
              />
              
              <ImageListItemBar
                title={fotoSeleccionada.nombre_archivo || `Foto ${fotos.indexOf(fotoSeleccionada) + 1}`}
                subtitle={
                  <Box>
                    <Typography variant="caption">
                      {fotoSeleccionada.tamano_kb && `Tamaño: ${fotoSeleccionada.tamano_kb} KB`}
                    </Typography>
                    <br />
                    <Typography variant="caption">
                      {fotoSeleccionada.fecha_subida && `Subido: ${new Date(fotoSeleccionada.fecha_subida).toLocaleDateString()}`}
                    </Typography>
                    <br />
                    <Typography variant="caption">
                      URL: {getImageUrl(fotoSeleccionada)}
                    </Typography>
                  </Box>
                }
                sx={{
                  background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)'
                }}
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default GaleriaFotos;