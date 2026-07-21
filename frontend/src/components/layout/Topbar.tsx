import {
    AppBar, Toolbar, IconButton, Typography,
    Box, Tooltip
} from '@mui/material'
import { Menu, Notifications } from '@mui/icons-material'
import { useLocation } from 'react-router-dom'

const PAGE_TITLES: Record<string, string> = {
    '/': 'Dashboard',
    '/dashboard/receptionist': 'Receptionist Dashboard',
    '/dashboard/dentist': 'Dentist Dashboard',
    '/patients': 'Patients',
    '/appointments': 'Appointments',
    '/appointments/calendar': 'Appointment Calendar',
    '/treatment': 'Treatment Records',
    '/billing': 'Billing',
    '/reports': 'Reports',
    '/users': 'User Management',
    '/audit': 'Audit Logs',
}

interface TopbarProps {
    drawerWidth: number
    onMenuClick: () => void
}

export function Topbar({ drawerWidth, onMenuClick }: TopbarProps) {
    const location = useLocation()

    const title = Object.entries(PAGE_TITLES)
        .reverse()
        .find(([path]) => location.pathname.startsWith(path))?.[1] ?? 'Dental Clinic'

    return (
        <AppBar
            position="fixed"
            color="inherit"
            sx={{
                width: { md: `calc(100% - ${drawerWidth}px)` },
                ml: { md: `${drawerWidth}px` },
                bgcolor: 'background.paper',
                color: 'text.primary',
            }}
        >
            <Toolbar>
                <IconButton
                    edge="start"
                    onClick={onMenuClick}
                    sx={{ mr: 2, display: { md: 'none' } }}
                >
                    <Menu />
                </IconButton>

                <Typography variant="h6" sx={{ fontWeight: 600, flexGrow: 1 }}>
                    {title}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Tooltip title="Notifications">
                        <IconButton size="small">
                            <Notifications />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Toolbar>
        </AppBar>
    )
}