import { useEffect } from 'react'
import {
    Box, Card, CardContent, Grid, TextField,
    MenuItem, Button, CircularProgress, Alert
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { usersApi } from '@/api/endpoints/users'
import { PageHeader } from '@/components/common/PageHeader'
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges'
import type { Role } from '@/types'

const ROLES: Role[] = ['ADMIN', 'RECEPTIONIST', 'DENTIST']

const schema = z.object({
    fullName: z.string().min(1, 'Full name is required'),
    email: z.string().email({ message: 'Invalid email' }),
    password: z.string().min(8, 'Min 8 characters')
        .regex(/[A-Z]/, 'Need uppercase')
        .regex(/[a-z]/, 'Need lowercase')
        .regex(/[0-9]/, 'Need digit')
        .regex(/[^A-Za-z0-9]/, 'Need special character'),
    role: z.enum(['ADMIN', 'RECEPTIONIST', 'DENTIST']),
})

type FormData = z.infer<typeof schema>

export function UserFormPage() {
    const { id } = useParams()
    const isEdit = !!id
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const { data: existing } = useQuery({
        queryKey: ['user', id],
        queryFn: () => usersApi.getById(Number(id)),
        enabled: isEdit,
    })

    const {
        register, handleSubmit, control, reset,
        formState: { errors, isDirty },
    } = useForm<FormData>({ resolver: zodResolver(schema) })

    useUnsavedChanges(isDirty)

    useEffect(() => {
        if (existing) {
            reset({
                fullName: existing.fullName,
                email: existing.email,
                password: '',
                role: existing.role,
            })
        }
    }, [existing, reset])

    const mutation = useMutation({
        mutationFn: (data: FormData) =>
            isEdit
                ? usersApi.update(Number(id), data)
                : usersApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] })
            navigate('/users')
        },
    })

    return (
        <Box>
            <PageHeader title={isEdit ? 'Edit Staff Account' : 'New Staff Account'} />

            {mutation.isError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {mutation.error?.message ?? 'Failed to save'}
                </Alert>
            )}

            <Card>
                <CardContent>
                    <Box component="form" onSubmit={handleSubmit((d) => mutation.mutate(d))}>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="Full Name *" fullWidth
                                    {...register('fullName')}
                                    error={!!errors.fullName}
                                    helperText={errors.fullName?.message}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="Email *" fullWidth type="email"
                                    {...register('email')}
                                    error={!!errors.email}
                                    helperText={errors.email?.message}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label={isEdit ? 'New Password (leave blank to keep)' : 'Password *'}
                                    fullWidth type="password"
                                    {...register('password')}
                                    error={!!errors.password}
                                    helperText={errors.password?.message}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Controller
                                    name="role"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            select label="Role *" fullWidth
                                            {...field} value={field.value ?? ''}
                                            error={!!errors.role}
                                            helperText={errors.role?.message}
                                        >
                                            {ROLES.map((r) => (
                                                <MenuItem key={r} value={r}>{r}</MenuItem>
                                            ))}
                                        </TextField>
                                    )}
                                />
                            </Grid>
                        </Grid>

                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
                            <Button onClick={() => navigate(-1)} disabled={mutation.isPending}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="contained" disabled={mutation.isPending}>
                                {mutation.isPending
                                    ? <CircularProgress size={20} color="inherit" />
                                    : isEdit ? 'Save Changes' : 'Create Account'}
                            </Button>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    )
}