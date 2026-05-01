# AI Workflow - n8n Course Recommender

This directory contains the automation workflows for the AI Course Recommender system, powered by n8n.

## 🚀 Overview

The system uses n8n to handle complex AI logic, such as analyzing user profiles and recommending courses. The workflow is triggered by the backend and returns personalized recommendations.

## 🛠️ Prerequisites

- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) installed on your machine.

## 📦 Setup & Running n8n

1.  **Navigate to the workflow directory**:
    ```bash
    cd AI_workflow_n8n
    ```

2.  **Start n8n using Docker Compose**:
    ```bash
    docker-compose up -d
    ```

3.  **Access n8n**:
    Open your browser and go to: `http://localhost:5678`

## 🔄 Importing the Workflow

1.  In the n8n interface, click on the **Workflows** menu.
2.  Click **Add Workflow** -> **Import from File**.
3.  Select the `course_recommender_workflow.json` file located in this directory.
4.  Once imported, make sure to **Activate** the workflow.

## 🔑 Required Credentials

Depending on the nodes used in the workflow, you may need to configure credentials in n8n for:
- OpenAI (or other LLM providers)
- MongoDB (if n8n connects directly)
- Webhooks (to communicate with the backend)

## 📂 Files

- `course_recommender_workflow.json`: The main n8n workflow definition.
- `docker-compose.yml`: Configuration to run n8n in a container.
