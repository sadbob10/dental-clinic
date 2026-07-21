import { useState } from 'react'
import {
    Box, Card, CardContent, Typography, TextField,
    MenuItem, Skeleton, Button
} from '@mui/material'
import { Add } from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { treatmentApi } from '@/api/endpoints/treatment'
import { patientsApi } from '@/api/endpoints/patients'
import { PageHeader } from '@/components/common/PageHeader'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { useAuthStore } from '@/store/authStore'
import type { TreatmentRecordResponse } from '@/types'
import dayjs from 'dayjs'

export function TreatmentListPage() {
    const navigate = useNavigate()
    const { hasRole } = useAuthStore()
    const canCreate = hasRole(['ADMIN', 'DENTIST'])

    const [selectedPatientId, setSelectedPatientId] = useState<number | ''>('')

    const { data: patients } = useQuery({
        queryKey: ['patients-all'],
        queryFn: () => patientsApi.getAll({ size: 100 }),
    })

    const { data: records, isLoading, error } = useQuery({
        queryKey: ['treatment', selectedPatientId],
        queryFn: () => treatmentApi.getByPatient(Number(selectedPatientId)),
        enabled: !!selectedPatientId,
    })

    if (error) return <ErrorAlert error={error} />

    return (
        <Box>
            <PageHeader
                title="Treatment Records"
                actionLabel={canCreate ? 'Add Record' : undefined}
                onAction={canCreate ? () => navigate('/treatment/new') : undefined}
            />

            {/* Patient selector */}
            <Box sx={{ mb: 3 }}>
                <TextField
                    select
                    label="Select Patient"
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(
                        e.target.value === '' ? '' : Number(e.target.value)
                    )}
                    sx={{ width: 320 }}
                >
                    <MenuItem value="">— Select a patient —</MenuItem>
                    {patients?.content.map((p) => (
                        <MenuItem key={p.id} value={p.id}>
                            {p.fullName} — {p.phone}
                        </MenuItem>
                    ))}
                </TextField>
            </Box>

            {!selectedPatientId ? (
                <Card>
                    <CardContent sx={{ textAlign: 'center', py: 6 }}>
                        <Typography color="text.secondary">
                            Select a patient to view their treatment history
                        </Typography>
                    </CardContent>
                </Card>
            ) : isLoading ? (
                <Skeleton variant="rectangular" height={300} />
            ) : records?.length === 0 ? (
                <Card>
                    <CardContent sx={{ textAlign: 'center', py: 6 }}>
                        <Typography color="text.secondary" sx={{ mb: 2 }}>
                            No treatment records for this patient
                        </Typography>
                        {canCreate && (
                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                onClick={() => navigate(`/treatment/new?patientId=${selectedPatientId}`)}
                            >
                                Add First Record
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {records?.map((record: TreatmentRecordResponse) => (
                        <Card key={record.id}>
                            <CardContent>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        mb: 2,
                                    }}
                                >
                                    <Box>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                            {dayjs(record.createdAt).format('MMMM D, YYYY')}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Dr. {record.dentistName}
                                            {record.appointmentId && ` • Appointment #${record.appointmentId}`}
                                        </Typography>
                                    </Box>
                                    {canCreate && (
                                        <Button
                                            size="small"
                                            onClick={() => navigate(`/treatment/${record.id}/edit`)}
                                        >
                                            Edit
                                        </Button>
                                    )}
                                </Box>

                                <Box
                                    sx={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr',
                                        gap: 2,
                                    }}
                                >
                                    {record.diagnosis && (
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Diagnosis</Typography>
                                            <Typography variant="body2">{record.diagnosis}</Typography>
                                        </Box>
                                    )}
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">Treatment Done</Typography>
                                        <Typography variant="body2">{record.treatmentDone}</Typography>
                                    </Box>
                                    {record.prescription && (
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Prescription</Typography>
                                            <Typography variant="body2">{record.prescription}</Typography>
                                        </Box>
                                    )}
                                    {record.nextVisitNotes && (
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Next Visit</Typography>
                                            <Typography variant="body2">{record.nextVisitNotes}</Typography>
                                        </Box>
                                    )}
                                </Box>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            )}
        </Box>
    )
}