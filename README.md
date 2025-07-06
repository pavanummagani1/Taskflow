# Smart Task Manager - Smart Task Management System

A full-stack task management application with advanced admin capabilities, built with modern web technologies.

## Features

### 🌟 User Features
- Secure authentication (Email/Password & Google OAuth)
- Intuitive task management (CRUD operations)
- Task categorization and advanced filtering
- Personal dashboard with visual analytics
- Data export (CSV, Excel, PDF)
- Responsive mobile-friendly design

### 🔐 Admin Features
- Comprehensive user management system
- Global task monitoring across all users
- Detailed audit logging
- Admin dashboard with system statistics
- Role-based access control (RBAC)

### ⚙️ Technical Features
- JWT & Firebase authentication
- MongoDB with Mongoose ODM
- RESTful API with proper status codes
- Comprehensive audit trail
- Rate limiting and security middleware
- Robust input validation
- Centralized error handling

## Tech Stack

### Frontend
- React 18 with Hooks
- React Router v6
- Axios for HTTP requests
- Tailwind CSS with custom themes
- Recharts for data visualization
- Firebase Authentication
- Export functionality (jsPDF, xlsx)

### Backend
- Node.js & Express.js
- MongoDB Atlas
- Firebase Admin SDK
- JWT authentication
- Security middleware (Helmet, CORS)
- Express Validator

## Live Demo

Access the deployed application: [Smart Task Manager Live](https://taskflow-kappa-two.vercel.app/login)
client Login Details: 
Email: pavanummagani1@gmail.com
Password: Sf9t^Ot2$jFz

Admin Login Details:
Email:
Password: 


## API Documentation

Base URL: `https://taskflow-wxqj.onrender.com/api`

### 🔒 Authentication
- `POST /auth/google` - Google OAuth authentication

### 📝 Tasks
- `GET /tasks/alltasks` - Get all tasks for authenticated user
- `GET /tasks/stats` - Get task statistics
- `GET /tasks/:taskId` - Get specific task
- `PUT /tasks/:taskId` - Update task
- `DELETE /tasks/:taskId` - Delete task

### 👨‍💻 Admin Endpoints
- `GET /admin/users` - List all users
- `GET /admin/tasks` - List all tasks
- `GET /admin/audit-logs` - Get audit logs (supports `?populate=user`)
- `GET /admin/stats` - Get system statistics
- `PUT /admin/users/:userId/status` - Update user status
- `DELETE /admin/users/:userId` - Delete user

## Installation

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- Firebase project

### Setup Instructions

1. Clone the repository:
git clone [https://github.com/yourusername/taskflow.git](https://github.com/pavanummagani1/Taskflow.git)
cd taskflow
2.	Install dependencies:
Download
npm install
cd client && npm install
3.	Configure environment
Download
cp .env.example .env
4.	Set up environment variables in .env:
Database Schema
📌 Users Collection
•	name, email, password (hashed)
•	role ('user' or 'admin')
•	status ('active' or 'inactive')
•	firebaseUID (for Google auth)
•	timestamps
✅ Tasks Collection
•	title, description, category
•	dueDate, status, priority
•	user (reference)
•	timestamps
📊 Audit Logs Collection
•	user (reference)
•	action, resource, details
•	ipAddress, userAgent
•	timestamps
Deployment
The application is deployed on Render:
•	Frontend: https://taskflow-kappa-two.vercel.app/login
•	Backend: https://taskflow-wxqj.onrender.com
Security Features
•	🔑 Password hashing with bcrypt
•	🛡️ JWT token authentication
•	🔍 Firebase token verification
•	⏱️ Rate limiting
•	🧹 Input validation and sanitization
•	🛡️ CORS protection
•	🔒 Security headers with Helmet
•	📝 Comprehensive audit logging
Contributing
We welcome contributions! Please follow these steps:
1.	Fork the repository
2.	Create your feature branch (git checkout -b feature/AmazingFeature)
3.	Commit your changes (git commit -m 'Add some AmazingFeature')
4.	Push to the branch (git push origin feature/AmazingFeature)
5.	Open a Pull Request
License
Distributed under the MIT License. See LICENSE for more information.
Contact
Project Maintainer: Pavan Kalyan
Email: pavanummagani1@gmail.com
Project Link: https://github.com/pavanummagani1/Taskflow.git