import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { LoginPage } from '@/features/auth/LoginPage'
import { ReceptionistDashboard } from '@/features/dashboard/ReceptionistDashboard'
import { DentistDashboard } from '@/features/dashboard/DentistDashboard'
import { PatientListPage } from '@/features/patients/PatientListPage'
import { PatientFormPage } from '@/features/patients/PatientFormPage'
import { PatientProfilePage } from '@/features/patients/PatientProfilePage'
import { AppointmentListPage } from '@/features/appointments/AppointmentListPage'
import { AppointmentFormPage } from '@/features/appointments/AppointmentFormPage'
import { AppointmentCalendarPage } from '@/features/appointments/AppointmentCalendarPage'
import { TreatmentListPage } from '@/features/treatment/TreatmentListPage'
import { TreatmentFormPage } from '@/features/treatment/TreatmentFormPage'
import { InvoiceListPage } from '@/features/billing/InvoiceListPage'
import { InvoiceFormPage } from '@/features/billing/InvoiceFormPage'
import { InvoiceDetailPage } from '@/features/billing/InvoiceDetailPage'
import { ReportsPage } from '@/features/reports/ReportsPage'
import { UserListPage } from '@/features/users/UserListPage'
import { UserFormPage } from '@/features/users/UserFormPage'
import { AuditLogPage } from '@/features/audit/AuditLogPage'
import { UnauthorizedPage } from '@/features/auth/UnauthorizedPage'
import { useAuthStore } from '@/store/authStore'

function DashboardRedirect() {
    const { user } = useAuthStore()
    if (user?.role === 'DENTIST') return <Navigate to="/dashboard/dentist" replace />
    return <Navigate to="/dashboard/receptionist" replace />
}

export function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/unauthorized" element={<UnauthorizedPage />} />

                {/* Protected */}
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <AppLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<DashboardRedirect />} />

                    {/* Dashboards */}
                    <Route
                        path="dashboard/receptionist"
                        element={
                            <ProtectedRoute allowedRoles={['ADMIN', 'RECEPTIONIST']}>
                                <ReceptionistDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="dashboard/dentist"
                        element={
                            <ProtectedRoute allowedRoles={['ADMIN', 'DENTIST']}>
                                <DentistDashboard />
                            </ProtectedRoute>
                        }
                    />

                    {/* Patients */}
                    <Route path="patients" element={<PatientListPage />} />
                    <Route
                        path="patients/new"
                        element={
                            <ProtectedRoute allowedRoles={['ADMIN', 'RECEPTIONIST']}>
                                <PatientFormPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="patients/:id" element={<PatientProfilePage />} />
                    <Route
                        path="patients/:id/edit"
                        element={
                            <ProtectedRoute allowedRoles={['ADMIN', 'RECEPTIONIST']}>
                                <PatientFormPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Appointments */}
                    <Route path="appointments" element={<AppointmentListPage />} />
                    <Route path="appointments/calendar" element={<AppointmentCalendarPage />} />
                    <Route
                        path="appointments/new"
                        element={
                            <ProtectedRoute allowedRoles={['ADMIN', 'RECEPTIONIST']}>
                                <AppointmentFormPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="appointments/:id/edit"
                        element={
                            <ProtectedRoute allowedRoles={['ADMIN', 'RECEPTIONIST']}>
                                <AppointmentFormPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Treatment */}
                    <Route path="treatment" element={<TreatmentListPage />} />
                    <Route
                        path="treatment/new"
                        element={
                            <ProtectedRoute allowedRoles={['ADMIN', 'DENTIST']}>
                                <TreatmentFormPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Billing */}
                    <Route path="billing" element={<InvoiceListPage />} />
                    <Route
                        path="billing/new"
                        element={
                            <ProtectedRoute allowedRoles={['ADMIN', 'RECEPTIONIST']}>
                                <InvoiceFormPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="billing/:id" element={<InvoiceDetailPage />} />

                    {/* Reports */}
                    <Route
                        path="reports"
                        element={
                            <ProtectedRoute allowedRoles={['ADMIN', 'RECEPTIONIST']}>
                                <ReportsPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Users */}
                    <Route
                        path="users"
                        element={
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                                <UserListPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="users/new"
                        element={
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                                <UserFormPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="users/:id/edit"
                        element={
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                                <UserFormPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Audit */}
                    <Route
                        path="audit"
                        element={
                            <ProtectedRoute allowedRoles={['ADMIN']}>
                                <AuditLogPage />
                            </ProtectedRoute>
                        }
                    />
                </Route>

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    )
}