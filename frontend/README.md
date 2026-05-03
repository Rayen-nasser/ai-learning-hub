# Frontend — AI Learning Hub

React 18 + Vite single-page application for the AI Learning Hub LMS. Features a premium dark-gold UI, full bilingual support (EN/FR), and AI-powered learning tools.

---

## 🚀 Tech Stack

| Tool | Purpose |
|---|---|
| React 18 | UI framework |
| Vite | Build tool with HMR |
| React Router DOM | Client-side routing |
| Axios | HTTP client |
| react-i18next | Bilingual internationalization (EN/FR) |
| Vanilla CSS | Custom premium dark-gold design system |

> **Note:** The project uses **Vanilla CSS** (not TailwindCSS). All styles are scoped inside component `<style>` blocks for full control.

---

## ✨ Features

### 🏠 Home Page
- Animated hero section with floating orbs, staggered fade-slide-up animations, gradient text
- **Dynamic platform stats** fetched from `/public/stats` (student count, courses, satisfaction %)
- Smart number formatting (auto `K+` suffix for thousands)
- Course cards with **real course image** + category name badge (top-right)
- Category cards with **smart emoji icons** matching category name keywords
- AI Course Recommender embedded section
- Premium CTA banner with grid overlay

### 🎓 Learner (Apprenant) Pages
- Course browser with search + filters
- Enrolled course dashboard
- **Lesson Viewer** (`ApprenantLearning`) with:
  - Sidebar lesson navigator + progress tracking
  - Video, file, image, link, and quiz content types
  - **AI Study Buddy** floating panel — per-lesson AI chat assistant
  - **Explain with AI** text-link on file and URL content items
  - **Summarize with AI** button — only shown when lesson contains files or links (hidden for video-only lessons)
  - Auto-scroll to AI anchor on response

### 👨‍💼 Admin Pages (Fully Localized)
- Dashboard overview
- User management (list, block/unblock, filter by role)
- Training centre management (pending approval workflow)
- Category, skill, report management
- Platform statistics (enrollments, revenue, top formations, block history)

### 🌍 Internationalization (i18n)
- Language auto-detected from browser (`i18next-browser-languagedetector`)
- Fallback language: **French** (`fr`)
- Translation files: `src/locales/en.json` and `src/locales/fr.json`
- Namespace: `admin.*` for all admin/AI keys
- All admin pages, AI recommender, and AI Study Buddy buttons are bilingual

### 🤖 AI Components
- **`AICourseRecommender`** (`src/shared/components/`) — fully localized, webhook-driven
- **AI Study Buddy** in `ApprenantLearning` — floating drawer with message history, typing indicator, copy-to-clipboard
- Context-aware: Explain and Summarize only appear on file/link content, not videos

---

## 📂 Project Structure

```text
frontend/src/
├── features/
│   ├── admin/
│   │   ├── components/       # AdminLayout, sidebar
│   │   ├── pages/            # AdminUsers, AdminStatistics, AdminReports, etc.
│   │   └── services/admin.js # Admin API calls
│   ├── apprenant/
│   │   ├── components/       # ApprenantLayout
│   │   └── pages/
│   │       └── ApprenantLearning.jsx  # Full lesson viewer + AI Study Buddy
│   ├── auth/                 # Login, Register pages + auth service
│   ├── formations/           # Course listing, detail, content services
│   ├── home/
│   │   └── pages/Home.jsx    # Landing page with dynamic stats + AI recommender
│   ├── dashboard/            # Student dashboard, enrollments, payments
│   └── profile/              # User profile page
├── shared/
│   ├── components/
│   │   └── AICourseRecommender.jsx   # AI course recommendation widget
│   ├── context/
│   │   └── AuthContext.jsx   # Global auth state
│   └── layout/
│       ├── Header.jsx        # Top navigation with language switcher
│       └── Layout.jsx        # Root layout wrapper
├── locales/
│   ├── en.json               # English translations
│   └── fr.json               # French translations
├── services/
│   ├── api.js                # Barrel re-exports for all services
│   └── client.js             # Configured Axios instance
└── i18n.js                   # i18next configuration
```

---

## 🛠️ Setup & Installation

```bash
cd frontend
npm install
npm run dev       # Dev server at http://localhost:5173
```

```bash
npm run build     # Production build
npm run preview   # Preview production build
```

---

## 🎨 Design System

The UI uses a **dark gold aesthetic** with the following design tokens:

| Token | Value | Usage |
|---|---|---|
| Background | `#0c0c0e` | Page background |
| Surface | `rgba(255,255,255,0.02–0.05)` | Cards, panels |
| Gold Primary | `#c8a86e` / `#b4915a` | Accents, buttons, icons |
| Text Primary | `#f0ebe0` | Headings |
| Text Secondary | `#888` / `#666` | Body text, labels |
| Border | `rgba(255,255,255,0.07)` | Card borders |
| Font Serif | `Cormorant Garamond` | Headings, large numbers |
| Font Sans | `DM Sans` | Body text, labels |

---

## 🌍 Adding Translations

1. Add the key to both `src/locales/en.json` and `src/locales/fr.json`
2. Use the `useTranslation()` hook in your component: `const { t } = useTranslation();`
3. Call `t('admin.yourKey')` for admin-namespace keys or `t('home.yourKey')` for home keys
