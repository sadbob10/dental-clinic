import { useState } from 'react'
import {
    Box, Card, CardContent, Grid, Typography, Chip, Button,
    Table, TableBody, TableCell, TableHead, TableRow,
    Divider, TextField, MenuItem, CircularProgress, Alert
} from '@mui/material'
import { PictureAsPdf, Payment } from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { billingApi } from '@/api/endpoints/billing'
import { ErrorAlert } from '@/components/common/ErrorAlert'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { PageHeader } from '@/components/common/PageHeader'
import { useAuthStore } from '@/store/authStore'
import type { InvoiceStatus, PaymentMethod } from '@/types'
import dayjs from 'dayjs'

const STATUS_COLORS: Record<InvoiceStatus, 'default' | 'primary' | 'info' | 'warning' | 'success' | 'error'> = {
    DRAFT: 'default', ISSUED: 'info', PARTIALLY_PAID: 'warning',
    PAID: 'success', CANCELLED: 'error',
}

const PAYMENT_METHODS: PaymentMethod[] = ['CASH', 'CARD', 'BANK_TRANSFER', 'MOBILE_MONEY']

const paymentSchema = z.object({
    amountPaid: z.number().min(0.01, 'Amount must be > 0'),
    paymentMethod: z.enum(['CASH', 'CARD', 'BANK_TRANSFER', 'MOBILE_MONEY']),
    referenceNumber: z.string().optional(),
    notes: z.string().optional(),
})

type PaymentForm = z.infer<typeof paymentSchema>

export function InvoiceDetailPage() {
    const { id } = useParams()
    const queryClient = useQueryClient()
    const { hasRole } = useAuthStore()
    const canManage = hasRole(['ADMIN', 'RECEPTIONIST'])
    const [showPaymentForm, setShowPaymentForm] = useState(false)

    const { data: invoice, isLoading, error } = useQuery({
        queryKey: ['invoice', id],
        queryFn: () => billingApi.getById(Number(id)),
    })

    const { data: payments } = useQuery({
        queryKey: ['payments', id],
        queryFn: () => billingApi.getPayments(Number(id)),
    })

    const statusMutation = useMutation({
        mutationFn: (status: string) => billingApi.updateStatus(Number(id), status),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoice', id] }),
    })

    const paymentMutation = useMutation({
        mutationFn: (data: PaymentForm) => billingApi.addPayment(Number(id), data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoice', id] })
            queryClient.invalidateQueries({ queryKey: ['payments', id] })
            setShowPaymentForm(false)
            reset()
        },
    })

    const { register, handleSubmit, control, reset, formState: { errors } } =
        useForm<PaymentForm>({
            resolver: zodResolver(paymentSchema),
            defaultValues: { paymentMethod: 'CASH' },
        })

    const handleDownloadPdf = async () => {
        const blob = await billingApi.downloadPdf(Number(id))
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `invoice-${id}.pdf`
        a.click()
        URL.revokeObjectURL(url)
    }

    if (isLoading) return <LoadingSpinner />
    if (error) return <ErrorAlert error={error} />
    if (!invoice) return null

    const totalPaid = payments?.reduce((sum, p) => sum + p.amountPaid, 0) ?? 0
    const balance = invoice.netAmount - totalPaid

    return (
        <Box>
            <PageHeader
                title={`Invoice #${invoice.id}`}
                subtitle={invoice.patientName}
            />

            {/* Action buttons */}
            <Box display="flex" gap={2} mb={3} flexWrap="wrap">
                <Button
                    variant="outlined"
                    startIcon={<PictureAsPdf />}
                    onClick={handleDownloadPdf}
                >
                    Download PDF
                </Button>
                {canManage && invoice.status === 'DRAFT' && (
                    <Button
                        variant="contained"
                        onClick={() => statusMutation.mutate('ISSUED')}
                        disabled={statusMutation.isPending}
                    >
                        Issue Invoice
                    </Button>
                )}
                {canManage && (invoice.status === 'ISSUED' || invoice.status === 'PARTIALLY_PAID') && (
                    <Button
                        variant="contained"
                        color="success"
                        startIcon={<Payment />}
                        onClick={() => setShowPaymentForm(true)}
                    >
                        Record Payment
                    </Button>
                )}
                {canManage && (invoice.status === 'DRAFT' || invoice.status === 'ISSUED') && (
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={() => statusMutation.mutate('CANCELLED')}
                        disabled={statusMutation.isPending}
                    >
                        Cancel
                    </Button>
                )}
            </Box>

            <Grid container spacing={3}>
                {/* Invoice info */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="subtitle1" fontWeight={600}>Details</Typography>
                                <Chip label={invoice.status} size="small" color={STATUS_COLORS[invoice.status]} />
                            </Box>
                            <Box mb={1}>
                                <Typography variant="caption" color="text.secondary">Patient</Typography>
                                <Typography variant="body2" fontWeight={500}>{invoice.patientName}</Typography>
                            </Box>
                            <Box mb={1}>
                                <Typography variant="caption" color="text.secondary">Created</Typography>
                                <Typography variant="body2">
                                    {dayjs(invoice.createdAt).format('MMM D, YYYY')}
                                </Typography>
                            </Box>
                            {invoice.issuedAt && (
                                <Box mb={1}>
                                    <Typography variant="caption" color="text.secondary">Issued</Typography>
                                    <Typography variant="body2">
                                        {dayjs(invoice.issuedAt).format('MMM D, YYYY')}
                                    </Typography>
                                </Box>
                            )}
                            {invoice.dueDate && (
                                <Box mb={1}>
                                    <Typography variant="caption" color="text.secondary">Due Date</Typography>
                                    <Typography variant="body2">
                                        {dayjs(invoice.dueDate).format('MMM D, YYYY')}
                                    </Typography>
                                </Box>
                            )}
                            <Divider sx={{ my: 2 }} />
                            <Box display="flex" justifyContent="space-between" mb={1}>
                                <Typography variant="body2">Subtotal</Typography>
                                <Typography variant="body2">{invoice.totalAmount.toFixed(2)}</Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between" mb={1}>
                                <Typography variant="body2">Discount</Typography>
                                <Typography variant="body2" color="error">-{invoice.discount.toFixed(2)}</Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between" mb={1}>
                                <Typography variant="body2" fontWeight={600}>Net Amount</Typography>
                                <Typography variant="body2" fontWeight={600}>{invoice.netAmount.toFixed(2)}</Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between" mb={1}>
                                <Typography variant="body2">Total Paid</Typography>
                                <Typography variant="body2" color="success.main">{totalPaid.toFixed(2)}</Typography>
                            </Box>
                            <Box
                                display="flex" justifyContent="space-between"
                                bgcolor={balance > 0 ? 'error.lighter' : 'success.lighter'}
                                p={1} borderRadius={1}
                            >
                                <Typography variant="body2" fontWeight={700}>Balance Due</Typography>
                                <Typography
                                    variant="body2"
                                    fontWeight={700}
                                    color={balance > 0 ? 'error.main' : 'success.main'}
                                >
                                    {balance.toFixed(2)}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={8}>
                    {/* Items */}
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="subtitle1" fontWeight={600} mb={2}>
                                Services
                            </Typography>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Description</TableCell>
                                        <TableCell align="center">Qty</TableCell>
                                        <TableCell align="right">Unit Price</TableCell>
                                        <TableCell align="right">Subtotal</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {invoice.items.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{item.description}</TableCell>
                                            <TableCell align="center">{item.quantity}</TableCell>
                                            <TableCell align="right">{item.unitPrice.toFixed(2)}</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 600 }}>
                                                {item.subtotal.toFixed(2)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Payment form */}
                    {showPaymentForm && (
                        <Card sx={{ mb: 3, border: '2px solid', borderColor: 'success.main' }}>
                            <CardContent>
                                <Typography variant="subtitle1" fontWeight={600} mb={2}>
                                    Record Payment
                                </Typography>
                                {paymentMutation.isError && (
                                    <Alert severity="error" sx={{ mb: 2 }}>
                                        {paymentMutation.error instanceof Error
                                            ? paymentMutation.error.message
                                            : 'Payment failed'}
                                    </Alert>
                                )}
                                <Box
                                    component="form"
                                    onSubmit={handleSubmit((d) => paymentMutation.mutate(d))}
                                >
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                label="Amount *"
                                                type="number"
                                                fullWidth
                                                inputProps={{ min: 0.01, step: 0.01, max: balance }}
                                                {...register('amountPaid', { valueAsNumber: true })}
                                                error={!!errors.amountPaid}
                                                helperText={errors.amountPaid?.message ?? `Balance: ${balance.toFixed(2)}`}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Controller
                                                name="paymentMethod"
                                                control={control}
                                                render={({ field }) => (
                                                    <TextField select label="Method *" fullWidth {...field}>
                                                        {PAYMENT_METHODS.map((m) => (
                                                            <MenuItem key={m} value={m}>{m}</MenuItem>
                                                        ))}
                                                    </TextField>
                                                )}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                label="Reference Number"
                                                fullWidth
                                                {...register('referenceNumber')}
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                label="Notes"
                                                fullWidth
                                                {...register('notes')}
                                            />
                                        </Grid>
                                    </Grid>
                                    <Box display="flex" gap={2} mt={2}>
                                        <Button onClick={() => setShowPaymentForm(false)}>Cancel</Button>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            color="success"
                                            disabled={paymentMutation.isPending}
                                        >
                                            {paymentMutation.isPending
                                                ? <CircularProgress size={20} color="inherit" />
                                                : 'Record Payment'}
                                        </Button>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    )}

                    {/* Payment history */}
                    <Card>
                        <CardContent>
                            <Typography variant="subtitle1" fontWeight={600} mb={2}>
                                Payment History
                            </Typography>
                            {!payments || payments.length === 0 ? (
                                <Typography color="text.secondary" textAlign="center" py={3}>
                                    No payments recorded yet
                                </Typography>
                            ) : (
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Date</TableCell>
                                            <TableCell>Method</TableCell>
                                            <TableCell>Reference</TableCell>
                                            <TableCell align="right">Amount</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {payments.map((p) => (
                                            <TableRow key={p.id}>
                                                <TableCell>{dayjs(p.paidAt).format('MMM D, YYYY h:mm A')}</TableCell>
                                                <TableCell>{p.paymentMethod}</TableCell>
                                                <TableCell>{p.referenceNumber ?? '—'}</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 600, color: 'success.main' }}>
                                                    {p.amountPaid.toFixed(2)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    )
}