import apiClient from '@/api/client'
import type {
    RevenueReportResponse, DailyRevenueResponse,
    AppointmentReportResponse, PatientReportResponse
} from '@/types'

export const reportsApi = {
    getRevenue: async (from: string, to: string) => {
        const res = await apiClient.get<RevenueReportResponse>('/reports/revenue', {
            params: { from, to },
        })
        return res.data
    },
    getDailyRevenue: async (from: string, to: string) => {
        const res = await apiClient.get<DailyRevenueResponse[]>('/reports/revenue/daily', {
            params: { from, to },
        })
        return res.data
    },
    getAppointments: async (from: string, to: string) => {
        const res = await apiClient.get<AppointmentReportResponse>('/reports/appointments', {
            params: { from, to },
        })
        return res.data
    },
    getPatients: async (from: string, to: string) => {
        const res = await apiClient.get<PatientReportResponse>('/reports/patients', {
            params: { from, to },
        })
        return res.data
    },
}