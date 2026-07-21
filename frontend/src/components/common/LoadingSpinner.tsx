import { Box, CircularProgress, Typography } from '@mui/material'

interface LoadingSpinnerProps {
    message?: string
    fullHeight?: boolean
}

export function LoadingSpinner({
                                   message = 'Loading...',
                                   fullHeight = true,
                               }: LoadingSpinnerProps) {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: fullHeight ? '60vh' : 200,
                gap: 2,
            }}
        >
            <CircularProgress />
            <Typography variant="body2" color="text.secondary">
                {message}
            </Typography>
        </Box>
    )
}