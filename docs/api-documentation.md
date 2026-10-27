# REST API Documentation Specification

All endpoints are prefixed with `/api/v1`. Communication is performed via JSON payloads. Authenticated endpoints require an HTTP `Authorization` header containing a valid Bearer token: `Authorization: Bearer <JWT_ACCESS_TOKEN>`.

---

## 1. Authentication Module (`/api/v1/auth`)

### `POST /auth/register`
- **Description:** Registers a new user account with initial role(s) (`DONOR` or `REQUESTER`).
- **Access:** Public.
- **Request Body:**
```json
{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "password": "SecurePassword123!",
  "roles": ["DONOR", "REQUESTER"],
  "donorInfo": {
    "bloodGroup": "O_POSITIVE",
    "town": "Downtown",
    "city": "Metropolis",
    "isAvailable": true,
    "allowNotifications": true
  }
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": "uuid-v4",
    "email": "jane@example.com",
    "roles": ["DONOR", "REQUESTER"],
    "accessToken": "eyJhbGci...",
    "refreshToken": "d8f7a6..."
  }
}
```

### `POST /auth/login`
- **Description:** Authenticates user credentials and returns tokens.
- **Access:** Public.
- **Request Body:**
```json
{
  "email": "jane@example.com",
  "password": "SecurePassword123!"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-v4",
      "fullName": "Jane Doe",
      "email": "jane@example.com",
      "roles": ["DONOR", "REQUESTER"]
    },
    "accessToken": "eyJhbGci...",
    "refreshToken": "d8f7a6..."
  }
}
```

### `POST /auth/refresh`
- **Description:** Exchanges a valid refresh token for a new access token.
- **Access:** Public.

### `POST /auth/logout`
- **Description:** Revokes current refresh token session.
- **Access:** Authenticated.

---

## 2. Profile Management Module (`/api/v1/users`)

### `GET /users/me`
- **Description:** Fetches current authenticated user's profile and linked profiles.
- **Access:** Authenticated.

### `PUT /users/donor-profile`
- **Description:** Updates donor availability status, blood group, town, city, or notification preferences.
- **Access:** Authenticated (`DONOR`).

---

## 3. Donor Search & Request Module (`/api/v1/donors`, `/api/v1/requests`)

### `GET /donors/search`
- **Description:** Searches for available donors based on blood group, town, and availability consent.
- **Access:** Authenticated (`REQUESTER`, `HOSPITAL_STAFF`, `SYSTEM_ADMINISTRATOR`).
- **Query Params:** `bloodGroup`, `city`, `town`, `page`, `limit`.

### `POST /requests`
- **Description:** Creates a new emergency or standard blood request.
- **Access:** Authenticated (`REQUESTER`, `HOSPITAL_STAFF`).
- **Request Body:**
```json
{
  "bloodGroup": "O_POSITIVE",
  "town": "Downtown",
  "city": "Metropolis",
  "hospitalName": "City General Hospital",
  "urgency": "HIGH",
  "unitsRequired": 2,
  "contactName": "John Smith",
  "contactPhone": "+1987654321",
  "notes": "Emergency surgery"
}
```

### `GET /requests`
- **Description:** Lists blood requests with optional status and role filtering.
- **Access:** Authenticated.

### `POST /requests/:id/respond`
- **Description:** Donor accepts or declines a blood request invitation.
- **Access:** Authenticated (`DONOR`).
- **Request Body:**
```json
{
  "responseStatus": "ACCEPTED",
  "notes": "Can donate tomorrow morning"
}
```

### `PATCH /requests/:id/status`
- **Description:** Updates blood request status (`IN_PROGRESS`, `FULFILLED`, `CANCELLED`).
- **Access:** Authenticated (Request Creator or `HOSPITAL_STAFF`).

---

## 4. Blood Bank & Inventory Module (`/api/v1/inventory`)

### `GET /inventory`
- **Description:** Fetches current verified blood stock quantities by blood group.
- **Access:** Authenticated (`BLOOD_BANK_OFFICER`, `HOSPITAL_STAFF`, `SYSTEM_ADMINISTRATOR`).

### `POST /inventory/receipts`
- **Description:** Logs a newly received verified blood batch into inventory.
- **Access:** Authenticated (`BLOOD_BANK_OFFICER`).
- **Request Body:**
```json
{
  "bloodGroup": "A_POSITIVE",
  "units": 5,
  "collectionDate": "2025-02-20T10:00:00Z",
  "expiryDate": "2025-03-27T10:00:00Z",
  "donorRef": "DONOR-1042"
}
```

### `POST /inventory/transactions`
- **Description:** Logs an issue, transfer, or adjustment stock transaction.
- **Access:** Authenticated (`BLOOD_BANK_OFFICER`).
- **Request Body:**
```json
{
  "transactionType": "ISSUE",
  "bloodGroup": "A_POSITIVE",
  "units": 2,
  "recipientHospitalId": "org-uuid-v4",
  "reason": "Issued for surgery request #REQ-99"
}
```

---

## 5. Administrative Module (`/api/v1/admin`)

### `GET /admin/organizations/pending`
- **Description:** Lists hospital and blood bank registration requests awaiting administrative verification.
- **Access:** Authenticated (`SYSTEM_ADMINISTRATOR`).

### `PATCH /admin/organizations/:id/verify`
- **Description:** Verifies or rejects a hospital/blood bank organization.
- **Access:** Authenticated (`SYSTEM_ADMINISTRATOR`).

### `GET /admin/audit-logs`
- **Description:** Retrieves system administrative audit trail entries.
- **Access:** Authenticated (`SYSTEM_ADMINISTRATOR`).
