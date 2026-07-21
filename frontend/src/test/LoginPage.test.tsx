import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@mui/material/styles'
import { LoginPage } from '@/features/auth/LoginPage'
import { theme } from '@/theme/theme'

vi.mock('@/api/client', () => ({
    default: {
        post: vi.fn(),
        interceptors: {
            request: { use: vi.fn() },
            response: { use: vi.fn() },
        },
    },
}))

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return { ...actual, useNavigate: () => vi.fn() }
})

function renderLogin() {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    })
    return render(
        <QueryClientProvider client={queryClient}>
            <ThemeProvider theme={theme}>
                <MemoryRouter>
                    <LoginPage />
                </MemoryRouter>
            </ThemeProvider>
        </QueryClientProvider>
    )
}

describe('LoginPage', () => {
    beforeEach(() => vi.clearAllMocks())

    it('renders login form', () => {
        renderLogin()
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    })

    it('shows validation errors on empty submit', async () => {
        renderLogin()
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
        await waitFor(() => {
            expect(screen.getByText(/invalid email/i)).toBeInTheDocument()
        })
    })

    it('shows password required error', async () => {
        renderLogin()
        fireEvent.change(screen.getByLabelText(/email/i), {
            target: { value: 'test@test.com' },
        })
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
        await waitFor(() => {
            expect(screen.getByText(/password is required/i)).toBeInTheDocument()
        })
    })
})