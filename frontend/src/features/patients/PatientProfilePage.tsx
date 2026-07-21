import { useState } from 'react'
import {
    Box, Card, CardContent, Grid, Typography, Chip,
    Tabs, Tab, Button, Avatar, Divider, Skeleton
} from '@mui/material'
import {
    Edit, CalendarMonth, Receipt, Person, MedicalServices
} from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { patientsApi } from '@/api/endpoints/patients'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { useAuthStore } from '@/store/authStore'
import type { AppointmentSummary, InvoiceSummary } from '@/types'
import dayjs from 'dayjs'

const STATUS_COLORS: Record<string, 'default' | 'primary' | 'success' | 'error' | 'warning' | 'info'> = {
    SCHEDULED: 'primary', CONFIRMED: 'success', COMPLETED: 'default',
    CANCELLED: 'error', NO_SHOW: 'warning',
    DRAFT: 'default', ISSUED: 'info', PARTIALLY_PAID: 'warning', PAID: 'success',
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
    return (
        <Box mb={1.5}>
            <Typography variant="caption" color="text.secondary" display="block">
                {label}
            </Typography>
            <Typography variant="body2" fontWeight={500}>
                {value || '—'}
            </Typography>
        </Box>
    )
}

export function PatientProfilePage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { hasRole } = useAuthStore()
    const [tab, setTab] = useState(0)

    const patientQuery = useQuery({
        queryKey: ['patient', id],
        queryFn: () => patientsApi.getById(Number(id)),
    })

    const appointmentsQuery = useQuery({
        queryKey: ['patient-appointments', id],
        queryFn: () => patientsApi.getAppointments(Number(id)),
        enabled: tab === 1,
    })

    const invoicesQuery = useQuery({
        queryKey: ['patient-invoices', id],
        queryFn: () => patientsApi.getInvoices(Number(id)),
        enabled: tab === 2,
    })

    if (patientQuery.error) return <ErrorAlert error={patientQuery.error} />

    const patient = patientQuery.data

    return (
        <Box>
            {/* Header */}
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: 24 }}>
                        <Person fontSize="large" />
                    </Avatar>
                    <Box>
                        {patientQuery.isLoading ? (
                            <Skeleton width={200} height={32} />
                        ) : (
                            <Typography variant="h5" fontWeight={700}>{patient?.fullName}</Typography>
                        )}
                        <Typography variant="body2" color="text.secondary">
                            {patient?.phone}
                        </Typography>
                    </Box>
                </Box>
                {hasRole(['ADMIN', 'RECEPTIONIST']) && (
                    <Button
                        variant="outlined"
                        startIcon={<Edit />}
                        onClick={() => navigate(`/patients/${id}/edit`)}
                    >
                        Edit
                    </Button>
                )}
            </Box>

            <Grid container spacing={3}>
                {/* Patient info card */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="subtitle1" fontWeight={600} mb={2}>
                                Patient Information
                            </Typography>
                            <InfoRow label="Email" value={patient?.email} />
                            <InfoRow
                                label="Date of Birth"
                                value={patient?.dateOfBirth
                                    ? dayjs(patient.dateOfBirth).format('MMMM D, YYYY')
                                    : null}
                            />
                            <InfoRow label="Gender" value={patient?.gender} />
                            <InfoRow label="Address" value={patient?.address} />
                            <InfoRow label="Emergency Contact" value={patient?.emergencyContact} />
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                                Medical Notes
                            </Typography>
                            <Typography variant="body2">
                                {patient?.medicalNotes || 'No medical notes'}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Tabs */}
                <Grid item xs={12} md={8}>
                    <Card>
                        <Tabs
                            value={tab}
                            onChange={(_, v) => setTab(v)}
                            sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
                        >
                            <Tab icon={<CalendarMonth />} iconPosition="start" label="Appointments" />
                            <Tab icon={<Receipt />} iconPosition="start" label="Invoices" />
                            <Tab icon={<MedicalServices />} iconPosition="start" label="Treatment" />
                        </Tabs>

                        <CardContent>
                            {/* Appointments tab */}
                            {tab === 0 && (
                                <Box>
                                    {appointmentsQuery.isLoading ? (
                                        <Skeleton variant="rectangular" height={200} />
                                    ) : appointmentsQuery.data?.length === 0 ? (
                                        <Typography color="text.secondary" textAlign="center" py={4}>
                                            No appointments found
                                        </Typography>
                                    ) : (
                                        appointmentsQuery.data?.map((apt: AppointmentSummary) => (
                                            <Box key={apt.id} py={1.5}>
                                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                                    <Box>
                                                        <Typography variant="body2" fontWeight={600}>
                                                            {dayjs(apt.scheduledAt).format('MMM D, YYYY h:mm A')}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {apt.type} • {apt.dentistName} • {apt.durationMinutes} min
                                                        </Typography>
                                                    </Box>
                                                    <Chip
                                                        label={apt.status}
                                                        size="small"
                                                        color={STATUS_COLORS[apt.status] ?? 'default'}
                                                    />
                                                </Box>
                                                <Divider sx={{ mt: 1.5 }} />
                                            </Box>
                                        ))
                                    )}
                                </Box>
                            )}

                            {/* Invoices tab */}
                            {tab === 1 && (
                                <Box>
                                    {invoicesQuery.isLoading ? (
                                        <Skeleton variant="rectangular" height={200} />
                                    ) : invoicesQuery.data?.length === 0 ? (
                                        <Typography color="text.secondary" textAlign="center" py={4}>
                                            No invoices found
                                        </Typography>
                                    ) : (
                                        invoicesQuery.data?.map((inv: InvoiceSummary) => (
                                            <Box
                                                key={inv.id}
                                                py={1.5}
                                                sx={{ cursor: 'pointer' }}
                                                onClick={() => navigate(`/billing/${inv.id}`)}
                                            >
                                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                                    <Box>
                                                        <Typography variant="body2" fontWeight={600}>
                                                            Invoice #{inv.id}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {dayjs(inv.createdAt).format('MMM D, YYYY')}
                                                        </Typography>
                                                    </Box>
                                                    <Box textAlign="right">
                                                        <Typography variant="body2" fontWeight={600}>
                                                            {inv.netAmount.toFixed(2)}
                                                        </Typography>
                                                        <Chip
                                                            label={inv.status}
                                                            size="small"
                                                            color={STATUS_COLORS[inv.status] ?? 'default'}
                                                        />
                                                    </Box>
                                                </Box>
                                                <Divider sx={{ mt: 1.5 }} />
                                            </Box>
                                        ))
                                    )}
                                </Box>
                            )}

                            {/* Treatment tab */}
                            {tab === 2 && (
                                <Box>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => navigate(`/treatment/new?patientId=${id}`)}
                                        sx={{ mb: 2 }}
                                    >
                                        Add Treatment Record
                                    </Button>
                                    <Typography color="text.secondary" textAlign="center" py={4}>
                                        View treatment records in the Treatment module
                                    </Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    )
}