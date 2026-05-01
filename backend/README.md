# Backend - AI Course Recommender & LMS

This is the backend API for the AI Course Recommender and Learning Management System. It is built using Node.js, Express, and MongoDB.

## 🚀 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Joi
- **Security**: Helmet, Express Rate Limit, Bcrypt
- **Documentation**: Swagger (Swagger UI Express)
- **Email**: Nodemailer

## ✨ Key Features

- **User Management**: Authentication, profile management, and role-based access control.
- **Course Management**: Create and manage training centers, formations (courses), lessons, and content.
- **Enrollment System**: Student inscriptions with status tracking.
- **Payment Integration**: Secure payment processing for courses.
- **Reviews & Favorites**: Rate courses and save them for later.
- **Reporting & Notifications**: Generate reports and send real-time notifications.
- **AI Integration**: Connects with n8n for personalized skill-based recommendations.
- **API Documentation**: Auto-generated Swagger UI.

## 🛠️ Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)
- [npm](https://www.npmjs.com/)

## 📦 Setup & Installation

1.  **Navigate to the backend directory**:
    ```bash
    cd backend
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**:
    Copy the `.env.example` file to `.env` and fill in your details:
    ```bash
    cp .env.example .env
    ```
    *Note: Ensure you provide a valid MongoDB connection string.*

4.  **Seed the Database (Optional)**:
    To populate the database with initial/fake data for testing:
    ```bash
    npm run seed
    ```

## 🏃 Running the App

- **Development Mode** (with nodemon):
  ```bash
  npm run dev
  ```
- **Production Mode**:
  ```bash
  npm start
  ```

The server will start at `http://localhost:5000` (or the port specified in `.env`).

## 📚 API Documentation

Once the server is running, you can access the interactive Swagger documentation at:
`http://localhost:5000/api-docs`

## 📂 Project Structure

- `controllers/`: Handles the logic for each route.
- `models/`: Mongoose schemas and models.
- `routes/`: API endpoint definitions.
- `middlewares/`: Custom Express middlewares (auth, validation, error handling).
- `services/`: Business logic and external integrations.
- `utils/`: Helper functions.
- `validations/`: Joi validation schemas.
- `scripts/`: Database seeding and maintenance scripts.
