import { useState } from 'react'
import {
    Box, Card, CardContent, Grid, Typography, Chip,
    IconButton, MenuItem, TextField
} from '@mui/material'
import { ChevronLeft, ChevronRight } from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import { appointmentsApi } from '@/api/endpoints/appointments'
import { usersApi } from '@/api/endpoints/users'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { PageHeader } from '@/components/common/PageHeader'
import type { AppointmentStatus } from '@/types'
import dayjs from 'dayjs'

const STATUS_COLORS: Record<AppointmentStatus, string> = {
    SCHEDULED: '#2980b9', CONFIRMED: '#27ae60', COMPLETED: '#95a5a6',
    CANCELLED: '#e74c3c', NO_SHOW: '#f39c12',
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function AppointmentCalendarPage() {
    const today = dayjs()
    const [year, setYear] = useState(today.year())
    const [month, setMonth] = useState(today.month() + 1)
    const [dentistId, setDentistId] = useState<number | ''>('')

    const { data: dentists } = useQuery({
        queryKey: ['dentists'],
        queryFn: usersApi.getDentists,
    })

    const { data, isLoading, error } = useQuery({
        queryKey: ['calendar', year, month, dentistId],
        queryFn: () =>
            appointmentsApi.getCalendar(year, month, dentistId || undefined),
    })

    const currentMonth = dayjs(`${year}-${String(month).padStart(2, '0')}-01`)
    const daysInMonth = currentMonth.daysInMonth()
    const firstDayOfWeek = currentMonth.day()

    const prevMonth = () => {
        if (month === 1) { setYear(y => y - 1); setMonth(12) }
        else setMonth(m => m - 1)
    }
    const nextMonth = () => {
        if (month === 12) { setYear(y => y + 1); setMonth(1) }
        else setMonth(m => m + 1)
    }

    if (error) return <ErrorAlert error={error} />

    return (
        <Box>
            <PageHeader title="Appointment Calendar" />

            {/* Controls */}
            <Box display="flex" alignItems="center" gap={2} mb={3} flexWrap="wrap">
                <Box display="flex" alignItems="center" gap={1}>
                    <IconButton onClick={prevMonth}><ChevronLeft /></IconButton>
                    <Typography variant="h6" fontWeight={600} sx={{ minWidth: 160, textAlign: 'center' }}>
                        {currentMonth.format('MMMM YYYY')}
                    </Typography>
                    <IconButton onClick={nextMonth}><ChevronRight /></IconButton>
                </Box>
                <TextField
                    select label="Filter by Dentist"
                    value={dentistId}
                    onChange={(e) => setDentistId(e.target.value === '' ? '' : Number(e.target.value))}
                    sx={{ width: 220 }}
                    size="small"
                >
                    <MenuItem value="">All Dentists</MenuItem>
                    {dentists?.map((d) => (
                        <MenuItem key={d.id} value={d.id}>{d.fullName}</MenuItem>
                    ))}
                </TextField>
            </Box>

            {isLoading ? <LoadingSpinner /> : (
                <Card>
                    <CardContent>
                        {/* Day headers */}
                        <Grid container sx={{ mb: 1 }}>
                            {DAYS.map((day) => (
                                <Grid item xs={12 / 7} key={day}>
                                    <Typography
                                        variant="caption"
                                        fontWeight={600}
                                        color="text.secondary"
                                        textAlign="center"
                                        display="block"
                                        py={1}
                                    >
                                        {day}
                                    </Typography>
                                </Grid>
                            ))}
                        </Grid>

                        {/* Calendar grid */}
                        <Grid container>
                            {/* Empty cells before first day */}
                            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                                <Grid item xs={12 / 7} key={`empty-${i}`}>
                                    <Box
                                        sx={{
                                            minHeight: 100,
                                            borderTop: '1px solid',
                                            borderColor: 'divider',
                                            bgcolor: 'grey.50',
                                        }}
                                    />
                                </Grid>
                            ))}

                            {/* Day cells */}
                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                const dayNum = i + 1
                                const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
                                const dayAppointments = data?.days[dateKey] ?? []
                                const isToday =
                                    today.date() === dayNum &&
                                    today.month() + 1 === month &&
                                    today.year() === year

                                return (
                                    <Grid item xs={12 / 7} key={dayNum}>
                                        <Box
                                            sx={{
                                                minHeight: 100,
                                                borderTop: '1px solid',
                                                borderLeft: '1px solid',
                                                borderColor: 'divider',
                                                p: 0.5,
                                                bgcolor: isToday ? 'primary.lighter' : 'background.paper',
                                            }}
                                        >
                                            <Typography
                                                variant="caption"
                                                fontWeight={isToday ? 700 : 400}
                                                color={isToday ? 'primary.main' : 'text.secondary'}
                                                display="block"
                                                mb={0.5}
                                            >
                                                {dayNum}
                                            </Typography>
                                            {dayAppointments.slice(0, 3).map((apt) => (
                                                <Box
                                                    key={apt.id}
                                                    sx={{
                                                        bgcolor: STATUS_COLORS[apt.status],
                                                        color: 'white',
                                                        borderRadius: 0.5,
                                                        px: 0.5,
                                                        py: 0.25,
                                                        mb: 0.25,
                                                        fontSize: 10,
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                    }}
                                                >
                                                    {dayjs(apt.scheduledAt).format('h:mm')} {apt.patientName}
                                                </Box>
                                            ))}
                                            {dayAppointments.length > 3 && (
                                                <Typography variant="caption" color="text.secondary">
                                                    +{dayAppointments.length - 3} more
                                                </Typography>
                                            )}
                                        </Box>
                                    </Grid>
                                )
                            })}
                        </Grid>

                        {/* Legend */}
                        <Box display="flex" gap={2} mt={2} flexWrap="wrap">
                            {Object.entries(STATUS_COLORS).map(([status, color]) => (
                                <Box key={status} display="flex" alignItems="center" gap={0.5}>
                                    <Box sx={{ width: 12, height: 12, borderRadius: 0.5, bgcolor: color }} />
                                    <Typography variant="caption">{status}</Typography>
                                </Box>
                            ))}
                        </Box>
                    </CardContent>
                </Card>
            )}
        </Box>
    )
}