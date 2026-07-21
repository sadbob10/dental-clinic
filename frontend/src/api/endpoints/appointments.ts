import apiClient from '@/api/client'
import type {
    Page, AppointmentResponse, AppointmentSummary,
    AppointmentRequest, CalendarResponse
} from '@/types'

export const appointmentsApi = {
    getAll: async (params: {
        dentistId?: number; patientId?: number;
        status?: string; date?: string;
        page?: number; size?: number
    }) => {
        const res = await apiClient.get<Page<AppointmentSummary>>('/appointments', { params })
        return res.data
    },
    getToday: async () => {
        const res = await apiClient.get<AppointmentSummary[]>('/appointments/today')
        return res.data
    },
    getCalendar: async (year: number, month: number, dentistId?: number) => {
        const res = await apiClient.get<CalendarResponse>('/appointments/calendar', {
            params: { year, month, dentistId },
        })
        return res.data
    },
    getById: async (id: number) => {
        const res = await apiClient.get<AppointmentResponse>(`/appointments/${id}`)
        return res.data
    },
    create: async (data: AppointmentRequest) => {
        const res = await apiClient.post<AppointmentResponse>('/appointments', data)
        return res.data
    },
    update: async (id: number, data: AppointmentRequest) => {
        const res = await apiClient.put<AppointmentResponse>(`/appointments/${id}`, data)
        return res.data
    },
    updateStatus: async (id: number, status: string) => {
        const res = await apiClient.patch<AppointmentResponse>(
            `/appointments/${id}/status`, { status }
        )
        return res.data
    },
    delete: async (id: number) => {
        await apiClient.delete(`/appointments/${id}`)
    },
}