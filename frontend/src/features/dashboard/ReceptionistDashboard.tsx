import { Grid, Card, CardContent, Typography, Box, Chip, Divider, Skeleton } from '@mui/material'
import {
    People, CalendarMonth, Receipt, PersonAdd
} from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '@/api/endpoints/dashboard'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import type { AppointmentSummary } from '@/types'
import dayjs from 'dayjs'
import React from "react";

const STATUS_COLORS: Record<string, 'default' | 'primary' | 'success' | 'error' | 'warning'> = {
    SCHEDULED: 'primary',
    CONFIRMED: 'success',
    COMPLETED: 'default',
    CANCELLED: 'error',
    NO_SHOW: 'warning',
}

function StatCard({
                      title, value, icon, color = 'primary', subtitle
                  }: {
    title: string
    value: number | string
    icon: React.ReactNode
    color?: string
    subtitle?: string
}) {
    return (
        <Card>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            {title}
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                            {value}
                        </Typography>
                        {subtitle && (
                            <Typography variant="caption" color="text.secondary">
                                {subtitle}
                            </Typography>
                        )}
                    </Box>
                    <Box
                        sx={{
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: `${color}.lighter` || 'primary.lighter',
                            color: `${color}.main` || 'primary.main',
                            display: 'flex',
                        }}
                    >
                        {icon}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    )
}

function AppointmentRow({ appointment }: { appointment: AppointmentSummary }) {
    return (
        <Box sx={{ py: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {appointment.patientName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {dayjs(appointment.scheduledAt).format('h:mm A')} •{' '}
                        {appointment.dentistName} • {appointment.type}
                    </Typography>
                </Box>
                <Chip
                    label={appointment.status}
                    size="small"
                    color={STATUS_COLORS[appointment.status] ?? 'default'}
                />
            </Box>
            <Divider sx={{ mt: 1.5 }} />
        </Box>
    )
}

export function ReceptionistDashboard() {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['dashboard', 'receptionist'],
        queryFn: () => dashboardApi.getReceptionistDashboard(),
        refetchInterval: 1000 * 60 * 5,
    })

    if (error) return <ErrorAlert error={error} onRetry={refetch} />

    return (
        <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                Good {getGreeting()}, here's today's overview
            </Typography>

            {/* Stats */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    {isLoading ? (
                        <Skeleton variant="rounded" height={120} />
                    ) : (
                        <StatCard
                            title="Today's Appointments"
                            value={data?.todayAppointments.total ?? 0}
                            icon={<CalendarMonth />}
                            color="primary"
                            subtitle={`${data?.todayAppointments.completed ?? 0} completed`}
                        />
                    )}
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    {isLoading ? (
                        <Skeleton variant="rounded" height={120} />
                    ) : (
                        <StatCard
                            title="Pending Invoices"
                            value={data?.pendingInvoices.count ?? 0}
                            icon={<Receipt />}
                            color="warning"
                            subtitle={`${data?.pendingInvoices.totalOutstanding?.toFixed(2) ?? 0} outstanding`}
                        />
                    )}
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    {isLoading ? (
                        <Skeleton variant="rounded" height={120} />
                    ) : (
                        <StatCard
                            title="New Patients Today"
                            value={data?.newPatientsToday ?? 0}
                            icon={<PersonAdd />}
                            color="success"
                        />
                    )}
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    {isLoading ? (
                        <Skeleton variant="rounded" height={120} />
                    ) : (
                        <StatCard
                            title="Total Active Patients"
                            value={data?.totalActivePatients ?? 0}
                            icon={<People />}
                            color="info"
                        />
                    )}
                </Grid>
            </Grid>

            {/* Appointment breakdown + upcoming */}
            <Grid container spacing={3}>
                {/* Status breakdown */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                                Today's Breakdown
                            </Typography>
                            {isLoading ? (
                                <Skeleton variant="rectangular" height={150} />
                            ) : (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                    {[
                                        { label: 'Scheduled', value: data?.todayAppointments.scheduled, color: 'primary' },
                                        { label: 'Confirmed', value: data?.todayAppointments.confirmed, color: 'success' },
                                        { label: 'Completed', value: data?.todayAppointments.completed, color: 'default' },
                                        { label: 'Cancelled', value: data?.todayAppointments.cancelled, color: 'error' },
                                    ].map((item) => (
                                        <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="body2">{item.label}</Typography>
                                            <Chip
                                                label={item.value ?? 0}
                                                size="small"
                                                color={item.color as 'primary' | 'success' | 'default' | 'error'}
                                            />
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Upcoming appointments */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                Upcoming Appointments
                            </Typography>
                            {isLoading ? (
                                <Skeleton variant="rectangular" height={200} />
                            ) : data?.upcomingAppointments.length === 0 ? (
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ py: 3, textAlign: 'center' }}
                                >
                                    No upcoming appointments for today
                                </Typography>
                            ) : (
                                data?.upcomingAppointments.map((apt) => (
                                    <AppointmentRow key={apt.id} appointment={apt} />
                                ))
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    )
}

function getGreeting() {
    const hour = new Date().getHours()
    if (hour < 12) return 'morning'
    if (hour < 17) return 'afternoon'
    return 'evening'
}