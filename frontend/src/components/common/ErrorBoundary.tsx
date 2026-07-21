import { Component, ErrorInfo, ReactNode } from 'react'
import { Box, Typography, Button, Paper } from '@mui/material'
import { ErrorOutlined } from '@mui/icons-material'

interface Props {
    children: ReactNode
    fallback?: ReactNode
}

interface State {
    hasError: boolean
    error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error('ErrorBoundary caught:', error, info)
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback

            return (
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '60vh',
                    }}
                >
                    <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 400 }}>
                        <ErrorOutlined color="error" sx={{ fontSize: 48, mb: 2 }} />
                        <Typography variant="h6" gutterBottom>
                            Something went wrong
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            {this.state.error?.message ?? 'An unexpected error occurred'}
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={() => {
                                this.setState({ hasError: false, error: null })
                                window.location.href = '/'
                            }}
                        >
                            Go to Home
                        </Button>
                    </Paper>
                </Box>
            )
        }

        return this.props.children
    }
}