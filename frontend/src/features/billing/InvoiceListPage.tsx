import { useState } from 'react'
import {
    Box, Card, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, TablePagination, TextField,
    MenuItem, IconButton, Tooltip, Chip, Skeleton
} from '@mui/material'
import { Visibility, PictureAsPdf } from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { billingApi } from '@/api/endpoints/billing'
import { PageHeader } from '@/components/common/PageHeader'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { useAuthStore } from '@/store/authStore'
import type { InvoiceStatus } from '@/types'
import dayjs from 'dayjs'

const STATUS_COLORS: Record<InvoiceStatus, 'default' | 'primary' | 'info' | 'warning' | 'success' | 'error'> = {
    DRAFT: 'default', ISSUED: 'info', PARTIALLY_PAID: 'warning',
    PAID: 'success', CANCELLED: 'error',
}

const STATUSES: InvoiceStatus[] = ['DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'CANCELLED']

export function InvoiceListPage() {
    const navigate = useNavigate()
    const { hasRole } = useAuthStore()
    const canCreate = hasRole(['ADMIN', 'RECEPTIONIST'])

    const [status, setStatus] = useState('')
    const [page, setPage] = useState(0)

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['invoices', { status, page }],
        queryFn: () => billingApi.getAll({
            status: status || undefined,
            page, size: 10,
        }),
    })

    const handleDownloadPdf = async (id: number) => {
        const blob = await billingApi.downloadPdf(id)
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `invoice-${id}.pdf`
        a.click()
        URL.revokeObjectURL(url)
    }

    if (error) return <ErrorAlert error={error} onRetry={refetch} />

    return (
        <Box>
            <PageHeader
                title="Invoices"
                subtitle={`${data?.totalElements ?? 0} total`}
                actionLabel={canCreate ? 'New Invoice' : undefined}
                onAction={canCreate ? () => navigate('/billing/new') : undefined}
            />

            <Box mb={2}>
                <TextField
                    select label="Status"
                    value={status}
                    onChange={(e) => { setStatus(e.target.value); setPage(0) }}
                    sx={{ width: 200 }}
                >
                    <MenuItem value="">All Statuses</MenuItem>
                    {STATUSES.map((s) => (
                        <MenuItem key={s} value={s}>{s}</MenuItem>
                    ))}
                </TextField>
            </Box>

            <Card>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>#</TableCell>
                                <TableCell>Patient</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Net Amount</TableCell>
                                <TableCell>Created</TableCell>
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
                                : data?.content.map((inv) => (
                                    <TableRow key={inv.id} hover>
                                        <TableCell sx={{ fontWeight: 600 }}>#{inv.id}</TableCell>
                                        <TableCell>{inv.patientName}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={inv.status}
                                                size="small"
                                                color={STATUS_COLORS[inv.status]}
                                            />
                                        </TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                                            {inv.netAmount.toFixed(2)}
                                        </TableCell>
                                        <TableCell>
                                            {dayjs(inv.createdAt).format('MMM D, YYYY')}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="View">
                                                <IconButton size="small" onClick={() => navigate(`/billing/${inv.id}`)}>
                                                    <Visibility fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Download PDF">
                                                <IconButton size="small" onClick={() => handleDownloadPdf(inv.id)}>
                                                    <PictureAsPdf fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
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
        </Box>
    )
}