// frontend/src/components/admin/MapaUbicacionAdmin.jsx - Adaptado del líder para admin
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
  Refresh as RefreshIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';

const MapaUbicacionAdmin = ({ 
  latitud, 
  longitud, 
  metodo_ubicacion, 
  precision_metros, 
  direccion,
  height = 300,
  titulo = "Ubicación del Reporte" 
}) => {
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState('');
  
  // Convertir coordenadas a números (pueden venir como string desde BD)
  const latNum = latitud ? parseFloat(latitud) : null;
  const lngNum = longitud ? parseFloat(longitud) : null;

  useEffect(() => {
    if (!latNum || !lngNum) {
      setMapError('No hay ubicación GPS disponible');
      return;
    }

    const loadLeaflet = async () => {
      try {
        // Cargar Leaflet CSS
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
        }

        // Cargar Leaflet JS
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
        console.error('Error cargando Leaflet en admin:', error);
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
          mapRef.current.style.height = '100%';
          mapRef.current.style.width = '100%';
        }

        // Crear mapa
        const map = window.L.map(mapRef.current).setView([latNum, lngNum], 16);
        
        // Agregar capa de OpenStreetMap
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(map);

        // Crear marcador especial para administrador
        const adminIcon = window.L.divIcon({
          className: 'admin-marker',
          html: `
            <div style="
              width: 25px; 
              height: 25px; 
              border-radius: 50%; 
              background: #1976d2; 
              border: 3px solid white; 
              box-shadow: 0 0 15px rgba(25, 118, 210, 0.6);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 12px;
            ">
              R
            </div>
          `,
          iconSize: [25, 25],
          iconAnchor: [12, 12]
        });

        const marker = window.L.marker([latNum, lngNum], { icon: adminIcon }).addTo(map);
        
        // Popup con información completa para admin
        const popupContent = `
          <div style="text-align: center; padding: 12px; min-width: 200px;">
            <strong style="color: #1976d2;">📍 Ubicación del Reporte</strong><br>
            <hr style="margin: 10px 0;">
            <div style="text-align: left;">
              <strong>Coordenadas:</strong><br>
              <small>Lat: ${latNum.toFixed(6)}</small><br>
              <small>Lng: ${lngNum.toFixed(6)}</small><br><br>
              
              <strong>Método:</strong> ${metodo_ubicacion || 'GPS'}<br>
              ${precision_metros ? `<strong>Precisión:</strong> ${Math.round(precision_metros)}m<br>` : ''}
              
              ${direccion ? `<br><strong>Dirección:</strong><br><small>${direccion}</small>` : ''}
            </div>
            <hr style="margin: 10px 0;">
            <small style="color: #666;"><em>Información del ciudadano</em></small>
          </div>
        `;
        
        marker.bindPopup(popupContent, {
          maxWidth: 300,
          className: 'admin-popup'
        }).openPopup();

        // Agregar círculo de precisión si está disponible
        if (precision_metros && precision_metros < 1000) {
          window.L.circle([latNum, lngNum], {
            color: '#1976d2',
            fillColor: '#1976d2',
            fillOpacity: 0.1,
            radius: precision_metros
          }).addTo(map);
        }

        // Cleanup
        return () => {
          if (map) {
            map.remove();
          }
        };
      } catch (error) {
        console.error('Error inicializando mapa admin:', error);
        setMapError('Error al mostrar el mapa: ' + error.message);
      }
    }
  }, [mapLoaded, latNum, lngNum, metodo_ubicacion, precision_metros, direccion]);

  const handleRefresh = () => {
    setMapLoaded(false);
    setMapError('');
    setTimeout(() => setMapLoaded(true), 100);
  };

  if (!latNum || !lngNum) {
    return (
      <Paper elevation={2} sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50', height }}>
        <ErrorIcon sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
        <Typography variant="h6" color="textSecondary" gutterBottom>
          Sin Ubicación GPS
        </Typography>
        <Typography variant="body2" color="textSecondary">
          El ciudadano no proporcionó ubicación GPS para este reporte
        </Typography>
        
        {direccion && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Dirección proporcionada:</strong> {direccion}
            </Typography>
          </Alert>
        )}
        
        {process.env.NODE_ENV === 'development' && (
          <Typography variant="caption" color="error" sx={{ mt: 2, display: 'block' }}>
            Debug: Lat={latitud}, Lng={longitud}
          </Typography>
        )}
      </Paper>
    );
  }

  if (mapError) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          {mapError}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          size="small"
        >
          Reintentar Carga
        </Button>
      </Box>
    );
  }

  const googleMapsUrl = `https://www.google.com/maps?q=${latNum},${lngNum}`;

  return (
    <Paper elevation={3} sx={{ overflow: 'hidden' }}>
      {/* Header del mapa */}
      <Box sx={{ 
        p: 2, 
        bgcolor: 'primary.main', 
        color: 'white', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between' 
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocationIcon />
          <Typography variant="h6">
            {titulo}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Recargar mapa">
            <IconButton
              size="small"
              color="inherit"
              onClick={handleRefresh}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Abrir en Google Maps">
            <IconButton
              size="small"
              color="inherit"
              onClick={() => window.open(googleMapsUrl, '_blank')}
            >
              <OpenIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Información para administrador */}
      <Alert severity="success" sx={{ m: 0, borderRadius: 0 }}>
        <Typography variant="body2">
          <strong>Ubicación proporcionada por el ciudadano:</strong> 
          Coordenadas GPS precisas para localización exacta del problema.
        </Typography>
      </Alert>

      {/* Mapa */}
      <Box 
        ref={mapRef} 
        sx={{ 
          width: '100%', 
          height: height - 120,
          minHeight: 200
        }} 
      />

      {/* Información detallada de ubicación */}
      <Box sx={{ p: 2, bgcolor: 'grey.50', borderTop: '1px solid', borderColor: 'grey.200' }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', mb: 1 }}>
          <Chip 
            icon={<GPSIcon />}
            label={`${latNum.toFixed(6)}, ${lngNum.toFixed(6)}`}
            size="small"
            color="primary"
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
              color={precision_metros < 50 ? 'success' : precision_metros < 100 ? 'warning' : 'error'}
            />
          )}
        </Box>
        
        {direccion && (
          <Typography variant="body2" color="textSecondary">
            <strong>Dirección:</strong> {direccion}
          </Typography>
        )}
      </Box>

      {/* Indicador de carga */}
      {!mapLoaded && (
        <Box sx={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          bgcolor: 'rgba(255,255,255,0.9)',
          p: 2,
          borderRadius: 1
        }}>
          <CircularProgress size={24} />
          <Typography variant="body2">
            Cargando mapa...
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default MapaUbicacionAdmin;