import { useState } from 'react'
import {
    Box, Card, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, TablePagination, TextField,
    Chip, Skeleton
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { auditApi } from '@/api/endpoints/audit'
import { PageHeader } from '@/components/common/PageHeader'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import dayjs from 'dayjs'

const ACTION_COLORS: Record<string, 'default' | 'primary' | 'success' | 'error' | 'warning' | 'info'> = {
    LOGIN: 'success', LOGOUT: 'default',
    PATIENT_CREATED: 'primary', PATIENT_UPDATED: 'info', PATIENT_DELETED: 'error',
    APPOINTMENT_CREATED: 'primary', APPOINTMENT_STATUS_UPDATED: 'info',
    APPOINTMENTS_BULK_CANCELLED: 'warning',
    INVOICE_CREATED: 'primary', INVOICE_STATUS_UPDATED: 'info', PAYMENT_RECORDED: 'success',
    STAFF_CREATED: 'primary', STAFF_STATUS_UPDATED: 'info', PASSWORD_CHANGED: 'warning',
}

export function AuditLogPage() {
    const [performedBy, setPerformedBy] = useState('')
    const [action, setAction] = useState('')
    const [entityType, setEntityType] = useState('')
    const [page, setPage] = useState(0)

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['audit-logs', { performedBy, action, entityType, page }],
        queryFn: () => auditApi.getAll({
            performedBy: performedBy || undefined,
            action: action || undefined,
            entityType: entityType || undefined,
            page,
            size: 20,
        }),
    })

    if (error) return <ErrorAlert error={error} onRetry={refetch} />

    return (
        <Box>
            <PageHeader
                title="Audit Logs"
                subtitle="System activity trail"
            />

            {/* Filters */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                <TextField
                    label="Performed By"
                    placeholder="user@email.com"
                    value={performedBy}
                    onChange={(e) => { setPerformedBy(e.target.value); setPage(0) }}
                    size="small"
                    sx={{ width: 240 }}
                />
                <TextField
                    label="Action"
                    placeholder="LOGIN, PATIENT_CREATED..."
                    value={action}
                    onChange={(e) => { setAction(e.target.value); setPage(0) }}
                    size="small"
                    sx={{ width: 220 }}
                />
                <TextField
                    label="Entity Type"
                    placeholder="Patient, Appointment..."
                    value={entityType}
                    onChange={(e) => { setEntityType(e.target.value); setPage(0) }}
                    size="small"
                    sx={{ width: 200 }}
                />
            </Box>

            <Card>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Timestamp</TableCell>
                                <TableCell>Action</TableCell>
                                <TableCell>Entity</TableCell>
                                <TableCell>Performed By</TableCell>
                                <TableCell>Details</TableCell>
                                <TableCell>IP Address</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isLoading
                                ? Array.from({ length: 10 }).map((_, i) => (
                                    <TableRow key={i}>
                                        {Array.from({ length: 6 }).map((__, j) => (
                                            <TableCell key={j}><Skeleton /></TableCell>
                                        ))}
                                    </TableRow>
                                ))
                                : data?.content.map((log) => (
                                    <TableRow key={log.id} hover>
                                        <TableCell sx={{ whiteSpace: 'nowrap', fontSize: 12 }}>
                                            {dayjs(log.createdAt).format('MMM D, YYYY HH:mm:ss')}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={log.action}
                                                size="small"
                                                color={ACTION_COLORS[log.action] ?? 'default'}
                                                sx={{ fontSize: 10 }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ fontSize: 12 }}>
                                            {log.entityType ?? '—'}
                                            {log.entityId ? ` #${log.entityId}` : ''}
                                        </TableCell>
                                        <TableCell sx={{ fontSize: 12 }}>
                                            {log.performedBy ?? '—'}
                                        </TableCell>
                                        <TableCell sx={{ fontSize: 12, maxWidth: 200 }}>
                                            <Box
                                                sx={{
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {log.details ?? '—'}
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ fontSize: 12 }}>
                                            {log.ipAddress ?? '—'}
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
                    rowsPerPage={20}
                    rowsPerPageOptions={[20]}
                    onPageChange={(_, p) => setPage(p)}
                />
            </Card>
        </Box>
    )
}