import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Box } from '@mui/material'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

const DRAWER_WIDTH = 240

export function AppLayout() {
    const [mobileOpen, setMobileOpen] = useState(false)

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar
                drawerWidth={DRAWER_WIDTH}
                mobileOpen={mobileOpen}
                onClose={() => setMobileOpen(false)}
            />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
                    minHeight: '100vh',
                    bgcolor: 'background.default',
                }}
            >
                <Topbar
                    drawerWidth={DRAWER_WIDTH}
                    onMenuClick={() => setMobileOpen(true)}
                />
                <Box sx={{ flexGrow: 1, p: 3, mt: 8 }}>
                    <Outlet />
                </Box>
            </Box>
        </Box>
    )
}