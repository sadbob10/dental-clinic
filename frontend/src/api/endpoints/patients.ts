import apiClient from '@/api/client'
import type {
    Page, PatientResponse, PatientSummary,
    PatientRequest, AppointmentSummary, InvoiceSummary
} from '@/types'

export const patientsApi = {
    getAll: async (params: { search?: string; page?: number; size?: number }) => {
        const res = await apiClient.get<Page<PatientSummary>>('/patients', { params })
        return res.data
    },
    getById: async (id: number) => {
        const res = await apiClient.get<PatientResponse>(`/patients/${id}`)
        return res.data
    },
    create: async (data: PatientRequest) => {
        const res = await apiClient.post<PatientResponse>('/patients', data)
        return res.data
    },
    update: async (id: number, data: PatientRequest) => {
        const res = await apiClient.put<PatientResponse>(`/patients/${id}`, data)
        return res.data
    },
    delete: async (id: number) => {
        await apiClient.delete(`/patients/${id}`)
    },
    getAppointments: async (id: number) => {
        const res = await apiClient.get<AppointmentSummary[]>(`/patients/${id}/appointments`)
        return res.data
    },
    getInvoices: async (id: number) => {
        const res = await apiClient.get<InvoiceSummary[]>(`/patients/${id}/invoices`)
        return res.data
    },
}