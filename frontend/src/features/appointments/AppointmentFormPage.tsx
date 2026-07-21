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
import { appointmentsApi } from '@/api/endpoints/appointments'
import { usersApi } from '@/api/endpoints/users'
import { patientsApi } from '@/api/endpoints/patients'
import { PageHeader } from '@/components/common/PageHeader'
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges'
import type { AppointmentType } from '@/types'

const TYPES: AppointmentType[] = [
    'CHECKUP', 'CLEANING', 'FILLING', 'EXTRACTION',
    'ROOT_CANAL', 'WHITENING', 'CONSULTATION', 'OTHER',
]

const schema = z.object({
    patientId: z.number({ required_error: 'Patient is required' }),
    dentistId: z.number({ required_error: 'Dentist is required' }),
    scheduledAt: z.string().min(1, 'Date and time is required'),
    durationMinutes: z.number().min(15, 'Minimum 15 minutes'),
    type: z.enum(['CHECKUP','CLEANING','FILLING','EXTRACTION',
        'ROOT_CANAL','WHITENING','CONSULTATION','OTHER']),
    notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export function AppointmentFormPage() {
    const { id } = useParams()
    const isEdit = !!id
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const { data: existing } = useQuery({
        queryKey: ['appointment', id],
        queryFn: () => appointmentsApi.getById(Number(id)),
        enabled: isEdit,
    })

    const { data: dentists } = useQuery({
        queryKey: ['dentists'],
        queryFn: usersApi.getDentists,
    })

    const { data: patients } = useQuery({
        queryKey: ['patients-all'],
        queryFn: () => patientsApi.getAll({ size: 100 }),
    })

    const {
        register, handleSubmit, control, reset,
        formState: { errors, isDirty },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { durationMinutes: 30, type: 'CHECKUP' },
    })

    useUnsavedChanges(isDirty)

    useEffect(() => {
        if (existing) {
            reset({
                patientId: existing.patientId,
                dentistId: existing.dentistId,
                scheduledAt: existing.scheduledAt.slice(0, 16),
                durationMinutes: existing.durationMinutes,
                type: existing.type,
                notes: existing.notes ?? '',
            })
        }
    }, [existing, reset])

    const mutation = useMutation({
        mutationFn: (data: FormData) =>
            isEdit
                ? appointmentsApi.update(Number(id), data)
                : appointmentsApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] })
            navigate('/appointments')
        },
    })

    return (
        <Box>
            <PageHeader
                title={isEdit ? 'Edit Appointment' : 'New Appointment'}
            />

            {mutation.isError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {mutation.error instanceof Error ? mutation.error.message : 'Failed to save'}
                </Alert>
            )}

            <Card>
                <CardContent>
                    <Box component="form" onSubmit={handleSubmit((d) => mutation.mutate(d))}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <Controller
                                    name="patientId"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            select label="Patient *" fullWidth
                                            {...field} value={field.value ?? ''}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                            error={!!errors.patientId}
                                            helperText={errors.patientId?.message}
                                        >
                                            {patients?.content.map((p) => (
                                                <MenuItem key={p.id} value={p.id}>
                                                    {p.fullName} — {p.phone}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Controller
                                    name="dentistId"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            select label="Dentist *" fullWidth
                                            {...field} value={field.value ?? ''}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                            error={!!errors.dentistId}
                                            helperText={errors.dentistId?.message}
                                        >
                                            {dentists?.map((d) => (
                                                <MenuItem key={d.id} value={d.id}>{d.fullName}</MenuItem>
                                            ))}
                                        </TextField>
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Date & Time *"
                                    type="datetime-local"
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    {...register('scheduledAt')}
                                    error={!!errors.scheduledAt}
                                    helperText={errors.scheduledAt?.message}
                                />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <Controller
                                    name="durationMinutes"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            select label="Duration *" fullWidth
                                            {...field}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                            error={!!errors.durationMinutes}
                                        >
                                            {[15, 30, 45, 60, 90, 120].map((m) => (
                                                <MenuItem key={m} value={m}>{m} minutes</MenuItem>
                                            ))}
                                        </TextField>
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <Controller
                                    name="type"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField select label="Type *" fullWidth {...field}>
                                            {TYPES.map((t) => (
                                                <MenuItem key={t} value={t}>{t}</MenuItem>
                                            ))}
                                        </TextField>
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Notes"
                                    fullWidth multiline rows={3}
                                    {...register('notes')}
                                />
                            </Grid>
                        </Grid>

                        <Box display="flex" gap={2} justifyContent="flex-end" mt={3}>
                            <Button onClick={() => navigate(-1)} disabled={mutation.isPending}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="contained" disabled={mutation.isPending}>
                                {mutation.isPending
                                    ? <CircularProgress size={20} color="inherit" />
                                    : isEdit ? 'Save Changes' : 'Create Appointment'}
                            </Button>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    )
}