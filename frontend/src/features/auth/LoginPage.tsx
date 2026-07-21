import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
    Box, Paper, Typography, TextField, Button,
    Alert, InputAdornment, IconButton, CircularProgress
} from '@mui/material'
import { Visibility, VisibilityOff, LocalHospital } from '@mui/icons-material'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import apiClient from '@/api/client'
import type { AuthResponse } from '@/types'

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
})

type LoginForm = z.infer<typeof loginSchema>

export function LoginPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const { setAuth } = useAuthStore()
    const [showPassword, setShowPassword] = useState(false)

    const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/'

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    })

    const loginMutation = useMutation({
        mutationFn: async (data: LoginForm) => {
            const response = await apiClient.post<AuthResponse>('/auth/login', data)
            return response.data
        },
        onSuccess: (data) => {
            setAuth(
                { email: data.email, fullName: data.fullName, role: data.role },
                data.accessToken,
                data.refreshToken
            )
            navigate(from, { replace: true })
        },
    })

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.default',
                p: 2,
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    p: 4,
                    width: '100%',
                    maxWidth: 420,
                    border: '1px solid rgba(0,0,0,0.08)',
                }}
            >
                {/* Logo */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 4 }}>
                    <LocalHospital color="primary" sx={{ fontSize: 32 }} />
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700 }} color="primary">
                            DentalClinic
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Admin Panel
                        </Typography>
                    </Box>
                </Box>

                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Welcome back
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Sign in to your account to continue
                </Typography>

                {loginMutation.isError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {loginMutation.error?.message ?? 'Invalid email or password'}
                    </Alert>
                )}

                <Box
                    component="form"
                    onSubmit={handleSubmit((data) => loginMutation.mutate(data))}
                    sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                >
                    <TextField
                        label="Email"
                        type="email"
                        fullWidth
                        {...register('email')}
                        error={!!errors.email}
                        helperText={errors.email?.message}
                        autoComplete="email"
                        autoFocus
                    />

                    <TextField
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        fullWidth
                        {...register('password')}
                        error={!!errors.password}
                        helperText={errors.password?.message}
                        autoComplete="current-password"
                        slotProps={{
                            input: {
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        fullWidth
                        disabled={loginMutation.isPending}
                        sx={{ mt: 1 }}
                    >
                        {loginMutation.isPending ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            'Sign In'
                        )}
                    </Button>
                </Box>
            </Paper>
        </Box>
    )
}