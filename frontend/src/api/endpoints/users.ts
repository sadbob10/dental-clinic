import apiClient from '@/api/client'
import type { Page, UserResponse, UserSummary, UserRequest } from '@/types'

export const usersApi = {
    getAll: async (params: { role?: string; page?: number; size?: number }) => {
        const res = await apiClient.get<Page<UserSummary>>('/users', { params })
        return res.data
    },
    getDentists: async () => {
        const res = await apiClient.get<UserSummary[]>('/users/dentists')
        return res.data
    },
    getMe: async () => {
        const res = await apiClient.get<UserResponse>('/users/me')
        return res.data
    },
    getById: async (id: number) => {
        const res = await apiClient.get<UserResponse>(`/users/${id}`)
        return res.data
    },
    create: async (data: UserRequest) => {
        const res = await apiClient.post<UserResponse>('/users', data)
        return res.data
    },
    update: async (id: number, data: UserRequest) => {
        const res = await apiClient.put<UserResponse>(`/users/${id}`, data)
        return res.data
    },
    updateStatus: async (id: number, isActive: boolean) => {
        const res = await apiClient.patch<UserResponse>(
            `/users/${id}/status`, null, { params: { isActive } }
        )
        return res.data
    },
    changePassword: async (data: {
        currentPassword: string
        newPassword: string
        confirmPassword: string
    }) => {
        await apiClient.patch('/users/me/password', data)
    },
}