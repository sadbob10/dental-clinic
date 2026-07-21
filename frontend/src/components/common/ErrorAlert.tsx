import { Alert, AlertTitle, Box, Button } from '@mui/material'
import { AxiosError } from 'axios'
import type { ApiError } from '@/types'

interface ErrorAlertProps {
    error: unknown
    onRetry?: () => void
}

function getErrorMessage(error: unknown): string {
    if (error instanceof AxiosError) {
        const data = error.response?.data as ApiError
        if (data?.error) return data.error
        if (data?.details) {
            return Object.values(data.details).join(', ')
        }
    }
    if (error instanceof Error) return error.message
    return 'An unexpected error occurred'
}

export function ErrorAlert({ error, onRetry }: ErrorAlertProps) {
    return (
        <Box sx={{ my: 2 }}>
            <Alert
                severity="error"
                action={
                    onRetry && (
                        <Button color="inherit" size="small" onClick={onRetry}>
                            Retry
                        </Button>
                    )
                }
            >
                <AlertTitle>Error</AlertTitle>
                {getErrorMessage(error)}
            </Alert>
        </Box>
    )
}