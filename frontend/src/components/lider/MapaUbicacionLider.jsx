// frontend/src/components/lider/MapaUbicacionLider.jsx - COMPLETO CORREGIDO CON DEBUG
import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Button
} from '@mui/material';
import {
  MyLocation as GPSIcon,
  OpenInNew as OpenIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

const MapaUbicacionLider = ({ latitud, longitud, metodo_ubicacion, precision_metros, height = 200 }) => {
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');

  // Convertir coordenadas a números (vienen como string desde la BD)
  const latNum = latitud ? parseFloat(latitud) : null;
  const lngNum = longitud ? parseFloat(longitud) : null;

  // Debug info
  useEffect(() => {
    const info = `
      Coordenadas recibidas: 
      - Latitud: ${latitud} (tipo: ${typeof latitud})
      - Longitud: ${longitud} (tipo: ${typeof longitud})
      - Convertidas: ${latNum}, ${lngNum}
      - Método: ${metodo_ubicacion}
      - Precisión: ${precision_metros}m
    `;
    setDebugInfo(info);
    console.log('Datos de ubicación recibidos:', {
      latitud,
      longitud, 
      metodo_ubicacion,
      precision_metros,
      latNum,
      lngNum
    });
  }, [latitud, longitud, metodo_ubicacion, precision_metros, latNum, lngNum]);

  useEffect(() => {
    if (!latNum || !lngNum) {
      setMapError('No hay ubicación GPS disponible');
      return;
    }

    const loadLeaflet = async () => {
      try {
        // Cargar Leaflet CSS si no existe
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        // Cargar Leaflet JS si no existe
        if (!window.L) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        // Configurar iconos
        delete window.L.Icon.Default.prototype._getIconUrl;
        window.L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });

        setMapLoaded(true);
      } catch (error) {
        console.error('Error cargando Leaflet:', error);
        setMapError('Error al cargar el mapa');
      }
    };

    loadLeaflet();
  }, [latNum, lngNum]);

  useEffect(() => {
    if (mapLoaded && latNum && lngNum && window.L && mapRef.current) {
      try {
        // Limpiar mapa existente
        if (mapRef.current._leaflet_id) {
          window.L.DomUtil.remove(mapRef.current);
          mapRef.current = document.createElement('div');
        }

        // Crear mapa
        const map = window.L.map(mapRef.current).setView([latNum, lngNum], 16);
        
        // Agregar capa de OpenStreetMap
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(map);

        // Agregar marcador
        const marker = window.L.marker([latNum, lngNum]).addTo(map);
        
        // Popup con información (CORREGIDO: usar números convertidos)
        const popupContent = `
          <div style="text-align: center; padding: 10px;">
            <strong>📍 Ubicación del Reporte</strong><br>
            <hr style="margin: 8px 0;">
            <small>Lat: ${latNum.toFixed(6)}</small><br>
            <small>Lng: ${lngNum.toFixed(6)}</small><br>
            <small>Método: ${metodo_ubicacion || 'GPS'}</small><br>
            ${precision_metros ? `<small>Precisión: ${Math.round(precision_metros)}m</small>` : ''}
            <hr style="margin: 8px 0;">
            <small><em>Coordenadas originales:</em></small><br>
            <small>${latitud}, ${longitud}</small>
          </div>
        `;
        
        marker.bindPopup(popupContent).openPopup();

        // Cleanup
        return () => {
          if (map) {
            map.remove();
          }
        };
      } catch (error) {
        console.error('Error inicializando mapa:', error);
        setMapError('Error al mostrar el mapa: ' + error.message);
      }
    }
  }, [mapLoaded, latNum, lngNum, metodo_ubicacion, precision_metros, latitud, longitud]);

  const handleRefresh = () => {
    setMapLoaded(false);
    setMapError('');
    setTimeout(() => {
      setMapLoaded(true);
    }, 100);
  };

  if (!latNum || !lngNum) {
    return (
      <Paper elevation={1} sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.50', height }}>
        <ErrorIcon sx={{ fontSize: 40, color: 'grey.400', mb: 1 }} />
        <Typography variant="body2" color="textSecondary">
          No hay ubicación GPS disponible
        </Typography>
        <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
          Lat: {latitud}, Lng: {longitud}
        </Typography>
        
        {process.env.NODE_ENV === 'development' && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="caption">
              Debug: {debugInfo}
            </Typography>
          </Alert>
        )}
      </Paper>
    );
  }

  if (mapError) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 1 }}>
          {mapError}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          size="small"
        >
          Reintentar
        </Button>
      </Box>
    );
  }

  const googleMapsUrl = `https://www.google.com/maps?q=${latNum},${lngNum}`;

  return (
    <Paper elevation={2} sx={{ overflow: 'hidden' }}>
      {/* Header del mapa */}
      <Box sx={{ p: 1, bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <GPSIcon fontSize="small" />
          <Typography variant="body2">
            Ubicación GPS
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Recargar mapa">
            <IconButton
              size="small"
              color="inherit"
              onClick={handleRefresh}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Abrir en Google Maps">
            <IconButton
              size="small"
              color="inherit"
              onClick={() => window.open(googleMapsUrl, '_blank')}
            >
              <OpenIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Mapa */}
      <Box 
        ref={mapRef} 
        sx={{ 
          width: '100%', 
          height: height - 40,
          minHeight: 160
        }} 
      />

      {/* Información de ubicación */}
      <Box sx={{ p: 1, bgcolor: 'grey.50', display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
        <Chip 
          label={`${latNum.toFixed(6)}, ${lngNum.toFixed(6)}`}
          size="small"
          color="primary"
          variant="outlined"
        />
        
        {metodo_ubicacion && (
          <Chip 
            label={`Método: ${metodo_ubicacion}`}
            size="small"
            variant="outlined"
          />
        )}
        
        {precision_metros && (
          <Chip 
            label={`Precisión: ${Math.round(precision_metros)}m`}
            size="small"
            variant="outlined"
          />
        )}
      </Box>

      {!mapLoaded && (
        <Box sx={{ 
          position: 'absolute', 
          top: 40, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          bgcolor: 'rgba(255,255,255,0.8)'
        }}>
          <CircularProgress size={24} />
          <Typography variant="body2" sx={{ ml: 1 }}>
            Cargando mapa...
          </Typography>
        </Box>
      )}

      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <Alert severity="info" sx={{ mt: 1 }}>
          <Typography variant="caption">
            {debugInfo}
          </Typography>
        </Alert>
      )}
    </Paper>
  );
};

export default MapaUbicacionLider;