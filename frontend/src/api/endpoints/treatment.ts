import apiClient from '@/api/client'
import type { TreatmentRecordResponse, TreatmentRecordRequest } from '@/types'

export const treatmentApi = {
    getByPatient: async (patientId: number) => {
        const res = await apiClient.get<TreatmentRecordResponse[]>(
            `/treatment-records/patient/${patientId}`
        )
        return res.data
    },
    getById: async (id: number) => {
        const res = await apiClient.get<TreatmentRecordResponse>(`/treatment-records/${id}`)
        return res.data
    },
    create: async (data: TreatmentRecordRequest) => {
        const res = await apiClient.post<TreatmentRecordResponse>('/treatment-records', data)
        return res.data
    },
    update: async (id: number, data: TreatmentRecordRequest) => {
        const res = await apiClient.put<TreatmentRecordResponse>(`/treatment-records/${id}`, data)
        return res.data
    },
}