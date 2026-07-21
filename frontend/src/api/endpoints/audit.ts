import apiClient from '@/api/client'
import type { Page, AuditLogResponse } from '@/types'

export const auditApi = {
    getAll: async (params: {
        performedBy?: string
        action?: string
        entityType?: string
        page?: number
        size?: number
    }) => {
        const res = await apiClient.get<Page<AuditLogResponse>>('/audit-logs', { params })
        return res.data
    },
}