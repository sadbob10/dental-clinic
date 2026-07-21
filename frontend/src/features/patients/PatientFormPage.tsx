import { useEffect } from 'react'
import {
    Box, Card, CardContent, Grid, TextField, Button,
    MenuItem, CircularProgress, Alert
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { patientsApi } from '@/api/endpoints/patients'
import { PageHeader } from '@/components/common/PageHeader'
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges'

const schema = z.object({
    fullName: z.string().min(1, 'Full name is required'),
    phone: z.string().min(1, 'Phone is required'),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    dateOfBirth: z.string().optional(),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
    address: z.string().optional(),
    emergencyContact: z.string().optional(),
    medicalNotes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export function PatientFormPage() {
    const { id } = useParams()
    const isEdit = !!id
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const { data: existing } = useQuery({
        queryKey: ['patient', id],
        queryFn: () => patientsApi.getById(Number(id)),
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
                phone: existing.phone,
                email: existing.email ?? '',
                dateOfBirth: existing.dateOfBirth ?? '',
                gender: existing.gender ?? undefined,
                address: existing.address ?? '',
                emergencyContact: existing.emergencyContact ?? '',
                medicalNotes: existing.medicalNotes ?? '',
            })
        }
    }, [existing, reset])

    const mutation = useMutation({
        mutationFn: (data: FormData) =>
            isEdit
                ? patientsApi.update(Number(id), data)
                : patientsApi.create(data),
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ['patients'] })
            navigate(`/patients/${result.id}`)
        },
    })

    return (
        <Box>
            <PageHeader
                title={isEdit ? 'Edit Patient' : 'New Patient'}
                subtitle={isEdit ? `Editing ${existing?.fullName}` : 'Register a new patient'}
            />

            {mutation.isError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {mutation.error instanceof Error
                        ? mutation.error.message
                        : 'Failed to save patient'}
                </Alert>
            )}

            <Card>
                <CardContent>
                    <Box
                        component="form"
                        onSubmit={handleSubmit((d) => mutation.mutate(d))}
                    >
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Full Name *"
                                    fullWidth
                                    {...register('fullName')}
                                    error={!!errors.fullName}
                                    helperText={errors.fullName?.message}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Phone *"
                                    fullWidth
                                    {...register('phone')}
                                    error={!!errors.phone}
                                    helperText={errors.phone?.message}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Email"
                                    fullWidth
                                    {...register('email')}
                                    error={!!errors.email}
                                    helperText={errors.email?.message}
                                />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <TextField
                                    label="Date of Birth"
                                    type="date"
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    {...register('dateOfBirth')}
                                />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <Controller
                                    name="gender"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField select label="Gender" fullWidth {...field} value={field.value ?? ''}>
                                            <MenuItem value="">Not specified</MenuItem>
                                            <MenuItem value="MALE">Male</MenuItem>
                                            <MenuItem value="FEMALE">Female</MenuItem>
                                            <MenuItem value="OTHER">Other</MenuItem>
                                        </TextField>
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Address"
                                    fullWidth
                                    multiline
                                    rows={2}
                                    {...register('address')}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Emergency Contact"
                                    fullWidth
                                    {...register('emergencyContact')}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Medical Notes"
                                    fullWidth
                                    multiline
                                    rows={3}
                                    {...register('medicalNotes')}
                                    placeholder="Allergies, conditions, medications..."
                                />
                            </Grid>
                        </Grid>

                        <Box display="flex" gap={2} justifyContent="flex-end" mt={3}>
                            <Button onClick={() => navigate(-1)} disabled={mutation.isPending}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={mutation.isPending}
                            >
                                {mutation.isPending ? (
                                    <CircularProgress size={20} color="inherit" />
                                ) : isEdit ? 'Save Changes' : 'Create Patient'}
                            </Button>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    )
}