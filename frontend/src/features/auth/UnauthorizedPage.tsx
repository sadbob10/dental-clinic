import { Box, Typography, Button, Paper } from '@mui/material'
import { Lock } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

export function UnauthorizedPage() {
    const navigate = useNavigate()
    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 400 }}>
                <Lock color="warning" sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 700 }} gutterBottom>
                    Access Denied
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    You don't have permission to view this page.
                </Typography>
                <Button variant="contained" onClick={() => navigate('/')}>
                    Go to Dashboard
                </Button>
            </Paper>
        </Box>
    )
}