import { useState } from 'react'
import {
    Box, Card, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, TablePagination, TextField, MenuItem,
    IconButton, Tooltip, Chip, Skeleton, Switch
} from '@mui/material'
import { Edit } from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { usersApi } from '@/api/endpoints/users'
import { PageHeader } from '@/components/common/PageHeader'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import type { Role } from '@/types'
import dayjs from 'dayjs'

const ROLE_COLORS: Record<Role, 'primary' | 'info' | 'success'> = {
    ADMIN: 'primary', RECEPTIONIST: 'info', DENTIST: 'success',
}

const ROLES: Role[] = ['ADMIN', 'RECEPTIONIST', 'DENTIST']

export function UserListPage() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [role, setRole] = useState<Role | ''>('')
    const [page, setPage] = useState(0)

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['users', { role, page }],
        queryFn: () => usersApi.getAll({ role: role || undefined, page, size: 10 }),
    })

    const statusMutation = useMutation({
        mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
            usersApi.updateStatus(id, isActive),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
    })

    if (error) return <ErrorAlert error={error} onRetry={refetch} />

    return (
        <Box>
            <PageHeader
                title="User Management"
                subtitle={`${data?.totalElements ?? 0} staff accounts`}
                actionLabel="New Staff Account"
                onAction={() => navigate('/users/new')}
            />

            <Box mb={2}>
                <TextField
                    select label="Filter by Role"
                    value={role}
                    onChange={(e) => { setRole(e.target.value as Role | ''); setPage(0) }}
                    sx={{ width: 200 }}
                >
                    <MenuItem value="">All Roles</MenuItem>
                    {ROLES.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                </TextField>
            </Box>

            <Card>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Role</TableCell>
                                <TableCell>Created</TableCell>
                                <TableCell align="center">Active</TableCell>
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
                                : data?.content.map((user) => (
                                    <TableRow key={user.id} hover>
                                        <TableCell sx={{ fontWeight: 600 }}>{user.fullName}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={user.role}
                                                size="small"
                                                color={ROLE_COLORS[user.role]}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {dayjs(user.isActive ? user.id : user.id).format('MMM D, YYYY')}
                                        </TableCell>
                                        <TableCell align="center">
                                            <Switch
                                                checked={user.isActive}
                                                onChange={(e) =>
                                                    statusMutation.mutate({ id: user.id, isActive: e.target.checked })
                                                }
                                                color="success"
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="Edit">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => navigate(`/users/${user.id}/edit`)}
                                                >
                                                    <Edit fontSize="small" />
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