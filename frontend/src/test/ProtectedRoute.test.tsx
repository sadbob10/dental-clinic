import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { useAuthStore } from '@/store/authStore'

vi.mock('@/store/authStore')

const mockUseAuthStore = vi.mocked(useAuthStore)

function renderProtected(isAuthenticated: boolean, role = 'ADMIN') {
    mockUseAuthStore.mockReturnValue({
        isAuthenticated,
        user: isAuthenticated ? { email: 'test@test.com', fullName: 'Test', role } : null,
    } as ReturnType<typeof useAuthStore>)

    return render(
        <MemoryRouter initialEntries={['/protected']}>
            <Routes>
                <Route path="/login" element={<div>Login Page</div>} />
                <Route
                    path="/protected"
                    element={
                        <ProtectedRoute>
                            <div>Protected Content</div>
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </MemoryRouter>
    )
}

describe('ProtectedRoute', () => {
    beforeEach(() => vi.clearAllMocks())

    it('redirects to login when not authenticated', () => {
        renderProtected(false)
        expect(screen.getByText('Login Page')).toBeInTheDocument()
    })

    it('renders children when authenticated', () => {
        renderProtected(true)
        expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })
})