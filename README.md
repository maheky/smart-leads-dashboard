# 🚀 Smart Leads Dashboard (MERN Stack)
A full-stack Lead Management System built using MERN stack with TypeScript, featuring authentication, lead tracking, filtering, pagination, and role-based access.
---
## 📌 Tech Stack

### Frontend
- React.js (TypeScript)
- TailwindCSS
- Axios
- React Router

### Backend
- Node.js
- Express.js (TypeScript)
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs
---
## ✨ Features

### 🔐 Authentication
- User Registration
- User Login
- JWT-based authentication
- Protected Routes
- Password hashing using bcrypt
---
### 📊 Leads Management
- Create Lead
- Update Lead
- Delete Lead
- View all leads
- View single lead
---
### 🔎 Advanced Features
- Debounced Search
- Filter by Status
- Filter by Source
- Sorting (Newest / Oldest)
- Backend Pagination (10 per page)
---
### 👥 Role-Based Access
- Admin
- Sales User
---
### 📤 Additional Features
- CSV Export
- Dark Mode Support
- Responsive UI
- Toast Notifications
---
## ⚙️ Setup Instructions
### 1. Clone Repo
```bash
git clone https://github.com/maheky/smart-leads-dashboard.git

2. Backend Setup
cd backend
npm install
npm run dev

3. Frontend Setup
cd frontend
npm install
npm run dev

🔐 Environment Variables
Create .env file in backend:
MONGO_URI=mongodb+srv://ymahek341_db_user:gigflow123@gigflow-cluster.kwmxd79.mongodb.net/gigflow?retryWrites=true&w=majority
JWT_SECRET=gigflowsecretkey
PORT=5000

🐳 Docker
docker compose up --build
