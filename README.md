# AI Learning Hub (PFE 2026)

Welcome to the **AI Learning Hub** — a full-stack, AI-Powered Learning Management System (LMS) built to deliver a modern, intelligent, and bilingual educational experience.

### 💡 About the Name
- **AI** — Reflects the integrated Artificial Intelligence features: course recommender, AI Study Buddy, and smart analytics.
- **Learning** — The primary mission: accessible, high-quality education for every user.
- **Hub** — A centralized monorepo uniting the Frontend, Backend, and AI workflows.

---

## 🏗️ Architecture Overview

| Layer | Technology | Role |
|---|---|---|
| **Backend** | Node.js + Express + MongoDB | REST API, Auth, Business Logic |
| **Frontend** | React 18 + Vite | Student, Admin, Formateur & Responsable UIs |
| **AI Workflows** | n8n (Docker) | Course Recommender & AI Study Buddy |

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/)
- [Docker](https://www.docker.com/) (for AI workflows)

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env   # Fill in MONGO_URI, JWT_SECRET, etc.
npm run dev            # Runs on http://localhost:5000
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev            # Runs on http://localhost:5173
```

### 3. AI Workflows (n8n)
```bash
cd AI_workflow_n8n
docker-compose up -d   # n8n at http://localhost:5678
```
Import `course_recommender_workflow.json` and `study_buddy_workflow.json` into n8n, then activate them.

---

## 📂 Project Structure

```text
.
├── backend/                  # Express API, MongoDB models, controllers, routes
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   │   └── public.routes.js  # Public stats endpoint (no auth required)
│   ├── middlewares/
│   ├── services/
│   └── utils/
├── frontend/                 # React 18 + Vite application
│   └── src/
│       ├── features/         # Feature-based modules (admin, apprenant, home…)
│       ├── shared/           # Shared components, layout, context
│       └── locales/          # EN & FR translation files (i18next)
└── AI_workflow_n8n/          # n8n Docker setup + workflow JSON files
```

---

## ✨ Key Features

### 🎓 Learning Experience
- Course browsing with category filters and AI-powered recommendations
- Interactive lesson viewer (video, file, image, link, quiz)
- AI Study Buddy (chat assistant per lesson, context-aware)
- Progress tracking per course

### 🤖 AI Features
- **AI Course Recommender** — personalized path based on user goals (n8n webhook)
- **AI Study Buddy** — per-lesson AI chat assistant with conversation memory
- **Explain with AI** — instant explanation of attached files & URLs
- **Summarize with AI** — lesson summary from documents/links

### 🌍 Bilingual (EN / FR)
- Full i18next integration across all pages
- Language auto-detection via browser settings
- Separate `en.json` and `fr.json` locale files under `frontend/src/locales/`

### 📊 Dynamic Statistics (Home Page)
- Real-time student count, course count, category count and satisfaction rate
- Served by public `GET /public/stats` endpoint (no auth required)
- Smart number formatting (auto K+ for thousands)

### 🎨 Premium UI/UX
- Dark gold theme with animated hero orbs, staggered entry animations
- Glassmorphism badges and gradient text
- Course cards with real image support + zoom on hover
- Smart category icons that match category name keywords
- Fully responsive (mobile-first breakpoints)

### 🔐 Role-Based Access Control
| Role | Access |
|---|---|
| `admin` | Full platform management, statistics, user control |
| `responsableCF` | Manage own training centres and their formations |
| `formateur` | Create and manage lessons/content for assigned formations |
| `apprenant` | Enroll, learn, review, favorite courses |

---

## 📖 Sub-module Documentation

- [Backend Documentation](./backend/README.md)
- [Frontend Documentation](./frontend/README.md)
- [E2E Test Documentation](./e2e/README.md)
- [AI Workflow Documentation](./AI_workflow_n8n/README.md)

---

## 🧪 Testing

| Suite | Location | Command | Count |
|---|---|---|---|
| **Backend unit** | `backend/tests/unit/` | `npm test` (in `backend/`) | 36 |
| **Backend integration** | `backend/tests/integration/` | `npm test` (in `backend/`) | 58 |
| **Frontend (Vitest)** | `frontend/src/test/` | `npm test` (in `frontend/`) | 209 (7 files) |
| **E2E (Playwright)** | `e2e/tests/` | `npm test` (in `e2e/`) | 17 pass / 2 skip |

See the [E2E README](./e2e/README.md) for detailed setup, common gotchas, and how to add new tests.

---

> Developed for the **PFE 2026** Project by Rayen Nasser.
