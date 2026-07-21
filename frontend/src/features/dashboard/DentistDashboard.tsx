import { Grid, Card, CardContent, Typography, Box, Chip, Divider, Skeleton } from '@mui/material'
import { CalendarMonth, CheckCircle, Schedule } from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '@/api/endpoints/dashboard'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { useAuthStore } from '@/store/authStore'
import type { AppointmentSummary } from '@/types'
import dayjs from 'dayjs'

const STATUS_COLORS: Record<string, 'default' | 'primary' | 'success' | 'error' | 'warning'> = {
    SCHEDULED: 'primary',
    CONFIRMED: 'success',
    COMPLETED: 'default',
    CANCELLED: 'error',
    NO_SHOW: 'warning',
}

function AppointmentCard({ appointment }: { appointment: AppointmentSummary }) {
    return (
        <Box sx={{ py: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {appointment.patientName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {dayjs(appointment.scheduledAt).format('h:mm A')} •{' '}
                        {appointment.durationMinutes} min • {appointment.type}
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

export function DentistDashboard() {
    const { user } = useAuthStore()

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['dashboard', 'dentist'],
        queryFn: () => dashboardApi.getDentistDashboard(),
        refetchInterval: 1000 * 60 * 5,
    })

    if (error) return <ErrorAlert error={error} onRetry={refetch} />

    return (
        <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                Good {getGreeting()}, Dr. {user?.fullName?.split(' ').pop()}
            </Typography>

            {/* Stats */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 4 }}>
                    {isLoading ? (
                        <Skeleton variant="rounded" height={120} />
                    ) : (
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <CalendarMonth color="primary" />
                                    <Typography variant="body2" color="text.secondary">
                                        Today's Appointments
                                    </Typography>
                                </Box>
                                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                    {data?.todayAppointments.length ?? 0}
                                </Typography>
                            </CardContent>
                        </Card>
                    )}
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    {isLoading ? (
                        <Skeleton variant="rounded" height={120} />
                    ) : (
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <CheckCircle color="success" />
                                    <Typography variant="body2" color="text.secondary">
                                        Completed Today
                                    </Typography>
                                </Box>
                                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                    {data?.completedToday ?? 0}
                                </Typography>
                            </CardContent>
                        </Card>
                    )}
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                    {isLoading ? (
                        <Skeleton variant="rounded" height={120} />
                    ) : (
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <Schedule color="info" />
                                    <Typography variant="body2" color="text.secondary">
                                        This Month
                                    </Typography>
                                </Box>
                                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                    {data?.totalAppointmentsThisMonth ?? 0}
                                </Typography>
                            </CardContent>
                        </Card>
                    )}
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                {/* Next appointment */}
                {data?.nextAppointment && (
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Card sx={{ borderLeft: '4px solid', borderColor: 'primary.main' }}>
                            <CardContent>
                                <Typography variant="subtitle2" color="primary" gutterBottom>
                                    NEXT APPOINTMENT
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    {data.nextAppointment.patientName}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {dayjs(data.nextAppointment.scheduledAt).format('h:mm A')}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {data.nextAppointment.type} •{' '}
                                    {data.nextAppointment.durationMinutes} min
                                </Typography>
                                <Chip
                                    label={data.nextAppointment.status}
                                    size="small"
                                    color={STATUS_COLORS[data.nextAppointment.status]}
                                    sx={{ mt: 1 }}
                                />
                            </CardContent>
                        </Card>
                    </Grid>
                )}

                {/* Today's schedule */}
                <Grid size={{ xs: 12, md: data?.nextAppointment ? 8 : 12 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                Today's Schedule
                            </Typography>
                            {isLoading ? (
                                <Skeleton variant="rectangular" height={200} />
                            ) : data?.todayAppointments.length === 0 ? (
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ py: 3, textAlign: 'center' }}
                                >
                                    No appointments scheduled for today
                                </Typography>
                            ) : (
                                data?.todayAppointments.map((apt) => (
                                    <AppointmentCard key={apt.id} appointment={apt} />
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