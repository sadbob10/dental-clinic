import {
    Box, Card, CardContent, Grid, TextField, MenuItem,
    Button, CircularProgress, Alert, Typography,
    Table, TableBody, TableCell, TableHead, TableRow,
    IconButton
} from '@mui/material'
import { Add, Delete } from '@mui/icons-material'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { billingApi } from '@/api/endpoints/billing'
import { patientsApi } from '@/api/endpoints/patients'
import { PageHeader } from '@/components/common/PageHeader'
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges'

const itemSchema = z.object({
    description: z.string().min(1, 'Required'),
    quantity: z.number().min(1),
    unitPrice: z.number().min(0.01, 'Must be > 0'),
})

const schema = z.object({
    patientId: z.number({ required_error: 'Patient is required' }),
    items: z.array(itemSchema).min(1, 'At least one item required'),
    discount: z.number().min(0).optional(),
    notes: z.string().optional(),
    dueDate: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export function InvoiceFormPage() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const { data: patients } = useQuery({
        queryKey: ['patients-all'],
        queryFn: () => patientsApi.getAll({ size: 100 }),
    })

    const {
        register, handleSubmit, control, watch,
        formState: { errors, isDirty },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            items: [{ description: '', quantity: 1, unitPrice: 0 }],
            discount: 0,
        },
    })

    const { fields, append, remove } = useFieldArray({ control, name: 'items' })
    useUnsavedChanges(isDirty)

    const watchItems = watch('items')
    const watchDiscount = watch('discount') ?? 0
    const subtotal = watchItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice || 0), 0)
    const netAmount = Math.max(0, subtotal - watchDiscount)

    const mutation = useMutation({
        mutationFn: (data: FormData) => billingApi.create(data),
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] })
            navigate(`/billing/${result.id}`)
        },
    })

    return (
        <Box>
            <PageHeader title="New Invoice" />

            {mutation.isError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {mutation.error?.message ?? 'Failed to create invoice'}
                </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit((d) => mutation.mutate(d))}>
                <Grid container spacing={3}>
                    {/* Patient + details */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Card>
                            <CardContent>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                                    Invoice Details
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12 }}>
                                        <Controller
                                            name="patientId"
                                            control={control}
                                            render={({ field }) => (
                                                <TextField
                                                    select label="Patient *" fullWidth
                                                    {...field} value={field.value ?? ''}
                                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                                    error={!!errors.patientId}
                                                    helperText={errors.patientId?.message}
                                                >
                                                    {patients?.content.map((p) => (
                                                        <MenuItem key={p.id} value={p.id}>
                                                            {p.fullName} — {p.phone}
                                                        </MenuItem>
                                                    ))}
                                                </TextField>
                                            )}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <TextField
                                            label="Due Date"
                                            type="datetime-local"
                                            fullWidth
                                            slotProps={{ inputLabel: { shrink: true } }}
                                            {...register('dueDate')}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <TextField
                                            label="Discount"
                                            type="number"
                                            fullWidth
                                            slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
                                            {...register('discount', { valueAsNumber: true })}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <TextField
                                            label="Notes"
                                            fullWidth multiline rows={3}
                                            {...register('notes')}
                                        />
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Totals */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                                    Summary
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography>Subtotal</Typography>
                                    <Typography sx={{ fontWeight: 600 }}>{subtotal.toFixed(2)}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography>Discount</Typography>
                                    <Typography color="error">-{watchDiscount.toFixed(2)}</Typography>
                                </Box>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        bgcolor: 'primary.main',
                                        color: 'white',
                                        p: 1.5,
                                        borderRadius: 1,
                                    }}
                                >
                                    <Typography sx={{ fontWeight: 700 }}>Net Amount</Typography>
                                    <Typography sx={{ fontWeight: 700 }}>{netAmount.toFixed(2)}</Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Line items */}
                    <Grid size={{ xs: 12 }}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                        Line Items
                                    </Typography>
                                    <Button
                                        size="small"
                                        startIcon={<Add />}
                                        onClick={() => append({ description: '', quantity: 1, unitPrice: 0 })}
                                    >
                                        Add Item
                                    </Button>
                                </Box>

                                {errors.items && (
                                    <Alert severity="error" sx={{ mb: 2 }}>At least one item required</Alert>
                                )}

                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Description</TableCell>
                                            <TableCell align="center" sx={{ width: 100 }}>Qty</TableCell>
                                            <TableCell align="right" sx={{ width: 140 }}>Unit Price</TableCell>
                                            <TableCell align="right" sx={{ width: 120 }}>Subtotal</TableCell>
                                            <TableCell sx={{ width: 48 }} />
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {fields.map((field, index) => {
                                            const qty = watchItems[index]?.quantity ?? 0
                                            const price = watchItems[index]?.unitPrice ?? 0
                                            return (
                                                <TableRow key={field.id}>
                                                    <TableCell>
                                                        <TextField
                                                            size="small" fullWidth
                                                            placeholder="Service description"
                                                            {...register(`items.${index}.description`)}
                                                            error={!!errors.items?.[index]?.description}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <TextField
                                                            size="small" type="number"
                                                            slotProps={{ htmlInput: { min: 1 } }}
                                                            {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <TextField
                                                            size="small" type="number"
                                                            slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
                                                            {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                                                            error={!!errors.items?.[index]?.unitPrice}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Typography sx={{ fontWeight: 600 }}>
                                                            {(qty * price).toFixed(2)}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        {fields.length > 1 && (
                                                            <IconButton size="small" color="error" onClick={() => remove(index)}>
                                                                <Delete fontSize="small" />
                                                            </IconButton>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
                    <Button onClick={() => navigate(-1)} disabled={mutation.isPending}>Cancel</Button>
                    <Button type="submit" variant="contained" disabled={mutation.isPending}>
                        {mutation.isPending
                            ? <CircularProgress size={20} color="inherit" />
                            : 'Create Invoice'}
                    </Button>
                </Box>
            </Box>
        </Box>
    )
}