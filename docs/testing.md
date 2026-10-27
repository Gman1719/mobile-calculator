# System Testing & Verification Report

## 1. Test Suite Overview
The testing framework spans frontend unit/integration verification, backend REST API endpoint testing, RBAC permission checks, database transaction concurrency validation, and offline caching verification.

---

## 2. Role-Based Verification Matrix

| Role | Test Scenario | Expected Result | Status |
| :--- | :--- | :--- | :--- |
| **DONOR** | Register new donor profile with blood group O+ & city Metropolis | User created; DonorProfile created with `isAvailable=true` | **PASSED** |
| **DONOR** | Toggle availability state to `false` | API updates `isAvailable=false`; donor excluded from active searches | **PASSED** |
| **REQUESTER** | Search donors by blood group O+ and city Metropolis | Returns matching available donors with contact details | **PASSED** |
| **REQUESTER** | Create emergency blood request | Request created with status `OPEN`; matching donors notified | **PASSED** |
| **HOSPITAL_STAFF** | Create official hospital request & query blood bank stock | Query returns real-time verified units by blood bank | **PASSED** |
| **BLOOD_BANK_OFFICER**| Log receipt of 5 units O+ blood batch | Stock increments atomically; transaction log created | **PASSED** |
| **BLOOD_BANK_OFFICER**| Issue stock exceeding available inventory | Transaction aborts; returns HTTP 400 Insufficient Stock error | **PASSED** |
| **SYSTEM_ADMIN** | Verify pending hospital organization request | `isVerified` set to `true`; action recorded in `AuditLog` | **PASSED** |

---

## 3. Concurrency & Transaction Safety Verification
- **Negative Inventory Prevention Test:** Simulated concurrent requests attempting to issue 10 units when stock was 5.
  - **Result:** Prisma `$transaction` lock ensured the first transaction succeeded, and the second was rejected with `Insufficient verified stock`.
- **RBAC Security Enforcement Test:** Attempted to access `/api/v1/admin/audit-logs` using a `DONOR` JWT token.
  - **Result:** HTTP 403 Forbidden returned with message `Forbidden: Requires one of the following roles: [SYSTEM_ADMINISTRATOR]`.

---

## 4. Offline Functionality Verification
- **Network Loss Simulation:** Device disconnected from Internet during request history viewing.
  - **Result:** Repository automatically loaded records from Room Database (`cached_requests`) and displayed offline banner.
