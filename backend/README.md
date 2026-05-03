# Backend — AI Learning Hub

REST API for the AI Learning Hub LMS, built with **Node.js**, **Express**, and **MongoDB**.

---

## 🚀 Tech Stack

| Tool | Purpose |
|---|---|
| Node.js + Express | HTTP server and routing |
| MongoDB + Mongoose | Database and ODM |
| JWT + bcrypt | Authentication and password hashing |
| Helmet + express-rate-limit | Security hardening |
| Joi | Request validation |
| Nodemailer | Email sending |
| Swagger (swagger-ui-express) | Auto-generated API docs |

---

## ✨ Features

### Core Modules
- **User Management** — Registration, login, JWT auth, role-based access control, block/unblock
- **Training Centres** — CRUD for centres, pending approval workflow
- **Formations (Courses)** — Create, update, delete, assign formateurs, filter by category/centre
- **Lessons & Content** — Lessons with file uploads (video, image, PDF, link), quiz questions
- **Enrollments (Inscriptions)** — Student enrollment with status tracking (`pending`, `accepted`, `refused`)
- **Payments** — Payment tracking with `pending`/`confirmed` statuses and revenue reports
- **Reviews (Avis)** — Star ratings and comments on courses
- **Favorites** — Save/remove courses from favorites
- **Notifications** — Real-time in-app notifications
- **Skills** — Skill tags on formateurs and formations for AI matching
- **Reports** — Report abusive content/users
- **Admin Stats** — Platform statistics: users, enrollments, revenue, top formations

### New in Latest Version
- **`GET /public/stats`** — Public endpoint returning real-time platform stats (student count, course count, satisfaction %) for the home page. No authentication required.
- Smart student count using `block: false` filter (no false `status` field dependency)

### AI Integration
- Connects to **n8n webhook** for the AI Course Recommender (`POST /webhook/recommend`)
- Connects to **n8n webhook** for the AI Study Buddy per lesson (`POST /webhook/study-buddy`)
- Passes `leconId`, `contentId`, `action`, `question`, and `sessionId` for memory-based conversation

---

## 📂 Project Structure

```text
backend/
├── app.js                    # Express app entry, route mounting
├── config/
│   ├── config.js             # Environment config (port, DB URL, JWT, etc.)
│   └── db.js                 # MongoDB connection
├── controllers/
│   ├── admin.controller.js   # Admin-specific actions (stats, block, verify centres)
│   ├── formation.controller.js
│   ├── inscription.controller.js
│   ├── lecon.controller.js   # Lessons + AI Study Buddy endpoint
│   ├── leconContent.controller.js
│   ├── paiement.controller.js
│   ├── public.controller.js  # ★ NEW: public stats (no auth)
│   ├── report.controller.js
│   ├── user.controller.js
│   └── ...
├── middlewares/
│   ├── authMiddleware.js     # JWT verification, role guards
│   ├── errorMiddleware.js    # Global error handler
│   └── uploadfile.js         # Multer config for file uploads
├── models/                   # Mongoose schemas
├── routes/
│   ├── admin.routes.js
│   ├── public.routes.js      # ★ NEW: /public/stats
│   └── ...
├── services/                 # Business logic helpers
├── utils/
│   ├── response.js           # Standardized sendSuccess / sendError helpers
│   └── parser.js
└── validations/              # Joi schemas
```

---

## 🛠️ Setup & Installation

```bash
cd backend
npm install
cp .env.example .env    # Set MONGO_URI, JWT_SECRET, PORT, FRONTEND_URL
npm run dev             # Starts with nodemon on http://localhost:5000
```

### Environment Variables (`.env`)

| Key | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing JWT tokens |
| `PORT` | Server port (default: 5000) |
| `FRONTEND_URL` | CORS allowed origin (e.g. `http://localhost:5173`) |
| `N8N_STUDY_BUDDY_WEBHOOK_URL` | n8n webhook URL for AI Study Buddy |

---

## 📚 API Documentation

Swagger UI is available at:
```
http://localhost:5000/api-docs
```

---

## 🔑 Role Permissions

| Endpoint Group | Admin | ResponsableCF | Formateur | Apprenant |
|---|---|---|---|---|
| `/admin/*` | ✅ | ❌ | ❌ | ❌ |
| `/centres` (own) | ✅ | ✅ | ❌ | ❌ |
| `/formations` (own) | ✅ | ✅ | ❌ | ❌ |
| `/lecons`, `/contents` | ✅ | ✅ | ✅ | ❌ |
| `/inscriptions` | ✅ | ✅ | ❌ | ✅ |
| `/public/stats` | ✅ | ✅ | ✅ | ✅ (no auth) |
