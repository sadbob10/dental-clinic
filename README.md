# Dental Clinic Management System

Production-grade Dental Clinic Management System — modular monolith backend, React admin panel, React Native patient app.

## Repository Structure

```
dental-clinic/
├── backend/        # Spring Boot 3 (Java 21) — REST API, JWT auth, PostgreSQL
├── frontend/        # React + TypeScript + Vite — Admin Panel (Receptionist / Dentist / Admin)
├── mobile/          # React Native (Expo) — Patient App (Phase 2)
├── docker-compose.yml
└── README.md
```

## Tech Stack

**Backend:** Java 21, Spring Boot 3, Spring Security, JWT, PostgreSQL, Flyway, MapStruct, Lombok, OpenAPI/Swagger
**Frontend:** React, TypeScript, Vite, Material UI, TanStack Query, Zustand, React Hook Form, Zod
**Mobile:** React Native (Expo), TypeScript, React Navigation, TanStack Query, Zustand, Zod
**Infra:** Docker, Docker Compose, Nginx, GitHub Actions

## Architecture

Modular monolith, Clean Architecture, REST API-first. One Spring Boot application with clearly separated modules: `auth`, `patient`, `appointment`, `treatment`, `billing`, `report`. No microservices, no Kafka, no Kubernetes — simplicity is a hard requirement for this project.

## Project Status

**Phase 1 — Web Admin Panel (MVP):** in progress
**Phase 2 — Mobile Patient App:** not started

| Step | Status      |
|---|-------------|
| Project Scaffold | Done        |
| Authentication & JWT | Done        |
| Patient Management | Done        |
| Appointment Management | Done        |
| Treatment Records | Done        |
| Billing | started |
| Reports | Not started |

## Local Development

```bash
# 1. Start Postgres
docker compose up -d postgres

# 2. Run backend
cd backend && ./mvnw spring-boot:run

# 3. Run frontend
cd frontend && npm install && npm run dev
```

Backend: `http://localhost:8002` · Swagger: `http://localhost:8002/swagger-ui.html` · Frontend: `http://localhost:5173`
