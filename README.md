# Dental Clinic Management System

A production-grade Dental Clinic Management System with a React Admin Panel (Phase 1) and Patient Mobile App (Phase 2).

---

## Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Java | 25 (LTS) | Language |
| Spring Boot | 4.1.x | Framework |
| Spring Security | 7.x | Auth + JWT |
| PostgreSQL | 16 | Database |
| Flyway | 10.x | DB Migrations |
| MapStruct | 1.6.3 | DTO Mapping |
| Lombok | Latest | Boilerplate |
| OpenAPI/Swagger | 2.8.9 | API Docs |
| Bucket4j | 8.10.1 | Rate Limiting |
| OpenPDF | 2.0.3 | PDF Generation |

### Frontend (Phase 1)
| Technology | Purpose |
|---|---|
| React 18 + TypeScript | UI Framework |
| Vite | Build Tool |
| Material UI (MUI) | Component Library |
| TanStack Query | API State Management |
| Zustand | Local State |
| React Hook Form + Zod | Forms + Validation |

### Mobile (Phase 2)
| Technology | Purpose |
|---|---|
| React Native (Expo) | Mobile Framework |
| TypeScript | Language |
| React Navigation | Navigation |
| Expo Notifications | Push Notifications |

### Infrastructure
| Technology | Purpose |
|---|---|
| Docker + Docker Compose | Containerization |
| Nginx | Reverse Proxy |
| GitHub Actions | CI/CD |

---

## Project Structure

```
dental-clinic/
├── backend/          # Spring Boot REST API
├── frontend/         # React Admin Panel (Phase 1)
├── mobile/           # React Native Patient App (Phase 2)
├── docker-compose.yml
├── .env.example      # Environment variables template
└── README.md
```

---

## Quick Start

### Prerequisites
- Java 25
- Maven 3.9+
- Docker + Docker Compose
- Node.js 20+

### 1. Clone and Setup

```bash
git clone https://github.com/your-username/dental-clinic.git
cd dental-clinic
cp .env.example .env
# Edit .env with your values
```

### 2. Generate JWT Secret

```bash
openssl rand -hex 64
# Copy output to JWT_SECRET in .env
```

### 3. Start with Docker Compose

```bash
docker compose up -d
```

### 4. Run Backend Locally (Development)

```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

### 5. Run Frontend Locally

```bash
cd frontend
npm install
npm run dev
```

---

## API Documentation

Swagger UI available at:
```
http://localhost:8080/swagger-ui/index.html
```

---

## API Endpoints Summary

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/login | Login |
| POST | /api/auth/refresh | Refresh token |
| POST | /api/auth/logout | Logout |

### Users
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/users/me | Own profile |
| PATCH | /api/users/me/password | Change password |
| POST | /api/users | Create staff |
| GET | /api/users | List staff |
| GET | /api/users/dentists | Active dentists |
| GET | /api/users/{id} | Get staff |
| PUT | /api/users/{id} | Update staff |
| PATCH | /api/users/{id}/status | Activate/deactivate |

### Patients
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/patients | Create patient |
| GET | /api/patients | List + search |
| GET | /api/patients/search?phone= | Search by phone |
| GET | /api/patients/{id} | Get profile |
| PUT | /api/patients/{id} | Update |
| DELETE | /api/patients/{id} | Soft delete |
| GET | /api/patients/{id}/appointments | Appointment history |
| GET | /api/patients/{id}/invoices | Billing history |

### Appointments
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/appointments | Create |
| GET | /api/appointments | List + filter |
| GET | /api/appointments/today | Today's schedule |
| GET | /api/appointments/calendar | Calendar view |
| GET | /api/appointments/{id} | Get by ID |
| PUT | /api/appointments/{id} | Update |
| PATCH | /api/appointments/{id}/status | Change status |
| DELETE | /api/appointments/{id} | Soft delete |
| PATCH | /api/appointments/bulk-cancel | Bulk cancel |

### Treatment Records
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/treatment-records | Create |
| GET | /api/treatment-records/{id} | Get by ID |
| GET | /api/treatment-records/patient/{id} | Patient history |
| GET | /api/treatment-records/appointment/{id} | By appointment |
| PUT | /api/treatment-records/{id} | Update |

### Billing
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/invoices | Create invoice |
| GET | /api/invoices | List invoices |
| GET | /api/invoices/{id} | Get invoice |
| PUT | /api/invoices/{id} | Update (DRAFT) |
| PATCH | /api/invoices/{id}/status | Issue/cancel |
| GET | /api/invoices/{id}/pdf | Download PDF |
| POST | /api/invoices/{id}/payments | Record payment |
| GET | /api/invoices/{id}/payments | List payments |

### Reports
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/reports/revenue | Revenue summary |
| GET | /api/reports/revenue/daily | Daily breakdown |
| GET | /api/reports/appointments | Appointment stats |
| GET | /api/reports/patients | Patient stats |

### Dashboard
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/dashboard/receptionist | Receptionist view |
| GET | /api/dashboard/dentist | Dentist view |

### Audit
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/audit-logs | System audit trail |

---

## Environment Variables

See `.env.example` for full list.

Key variables:
| Variable | Required | Description |
|---|---|---|
| JWT_SECRET |  Yes | Min 64 chars, random |
| DB_PASSWORD |  Yes | Postgres password |
| MAIL_USERNAME | For email | Mailtrap/SMTP username |
| MAIL_PASSWORD | For email | Mailtrap/SMTP password |

---

## Roles & Permissions

| Role | Access |
|---|---|
| ADMIN | Full access |
| RECEPTIONIST | Patients, Appointments, Billing, Dashboard |
| DENTIST | Own schedule, Treatment records, Read-only billing |

---

## Default Admin Account

Created automatically on first run:
- **Email:** admin@dentalclinic.com
- **Password:** Set via `V3__fix_admin_password.sql` migration

Change the admin password immediately after first login.

---

## Database Migrations

Managed by Flyway. Migrations run automatically on startup.

| Version | Description |
|---|---|
| V1 | Baseline |
| V2 | Users table |
| V3 | Admin password fix |
| V4 | Patients table |
| V5 | Appointments table |
| V6 | Treatment records table |
| V7 | Billing tables |
| V8 | Refresh tokens table |
| V9 | Audit logs table |

---

## Development

### Running Tests

```bash
cd backend
./mvnw test
```

### Building for Production

```bash
cd backend
./mvnw clean package -DskipTests

cd frontend
npm run build
```

---

## Phase 2 — Mobile App

See `mobile/README.md` for the React Native patient app plan.

---

## License

Private — All rights reserved.