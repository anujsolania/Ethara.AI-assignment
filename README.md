# Ethara.AI Team Task Manager 🚀

A production-ready full-stack MERN (MongoDB, Express, React, Node.js) application designed for high-performance team collaboration. This project features robust role-based access control (RBAC), real-time task tracking with a Kanban board, and a stunning glassmorphism-inspired UI.

---

## 🌟 Key Features

### 🔐 Authentication & Security
- **JWT-Based Auth**: Secure login and registration with Access & Refresh token rotation.
- **Secure Storage**: HTTP-only cookies for refresh tokens to prevent XSS.
- **Rate Limiting**: Protection against brute-force attacks on all API endpoints.
- **Helmet**: Essential security headers for production safety.

### 🛡️ Role-Based Access Control (RBAC)
- **Admin**: Full control. Can create projects, invite members, assign tasks, and delete records.
- **Member**: Focused access. Can only view assigned projects and update the status of tasks assigned to them.
- **Granular Permissions**: Custom middleware ensures users can only access data they are authorized to see.

### 📊 Project & Task Management
- **Dynamic Kanban Board**: Drag-and-drop tasks across statuses (To Do, In Progress, Review, Done) powered by `@dnd-kit`.
- **Project Lifecycle**: Assign colors, set deadlines, and track completion progress.
- **Collaborative Comments**: Discuss tasks directly within the task view.

### 🎨 Premium UI/UX
- **Aesthetic Design**: Dark-mode first design with glassmorphism, vibrant gradients, and smooth transitions.
- **Responsive Layout**: Optimized for Desktop, Tablet, and Mobile.
- **Micro-animations**: Subtle feedback for every user interaction.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 (Vite)
- **State Management**: React Context API
- **Routing**: React Router DOM v6
- **Styling**: Vanilla CSS (Custom Design System)
- **Interactions**: `@dnd-kit` (Drag & Drop), `lucide-react` (Icons)
- **Networking**: Axios (with interceptors for token refresh)

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Security**: JWT, Bcrypt.js, Helmet, Express-Rate-Limit, CORS
- **Logging**: Morgan

---

## 📂 Project Structure

```text
├── assets/             # Project images and banners
├── backend/            # Express API
│   ├── src/
│   │   ├── config/     # Database and env configs
│   │   ├── controllers/# Business logic
│   │   ├── middleware/ # Auth & RBAC logic
│   │   ├── models/     # Mongoose Schemas
│   │   └── routes/     # API Endpoints
│   └── server.js       # Entry point
├── frontend/           # React App
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── context/    # Global state (Auth/Projects)
│   │   ├── pages/      # View components
│   │   └── services/   # API communication (Axios)
│   └── index.css       # Core design system
└── railway.json        # Deployment configuration
```

---

## 🚦 API Documentation

### Auth Endpoints
- `POST /api/auth/register` - Create a new account.
- `POST /api/auth/login` - Login and receive tokens.
- `POST /api/auth/refresh` - Rotate access token.
- `GET /api/auth/me` - Get current user profile.

### Project Endpoints
- `GET /api/projects` - List all projects (filtered by role).
- `POST /api/projects` - Create new project (**Admin only**).
- `GET /api/projects/:id` - Get project details.
- `POST /api/projects/:id/members` - Add member to project (**Admin only**).

### Task Endpoints
- `GET /api/tasks` - Get all tasks.
- `POST /api/tasks` - Create new task (**Admin only**).
- `PATCH /api/tasks/:id/status` - Update task status (**Assigned Member/Admin**).
- `POST /api/tasks/:id/comments` - Add comment to task.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account or local MongoDB instance

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/ethara-task-manager.git
cd ethara-task-manager
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Fill in your MONGODB_URI and JWT secrets in .env
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🌐 Deployment (Railway)

This repository is optimized for deployment on **Railway**.

1. Connect your GitHub repository to [Railway](https://railway.app/).
2. Railway will detect the `railway.json` and deploy both services.
3. **Environment Variables Needed**:
   - `MONGODB_URI`: Your MongoDB connection string.
   - `JWT_SECRET`: Random string for access tokens.
   - `JWT_REFRESH_SECRET`: Random string for refresh tokens.
   - `FRONTEND_URL`: URL of your deployed frontend.
   - `VITE_API_URL`: (Frontend) URL of your deployed backend.

---

## 🎥 Demo Walkthrough

1. **Dashboard**: View real-time project statistics and overdue task alerts.
2. **Project Creation**: Create a project and assign it a unique color identity.
3. **Collaboration**: Add members to projects and assign them specific tasks.
4. **Kanban Flow**: Move tasks across the board as work progresses.
5. **RBAC Test**: Log in as a 'Member' to see the restricted, focused view.

---
*Developed with ❤️ by Anuj Solania for Ethara.AI*
