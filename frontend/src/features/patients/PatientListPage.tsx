import { useState } from 'react'
import {
    Box, Card, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, TablePagination, TextField, InputAdornment,
    IconButton, Tooltip, Chip, Skeleton, Avatar
} from '@mui/material'
import { Search, Visibility, Edit, Delete, Person } from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { patientsApi } from '@/api/endpoints/patients'
import { PageHeader } from '@/components/common/PageHeader'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { useAuthStore } from '@/store/authStore'
import type { PatientSummary } from '@/types'
import dayjs from 'dayjs'

export function PatientListPage() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { hasRole } = useAuthStore()
    const canEdit = hasRole(['ADMIN', 'RECEPTIONIST'])

    const [search, setSearch] = useState('')
    const [page, setPage] = useState(0)
    const [size] = useState(10)
    const [deleteTarget, setDeleteTarget] = useState<PatientSummary | null>(null)

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['patients', { search, page, size }],
        queryFn: () => patientsApi.getAll({ search: search || undefined, page, size }),
    })

    const deleteMutation = useMutation({
        mutationFn: (id: number) => patientsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['patients'] })
            setDeleteTarget(null)
        },
    })

    if (error) return <ErrorAlert error={error} onRetry={refetch} />

    return (
        <Box>
            <PageHeader
                title="Patients"
                subtitle={`${data?.totalElements ?? 0} total patients`}
                actionLabel={canEdit ? 'New Patient' : undefined}
                onAction={canEdit ? () => navigate('/patients/new') : undefined}
            />

            {/* Search */}
            <Box mb={2}>
                <TextField
                    placeholder="Search by name or phone..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(0) }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search fontSize="small" />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ width: 320 }}
                />
            </Box>

            {/* Table */}
            <Card>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Patient</TableCell>
                                <TableCell>Phone</TableCell>
                                <TableCell>Date of Birth</TableCell>
                                <TableCell>Gender</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isLoading
                                ? Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        {Array.from({ length: 5 }).map((__, j) => (
                                            <TableCell key={j}>
                                                <Skeleton />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                                : data?.content.map((patient) => (
                                    <TableRow key={patient.id} hover>
                                        <TableCell>
                                            <Box display="flex" alignItems="center" gap={1.5}>
                                                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light' }}>
                                                    <Person fontSize="small" />
                                                </Avatar>
                                                <Box>
                                                    <Box fontWeight={600} fontSize={14}>
                                                        {patient.fullName}
                                                    </Box>
                                                    {patient.email && (
                                                        <Box fontSize={12} color="text.secondary">
                                                            {patient.email}
                                                        </Box>
                                                    )}
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>{patient.phone}</TableCell>
                                        <TableCell>
                                            {patient.dateOfBirth
                                                ? dayjs(patient.dateOfBirth).format('MMM D, YYYY')
                                                : '—'}
                                        </TableCell>
                                        <TableCell>
                                            {patient.gender ? (
                                                <Chip
                                                    label={patient.gender}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            ) : '—'}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="View Profile">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => navigate(`/patients/${patient.id}`)}
                                                >
                                                    <Visibility fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            {canEdit && (
                                                <>
                                                    <Tooltip title="Edit">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => navigate(`/patients/${patient.id}/edit`)}
                                                        >
                                                            <Edit fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Delete">
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={() => setDeleteTarget(patient)}
                                                        >
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
                    rowsPerPage={size}
                    rowsPerPageOptions={[10]}
                    onPageChange={(_, p) => setPage(p)}
                />
            </Card>

            {/* Delete confirm */}
            <ConfirmDialog
                open={!!deleteTarget}
                title="Delete Patient"
                message={`Are you sure you want to delete ${deleteTarget?.fullName}? This cannot be undone.`}
                confirmLabel="Delete"
                confirmColor="error"
                loading={deleteMutation.isPending}
                onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
                onCancel={() => setDeleteTarget(null)}
            />
        </Box>
    )
}