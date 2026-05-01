# Strict Training Center Verification System

This plan outlines the implementation of a robust approval workflow for creating training centers. The system ensures that all centers are verified by administrators before becoming active, and handles the automatic promotion of users to the `responsableCF` role upon approval.

## 1. Data Model Enhancements

### `CentreFormation` Model Updates
We will extend the `CentreFormation` schema to track the verification state and store required documentation.

- `status`: Enum (`pending`, `approved`, `rejected`). Default: `pending`.
- `documents`: Array of objects containing:
    - `type`: Enum (`registration`, `tax_id`, `identity`, `authorization`, `lease`).
    - `path`: String (path to file).
    - `status`: Enum (`valid`, `invalid`, `pending`).
- `adminMessage`: String for feedback in case of rejection.

### Required Documents Registry
The system will strictly require the following files for any center application:
1. **Commercial Registration**: Legal proof of the center's existence (e.g., Registre de Commerce).
2. **Tax ID**: Official tax identification document (e.g., Matricule Fiscal).
3. **Identity Document**: CIN or Passport of the legal representative.
4. **Accreditation**: Official authorization from relevant authorities (e.g., Ministry of Vocational Training).
5. **Lease Agreement**: Proof of physical location and premises.

### `User` Model
No major changes needed, but the logic will ensure the role transitions from `apprenant` (or other) to `responsableCF` only after approval.

---

## 2. API Workflow

### Step 1: Request Creation (`POST /centres`)
- **Access**: Any registered user.
- **Payload**: Center details (name, address, etc.) + **Required Files** (min 3-5 files depending on policy).
- **Validation**:
    1. Check that all mandatory document types are present in the upload.
    2. Create center with `status: 'pending'`.
    3. Store uploaded files in `documents` field with their respective types.
    4. Link `responsableId` to the current user.

### Step 2: Administrative Review (`GET /admin/centres/pending`)
- **Access**: `admin` role only.
- **Logic**: Returns a list of all centers awaiting verification.

### Step 3: Approval Decision
#### Option A: Approval (`PATCH /admin/centres/:id/approve`)
- **Logic**:
    1. Set `status` to `approved`.
    2. Find the user linked via `responsableId`.
    3. Update user role to `responsableCF`.
    4. Notify the user of the success.

#### Option B: Rejection (`PATCH /admin/centres/:id/reject`)
- **Logic**:
    1. Set `status` to `rejected`.
    2. Store `adminMessage` provided in the request body.
    3. Notify the user of the rejection and the reason.

---

## 3. Best Practices & Design Decisions

### Separation of Concerns
We will create dedicated endpoints in the admin controller to handle these privileged operations.

### File Organization
Documents should be stored in a protected directory (e.g., `uploads/verification/`) to avoid public exposure of sensitive business documents if possible.

### Middleware
- **`requireAuth`**: Ensure only logged-in users can apply.
- **`requireRole('admin')`**: Strict enforcement for approval endpoints.
- **`upload`**: Multer configuration to handle multiple file uploads (e.g., `upload.array('documents', 5)`).

### Atomic Updates
The approval process (updating center status + updating user role) should ideally be wrapped in a database transaction to ensure data consistency.

---

## 4. Proposed Endpoint Summary

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/centres` | User | Submit a new center request with documents. |
| `GET` | `/centres/my-requests` | User | View status of own applications. |
| `GET` | `/admin/centres/pending` | Admin | List all pending requests. |
| `PATCH` | `/admin/centres/:id/approve` | Admin | Approve a center and promote the creator. |
| `PATCH` | `/admin/centres/:id/reject` | Admin | Reject a request with feedback. |

## 5. Security Note
All existing `GET /centres` endpoints must be updated to filter by `{ status: 'approved' }` by default.
