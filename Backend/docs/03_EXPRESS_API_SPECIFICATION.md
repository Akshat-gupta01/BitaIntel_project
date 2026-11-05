# BITAINTEL Express.js REST API Specification

All endpoints are versioned under `/api/v1` and follow standard HTTP semantics, returning a unified JSON envelope.

---

## 1. Standard API Response Structure

### 1.1 Success Envelope
```typescript
interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    timestamp: string;
  };
}
```

### 1.2 Error Envelope
```typescript
interface ApiErrorResponse {
  success: false;
  error: {
    code: string;       // e.g. "ERR_VALIDATION", "ERR_UNAUTHORIZED", "ERR_NOT_FOUND"
    message: string;    // Human-readable message
    details?: unknown;  // Zod validation errors or field specifics
    timestamp: string;
  };
}
```

---

## 2. Authentication & Onboarding Module (`/api/v1/auth`)

### 2.1 Send Dual OTPs (Email & Mobile)
- **Endpoint**: `POST /api/v1/auth/send-otp`
- **Access**: Public
- **Description**: Triggers instantaneous dispatch of verification OTPs to both email and phone number for Stage 1 registration or login.
- **Request Body**:
```json
{
  "email": "rajesh.mehta@meridiansteel.com",
  "mobile": "+919820144521",
  "purpose": "registration"
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "emailDispatched": true,
    "mobileDispatched": true,
    "expiresInSeconds": 600,
    "message": "Dual verification codes dispatched successfully."
  }
}
```

---

### 2.2 Verify Dual OTPs
- **Endpoint**: `POST /api/v1/auth/verify-otp`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "rajesh.mehta@meridiansteel.com",
  "emailOtp": "4921",
  "mobile": "+919820144521",
  "mobileOtp": "8142",
  "purpose": "registration"
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "emailVerified": true,
    "mobileVerified": true,
    "verificationToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 2.3 Complete Onboarding (Stage 1 + Stage 2)
- **Endpoint**: `POST /api/v1/auth/register`
- **Access**: Public (requires valid OTP verification token or active session)
- **Request Body**:
```json
{
  "account": {
    "fullName": "Rajesh Mehta",
    "email": "vendor@meridiansteel.com",
    "mobile": "+919820144521",
    "password": "SecurePassword123!",
    "userType": "Vendor / Direct Manufacturer",
    "designation": "Director / Authorized Signatory",
    "verificationToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "business": {
    "legalName": "Meridian Advanced Materials & Steelworks Pvt. Ltd.",
    "tradeName": "Meridian Steel Works",
    "companyType": "Private Limited Company (Pvt Ltd)",
    "registrationNo": "U27100PN2003PTC148921",
    "gstin": "27AABCM8291Q1Z4",
    "pan": "AABCM8291Q",
    "cin": "U27100PN2003PTC148921",
    "registeredAddress": "Plot 42-45, MIDC Industrial Area, Bhosari, Pune, MH 411026",
    "pincode": "411026",
    "website": "https://meridiansteel.example.com",
    "yearEstablished": 2003,
    "employeeRange": "250–500",
    "turnoverRange": "₹50–100 crore",
    "industry": "Manufacturing",
    "category": "Precision CNC Machining & Structural Fabrication",
    "agreeDeclaration": true
  }
}
```
- **Response `201 Created`**:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1Ni...",
    "refreshToken": "eyJhbGciOiJIUzI1Ni...",
    "user": {
      "id": "a0000000-0000-0000-0000-000000000003",
      "email": "vendor@meridiansteel.com",
      "fullName": "Rajesh Mehta",
      "role": "vendor",
      "businessId": "b0000000-0000-0000-0000-000000000001",
      "businessSlug": "meridian-steel-works"
    }
  }
}
```

---

### 2.4 Login
- **Endpoint**: `POST /api/v1/auth/login`
- **Access**: Public
- **Request Body**:
```json
{
  "email": "vendor@meridiansteel.com",
  "password": "SecurePassword123!"
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi...",
    "user": {
      "id": "a0000000-0000-0000-0000-000000000003",
      "email": "vendor@meridiansteel.com",
      "fullName": "Rajesh Mehta",
      "role": "vendor",
      "business": {
        "id": "b0000000-0000-0000-0000-000000000001",
        "slug": "meridian-steel-works",
        "name": "Meridian Steel Works",
        "score": 96.00,
        "badge": "Platinum"
      }
    }
  }
}
```

---

## 3. Directory Explorer & Business Dossier (`/api/v1/businesses`)

### 3.1 Search & Filter Businesses
- **Endpoint**: `GET /api/v1/businesses`
- **Access**: Public
- **Query Parameters**:
  - `q` (string): Search text matching brand name, legal name, products, GSTIN, or location.
  - `industry` (string): Filter by sector (e.g. `Manufacturing`, `IT Services`).
  - `level` (number): Minimum tier level (`1`, `2`, `3`, `4`).
  - `minScore` (number): Minimum composite score (`0`–`100`).
  - `verified` (boolean): `true` to return verified entities only.
  - `state` (string): State filter (e.g. `Maharashtra`, `Gujarat`).
  - `sortBy` (enum): `score` (default), `tenure`, `name`.
  - `order` (enum): `desc` (default), `asc`.
  - `page` (number): Pagination page (default `1`).
  - `limit` (number): Records per page (default `12`, max `50`).
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": [
    {
      "id": "meridian-steel-works",
      "name": "Meridian Steel Works",
      "legalName": "Meridian Advanced Materials & Steelworks Pvt. Ltd.",
      "initials": "MS",
      "industry": "Manufacturing",
      "location": "Pune, Maharashtra",
      "city": "Pune",
      "state": "Maharashtra",
      "level": 4,
      "score": 96.00,
      "badge": "Platinum",
      "age": 23,
      "summary": "Precision steel fabricator supplying high-tolerance structural and alloy steel assemblies...",
      "products": ["Precision Structural Steel", "CNC Machined Alloys", "Industrial Fabrications"],
      "gstin": "27AABCM8291Q1Z4",
      "cin": "U27100PN2003PTC148921",
      "isoCertified": "ISO 9001:2015 & IATF 16949",
      "identity": "10/10",
      "documents": "20/20",
      "contact": "5/5",
      "address": "5/5",
      "profile": 15,
      "turnover": "₹50–100 crore",
      "employees": "250–500",
      "verified": true,
      "lastAudited": "12 Oct 2026"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 12,
    "total": 12,
    "timestamp": "2026-11-03T17:45:00.000Z"
  }
}
```

---

### 3.2 Get Full Audited Business Profile Dossier
- **Endpoint**: `GET /api/v1/businesses/:slugOrId`
- **Access**: Public
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "id": "meridian-steel-works",
    "name": "Meridian Steel Works",
    "legalName": "Meridian Advanced Materials & Steelworks Pvt. Ltd.",
    "cin": "U27100PN2003PTC148921",
    "gstin": "27AABCM8291Q1Z4",
    "pan": "AABCM8291Q",
    "level": 4,
    "score": 96.00,
    "badge": "Platinum",
    "summary": "Precision steel fabricator...",
    "location": "Pune, Maharashtra",
    "city": "Pune",
    "state": "Maharashtra",
    "registeredAddress": "Plot 42-45, MIDC Industrial Area, Bhosari, Pune, MH 411026",
    "age": 23,
    "turnover": "₹50–100 crore",
    "employees": "250–500",
    "verified": true,
    "lastAudited": "12 Oct 2026",
    "checkpoints": [
      {
        "type": "identity",
        "title": "Corporate Legal Identity",
        "achieved": 10.00,
        "max": 10.00,
        "percentage": 100.00,
        "status": "VERIFIED",
        "notes": "MCA Active company record, CIN U27100PN2003PTC148921 valid."
      },
      {
        "type": "documents",
        "title": "Statutory Document Dossier",
        "achieved": 20.00,
        "max": 20.00,
        "percentage": 100.00,
        "status": "VERIFIED"
      }
    ],
    "certifications": [
      {
        "title": "ISO 9001:2015 & IATF 16949",
        "issuer": "TÜV SÜD South Asia",
        "certificateNumber": "IATF-0492810",
        "expiryDate": "2026-12-31",
        "status": "VERIFIED"
      }
    ],
    "products": [
      "Precision Structural Steel",
      "CNC Machined Alloys",
      "Industrial Fabrications"
    ]
  }
}
```

---

### 3.3 Multi-Business Comparison
- **Endpoint**: `GET /api/v1/businesses/compare?ids=meridian-steel-works,nexora-cloud-systems,greenleaf-bio-extracts`
- **Access**: Public
- **Description**: Returns normalized side-by-side comparison data for 2 to 4 business entities across scores, statutory status, certifications, and operational metrics.

---

## 4. Vendor Dashboard & Modules A–F (`/api/v1/vendor`)

### 4.1 Get Vendor Dashboard Status & Modules Overview
- **Endpoint**: `GET /api/v1/vendor/dashboard`
- **Access**: Authenticated (`vendor`, `admin`)
- **Headers**: `Authorization: Bearer <token>`
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "business": {
      "id": "b0000000-0000-0000-0000-000000000001",
      "name": "Meridian Steel Works",
      "score": 96.00,
      "badge": "Platinum",
      "level": 4,
      "verificationStatus": "bitaintel_verified",
      "profileCompletion": 100
    },
    "srsModules": [
      {
        "id": "module_a",
        "code": "Module A",
        "title": "Company Information",
        "status": "Verified",
        "completion": 100,
        "scoreContribution": "20.0 / 20%"
      },
      {
        "id": "module_e",
        "code": "Module E",
        "title": "Financial Information & Banking",
        "status": "In Review",
        "completion": 75,
        "scoreContribution": "11.0 / 15%"
      }
    ],
    "enquiriesSummary": {
      "total": 14,
      "new": 3
    }
  }
}
```

---

### 4.2 Update Specific Business Module (A through F)
- **Endpoint**: `PUT /api/v1/vendor/modules/:moduleCode` (e.g. `module_c`)
- **Access**: Authenticated (`vendor`, `admin`)
- **Request Body**:
```json
{
  "businessType": "Manufacturer",
  "plantAreaSqft": 75000,
  "machineryHighlights": "5-Axis CNC Mills, Robotic MIG Welders, Laser Cutting 12kW",
  "operatingShifts": 3,
  "headcountEpfo": 380,
  "annualProductionCapacity": "12,000 Metric Tonnes alloy steel structural assemblies"
}
```

---

## 5. Document Vault & Ingestion Pipeline (`/api/v1/documents`)

### 5.1 Request Presigned S3 Upload URL
- **Endpoint**: `POST /api/v1/documents/presigned-url`
- **Access**: Authenticated (`vendor`, `admin`)
- **Description**: Generates a tamper-evident pre-signed AWS S3 PUT URL bound to file SHA-256 hash.
- **Request Body**:
```json
{
  "categoryId": "cat_gst",
  "categoryName": "GST Certificate (Tax & GSTN)",
  "moduleCode": "Module F",
  "fileName": "GST_Registration_Certificate_REG06.pdf",
  "fileSizeBytes": 1854000,
  "mimeType": "application/pdf",
  "sha256Checksum": "a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0",
  "version": "v2.0"
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "documentId": "d0000000-0000-0000-0000-000000000002",
    "uploadUrl": "https://bitaintel-vault.s3.ap-south-1.amazonaws.com/vault/meridian/gst_v2.pdf?X-Amz-Signature=...",
    "expiresInSeconds": 900
  }
}
```

---

### 5.2 Confirm Document Upload & Queue Verification
- **Endpoint**: `POST /api/v1/documents/:id/confirm`
- **Access**: Authenticated (`vendor`, `admin`)
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "documentId": "d0000000-0000-0000-0000-000000000002",
    "status": "PENDING",
    "message": "Document registered in vault. Verification queued."
  }
}
```

---

## 6. Verification Team & Auditor Operations (`/api/v1/verification`)

### 6.1 Get Verification Queue
- **Endpoint**: `GET /api/v1/verification/queue`
- **Access**: Restricted (`verification_officer`, `quality_auditor`, `admin`, `super_admin`)
- **Response `200 OK`**: Returns list of entities in `info_submitted` or `action_required` state with days in queue.

---

### 6.2 Auditor Document Review
- **Endpoint**: `POST /api/v1/verification/documents/:docId/review`
- **Access**: Restricted (`verification_officer`, `admin`)
- **Request Body**:
```json
{
  "status": "VERIFIED", // or "REJECTED", "ACTION_REQUIRED"
  "rejectionReason": null,
  "auditorNotes": "GSTIN matches 27AABCM8291Q1Z4, principal place of business confirmed."
}
```

---

### 6.3 Final Verification Decision & Badge Issuance
- **Endpoint**: `POST /api/v1/verification/decision/:businessId`
- **Access**: Restricted (`verification_officer`, `admin`)
- **Request Body**:
```json
{
  "decision": "APPROVE_VERIFIED",
  "tierLevel": 4,
  "assignedBadge": "Platinum",
  "auditorRemarks": "All 6 statutory checkpoints verified with complete documentation."
}
```

---

## 7. Procurement Enquiries & Leads (`/api/v1/enquiries`)

### 7.1 Submit Procurement Enquiry
- **Endpoint**: `POST /api/v1/enquiries`
- **Access**: Public
- **Request Body**:
```json
{
  "businessSlug": "meridian-steel-works",
  "name": "Vikram Malhotra",
  "email": "buyer@procurement-corp.com",
  "phone": "+919877700004",
  "company": "Apex Industrial Systems",
  "message": "We require high-tolerance CNC machined structural alloy brackets..."
}
```
- **Response `201 Created`**:
```json
{
  "success": true,
  "data": {
    "enquiryId": "e1234567-0000-0000-0000-000000000001",
    "status": "NEW",
    "message": "Enquiry delivered to verified representative."
  }
}
```

---

### 7.2 Get Vendor Received Enquiries
- **Endpoint**: `GET /api/v1/vendor/enquiries`
- **Access**: Authenticated (`vendor`, `admin`)
- **Response `200 OK`**: List of buyer inquiries with contact information and lifecycle statuses.

---

## 8. General Contact & Platform Support (`/api/v1/contact`)

### 8.1 Submit Contact Us Form
- **Endpoint**: `POST /api/v1/contact`
- **Access**: Public
- **Request Body**:
```json
{
  "name": "Vikram Malhotra",
  "email": "vikram@example.com",
  "company": "Apex Industrial Solutions",
  "category": "Regulatory & Verification Inquiry",
  "message": "Requesting API integration documentation for enterprise ERP connection."
}
```
- **Response `201 Created`**:
```json
{
  "success": true,
  "data": {
    "ticketId": "c9876543-0000-0000-0000-000000000001",
    "message": "Query registered. Response within 1 business day."
  }
}
```


