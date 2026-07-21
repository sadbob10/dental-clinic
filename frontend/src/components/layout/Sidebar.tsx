import {
    Box, Drawer, List, ListItem, ListItemButton,
    ListItemIcon, ListItemText, Divider, Typography, Chip
} from '@mui/material'
import {
    Dashboard, People, CalendarMonth, MedicalServices,
    Receipt, BarChart, ManageAccounts, Security, Logout,
    LocalHospital
} from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import type { AuthUser } from '@/store/authStore'
import apiClient from '@/api/client'
import React from "react";

interface NavItem {
    label: string
    path: string
    icon: React.ReactNode
    roles?: AuthUser['role'][]
}

const NAV_ITEMS: NavItem[] = [
    {
        label: 'Dashboard',
        path: '/',
        icon: <Dashboard />,
    },
    {
        label: 'Patients',
        path: '/patients',
        icon: <People />,
    },
    {
        label: 'Appointments',
        path: '/appointments',
        icon: <CalendarMonth />,
    },
    {
        label: 'Treatment',
        path: '/treatment',
        icon: <MedicalServices />,
    },
    {
        label: 'Billing',
        path: '/billing',
        icon: <Receipt />,
    },
    {
        label: 'Reports',
        path: '/reports',
        icon: <BarChart />,
        roles: ['ADMIN', 'RECEPTIONIST'],
    },
    {
        label: 'Users',
        path: '/users',
        icon: <ManageAccounts />,
        roles: ['ADMIN'],
    },
    {
        label: 'Audit Logs',
        path: '/audit',
        icon: <Security />,
        roles: ['ADMIN'],
    },
]

const ROLE_COLORS: Record<AuthUser['role'], 'primary' | 'success' | 'info'> = {
    ADMIN: 'primary',
    RECEPTIONIST: 'info',
    DENTIST: 'success',
}

interface SidebarProps {
    drawerWidth: number
    mobileOpen: boolean
    onClose: () => void
}

export function Sidebar({ drawerWidth, mobileOpen, onClose }: SidebarProps) {
    const navigate = useNavigate()
    const location = useLocation()
    const { user, logout, hasRole } = useAuthStore()

    const handleLogout = async () => {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
            try {
                await apiClient.post('/auth/logout', { refreshToken })
            } catch (_) { /* ignore */ }
        }
        logout()
        navigate('/login')
    }

    const visibleItems = NAV_ITEMS.filter(
        (item) => !item.roles || hasRole(item.roles)
    )

    const isActive = (path: string) => {
        if (path === '/') return location.pathname === '/'
        return location.pathname.startsWith(path)
    }

    const drawerContent = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Logo */}
            <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocalHospital color="primary" sx={{ fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 700 }} color="primary">
                    DentalClinic
                </Typography>
            </Box>
            <Divider />

            {/* User info */}
            {user && (
                <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }} noWrap>
                        {user.fullName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                        {user.email}
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                        <Chip
                            label={user.role}
                            size="small"
                            color={ROLE_COLORS[user.role]}
                            sx={{ height: 20, fontSize: 10 }}
                        />
                    </Box>
                </Box>
            )}
            <Divider />

            {/* Navigation */}
            <List sx={{ flexGrow: 1, px: 1, py: 1 }}>
                {visibleItems.map((item) => (
                    <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton
                            onClick={() => { navigate(item.path); onClose() }}
                            selected={isActive(item.path)}
                            sx={{
                                borderRadius: 2,
                                '&.Mui-selected': {
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                    '& .MuiListItemIcon-root': { color: 'white' },
                                    '&:hover': { bgcolor: 'primary.dark' },
                                },
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
                            <ListItemText
                                primary={item.label}
                                slotProps={{
                                    primary: {
                                        sx: { fontSize: 14, fontWeight: 500 },
                                    },
                                }}
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>

            <Divider />

            {/* Logout */}
            <List sx={{ px: 1, py: 1 }}>
                <ListItem disablePadding>
                    <ListItemButton onClick={handleLogout} sx={{ borderRadius: 2 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                            <Logout fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                            primary="Logout"
                            slotProps={{
                                primary: {
                                    sx: { fontSize: 14 },
                                },
                            }}
                        />
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    )

    return (
        <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
            {/* Mobile */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={onClose}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': { width: drawerWidth },
                }}
            >
                {drawerContent}
            </Drawer>

            {/* Desktop */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', md: 'block' },
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        borderRight: '1px solid rgba(0,0,0,0.08)',
                    },
                }}
                open
            >
                {drawerContent}
            </Drawer>
        </Box>
    )
}