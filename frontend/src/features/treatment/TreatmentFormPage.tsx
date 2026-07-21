import { useEffect } from 'react'
import {
    Box, Card, CardContent, Grid, TextField,
    MenuItem, Button, CircularProgress, Alert
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { treatmentApi } from '@/api/endpoints/treatment'
import { patientsApi } from '@/api/endpoints/patients'
import { usersApi } from '@/api/endpoints/users'
import { PageHeader } from '@/components/common/PageHeader'
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges'

const schema = z.object({
    patientId: z.number({ error: 'Patient is required' }),
    dentistId: z.number({ error: 'Dentist is required' }),
    appointmentId: z.number().optional(),
    diagnosis: z.string().optional(),
    treatmentDone: z.string().min(1, 'Treatment description is required'),
    prescription: z.string().optional(),
    nextVisitNotes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export function TreatmentFormPage() {
    const { id } = useParams()
    const [searchParams] = useSearchParams()
    const isEdit = !!id
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const prefilledPatientId = searchParams.get('patientId')

    const { data: existing } = useQuery({
        queryKey: ['treatment-record', id],
        queryFn: () => treatmentApi.getById(Number(id)),
        enabled: isEdit,
    })

    const { data: patients } = useQuery({
        queryKey: ['patients-all'],
        queryFn: () => patientsApi.getAll({ size: 100 }),
    })

    const { data: dentists } = useQuery({
        queryKey: ['dentists'],
        queryFn: usersApi.getDentists,
    })

    const {
        register, handleSubmit, control, reset,
        formState: { errors, isDirty },
    } = useForm<FormData>({ resolver: zodResolver(schema) })

    useUnsavedChanges(isDirty)

    useEffect(() => {
        if (existing) {
            reset({
                patientId: existing.patientId,
                dentistId: existing.dentistId,
                appointmentId: existing.appointmentId ?? undefined,
                diagnosis: existing.diagnosis ?? '',
                treatmentDone: existing.treatmentDone,
                prescription: existing.prescription ?? '',
                nextVisitNotes: existing.nextVisitNotes ?? '',
            })
        } else if (prefilledPatientId) {
            reset({ patientId: Number(prefilledPatientId) })
        }
    }, [existing, prefilledPatientId, reset])

    const mutation = useMutation({
        mutationFn: (data: FormData) =>
            isEdit
                ? treatmentApi.update(Number(id), data)
                : treatmentApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['treatment'] })
            navigate('/treatment')
        },
    })

    return (
        <Box>
            <PageHeader title={isEdit ? 'Edit Treatment Record' : 'New Treatment Record'} />

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
                            <Grid size={{ xs: 12, md: 6 }}>
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
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="Diagnosis"
                                    fullWidth multiline rows={2}
                                    {...register('diagnosis')}
                                    placeholder="Patient's diagnosis..."
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="Treatment Done *"
                                    fullWidth multiline rows={2}
                                    {...register('treatmentDone')}
                                    error={!!errors.treatmentDone}
                                    helperText={errors.treatmentDone?.message}
                                    placeholder="Describe what was done..."
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="Prescription"
                                    fullWidth multiline rows={2}
                                    {...register('prescription')}
                                    placeholder="Medications prescribed..."
                                />
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    label="Next Visit Notes"
                                    fullWidth multiline rows={2}
                                    {...register('nextVisitNotes')}
                                    placeholder="Instructions for follow-up..."
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
                                    : isEdit ? 'Save Changes' : 'Save Record'}
                            </Button>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    )
}