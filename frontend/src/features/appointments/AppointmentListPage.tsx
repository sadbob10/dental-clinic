import { useState } from 'react'
import {
    Box, Card, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, TablePagination, MenuItem, TextField,
    IconButton, Tooltip, Chip, Skeleton, Button
} from '@mui/material'
import { Visibility, Edit, Delete, CalendarViewMonth } from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { appointmentsApi } from '@/api/endpoints/appointments'
import { PageHeader } from '@/components/common/PageHeader'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { useAuthStore } from '@/store/authStore'
import type { AppointmentSummary, AppointmentStatus } from '@/types'
import dayjs from 'dayjs'

const STATUS_COLORS: Record<AppointmentStatus, 'default' | 'primary' | 'success' | 'error' | 'warning'> = {
    SCHEDULED: 'primary', CONFIRMED: 'success', COMPLETED: 'default',
    CANCELLED: 'error', NO_SHOW: 'warning',
}

const STATUSES: AppointmentStatus[] = ['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']

export function AppointmentListPage() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { hasRole } = useAuthStore()
    const canEdit = hasRole(['ADMIN', 'RECEPTIONIST'])

    const [status, setStatus] = useState('')
    const [date, setDate] = useState('')
    const [page, setPage] = useState(0)
    const [deleteTarget, setDeleteTarget] = useState<AppointmentSummary | null>(null)

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['appointments', { status, date, page }],
        queryFn: () => appointmentsApi.getAll({
            status: status || undefined,
            date: date || undefined,
            page,
            size: 10,
        }),
    })

    const deleteMutation = useMutation({
        mutationFn: (id: number) => appointmentsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] })
            setDeleteTarget(null)
        },
    })

    if (error) return <ErrorAlert error={error} onRetry={refetch} />

    return (
        <Box>
            <PageHeader
                title="Appointments"
                subtitle={`${data?.totalElements ?? 0} total`}
                actionLabel={canEdit ? 'New Appointment' : undefined}
                onAction={canEdit ? () => navigate('/appointments/new') : undefined}
            />

            {/* Filters */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                <TextField
                    select
                    label="Status"
                    value={status}
                    onChange={(e) => { setStatus(e.target.value); setPage(0) }}
                    sx={{ width: 180 }}
                >
                    <MenuItem value="">All Statuses</MenuItem>
                    {STATUSES.map((s) => (
                        <MenuItem key={s} value={s}>{s}</MenuItem>
                    ))}
                </TextField>
                <TextField
                    type="date"
                    label="Date"
                    value={date}
                    onChange={(e) => { setDate(e.target.value); setPage(0) }}
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={{ width: 180 }}
                />
                <Button
                    variant="outlined"
                    startIcon={<CalendarViewMonth />}
                    onClick={() => navigate('/appointments/calendar')}
                >
                    Calendar View
                </Button>
            </Box>

            <Card>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Patient</TableCell>
                                <TableCell>Dentist</TableCell>
                                <TableCell>Date & Time</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isLoading
                                ? Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        {Array.from({ length: 6 }).map((__, j) => (
                                            <TableCell key={j}><Skeleton /></TableCell>
                                        ))}
                                    </TableRow>
                                ))
                                : data?.content.map((apt) => (
                                    <TableRow key={apt.id} hover>
                                        <TableCell sx={{ fontWeight: 600 }}>{apt.patientName}</TableCell>
                                        <TableCell>{apt.dentistName}</TableCell>
                                        <TableCell>
                                            <Box sx={{ fontSize: 14 }}>{dayjs(apt.scheduledAt).format('MMM D, YYYY')}</Box>
                                            <Box sx={{ fontSize: 12, color: 'text.secondary' }}>
                                                {dayjs(apt.scheduledAt).format('h:mm A')} • {apt.durationMinutes} min
                                            </Box>
                                        </TableCell>
                                        <TableCell>{apt.type}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={apt.status}
                                                size="small"
                                                color={STATUS_COLORS[apt.status]}
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="View">
                                                <IconButton size="small" onClick={() => navigate(`/appointments/${apt.id}/edit`)}>
                                                    <Visibility fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            {canEdit && (
                                                <>
                                                    <Tooltip title="Edit">
                                                        <IconButton size="small" onClick={() => navigate(`/appointments/${apt.id}/edit`)}>
                                                            <Edit fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Delete">
                                                        <IconButton size="small" color="error" onClick={() => setDeleteTarget(apt)}>
                                                            <Delete fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    component="div"
                    count={data?.totalElements ?? 0}
                    page={page}
                    rowsPerPage={10}
                    rowsPerPageOptions={[10]}
                    onPageChange={(_, p) => setPage(p)}
                />
            </Card>

            <ConfirmDialog
                open={!!deleteTarget}
                title="Cancel Appointment"
                message={`Cancel appointment for ${deleteTarget?.patientName}?`}
                confirmLabel="Delete"
                confirmColor="error"
                loading={deleteMutation.isPending}
                onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
                onCancel={() => setDeleteTarget(null)}
            />
        </Box>
    )
}