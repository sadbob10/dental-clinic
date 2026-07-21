import { Box, Typography, Button } from '@mui/material'
import { Add } from '@mui/icons-material'
import React from "react";

interface PageHeaderProps {
    title: string
    subtitle?: string
    actionLabel?: string
    onAction?: () => void
    actionIcon?: React.ReactNode
}

export function PageHeader({
                               title, subtitle, actionLabel, onAction,
                               actionIcon = <Add />,
                           }: PageHeaderProps) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3 }}>
            <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {title}
                </Typography>
                {subtitle && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {subtitle}
                    </Typography>
                )}
            </Box>
            {actionLabel && onAction && (
                <Button variant="contained" startIcon={actionIcon} onClick={onAction}>
                    {actionLabel}
                </Button>
            )}
        </Box>
    )
}