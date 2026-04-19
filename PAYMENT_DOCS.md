# Formation Center Backend API

## Payment & Inscription Flow Documentation

---

### 1. Payment Methods & Access

| Method | Payment Status | Can See Lessons | Can See Content | Who Confirms |
|--------|---------------|------------|------------|-----------------|--------------|
| **Card (`carte`)** | ✅ Confirmed instantly | ✅ Yes | ✅ Yes | Auto (system) |
| **Transfer (`virement`)** | ⏳ Pending | ❌ No | ❌ No | ResponsableCF only |
| **Cash (`especes`)** | ⏳ Pending | ❌ No | ❌ No | ResponsableCF only |

---

### 2. Permissions Matrix

| Action | User | Admin | ResponsableCF |
|--------|------|-------|----------------|
| Create payment | ✅ (own) | ❌ | ❌ |
| Cancel own pending | ✅ | ❌ | ❌ |
| Confirm payment | ❌ | ❌ | ✅ (own centre only) |
| Delete payment | ❌ | ❌ | ❌ |

---

### 3. API Endpoints

| Endpoint | Method | Access | Description |
|----------|--------|--------|-------------|
| `/paiements` | POST | User | Initiate payment for formation |
| `/paiements/me` | GET | User | Get own payments |
| `/paiements/:id` | GET | User / ResponsableCF | Get payment details |
| `/paiements/:id/confirm` | PUT | **ResponsableCF only** | Confirm pending payment |
| `/paiements/cancel/:id` | DELETE | **User only** | Cancel own pending payment |
| `/paiements` | GET | ResponsableCF | Get all payments (own centre) |

---

### 4. Flow Diagrams

#### A. Card Payment (Instant)
```
User POST /paiements { formationId, methodePaiement: "carte" }
                ↓
    Payment created → statut: "confirme" (auto)
                ↓
    Inscription → statut: "acceptee" (auto)
                ↓
    User can START STUDYING IMMEDIATELY
```

#### B. Transfer / Cash Payment
```
User POST /paiements { formationId, methodePaiement: "virement|especes" }
                ↓
    Payment created → statut: "en_attente"
                ↓
    Inscription → statut: "en_attente"
                ↓
    User CANNOT study yet
                ↓
ResponsableCF checks payment received
                ↓
ResponsableCF PUT /paiements/:id/confirm
                ↓
    Payment → statut: "confirme"
                ↓
    Inscription → statut: "acceptee"
                ↓
    User gets notification + email
                ↓
    User can START STUDYING
```

---

### 5. Notifications

When payment is pending,ResponsableCF receives:
- **In-app notification** - Appears in `/notifications`
- **Email notification** - Sent to their email

When payment is confirmed, user receives:
- **In-app notification**
- **Email notification**

---

### 6. Business Rules

1. **Once confirmed, payment cannot be cancelled** - Maintains audit trail
2. **User can only cancel their OWN pending payments** - Not others
3. **ResponsableCF can only confirm payments for their OWN centre** - Not other centres
4. **No payment deletion allowed** - All payments stored for records

---

### 7. Email Configuration (.env)

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM_NAME=Formation Center
```

---

### 8. Key Models

- **User** - Roles: `admin`, `responsableCF`, `formateur`, `apprenant`
- **Formation** - Contains `formateurIds`, `centreId`, `categorieId`
- **CentreFormation** - Contains `responsableId`
- **Inscription** - Links `apprenantId` to `formationId`
- **Paiement** - Links to `inscriptionId`, tracks `statut`
- **Notification** - In-app notifications per user

---

### 9. Common Responses

**Success:**
```json
{ "success": true, "message": "...", "data": {...} }
```

**Error:**
```json
{ "success": false, "message": "Error message", "errors": null }
```