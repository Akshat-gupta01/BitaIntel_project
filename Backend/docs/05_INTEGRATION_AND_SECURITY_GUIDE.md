# BITAINTEL External Integrations & Security Architecture Guide

## 1. Pluggable Government & Registry Integration Layer

Per SRS Section 3.1 & 5.5, all external government registries (GSTN, MCA, PAN, MSME, EPFO) are isolated behind a **pluggable Adapter Interface**. 

This decouples the BITAINTEL core platform from specific commercial API aggregators (e.g., Karza, Signzy, Perfios, ClearTax, or direct NIC/GSTN GSP gateways), enabling seamless provider migration without modifying business services.

```mermaid
flowchart TD
    CoreSvc["Verification Engine / Business Service"] --> IGSTAdapter["IGstnAdapter (TypeScript Interface)"]
    
    subgraph Adapter Implementations
        IGSTAdapter --> MockGST["MockGstnAdapter (Local Dev / Offline Tests)"]
        IGSTAdapter --> KarzaGST["KarzaGstnAdapter (Enterprise Aggregator)"]
        IGSTAdapter --> DirectGSP["DirectGspAdapter (GSTN NIC Gateway)"]
    end

    MockGST --> DevMock["In-Memory Mock Registry"]
    KarzaGST --> KarzaAPI["https://api.karza.in/v3/gst-search"]
    DirectGSP --> GspGateway["https://gsp.nic.in/taxpayerapi"]
```

### 1.1 The Common Interface Contract (`IGstnAdapter`)
```typescript
export interface GstnVerificationResult {
  gstin: string;
  legalName: string;
  tradeName: string;
  status: 'ACTIVE' | 'CANCELLED' | 'SUSPENDED';
  taxpayerType: 'Regular' | 'Composition';
  registrationDate: string;
  principalAddress: {
    building: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  filingContinuity24Months: boolean;
  rawPayload: Record<string, unknown>;
}

export interface IGstnAdapter {
  verifyGstin(gstin: string): Promise<GstnVerificationResult>;
}
```

---

## 2. Document Vault Cryptography & S3 Architecture

### 2.1 Direct-to-S3 Tamper-Evident Deposition

To prevent multi-megabyte file uploads from overwhelming Node.js application servers, uploads occur **directly from the client browser to AWS S3** via presigned cryptographic URLs.

```mermaid
sequenceDiagram
    autonumber
    actor Client as Vendor Web Client
    participant Express as Express Document API
    participant S3 as Amazon S3 Vault (ap-south-1)
    participant Worker as Background Antivirus / Hash Worker

    Client->>Client: 1. Calculate file SHA-256 hash locally in browser
    Client->>Express: 2. POST /api/v1/documents/presigned-url (file metadata + SHA-256)
    Express->>Express: 3. Authorize vendor & generate unique S3 key
    Express->>S3: 4. Request PutObject presigned URL (with checksum header lock)
    S3-->>Express: 5. Return signed URL (15 min TTL)
    Express-->>Client: 6. Return presigned upload URL & doc ID
    Client->>S3: 7. Direct PUT binary stream (with x-amz-checksum-sha256)
    Client->>Express: 8. POST /api/v1/documents/:id/confirm
    Express->>Worker: 9. Queue background ClamAV scan & format validation
```

### 2.2 Security Controls on S3 Vault:
1. **Server-Side Encryption**: `aws:kms` encryption enforced using dedicated customer-managed keys (CMK).
2. **Checksum Enforcement**: The presigned URL requires the client to supply `x-amz-checksum-sha256`. S3 rejects the upload if even a single byte differs.
3. **Public Access Block**: 100% of public bucket access is blocked at the AWS Account level.
4. **Time-Limited Signed Retrieval**: Files are only viewable by authorized verifiers or consented buyers via temporary presigned GET URLs (5-minute TTL).

---

## 3. Authentication & RBAC Security Model

### 3.1 Token Lifecycle
- **Access Token**: JSON Web Token (JWT) signed with HMAC-SHA256 or RS256. 
  - Validity: **15 minutes**.
  - Payload: `{ sub: userId, role: userRole, businessId: businessId }`.
- **Refresh Token**: Opaque cryptographically random 256-bit string stored in `refresh_tokens` database table with device footprint.
  - Validity: **7 days** with sliding renewal.

### 3.2 Role-Based Access Control (RBAC) Matrix

| Endpoint Group | `public` | `buyer` | `vendor` | `verification_officer` | `admin` | `super_admin` |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| `GET /api/v1/businesses` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `GET /api/v1/businesses/:id` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `POST /api/v1/enquiries` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `GET /api/v1/vendor/dashboard` | ❌ | ❌ | ✅ (Own) | ❌ | ✅ | ✅ |
| `POST /api/v1/documents/presigned-url` | ❌ | ❌ | ✅ (Own) | ❌ | ✅ | ✅ |
| `GET /api/v1/verification/queue` | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| `POST /api/v1/verification/decision` | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| `GET /api/v1/admin/kpis` | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |

---

## 4. Production Hardening & Anti-Scraping Defenses

1. **Anti-Scraping Rate Limiting**:
   - Public Directory Explorer: Maximum **60 requests/minute per IP** using Redis token bucket.
   - Search queries returning excessive pages trigger automated CAPTCHA challenges.
2. **SQL Injection Immunity**:
   - Zero raw string concatenation in SQL execution. Every single database parameter uses parameterized place-markers (`?, ?, ...`).
3. **HTTP Header Hardening**:
   - **Helmet.js** enforces strict HTTP Strict Transport Security (`HSTS`), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and Content Security Policy (`CSP`).
4. **CORS Policies**:
   - Whitelist restricted to authorized domain origins (e.g. `https://bitaintel.com` and `http://localhost:3000`).
5. **Audit Trail Immutability**:
   - All score alterations, document status shifts, and role elevations write to the `audit_logs` table with client IP, user agent, and before/after JSON diffs.


