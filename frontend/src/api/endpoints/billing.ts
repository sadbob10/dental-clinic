import apiClient from '@/api/client'
import type {
    Page, InvoiceResponse, InvoiceSummary,
    InvoiceRequest, PaymentResponse, PaymentRequest
} from '@/types'

export const billingApi = {
    getAll: async (params: { patientId?: number; status?: string; page?: number; size?: number }) => {
        const res = await apiClient.get<Page<InvoiceSummary>>('/invoices', { params })
        return res.data
    },
    getById: async (id: number) => {
        const res = await apiClient.get<InvoiceResponse>(`/invoices/${id}`)
        return res.data
    },
    create: async (data: InvoiceRequest) => {
        const res = await apiClient.post<InvoiceResponse>('/invoices', data)
        return res.data
    },
    update: async (id: number, data: InvoiceRequest) => {
        const res = await apiClient.put<InvoiceResponse>(`/invoices/${id}`, data)
        return res.data
    },
    updateStatus: async (id: number, status: string) => {
        const res = await apiClient.patch<InvoiceResponse>(
            `/invoices/${id}/status`, null, { params: { status } }
        )
        return res.data
    },
    downloadPdf: async (id: number) => {
        const res = await apiClient.get(`/invoices/${id}/pdf`, { responseType: 'blob' })
        return res.data as Blob
    },
    getPayments: async (id: number) => {
        const res = await apiClient.get<PaymentResponse[]>(`/invoices/${id}/payments`)
        return res.data
    },
    addPayment: async (id: number, data: PaymentRequest) => {
        const res = await apiClient.post<PaymentResponse>(`/invoices/${id}/payments`, data)
        return res.data
    },
}