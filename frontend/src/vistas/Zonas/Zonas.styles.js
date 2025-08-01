export const styles = {
  // Contenedor principal
  container: {
    mt: 3,
    mb: 3
  },

  // Título principal
  titulo: {
    mb: 4,
    fontWeight: 'bold',
    color: 'primary.main',
    textAlign: 'center'
  },

  // Paper del formulario
  formPaper: {
    p: 3,
    mb: 4,
    backgroundColor: 'background.paper',
    borderRadius: 2,
    boxShadow: 2
  },

  // Stack del formulario
  formStack: {
    spacing: 3,
    alignItems: 'stretch'
  },

  // Fila principal del formulario
  formRow: {
    display: 'flex',
    flexDirection: { xs: 'column', lg: 'row' },
    gap: 3,
    alignItems: 'flex-end'
  },

  // Campos básicos
  textField: {
    flex: 1,
    minWidth: { xs: '100%', md: 200 },
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: 'primary.light',
      },
      '&:hover fieldset': {
        borderColor: 'primary.main',
      },
    }
  },

  // Campo de descripción (más amplio)
  descriptionField: {
    flex: 2,
    minWidth: { xs: '100%', md: 300 },
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: 'primary.light',
      },
      '&:hover fieldset': {
        borderColor: 'primary.main',
      },
    }
  },

  // Campos numéricos pequeños
  numberField: {
    minWidth: { xs: '100%', md: 120 },
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: 'primary.light',
      },
      '&:hover fieldset': {
        borderColor: 'primary.main',
      },
    }
  },

  // Campo de área (más amplio que número básico)
  areaField: {
    minWidth: { xs: '100%', md: 160 },
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: 'primary.light',
      },
      '&:hover fieldset': {
        borderColor: 'primary.main',
      },
    }
  },

  // Campo de coordenadas
  coordenadasField: {
    flex: 1,
    minWidth: { xs: '100%', md: 200 },
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: 'primary.light',
      },
      '&:hover fieldset': {
        borderColor: 'primary.main',
      },
    }
  },

  // Contenedor de botones
  buttonContainer: {
    display: 'flex',
    gap: 2,
    flexDirection: { xs: 'column', sm: 'row' },
    minWidth: { xs: '100%', md: 'auto' },
    alignSelf: 'flex-end'
  },

  // Botones del formulario
  submitButton: {
    minWidth: 140,
    height: 56,
    fontWeight: 'bold'
  },

  cancelButton: {
    minWidth: 100,
    height: 56,
    fontWeight: 'bold'
  },

  // Paper de la tabla
  tablePaper: {
    overflow: 'hidden',
    borderRadius: 2,
    boxShadow: 3
  },

  // Tabla
  table: {
    minWidth: 800
  },

  // Encabezados de tabla
  tableHead: {
    backgroundColor: 'primary.main',
    '& .MuiTableCell-head': {
      color: 'primary.contrastText',
      fontWeight: 'bold',
      fontSize: '1rem'
    }
  },

  // Celdas de la tabla
  tableCell: {
    py: 2,
    px: 2
  },

  // Celda del número de zona con badge
  numeroZonaCell: {
    display: 'flex',
    alignItems: 'center',
    gap: 1
  },

  numeroZonaBadge: {
    minWidth: 40,
    height: 40,
    borderRadius: '50%',
    backgroundColor: 'secondary.main',
    color: 'secondary.contrastText',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '1.2rem'
  },

  // Celda de población con formato
  poblacionCell: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    fontWeight: 'medium'
  },

  // Celda de área con unidades
  areaCell: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start'
  },

  // Celda de coordenadas
  coordenadasCell: {
    fontFamily: 'monospace',
    fontSize: '0.85rem',
    maxWidth: 150,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },

  // Botones de acción
  actionButton: {
    minWidth: 80,
    fontWeight: 'bold',
    mr: 1
  },

  // Mensaje de tabla vacía
  emptyTableMessage: {
    textAlign: 'center',
    py: 4,
    color: 'text.secondary',
    fontStyle: 'italic'
  },

  // Loading state
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    py: 4
  },

  // Alert de mensajes
  alert: {
    mt: 2,
    borderRadius: 2
  },

  // Helper text para formatos
  helperText: {
    fontSize: '0.75rem',
    color: 'text.secondary',
    mt: 0.5
  }
};