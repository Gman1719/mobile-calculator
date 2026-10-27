# Database Design & Prisma Schema Specification

## 1. Relational Entity Overview

The PostgreSQL database is designed in Third Normal Form (3NF) to ensure data integrity, eliminate redundancy, and support audited transactions.

### Key Entities & Roles
1. **`User`**: Central identity table holding credentials and account status.
2. **`Role` & `UserRole`**: Many-to-Many junction table supporting multi-role users (`DONOR`, `REQUESTER`, `HOSPITAL_STAFF`, `BLOOD_BANK_OFFICER`, `SYSTEM_ADMINISTRATOR`).
3. **`DonorProfile`**: One-to-One relation with `User` for blood group, location, and availability preferences.
4. **`Organization`**: Stores physical health organizations (`HOSPITAL` or `BLOOD_BANK`) and administrative verification status (`isVerified`).
5. **`HospitalProfile` / `BloodBankProfile`**: Links a `User` to their verified `Organization`.
6. **`BloodRequest`**: Central workflow table for blood requests, urgency, location, required units, and status.
7. **`DonorResponse`**: Tracks donor invitations and responses (`ACCEPTED`, `DECLINED`, `COMPLETED`).
8. **`BloodInventory` & `InventoryBatch`**: Maintains verified real-time blood stock and batch collection/expiry dates.
9. **`InventoryTransaction`**: Audit ledger recording all stock movements (`RECEIPT`, `ISSUE`, `TRANSFER`, `ADJUSTMENT`).
10. **`Notification`**: System and push notification queue.
11. **`Report`**: Content and account abuse reports.
12. **`AuditLog`**: System-wide administrative action ledger.
13. **`RefreshToken`**: Session control tokens.

---

## 2. Entity Relationship Diagram (ERD)

```
┌──────────┐ 1      * ┌──────────┐ *      1 ┌──────────┐
│   User   │─────────┤ UserRole │──────────┤   Role   │
└────┬─────┘          └──────────┘          └──────────┘
     │ 1
     ├───────────────┐ 1
     │               ▼
     │        ┌──────────────┐
     │        │ DonorProfile │
     │        └──────────────┘
     │ 1
     ├───────────────┐ *
     │               ▼
     │        ┌──────────────┐ *      1 ┌──────────────┐
     │        │ BloodRequest │──────────┤ Organization │ (Hospital)
     │        └──────┬───────┘          └──────────────┘
     │ 1             │ 1                       ▲ 1
     │               ▼ *                       │
     │        ┌──────────────┐                 │
     └───────►│DonorResponse │                 │
              └──────────────┘                 │
                                               │
     ┌─────────────────────────────────────────┘
     │
     │ 1      * ┌─────────────────┐ *      1 ┌──────────────────────┐
     ├─────────┤  BloodInventory  ├──────────┤ InventoryTransaction │
     │         └─────────────────┘          └──────────────────────┘
     │ 1
     ├───────────────┐ *
     │               ▼
     │        ┌──────────────┐
     └───────►│   AuditLog   │
              └──────────────┘
```

---

## 3. Database Enums

```prisma
enum RoleName {
  DONOR
  REQUESTER
  HOSPITAL_STAFF
  BLOOD_BANK_OFFICER
  SYSTEM_ADMINISTRATOR
}

enum AccountStatus {
  ACTIVE
  SUSPENDED
  PENDING_VERIFICATION
}

enum BloodGroup {
  A_POSITIVE
  A_NEGATIVE
  B_POSITIVE
  B_NEGATIVE
  AB_POSITIVE
  AB_NEGATIVE
  O_POSITIVE
  O_NEGATIVE
}

enum RequestUrgency {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum RequestStatus {
  OPEN
  MATCHING
  RESPONSES_RECEIVED
  IN_PROGRESS
  FULFILLED
  CANCELLED
  EXPIRED
}

enum ResponseStatus {
  PENDING
  ACCEPTED
  DECLINED
  COMPLETED
  CANCELLED
}

enum OrganizationType {
  HOSPITAL
  BLOOD_BANK
}

enum TransactionType {
  RECEIPT
  ISSUE
  TRANSFER_IN
  TRANSFER_OUT
  ADJUSTMENT
  EXPIRY_DISCARD
}
```
