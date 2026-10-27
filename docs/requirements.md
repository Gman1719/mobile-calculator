# Phase 1: Requirements and Planning Specification

## 1. Project Explanation
The **Blood Donor Finder and Blood Bank Management System** is a mobile-first digital platform connecting voluntary blood donors, emergency requesters, authorized hospital staff, blood bank inventory officers, and system administrators. The system streamlines the emergency discovery of potential blood donors while providing audited, transactional blood bank inventory management.

## 2. Problem Statement
1. **Fragmented Emergency Sourcing:** Sourcing emergency blood donors currently relies on ad-hoc social media posts or phone calls, resulting in delays during critical medical situations.
2. **Lack of Inventory Visibility:** Hospitals frequently lack real-time visibility into local blood bank stock levels, leading to stockout risks and inefficient transfer delays.
3. **Inaccurate Inventory Tracking:** Manual logging and lack of audit trails in blood banks lead to unrecorded issues, expired stock wastage, and inventory mismatches.
4. **Security & Privacy Risks:** Unrestricted public listing of donor phone numbers and patient medical details creates privacy violations and potential misuse.

## 3. General Objective
To design, develop, test, and document a native Java Android application with a Node.js/Express/Prisma/PostgreSQL backend that facilitates secure blood donor matching, request coordination, and blood bank inventory control across five distinct user roles.

## 4. Specific Objectives
- Implement secure Role-Based Access Control (RBAC) supporting Donors, Requesters, Hospital Staff, Blood Bank Officers, and System Administrators.
- Develop a donor search and invitation engine filtered by ABO/Rh blood group, geographic location (town/city), and donor availability consent.
- Create a blood request workflow with strict status state machine transitions (`OPEN`, `MATCHING`, `RESPONSES_RECEIVED`, `IN_PROGRESS`, `FULFILLED`, `CANCELLED`, `EXPIRED`).
- Build an audited blood bank inventory management module with atomic transactions for stock receipts, transfers, issues, and adjustments.
- Design clean XML-based Android layouts with offline caching support (Room/SQLite) and Retrofit network integration.
- Implement system administration features for organizational verification (Hospitals and Blood Banks) and audit trail inspection.

## 5. Scope and Limitations

### Scope
- **Android App:** Native Java app using Android Studio, XML Layouts, Material Design Components, Retrofit, OkHttp, Room/SQLite local database, WorkManager, and Firebase Cloud Messaging.
- **Backend Service:** Node.js with Express, TypeScript/JavaScript, Prisma ORM, PostgreSQL database, JWT authentication, OpenAPI/Swagger API documentation.
- **Role Management:** 5 distinct roles with multi-role account support where authorized.

### Limitations
- **Medical Disclaimer:** The platform is an administrative and communication tool. ABO/Rh matching in the app identifies potential donors only; clinical compatibility testing (cross-matching) must be performed by qualified medical professionals.
- **Inventory Sourcing:** Voluntary donor registration or agreement to donate does **not** automatically increase blood bank stock. Stock increases require physical verification and authorized receipt logging by a Blood Bank Officer.

---

## 6. Five User Roles and Responsibilities

| Role | Core Responsibilities | Key Capabilities |
| :--- | :--- | :--- |
| **DONOR** | Voluntary blood donation participant | Register profile, set blood type & town, toggle contact availability & notification preferences, respond to requests, view donation history. |
| **REQUESTER** | Patient/Family member seeking blood | Search discoverable donors by blood group & city, create emergency blood requests, track status updates, communicate with willing donors, close requests. |
| **HOSPITAL_STAFF** | Verified clinical/hospital personnel | Sign in via verified hospital account, manage official hospital requests, review donor responses, query blood bank stock availability, record clinical outcomes. |
| **BLOOD_BANK_OFFICER** | Verified inventory manager | Log verified blood stock receipts, issue/transfer/adjust units with audit reasons, view stock levels, receive low-stock/expiry alerts, answer hospital inquiries. |
| **SYSTEM_ADMINISTRATOR** | Technical system operator | Verify hospital & blood bank organizations, manage user accounts & role grants, inspect audit logs, review reported content, monitor system health. |

---

## 7. Functional Requirements

### FR-1: Account & Authentication Management
- **FR-1.1:** Public registration allowed for Donor and Requester roles.
- **FR-1.2:** Hospital Staff and Blood Bank Officer access requires prior organizational verification by a System Administrator.
- **FR-1.3:** Passwords must be hashed using bcrypt or Argon2id before database insertion.
- **FR-1.4:** Session management via short-lived JWT access tokens and secure refresh tokens.
- **FR-1.5:** Multi-role support: A single account may hold permitted combined roles (e.g., Donor + Requester).

### FR-2: Donor Search & Request Workflow
- **FR-2.1:** Search donors by blood group, town/city, and active contact availability.
- **FR-2.2:** Requesters/Hospital Staff can submit blood requests with required blood group, hospital name, town, urgency level, and required units.
- **FR-2.3:** System notifies eligible, discoverable donors based on blood group match and location.
- **FR-2.4:** Donors can accept or decline request invitations.
- **FR-2.5:** Request status transitions strictly follow: `OPEN` -> `MATCHING` -> `RESPONSES_RECEIVED` -> `IN_PROGRESS` -> `FULFILLED` / `CANCELLED` / `EXPIRED`.

### FR-3: Blood Bank Inventory Management
- **FR-3.1:** Record blood receipts (blood group, quantity in units, collection date, expiry date, donor reference).
- **FR-3.2:** Execute stock transactions (issues, transfers, adjustments) within atomic database transactions to prevent negative inventory.
- **FR-3.3:** Generate low-stock alerts when stock drops below threshold parameters.
- **FR-3.4:** Generate approaching-expiry alerts for units nearing their expiration window.
- **FR-3.5:** Allow authorized Hospital Staff to query stock availability at linked blood banks.

### FR-4: System Administration & Audit Logging
- **FR-4.1:** Administrators can review pending Hospital and Blood Bank organization verification requests.
- **FR-4.2:** Admin action audit logging for account activation, suspension, role assignment, and organization verification.
- **FR-4.3:** Content report monitoring for suspicious blood requests or reported user accounts.

---

## 8. Non-Functional Requirements

### NFR-1: Security & Privacy
- **NFR-1.1:** All communication between Android app and backend must use TLS/HTTPS in production.
- **NFR-1.2:** Unrestricted public exposure of donor personal contact information is prohibited; donor contact info is disclosed only upon donor opt-in/response.
- **NFR-1.3:** Secrets, API keys, and credentials must be stored in environment variables, never hardcoded.

### NFR-2: Performance & Scalability
- **NFR-2.1:** API response latency under 300ms for core search and inventory queries under normal load.
- **NFR-2.2:** Database indexes on `blood_group`, `town`, `status`, and `user_id` columns to maintain query speed as records scale.

### NFR-3: Usability & Accessibility
- **NFR-3.1:** Intuitive Android layout using Material Design 3 guidelines with blood-donation red primary accent (`#D32F2F`) on clean light backgrounds.
- **NFR-3.2:** High contrast text and clear form validation error messages for all inputs.

### NFR-4: Offline Functionality
- **NFR-4.1:** Android client caches recent donor search results, user requests, and profile data locally using Room/SQLite.
- **NFR-4.2:** Application displays clear network state indicators when operating offline.

---

## 9. Preliminary Workflow & Interaction Model

```
[Requester / Hospital Staff] 
       │
       ├─► Creates Blood Request ──► [Backend API]
                                         │
                                         ├─► Identifies Matching Discoverable Donors
                                         │
                                         ▼
                                   [Push Notification]
                                         │
                                         ▼
                                  [Donor Accepts]
                                         │
                                         ▼
                              [Contact Info Disclosed]
                                         │
                                         ▼
                             [Hospital Clinical Match]
                                         │
                                         ▼
                               [Blood Issued from Stock] ◄── [Blood Bank Officer Logs Transaction]
                                         │
                                         ▼
                                [Request Status: FULFILLED]
```

---

## 10. Checklist of Phase 1 Deliverables
- [x] Project Scope & Problem Statement defined
- [x] Specific Objectives & Limitations outlined
- [x] 5 User Roles and Responsibilities mapped
- [x] Functional & Non-Functional Requirements detailed
- [x] High-level User Interaction Workflow defined
- [x] Phase 1 Requirements Specification document generated (`docs/requirements.md`)
