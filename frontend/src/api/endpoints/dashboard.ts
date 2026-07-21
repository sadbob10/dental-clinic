import apiClient from '@/api/client'
import type {
    ReceptionistDashboardResponse,
    DentistDashboardResponse,
} from '@/types'

export const dashboardApi = {
    getReceptionistDashboard: async (date?: string) => {
        const params = date ? { date } : {}
        const res = await apiClient.get<ReceptionistDashboardResponse>(
            '/dashboard/receptionist', { params }
        )
        return res.data
    },

    getDentistDashboard: async () => {
        const res = await apiClient.get<DentistDashboardResponse>('/dashboard/dentist')
        return res.data
    },
}