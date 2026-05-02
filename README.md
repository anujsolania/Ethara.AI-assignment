# Ethara.AI Team Task Manager 🚀

A production-ready full-stack MERN application for managing team projects, tasks, and members with role-based access control. Built for the Ethara.AI assignment.

## 🌟 Key Features

- **Authentication & Security**: Secure JWT-based login, registration, and refresh token rotation.
- **Role-Based Access Control (RBAC)**: 
  - **Admins** have full access to create projects, manage members, and oversee all tasks.
  - **Members** can only view projects they are assigned to and update the status of their own tasks.
- **Dynamic Kanban Board**: Drag-and-drop task management powered by `@dnd-kit`.
- **Stunning UI/UX**: Dark-mode first design, glassmorphism aesthetics, responsive layouts, and micro-animations built with rich Vanilla CSS.
- **Dashboard Analytics**: Real-time statistics, completion rates, and an overdue task alert system.

## 🛠️ Technology Stack

**Frontend**
- React 18 (Vite)
- React Router DOM v6
- Context API for State Management
- Axios (with interceptors for silent token refresh)
- `@dnd-kit` for drag-and-drop
- Vanilla CSS (Custom Design System, no Tailwind)

**Backend**
- Node.js & Express.js
- MongoDB & Mongoose ODM
- JWT (Access & Refresh Tokens stored securely)
- Bcrypt.js for password hashing
- Express Rate Limit & Helmet for security

**Deployment**
- Configured for Railway (`railway.json` included)
- Multi-stage Docker builds for both Frontend and Backend.

## 🚀 Running Locally

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account or local MongoDB instance

### 1. Clone the repository
\`\`\`bash
git clone https://github.com/yourusername/ethara-task-manager.git
cd ethara-task-manager
\`\`\`

### 2. Backend Setup
\`\`\`bash
cd backend
npm install

# Create a .env file and configure your MongoDB URI and JWT secrets
cp .env.example .env

# Start the dev server
npm run dev
\`\`\`

### 3. Frontend Setup
\`\`\`bash
cd frontend
npm install

# Start the dev server
npm run dev
\`\`\`

## 🌐 Deployment (Railway)

This repository is strictly configured for 1-click deployment on Railway using Docker.

1. Connect your GitHub repository to [Railway.app](https://railway.app/).
2. Railway will automatically detect the `railway.json` and deploy both the `backend` and `frontend` folders as separate services using their respective `Dockerfile`s.
3. Provision a **MongoDB** plugin within your Railway project.
4. Set the necessary Environment Variables in the backend service (`MONGODB_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `FRONTEND_URL`).
5. Set the `VITE_API_URL` environment variable in the frontend service to point to your deployed backend.

## 🎥 Demo Video Guide (2-5 mins script outline)

1. **Introduction**: Show the stunning Landing Page.
2. **Auth & RBAC Setup**: Register a new user (first user becomes Admin automatically). Show the Dashboard.
3. **Project Management**: Create a new Project, give it a color and deadline.
4. **Member Management**: Register a second user (becomes Member). Log back in as Admin and add them to the Project.
5. **Task Management (Kanban)**: Create tasks and assign them. Show the drag-and-drop Kanban functionality.
6. **Role Limitations**: Log in as the Member, show that they cannot create projects, but can move their assigned tasks across the Kanban board.
7. **Dashboard**: Show how the dashboard statistics and overdue alerts update dynamically.

---
*Developed by Anuj Solania for Ethara.AI*
