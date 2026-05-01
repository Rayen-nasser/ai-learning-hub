# AI-Powered Learning Management System (PFE 2026)

Welcome to the AI-Powered LMS and Course Recommender project. This is a full-stack application designed to provide a modern learning experience with intelligent course recommendations.

## 🏗️ Architecture Overview

The project is split into three main components:

1.  **Backend**: Express.js & MongoDB API handling authentication, data management, and integrations.
2.  **Frontend**: A modern React & Tailwind CSS dashboard for learners and administrators.
3.  **AI Workflow (n8n)**: Automation workflows for course recommendations and AI-driven logic.

## 🚀 Quick Start Guide

To get the entire system running locally, follow these steps in order:

### 1. Prerequisites
Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/)
- [Docker](https://www.docker.com/) (for AI workflows)

### 2. Setup the Backend
```bash
cd backend
npm install
cp .env.example .env  # Fill in your MongoDB URL and JWT Secret
npm run dev
```
*API will be available at `http://localhost:5000`*

### 3. Setup the Frontend
```bash
cd frontend
npm install
npm run dev
```
*App will be available at `http://localhost:5173`*

### 4. Setup AI Workflows (n8n)
```bash
cd AI_workflow_n8n
docker-compose up -d
```
*n8n will be available at `http://localhost:5678`. Import `course_recommender_workflow.json` into n8n.*

## 📂 Project Structure

```text
.
├── backend/            # Express API, MongoDB models, Controllers
├── frontend/           # React App, Tailwind CSS, Vite
└── AI_workflow_n8n/    # n8n Docker setup and workflow JSON
```

## 📖 Detailed Documentation

For more specific information on each part of the project, please refer to the README files in their respective directories:

- [Backend Documentation](./backend/README.md)
- [Frontend Documentation](./frontend/README.md)
- [AI Workflow Documentation](./AI_workflow_n8n/README.md)

---

Developed for the **PFE 2026** Project.
