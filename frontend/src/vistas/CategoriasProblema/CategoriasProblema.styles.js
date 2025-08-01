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
    flexDirection: { xs: 'column', md: 'row' },
    gap: 3,
    alignItems: 'flex-end'
  },

  // Campos del formulario
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

  // Campo de descripción
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

  // Campo de color
  colorContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    minWidth: 120
  },

  colorField: {
    '& input[type="color"]': {
      width: '100%',
      height: 56,
      border: '2px solid',
      borderColor: 'primary.light',
      borderRadius: 1,
      cursor: 'pointer',
      '&:hover': {
        borderColor: 'primary.main',
      }
    }
  },

  // Contenedor de botones
  buttonContainer: {
    display: 'flex',
    gap: 2,
    flexDirection: { xs: 'column', sm: 'row' },
    minWidth: { xs: '100%', md: 'auto' }
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
    minWidth: 650
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

  // Celda de color
  colorCell: {
    display: 'flex',
    alignItems: 'center',
    gap: 1
  },

  // Chip de color
  colorChip: {
    width: 30,
    height: 30,
    borderRadius: '50%',
    border: '2px solid',
    borderColor: 'grey.300',
    boxShadow: 1
  },

  // Celda de icono
  iconCell: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    fontSize: '1.1rem'
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

  // Select de iconos
  iconSelect: {
    flex: 1,
    minWidth: { xs: '100%', md: 200 },
    '& .MuiSelect-select': {
      display: 'flex',
      alignItems: 'center',
      gap: 1
    }
  },

  // Opción del select de iconos
  iconOption: {
    display: 'flex',
    alignItems: 'center',
    gap: 1
  }
};