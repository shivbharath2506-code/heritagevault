# HERITAGEVAULT — Digital Museum Management System
### Dedicated Operational & Curatorial Platform for Government Museum Chennai
**Institutional Code:** `CHN-MUS-001` • **Location:** Pantheon Complex, Egmore, Chennai, Tamil Nadu, India

---

## 🏛️ Project Overview

**HeritageVault** is a real-time, production-style digital museum management web application engineered specifically for **Government Museum Chennai** (established in 1851, the second oldest museum in India).

The system empowers authorized museum curators, conservators, administrators, and staff to manage artifacts, scientific conservation procedures, specialized restoration projects, exhibitions, daily visitor footfall, multi-dimensional analytics, and formal institutional audit reports.

Additionally, HeritageVault includes a **Public View Portal** where tourists, students, and citizens can view featured collections, active exhibitions, museum timings, and historical legacies without logging in.

---

## 🌟 Key Features

1. **Public Showcase Portal (Read-Only):**
   - Architectural and historical background of the Pantheon Complex.
   - Curated masterwork gallery (Bronze Chola Nataraja, Amaravati Sculptures, Roman Amphorae, Tanjore Gold Foil Paintings, Iron Age Burial Urns, etc.).
   - Current and upcoming exhibitions schedule and visitor info.

2. **Role-Based Access Control (RBAC):**
   - Cryptographic JWT authentication with bcrypt password hashing.
   - Enforced both at frontend routes and backend REST API levels (401 / 403 status codes).
   - Museum data isolation via verified `museum_id`.

3. **Artifact Management:**
   - Full cataloging with Name, Category, Historical Period, Discovery Origin, Material, Condition, Location, and Acquisition Date.
   - Real-time search and multi-criteria filtering by category and preservation condition.
   - Linked conservation and restoration trajectory inspection.

4. **Conservation & Scientific Wing:**
   - Condition Before / After tracking with chemical treatment procedures, consolidants, and climate-control recommendations.
   - Automatic artifact health updates.

5. **Curatorial Exhibitions:**
   - Schedule, update, and manage exhibitions (Planned, Active, Completed, Cancelled).
   - Dynamic linking of permanent vault artifacts into exhibition showcases.

6. **Restoration Projects:**
   - Structural repair tracking, specialist laboratory allocations, and INR (₹) expenditure audits.

7. **Visitor Headcount & Admissions:**
   - Daily admissions logging, exhibition-specific footfall, and aggregated averages.

8. **Analytics & Intelligence (Recharts):**
   - Interactive Area/Line charts for daily visitor trends.
   - Day-of-week attendance averages (weekend vs weekday distribution).
   - Curatorial category horizontal bar charts and condition health donut charts.
   - Restoration budget allocation breakdowns.

9. **Institutional Reports Generator:**
   - Formal official report documents complete with Government of Tamil Nadu emblems, executive summaries, itemized tables, and signature seal blocks.
   - Instant browser printing with tailored `@media print` stylesheets.
   - One-click CSV exports for audits.

10. **Redis Caching & Resilient Database:**
    - High-performance caching for analytics and artifact queries using Redis with automated cache invalidation upon CRUD mutations.
    - Resilient PostgreSQL pool with automatic schema initialization and initial seed data.

---

## 🔐 Default Demo Accounts & Role Permissions

| Role | Name | Email | Password | Allowed Modules & Operations |
| :--- | :--- | :--- | :--- | :--- |
| **ADMIN** | Dr. R. Sundaram | `admin@heritagevault.com` | `Admin@123` | **Full Access**: Artifacts, Conservation, Exhibitions, Restoration, Visitors, Analytics, Reports, User Administration |
| **CURATOR** | Meenakshi Krishnan | `curator@heritagevault.com` | `Curator@123` | Artifacts (CRUD), Exhibitions (CRUD), Visitors (View/Add). *Cannot manage Conservation, Restoration, or Admin Reports.* |
| **CONSERVATOR** | Arunmozhi Varman | `conservator@heritagevault.com` | `Conservator@123` | Conservation (CRUD), Restoration (CRUD), View Artifacts. *Cannot create artifacts, manage exhibitions, visitors, or reports.* |
| **STAFF** | Kavitha Selvam | `staff@heritagevault.com` | `Staff@123` | Visitors (View/Add), View Artifacts/Collections. *Restricted operational access.* |

---

## 🛠️ Technology Stack

- **Frontend:** React 18, TypeScript, Vite, Recharts, Lucide Icons, Vanilla CSS Design System.
- **Backend:** Node.js, Express.js, TypeScript, PostgreSQL (`pg`), Redis (`ioredis`), JWT, Bcrypt.
- **Database:** PostgreSQL 16 (Relational tables, foreign keys, cascading rules, performance indices).
- **Caching:** Redis 7 with cache invalidation pipelines.
- **Containerization:** Docker & Docker Compose.

---

## 📁 Application Structure

```
heritagevault/
├── docker-compose.yml
├── README.md
├── .env.example
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── artifactController.ts
│   │   │   ├── conservationController.ts
│   │   │   ├── exhibitionController.ts
│   │   │   ├── restorationController.ts
│   │   │   ├── visitorController.ts
│   │   │   ├── analyticsController.ts
│   │   │   ├── reportController.ts
│   │   │   └── museumController.ts
│   │   ├── middleware/
│   │   │   ├── authMiddleware.ts
│   │   │   ├── roleMiddleware.ts
│   │   │   └── errorHandler.ts
│   │   ├── routes/
│   │   │   ├── authRoutes.ts
│   │   │   ├── artifactRoutes.ts
│   │   │   ├── conservationRoutes.ts
│   │   │   ├── exhibitionRoutes.ts
│   │   │   ├── restorationRoutes.ts
│   │   │   ├── visitorRoutes.ts
│   │   │   ├── analyticsRoutes.ts
│   │   │   ├── reportRoutes.ts
│   │   │   └── healthRoutes.ts
│   │   ├── services/
│   │   │   └── cacheService.ts
│   │   ├── db.ts
│   │   ├── seed.ts
│   │   ├── schema.sql
│   │   └── server.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.tsx
    │   │   ├── Sidebar.tsx
    │   │   ├── StatCard.tsx
    │   │   ├── StatusBadge.tsx
    │   │   ├── Modal.tsx
    │   │   ├── ConfirmDialog.tsx
    │   │   └── ProtectedRoute.tsx
    │   ├── pages/
    │   │   ├── PublicLandingPage.tsx
    │   │   ├── LoginPage.tsx
    │   │   ├── DashboardPage.tsx
    │   │   ├── ArtifactsPage.tsx
    │   │   ├── ConservationPage.tsx
    │   │   ├── ExhibitionsPage.tsx
    │   │   ├── RestorationPage.tsx
    │   │   ├── VisitorsPage.tsx
    │   │   ├── AnalyticsPage.tsx
    │   │   └── ReportsPage.tsx
    │   ├── services/
    │   │   └── api.ts
    │   ├── context/
    │   │   ├── AuthContext.tsx
    │   │   └── ToastContext.tsx
    │   ├── types/
    │   │   └── index.ts
    │   ├── App.tsx
    │   ├── App.css
    │   └── main.tsx
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    └── index.html
```

---

## 🚀 Setup & Execution Guide

### Option 1: Quick Start (Standalone Local Development)

#### 1. Start Backend:
```bash
cd backend
npm install
npm run build
npm run dev
```
*Backend runs on `http://localhost:5000` with auto-migration and seeded data.*

#### 2. Start Frontend:
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

### Option 2: Docker Compose (PostgreSQL 16 + Redis 7)

```bash
docker compose up -d
```

---

## 📡 REST API Summary

### Authentication
- `POST /api/auth/login` — Authenticate staff credentials & issue JWT token.
- `POST /api/auth/register` — Register staff user.
- `GET /api/auth/me` — Retrieve active profile.

### Artifacts (Admin & Curator manage, All staff view)
- `GET /api/artifacts` — Query catalog with search, category, and condition filters.
- `GET /api/artifacts/:id` — Artifact details + linked conservation/restoration history.
- `POST /api/artifacts` — Register new artifact.
- `PUT /api/artifacts/:id` — Update artifact.
- `DELETE /api/artifacts/:id` — Delete artifact from registry.

### Conservation (Admin & Conservator only)
- `GET /api/conservation` — List conservation treatment logs.
- `POST /api/conservation` — Log new conservation procedure.
- `PUT /api/conservation/:id` — Update conservation record.
- `DELETE /api/conservation/:id` — Remove conservation log.

### Curatorial Exhibitions (Admin & Curator only)
- `GET /api/exhibitions` — List exhibitions with artifact and visitor counts.
- `POST /api/exhibitions` — Schedule new exhibition and link artifacts.
- `PUT /api/exhibitions/:id` — Update exhibition details.
- `DELETE /api/exhibitions/:id` — Remove exhibition.

### Restoration (Admin & Conservator only)
- `GET /api/restoration` — List restoration projects and cost metrics.
- `POST /api/restoration` — Create restoration project.
- `PUT /api/restoration/:id` — Update restoration status/cost.
- `DELETE /api/restoration/:id` — Delete restoration project.

### Visitors (Admin, Curator, and Staff)
- `GET /api/visitors` — Fetch attendance records and aggregate statistics.
- `POST /api/visitors` — Record daily attendance.
- `PUT /api/visitors/:id` — Update attendance count.
- `DELETE /api/visitors/:id` — Delete attendance record.

### Analytics (Admin only)
- `GET /api/analytics/summary` — High-level KPI metrics and recent activities.
- `GET /api/analytics/visitors` — Day-of-week trends and exhibition breakdowns.
- `GET /api/analytics/artifacts` — Curatorial category and condition distributions.
- `GET /api/analytics/conservation` — Specialist workloads and condition transitions.
- `GET /api/analytics/restoration` — Status and budget allocations.

### Reports (Admin only)
- `GET /api/reports` — Generate comprehensive JSON/CSV audit reports (`reportType=artifacts|visitors|conservation|restoration|exhibitions`).

### Public & System Health
- `GET /api/public/showcase` — Unauthenticated public landing page payload.
- `GET /api/health` — System status and Redis cache telemetry.
- `GET /api/db-test` — Live database connectivity validation.
