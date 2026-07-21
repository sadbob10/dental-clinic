// ── Auth ──────────────────────────────────────────────────────────────────────
export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
    email: string;
    fullName: string;
    role: 'ADMIN' | 'RECEPTIONIST' | 'DENTIST';
}

// ── Pagination ────────────────────────────────────────────────────────────────
export interface Page<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
}

// ── Users ─────────────────────────────────────────────────────────────────────
export type Role = 'ADMIN' | 'RECEPTIONIST' | 'DENTIST';

export interface UserResponse {
    id: number;
    fullName: string;
    email: string;
    role: Role;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface UserSummary {
    id: number;
    fullName: string;
    email: string;
    role: Role;
    isActive: boolean;
}

export interface UserRequest {
    fullName: string;
    email: string;
    password: string;
    role: Role;
}

// ── Patients ──────────────────────────────────────────────────────────────────
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface PatientResponse {
    id: number;
    fullName: string;
    dateOfBirth: string | null;
    gender: Gender | null;
    phone: string;
    email: string | null;
    address: string | null;
    emergencyContact: string | null;
    medicalNotes: string | null;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
}

export interface PatientSummary {
    id: number;
    fullName: string;
    dateOfBirth: string | null;
    gender: Gender | null;
    phone: string;
    email: string | null;
}

export interface PatientRequest {
    fullName: string;
    dateOfBirth?: string;
    gender?: Gender;
    phone: string;
    email?: string;
    address?: string;
    emergencyContact?: string;
    medicalNotes?: string;
}

// ── Appointments ──────────────────────────────────────────────────────────────
export type AppointmentStatus =
    | 'SCHEDULED'
    | 'CONFIRMED'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'NO_SHOW';

export type AppointmentType =
    | 'CHECKUP'
    | 'CLEANING'
    | 'FILLING'
    | 'EXTRACTION'
    | 'ROOT_CANAL'
    | 'WHITENING'
    | 'CONSULTATION'
    | 'OTHER';

export interface AppointmentResponse {
    id: number;
    patientId: number;
    patientName: string;
    dentistId: number;
    dentistName: string;
    scheduledAt: string;
    durationMinutes: number;
    status: AppointmentStatus;
    type: AppointmentType;
    notes: string | null;
    createdAt: string;
    createdBy: string;
}

export interface AppointmentSummary {
    id: number;
    patientName: string;
    dentistName: string;
    scheduledAt: string;
    durationMinutes: number;
    status: AppointmentStatus;
    type: AppointmentType;
}

export interface AppointmentRequest {
    patientId: number;
    dentistId: number;
    scheduledAt: string;
    durationMinutes: number;
    type: AppointmentType;
    notes?: string;
}

export interface CalendarResponse {
    year: number;
    month: number;
    days: Record<string, AppointmentSummary[]>;
}

// ── Treatment Records ─────────────────────────────────────────────────────────
export interface TreatmentRecordResponse {
    id: number;
    patientId: number;
    patientName: string;
    appointmentId: number | null;
    dentistId: number;
    dentistName: string;
    diagnosis: string | null;
    treatmentDone: string;
    prescription: string | null;
    nextVisitNotes: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface TreatmentRecordRequest {
    patientId: number;
    appointmentId?: number;
    dentistId: number;
    diagnosis?: string;
    treatmentDone: string;
    prescription?: string;
    nextVisitNotes?: string;
}

// ── Billing ───────────────────────────────────────────────────────────────────
export type InvoiceStatus =
    | 'DRAFT'
    | 'ISSUED'
    | 'PARTIALLY_PAID'
    | 'PAID'
    | 'CANCELLED';

export type PaymentMethod =
    | 'CASH'
    | 'CARD'
    | 'BANK_TRANSFER'
    | 'MOBILE_MONEY';

export interface InvoiceItemResponse {
    id: number;
    description: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
}

export interface InvoiceResponse {
    id: number;
    patientId: number;
    patientName: string;
    appointmentId: number | null;
    status: InvoiceStatus;
    totalAmount: number;
    discount: number;
    netAmount: number;
    notes: string | null;
    issuedAt: string | null;
    dueDate: string | null;
    items: InvoiceItemResponse[];
    createdAt: string;
    createdBy: string;
}

export interface InvoiceSummary {
    id: number;
    patientName: string;
    status: InvoiceStatus;
    netAmount: number;
    createdAt: string;
}

export interface InvoiceItemRequest {
    description: string;
    quantity: number;
    unitPrice: number;
}

export interface InvoiceRequest {
    patientId: number;
    appointmentId?: number;
    items: InvoiceItemRequest[];
    discount?: number;
    notes?: string;
    dueDate?: string;
}

export interface PaymentResponse {
    id: number;
    invoiceId: number;
    amountPaid: number;
    paymentMethod: PaymentMethod;
    paidAt: string;
    referenceNumber: string | null;
    notes: string | null;
}

export interface PaymentRequest {
    amountPaid: number;
    paymentMethod: PaymentMethod;
    referenceNumber?: string;
    notes?: string;
}

// ── Reports ───────────────────────────────────────────────────────────────────
export interface RevenueReportResponse {
    totalInvoiced: number;
    totalCollected: number;
    totalOutstanding: number;
    totalDiscount: number;
    invoiceCount: number;
    paidInvoiceCount: number;
    partiallyPaidCount: number;
    cancelledCount: number;
}

export interface DailyRevenueResponse {
    date: string;
    collected: number;
}

export interface AppointmentReportResponse {
    total: number;
    scheduled: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    noShow: number;
    byType: Record<string, number>;
}

export interface PatientReportResponse {
    totalPatients: number;
    newPatients: number;
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export interface TodayAppointmentStats {
    total: number;
    scheduled: number;
    confirmed: number;
    completed: number;
    cancelled: number;
}

export interface PendingInvoiceStats {
    count: number;
    totalOutstanding: number;
}

export interface ReceptionistDashboardResponse {
    todayAppointments: TodayAppointmentStats;
    upcomingAppointments: AppointmentSummary[];
    pendingInvoices: PendingInvoiceStats;
    newPatientsToday: number;
    totalActivePatients: number;
}

export interface DentistDashboardResponse {
    todayAppointments: AppointmentSummary[];
    nextAppointment: AppointmentSummary | null;
    completedToday: number;
    totalAppointmentsThisMonth: number;
}

// ── Audit ─────────────────────────────────────────────────────────────────────
export interface AuditLogResponse {
    id: number;
    action: string;
    entityType: string | null;
    entityId: string | null;
    performedBy: string | null;
    details: string | null;
    ipAddress: string | null;
    createdAt: string;
}

// ── API Error ─────────────────────────────────────────────────────────────────
export interface ApiError {
    status: number;
    error: string;
    timestamp: string;
    details?: Record<string, string>;
}