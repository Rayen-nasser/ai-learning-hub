# AI Workflows (n8n) — AI Learning Hub

This directory contains the **n8n automation workflows** powering the AI features of the Learning Hub platform.

---

## 🤖 Workflows

| Workflow | File | Webhook URL | Trigger |
|---|---|---|---|
| **AI Course Recommender** | `course_recommender_workflow.json` | `POST /webhook/recommend` | User submits learning goal in the home page widget |
| **AI Study Buddy** | `study_buddy_workflow.json` | `POST /webhook/study-buddy` | Student requests explanation/summary in the lesson viewer |

---

## 🚀 Tech Stack

- **n8n** (self-hosted via Docker)
- **OpenAI** (or compatible LLM) for AI responses
- **MongoDB** node for conversation memory (Study Buddy)

---

## 🛠️ Setup

### Prerequisites
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)

### Start n8n

```bash
cd AI_workflow_n8n
docker-compose up -d
```

n8n will be available at: **http://localhost:5678**

---

## 🔄 Importing Workflows

1. Open **http://localhost:5678** in your browser
2. Go to **Workflows → Add Workflow → Import from File**
3. Import `course_recommender_workflow.json`
4. Import `study_buddy_workflow.json`
5. **Activate** both workflows

---

## 🔑 Required Credentials

Configure these in the n8n **Credentials** panel before activating:

| Credential | Used By | Notes |
|---|---|---|
| OpenAI API Key | Both workflows | For LLM responses |
| MongoDB connection | Study Buddy | For persistent conversation memory |

---

## 📡 Webhook API Reference

### AI Course Recommender

**Endpoint:** `POST http://localhost:5678/webhook/recommend`

**Request body:**
```json
{
  "goal": "I want to master web development and React"
}
```

**Response:**
```json
{
  "recommendations": [...],
  "reasoning": "Based on your goal...",
  "matchAccuracy": "94%"
}
```

---

### AI Study Buddy

**Endpoint:** `POST http://localhost:5678/webhook/study-buddy`

**Request body:**
```json
{
  "leconId": "...",
  "contentId": "...",
  "action": "explain",
  "question": "Can you explain this PDF?",
  "sessionId": "userId_leconId"
}
```

**Actions:**
| Value | Behavior |
|---|---|
| `explain` | Explains a specific content item (file or URL) |
| `summarize` | Summarizes the lesson (only available if files/links exist) |
| *(free text)* | Answers a custom user question |

**Response:**
```json
{
  "data": {
    "answer": "Here is the explanation..."
  }
}
```

---

## 📂 Files

```text
AI_workflow_n8n/
├── docker-compose.yml                  # n8n Docker configuration
├── course_recommender_workflow.json    # AI Course Recommender workflow
└── study_buddy_workflow.json           # AI Study Buddy workflow
```

---

## ⚠️ Notes

- If the backend returns an AI error, verify the n8n service is running and the workflows are **activated**
- The `sessionId` (`userId_leconId`) is used by the Study Buddy to maintain per-user, per-lesson conversation memory in MongoDB
- The frontend **gracefully degrades** if n8n is offline (shows a localized error message instead of crashing)
