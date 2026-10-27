# Blood Donor Finder & Blood Bank Management System

A full-stack, enterprise-grade, role-based Android mobile application and Node.js REST API backend designed to streamline emergency blood sourcing, request tracking, and blood bank inventory control across five distinct user roles.

---

## Key Features & 5 User Roles
1. **DONOR:** Profile registration, ABO/Rh blood group recording, availability toggle, request response coordination, donation history tracking.
2. **REQUESTER:** Emergency donor search by blood group & city, blood request creation, real-time request tracking, direct donor communication upon consent.
3. **HOSPITAL_STAFF:** Verified hospital blood requests, donor response tracking, clinical inquiry into blood bank inventory, coordination outcome logging.
4. **BLOOD_BANK_OFFICER:** Audited inventory management, verified stock receipts, atomic stock issues & hospital transfers, low-stock & expiry alerts.
5. **SYSTEM_ADMINISTRATOR:** Verification of hospital & blood bank organizations, account role management, security audit log monitoring.

---

## Technology Stack

### Android Client (Frontend)
- **Language:** Java (Android Studio)
- **UI Architecture:** XML Layouts, Material Design 3 Components, MVVM Pattern
- **Networking:** Retrofit 2, OkHttp 4, Gson
- **Offline Caching:** Room Database (SQLite)
- **Security:** EncryptedSharedPreferences (AES-256)

### Backend Service
- **Runtime & Framework:** Node.js, Express.js, TypeScript
- **Database:** SQLite / PostgreSQL (Prisma ORM)
- **Authentication:** JWT (Access & Refresh Tokens), bcrypt password hashing

---

## Getting Started & Installation

### Prerequisites
- Node.js (v18+) & npm
- Android Studio Jellyfish / Ladybug or newer

### 1. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Initialize local SQLite database schema & seed initial data
npx prisma db push
npm run prisma:seed

# Start backend development server
npm run dev
```

The REST API server will run at **`http://localhost:5050`** (and **`http://10.0.2.2:5050`** from the Android Emulator).

### 2. Web Portal Setup (React + TypeScript)
```bash
# Navigate to web directory
cd web

# Install dependencies
npm install

# Start development server
npm run dev
```

The Web Portal dashboard will run at **`http://localhost:3000`**.

---

## Pre-Configured Demo Credentials (Password: `Password123!`)
- 🏥 **Hospital Staff:** `hospital@gmail.com` (City Central Hospital, Metropolis)
- 🩸 **Blood Bank Officer:** `bloodbank@gmail.com` (Metropolis Central Blood Bank)
- 🛡️ **System Administrator:** `admin@gmail.com` (Master Governance & Approvals)
- 👤 **Blood Donor (Mobile):** `donor@gmail.com` / `donor2@gmail.com`
- 🙋 **Blood Requester (Mobile):** `requester@gmail.com`

---

## API Endpoints Summary
- `GET /health` - Healthcheck endpoint
- `POST /api/v1/auth/register` - User registration (Donor, Requester)
- `POST /api/v1/auth/register-organization` - Organization registration (Pending approval)
- `POST /api/v1/auth/login` - User authentication & role verification
- `GET /api/v1/donors/search` - Search discoverable donors
- `POST /api/v1/requests` - Create blood request (Requester & Hospital)
- `GET /api/v1/requests` - List requests with responses and hospital details
- `PATCH /api/v1/requests/:id/status` - Update request status
- `GET /api/v1/inventory` - Query verified blood bank stock
- `GET /api/v1/inventory/batches` - Query cold-chain batches & expiry tracker
- `GET /api/v1/inventory/transactions` - Stock audit trail
- `POST /api/v1/inventory/receipts` - Log verified blood receipt
- `POST /api/v1/inventory/transactions/issue` - Issue stock to recipient hospital
- `GET /api/v1/admin/stats` - System overview metrics
- `GET /api/v1/admin/organizations/pending` - Pending organization applications
- `GET /api/v1/admin/organizations` - All healthcare facilities directory
- `PATCH /api/v1/admin/organizations/:id/verify` - Approve/reject facility & activate staff
- `GET /api/v1/admin/users` - User access & role management
- `PATCH /api/v1/admin/users/:id/status` - Suspend or activate user
- `GET /api/v1/admin/audit-logs` - System audit logs

