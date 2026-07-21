import { useState } from 'react'
import {
    Box, Card, CardContent, Grid, Typography, TextField,
    Button, Divider, Chip
} from '@mui/material'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'
import { useQuery } from '@tanstack/react-query'
import { reportsApi } from '@/api/endpoints/reports'
import { PageHeader } from '@/components/common/PageHeader'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import dayjs from 'dayjs'

const COLORS = ['#2980b9', '#27ae60', '#f39c12', '#e74c3c', '#9b59b6', '#1abc9c']

function StatBox({
                     label, value, color = 'text.primary'
                 }: {
    label: string; value: string | number; color?: string
}) {
    return (
        <Box textAlign="center" p={2}>
            <Typography variant="h4" fontWeight={700} color={color}>
                {value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
                {label}
            </Typography>
        </Box>
    )
}

export function ReportsPage() {
    const thisYear = dayjs().format('YYYY')
    const [from, setFrom] = useState(`${thisYear}-01-01`)
    const [to, setTo] = useState(dayjs().format('YYYY-MM-DD'))
    const [applied, setApplied] = useState({ from: `${thisYear}-01-01`, to: dayjs().format('YYYY-MM-DD') })

    const revenueQuery = useQuery({
        queryKey: ['report-revenue', applied],
        queryFn: () => reportsApi.getRevenue(applied.from, applied.to),
    })

    const dailyQuery = useQuery({
        queryKey: ['report-daily', applied],
        queryFn: () => reportsApi.getDailyRevenue(applied.from, applied.to),
    })

    const appointmentsQuery = useQuery({
        queryKey: ['report-appointments', applied],
        queryFn: () => reportsApi.getAppointments(applied.from, applied.to),
    })

    const patientsQuery = useQuery({
        queryKey: ['report-patients', applied],
        queryFn: () => reportsApi.getPatients(applied.from, applied.to),
    })

    const isLoading =
        revenueQuery.isLoading || dailyQuery.isLoading ||
        appointmentsQuery.isLoading || patientsQuery.isLoading

    const error =
        revenueQuery.error || dailyQuery.error ||
        appointmentsQuery.error || patientsQuery.error

    const apptByType = appointmentsQuery.data
        ? Object.entries(appointmentsQuery.data.byType)
            .filter(([, v]) => v > 0)
            .map(([name, value]) => ({ name, value }))
        : []

    const dailyChartData = dailyQuery.data?.map((d) => ({
        date: dayjs(d.date).format('MMM D'),
        collected: d.collected,
    })) ?? []

    return (
        <Box>
            <PageHeader title="Reports" subtitle="Revenue, appointments and patient statistics" />

            {/* Date range */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
                        <TextField
                            label="From"
                            type="date"
                            value={from}
                            onChange={(e) => setFrom(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            size="small"
                        />
                        <TextField
                            label="To"
                            type="date"
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            size="small"
                        />
                        <Button
                            variant="contained"
                            onClick={() => setApplied({ from, to })}
                        >
                            Apply
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            {error && <ErrorAlert error={error} />}
            {isLoading && <LoadingSpinner />}

            {!isLoading && !error && (
                <Grid container spacing={3}>
                    {/* Revenue summary */}
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Typography variant="subtitle1" fontWeight={600} mb={2}>
                                    Revenue Summary
                                </Typography>
                                <Grid container>
                                    <Grid item xs={6} md={3}>
                                        <StatBox
                                            label="Total Invoiced"
                                            value={revenueQuery.data?.totalInvoiced.toFixed(2) ?? 0}
                                            color="primary.main"
                                        />
                                    </Grid>
                                    <Grid item xs={6} md={3}>
                                        <StatBox
                                            label="Total Collected"
                                            value={revenueQuery.data?.totalCollected.toFixed(2) ?? 0}
                                            color="success.main"
                                        />
                                    </Grid>
                                    <Grid item xs={6} md={3}>
                                        <StatBox
                                            label="Outstanding"
                                            value={revenueQuery.data?.totalOutstanding.toFixed(2) ?? 0}
                                            color="warning.main"
                                        />
                                    </Grid>
                                    <Grid item xs={6} md={3}>
                                        <StatBox
                                            label="Total Discount"
                                            value={revenueQuery.data?.totalDiscount.toFixed(2) ?? 0}
                                            color="error.main"
                                        />
                                    </Grid>
                                </Grid>
                                <Divider sx={{ my: 2 }} />
                                <Box display="flex" gap={2} flexWrap="wrap" justifyContent="center">
                                    <Chip label={`${revenueQuery.data?.invoiceCount ?? 0} Total Invoices`} />
                                    <Chip label={`${revenueQuery.data?.paidInvoiceCount ?? 0} Paid`} color="success" />
                                    <Chip label={`${revenueQuery.data?.partiallyPaidCount ?? 0} Partial`} color="warning" />
                                    <Chip label={`${revenueQuery.data?.cancelledCount ?? 0} Cancelled`} color="error" />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Daily revenue chart */}
                    {dailyChartData.length > 0 && (
                        <Grid item xs={12} md={8}>
                            <Card>
                                <CardContent>
                                    <Typography variant="subtitle1" fontWeight={600} mb={2}>
                                        Daily Collections
                                    </Typography>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={dailyChartData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                            <YAxis tick={{ fontSize: 12 }} />
                                            <Tooltip />
                                            <Bar dataKey="collected" fill="#2980b9" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </Grid>
                    )}

                    {/* Appointments by type pie */}
                    {apptByType.length > 0 && (
                        <Grid item xs={12} md={4}>
                            <Card>
                                <CardContent>
                                    <Typography variant="subtitle1" fontWeight={600} mb={2}>
                                        Appointments by Type
                                    </Typography>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={apptByType}
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={80}
                                                dataKey="value"
                                                label={({ name, value }) => `${name}: ${value}`}
                                                labelLine={false}
                                            >
                                                {apptByType.map((_, index) => (
                                                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Legend />
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </Grid>
                    )}

                    {/* Appointment stats */}
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="subtitle1" fontWeight={600} mb={2}>
                                    Appointment Statistics
                                </Typography>
                                <Grid container>
                                    {[
                                        { label: 'Total', value: appointmentsQuery.data?.total ?? 0 },
                                        { label: 'Completed', value: appointmentsQuery.data?.completed ?? 0 },
                                        { label: 'Cancelled', value: appointmentsQuery.data?.cancelled ?? 0 },
                                        { label: 'No Show', value: appointmentsQuery.data?.noShow ?? 0 },
                                    ].map((item) => (
                                        <Grid item xs={6} key={item.label}>
                                            <StatBox label={item.label} value={item.value} />
                                        </Grid>
                                    ))}
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Patient stats */}
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="subtitle1" fontWeight={600} mb={2}>
                                    Patient Statistics
                                </Typography>
                                <Grid container>
                                    <Grid item xs={6}>
                                        <StatBox
                                            label="Total Active Patients"
                                            value={patientsQuery.data?.totalPatients ?? 0}
                                            color="primary.main"
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <StatBox
                                            label="New in Period"
                                            value={patientsQuery.data?.newPatients ?? 0}
                                            color="success.main"
                                        />
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}
        </Box>
    )
}