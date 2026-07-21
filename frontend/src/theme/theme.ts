import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
    palette: {
        primary: {
            main: '#2980b9',
            light: '#5dade2',
            dark: '#1a5276',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#27ae60',
            light: '#58d68d',
            dark: '#1e8449',
            contrastText: '#ffffff',
        },
        error: {
            main: '#e74c3c',
        },
        warning: {
            main: '#f39c12',
        },
        info: {
            main: '#2980b9',
        },
        success: {
            main: '#27ae60',
        },
        background: {
            default: '#f5f6fa',
            paper: '#ffffff',
        },
        text: {
            primary: '#2c3e50',
            secondary: '#7f8c8d',
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: { fontWeight: 700 },
        h2: { fontWeight: 700 },
        h3: { fontWeight: 600 },
        h4: { fontWeight: 600 },
        h5: { fontWeight: 600 },
        h6: { fontWeight: 600 },
        button: { textTransform: 'none', fontWeight: 500 },
    },
    shape: {
        borderRadius: 8,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    padding: '8px 20px',
                    boxShadow: 'none',
                    '&:hover': { boxShadow: 'none' },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    border: '1px solid rgba(0,0,0,0.06)',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                },
            },
        },
        MuiTextField: {
            defaultProps: {
                variant: 'outlined',
                size: 'small',
            },
        },
        MuiTableHead: {
            styleOverrides: {
                root: {
                    backgroundColor: '#f8f9fa',
                    '& .MuiTableCell-head': {
                        fontWeight: 600,
                        color: '#2c3e50',
                    },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: { borderRadius: 6 },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: { boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
            },
        },
    },
});