# System Architecture Specification

## 1. High-Level Architecture Overview
The system follows a modern decoupled client-server architecture consisting of a native Java Android Client, a Node.js Express REST API application with TypeScript, Prisma ORM, and a PostgreSQL database.

```
┌─────────────────────────────────────────────────────────────┐
│                 NATIVE ANDROID JAVA CLIENT                  │
│                                                             │
│  ┌─────────────────┐   ┌─────────────────┐   ┌───────────┐ │
│  │ UI Layer (XML)  │ ──│ ViewModel Layer │ ──│ Repository│ │
│  └─────────────────┘   └─────────────────┘   └─────┬─────┘ │
│                                                    │       │
│                        ┌───────────────────────────┴────┐  │
│                        │ Retrofit API & Room Offline DB │  │
│                        └────────────────┬───────────────┘  │
└─────────────────────────────────────────┼───────────────────┘
                                          │ HTTPS / REST API (JSON)
                                          ▼
┌─────────────────────────────────────────────────────────────┐
│                     NODE.JS / EXPRESS BACKEND               │
│                                                             │
│  ┌─────────────────┐   ┌─────────────────┐   ┌───────────┐ │
│  │ Express Routes  │ ──│ Security & RBAC │ ──│ Services  │ │
│  └─────────────────┘   └─────────────────┘   └─────┬─────┘ │
│                                                    │       │
│                                              ┌─────▼─────┐ │
│                                              │ Prisma ORM│ │
│                                              └─────┬─────┘ │
└────────────────────────────────────────────────────┼────────┘
                                                     │ SQL
                                                     ▼
                                          ┌───────────────────┐
                                          │ PostgreSQL Database│
                                          └───────────────────┘
```

## 2. Android Client Architecture (MVVM Pattern)
- **UI Layer (XML & Activities/Fragments):** Displays role-specific dashboards, forms, cards, and lists using Material Design 3.
- **ViewModel Layer:** Holds UI state and business logic survive configuration changes.
- **Repository Layer:** Acts as a single source of truth, managing network requests via Retrofit and local database access via Room for offline caching.
- **Local Database (Room/SQLite):** Caches user search history, pending requests, and donor profiles for offline usability.
- **Encrypted Preferences:** Stores JWT access/refresh tokens securely using `EncryptedSharedPreferences`.

## 3. Backend Architecture (Layered Controller-Service-ORM Pattern)
- **Routes Layer (`/api/v1/...`):** Endpoints definition mapped to Controllers.
- **Middleware Layer:** Handles JWT verification, Role-Based Access Control (`roleMiddleware`), validation (`express-validator`), and global error handling.
- **Controller Layer:** Parses incoming HTTP requests, calls domain services, and formats JSON API responses.
- **Service Layer:** Contains core business logic, including the blood request state machine transitions, inventory calculations, and audit logging.
- **Data Access Layer (Prisma ORM):** Interacts with PostgreSQL using strictly-typed Prisma queries and database transactions.

## 4. Key Workflows & Data Flows

### A. Authentication & Session Flow
1. User logs in with email and password.
2. Server verifies password hash using `bcrypt`.
3. Server generates short-lived JWT Access Token (15 mins) and long-lived Refresh Token (7 days).
4. Client stores tokens in `EncryptedSharedPreferences` and attaches `Bearer <token>` to all API calls via an OkHttp interceptor.

### B. Request Creation & Donor Matching Flow
1. Requester submits blood request (Blood Group, Location, Hospital, Urgency, Units).
2. Backend creates record in `BloodRequest` with status `OPEN`.
3. Backend searches discoverable `DonorProfile` records matching the requested `bloodGroup` and `town`/`city` with `isAvailable = true`.
4. System creates `Notification` records and triggers push alerts to matching donors.
5. Donors accept or decline, updating `DonorResponse` status.

### C. Blood Bank Stock Issue Transaction Flow
1. Blood Bank Officer initiates stock issue to a hospital.
2. System opens an atomic Prisma transaction (`$transaction`).
3. Verifies `unitsAvailable >= requestedUnits` in `BloodInventory`.
4. Decrements `unitsAvailable` in `BloodInventory`.
5. Inserts an `InventoryTransaction` record with type `ISSUE` and audit reason.
6. Writes an `AuditLog` entry.
7. Transaction commits; stock count is updated safely.
