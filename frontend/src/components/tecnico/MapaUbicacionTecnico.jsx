// frontend/src/components/tecnico/MapaUbicacionTecnico.jsx
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
  Engineering as TecnicoIcon,
  DirectionsCar as DirectionsIcon,
  Navigation as NavigationIcon
} from '@mui/icons-material';

const MapaUbicacionTecnico = ({ 
  latitud, 
  longitud, 
  metodo_ubicacion, 
  precision_metros, 
  direccion,
  height = 300,
  titulo = "Ubicación del Problema",
  mostrarRuta = true
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
        console.error('Error cargando Leaflet en técnico:', error);
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

        // Crear marcador especial para técnico
        const tecnicoIcon = window.L.divIcon({
          className: 'tecnico-marker',
          html: `
            <div style="
              width: 30px; 
              height: 30px; 
              border-radius: 50%; 
              background: #FF9800; 
              border: 4px solid white; 
              box-shadow: 0 0 20px rgba(255, 152, 0, 0.7);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 14px;
              animation: pulse 2s infinite;
            ">
              🔧
            </div>
          `,
          iconSize: [30, 30],
          iconAnchor: [15, 15]
        });

        const marker = window.L.marker([latNum, lngNum], { icon: tecnicoIcon }).addTo(map);
        
        // Popup con información completa para técnico
        const popupContent = `
          <div style="text-align: center; padding: 15px; min-width: 250px;">
            <strong style="color: #FF9800; font-size: 16px;">🔧 Ubicación del Problema</strong><br>
            <hr style="margin: 12px 0;">
            <div style="text-align: left;">
              <strong>📍 Coordenadas GPS:</strong><br>
              <small>Lat: ${latNum.toFixed(6)}</small><br>
              <small>Lng: ${lngNum.toFixed(6)}</small><br><br>
              
              <strong>📱 Método:</strong> ${metodo_ubicacion || 'GPS'}<br>
              ${precision_metros ? `<strong>🎯 Precisión:</strong> ${Math.round(precision_metros)}m<br>` : ''}
              
              ${direccion ? `<br><strong>📍 Dirección:</strong><br><small>${direccion}</small><br>` : ''}
              
              <br><strong style="color: #FF9800;">Para Técnicos:</strong><br>
              <small>• Usa las coordenadas para navegación exacta</small><br>
              <small>• Verifica la dirección como referencia adicional</small><br>
              <small>• Precisión GPS: ${precision_metros ? 
                (precision_metros < 50 ? 'Alta (< 50m)' : 
                 precision_metros < 100 ? 'Media (< 100m)' : 'Baja (> 100m)') 
                : 'No disponible'}</small>
            </div>
          </div>
        `;
        
        marker.bindPopup(popupContent, {
          maxWidth: 320,
          className: 'tecnico-popup'
        }).openPopup();

        // Agregar círculo de precisión si está disponible
        if (precision_metros && precision_metros < 1000) {
          const colorPrecision = precision_metros < 50 ? '#4CAF50' : 
                                precision_metros < 100 ? '#FF9800' : '#F44336';
          
          window.L.circle([latNum, lngNum], {
            color: colorPrecision,
            fillColor: colorPrecision,
            fillOpacity: 0.1,
            radius: precision_metros,
            weight: 2,
            dashArray: '5, 5'
          }).addTo(map);
        }

        // Agregar escala
        window.L.control.scale().addTo(map);

        // Cleanup
        return () => {
          if (map) {
            map.remove();
          }
        };
      } catch (error) {
        console.error('Error inicializando mapa técnico:', error);
        setMapError('Error al mostrar el mapa: ' + error.message);
      }
    }
  }, [mapLoaded, latNum, lngNum, metodo_ubicacion, precision_metros, direccion]);

  const handleRefresh = () => {
    setMapLoaded(false);
    setMapError('');
    setTimeout(() => setMapLoaded(true), 100);
  };

  // URLs para navegación externa
  const googleMapsUrl = `https://www.google.com/maps?q=${latNum},${lngNum}`;
  const wazeUrl = `https://www.waze.com/ul?ll=${latNum}%2C${lngNum}&navigate=yes`;

  if (!latNum || !lngNum) {
    return (
      <Paper elevation={2} sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50', height }}>
        <ErrorIcon sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
        <Typography variant="h6" color="textSecondary" gutterBottom>
          Sin Ubicación GPS
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          El ciudadano no proporcionó ubicación GPS para este reporte
        </Typography>
        
        {direccion && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Dirección proporcionada:</strong> {direccion}
            </Typography>
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              Usa la dirección para localizar el problema manualmente
            </Typography>
          </Alert>
        )}
        
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Para técnicos:</strong> Sin coordenadas GPS, deberás usar la dirección 
            y posibles puntos de referencia para localizar el problema.
          </Typography>
        </Alert>
        
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

  return (
    <Paper elevation={3} sx={{ overflow: 'hidden' }}>
      {/* Header del mapa para técnico */}
      <Box sx={{ 
        p: 2, 
        bgcolor: 'warning.main', 
        color: 'white', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between' 
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TecnicoIcon />
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
          
          {mostrarRuta && (
            <Tooltip title="Navegar con Waze">
              <IconButton
                size="small"
                color="inherit"
                onClick={() => window.open(wazeUrl, '_blank')}
              >
                <DirectionsIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Información específica para técnico */}
      <Alert severity="warning" sx={{ m: 0, borderRadius: 0 }}>
        <Typography variant="body2">
          <strong>Ubicación proporcionada por el ciudadano:</strong> 
          Coordenadas GPS precisas para localización directa del problema reportado.
        </Typography>
      </Alert>

      {/* Mapa */}
      <Box 
        ref={mapRef} 
        sx={{ 
          width: '100%', 
          height: height - 140,
          minHeight: 200
        }} 
      />

      {/* Información detallada de ubicación para técnico */}
      <Box sx={{ p: 2, bgcolor: 'warning.50', borderTop: '1px solid', borderColor: 'warning.200' }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', mb: 1 }}>
          <Chip 
            icon={<GPSIcon />}
            label={`${latNum.toFixed(6)}, ${lngNum.toFixed(6)}`}
            size="small"
            color="warning"
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

          <Chip 
            icon={<NavigationIcon />}
            label="Navegable"
            size="small"
            color="info"
            variant="outlined"
          />
        </Box>
        
        {direccion && (
          <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
            <strong>Dirección:</strong> {direccion}
          </Typography>
        )}

        {mostrarRuta && (
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<OpenIcon />}
              onClick={() => window.open(googleMapsUrl, '_blank')}
            >
              Google Maps
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<DirectionsIcon />}
              onClick={() => window.open(wazeUrl, '_blank')}
            >
              Waze
            </Button>
          </Box>
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
            Cargando mapa de ubicación...
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default MapaUbicacionTecnico;