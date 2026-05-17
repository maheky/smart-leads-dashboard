📊 Smart Leads Dashboard
A full-stack MERN + TypeScript Lead Management System built for efficient tracking, filtering, and management of sales leads with authentication, role-based access, and analytics-ready architecture.

🚀 Live Links
Frontend (Vercel): https://smart-leads-dashboard-git-main-mahek-yadav-s-projects.vercel.app/
Backend (Render): https://smart-leads-dashboard-aybl.onrender.com
GitHub Repo: https://github.com/maheky/smart-leads-dashboard

🛠️ Tech Stack
Frontend
React.js
TypeScript
Tailwind CSS
Axios
React Router
Backend
Node.js
Express.js
TypeScript
MongoDB + Mongoose
JWT Authentication
bcrypt.js

Deployment
Frontend: Vercel
Backend: Render
Database: MongoDB Atlas

✨ Features

🔐 Authentication System
User Registration & Login
JWT-based authentication
Password hashing using bcrypt
Protected routes

📋 Lead Management (CRUD)
Create Leads
Update Leads
Delete Leads
View all leads
View single lead details

🔎 Advanced Filtering & Search
Search by Name or Email
Filter by Status:
New
Contacted
Qualified
Lost
Filter by Source:
Website
Instagram
Referral
Sort by:
Latest
Oldest

📄 Pagination
Backend pagination implemented
10 records per page
Optimized API using skip & limit

📤 CSV Export
Export all leads data to CSV
Download-ready report generation

👥 Role-Based Access Control
Admin role
Sales role
Access-based route protection

🎨 UI/UX Features
Responsive design (mobile + desktop)
Clean dashboard layout
Loading & error states
Reusable components

⚡ Performance Features
Debounced search (optimized API calls)
Efficient state management
RESTful API structure

🚀 Setup Instructions
Backend
cd backend
npm install
npm run dev

Frontend
cd frontend
npm install
npm run dev

API Endpoints

Auth Routes
POST /api/auth/register → Register user
POST /api/auth/login → Login user

Lead Routes
GET /api/leads → Get all leads
POST /api/leads → Create lead
PUT /api/leads/:id → Update lead
DELETE /api/leads/:id → Delete lead
