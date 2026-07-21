import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUser {
    email: string;
    fullName: string;
    role: 'ADMIN' | 'RECEPTIONIST' | 'DENTIST';
}

interface AuthState {
    user: AuthUser | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;

    setAuth: (
        user: AuthUser,
        accessToken: string,
        refreshToken: string
    ) => void;
    logout: () => void;
    isAdmin: () => boolean;
    isReceptionist: () => boolean;
    isDentist: () => boolean;
    hasRole: (roles: AuthUser['role'][]) => boolean;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,

            setAuth: (user, accessToken, refreshToken) => {
                // Also store in localStorage for axios interceptor
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);
                set({ user, accessToken, refreshToken, isAuthenticated: true });
            },

            logout: () => {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                set({
                    user: null,
                    accessToken: null,
                    refreshToken: null,
                    isAuthenticated: false,
                });
            },

            isAdmin: () => get().user?.role === 'ADMIN',
            isReceptionist: () => get().user?.role === 'RECEPTIONIST',
            isDentist: () => get().user?.role === 'DENTIST',
            hasRole: (roles) => {
                const role = get().user?.role;
                return role ? roles.includes(role) : false;
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);