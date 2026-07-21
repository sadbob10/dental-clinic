import { useAuthStore } from '@/store/authStore'
import { useNavigate } from 'react-router-dom'
import apiClient from '@/api/client'

export function useAuth() {
    const store = useAuthStore()
    const navigate = useNavigate()

    const logout = async () => {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
            try {
                await apiClient.post('/auth/logout', { refreshToken })
            } catch (_) { /* ignore */ }
        }
        store.logout()
        navigate('/login')
    }

    return { ...store, logout }
}