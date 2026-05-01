# Frontend - AI Course Recommender & LMS

This is the frontend application for the AI Course Recommender and Learning Management System. It is built using React, Vite, and Tailwind CSS.

## 🚀 Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 4
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Testing**: Vitest & React Testing Library

## 🛠️ Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/)

## 📦 Setup & Installation

1.  **Navigate to the frontend directory**:
    ```bash
    cd frontend
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure API URL**:
    The frontend communicates with the backend at `http://localhost:5000` by default. You can configure this in your service layer or via environment variables if implemented.

## 🏃 Running the App

- **Development Mode** (with HMR):
  ```bash
  npm run dev
  ```
- **Build for Production**:
  ```bash
  npm run build
  ```
- **Preview Production Build**:
  ```bash
  npm run preview
  ```

## 🧪 Testing

- **Run tests**:
  ```bash
  npm test
  ```
- **Run tests with coverage**:
  ```bash
  npm run test:coverage
  ```

## 📂 Project Structure

- `src/assets/`: Static assets like images and fonts.
- `src/components/`: Reusable UI components.
- `src/pages/`: Page-level components (screens).
- `src/services/`: API calls and business logic.
- `src/hooks/`: Custom React hooks.
- `src/context/`: Context API providers for state management.
- `src/utils/`: Helper functions and constants.
