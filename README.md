# 🍽️ ChefPulse ### AI-Powered Smart Restaurant Management Platform 
![Hackathon](https://img.shields.io/badge/Hackathon-Vibeathon%206.0-blue?style=for-the-badge) ![Team](https://img.shields.io/badge/Team-SoloStack-success?style=for-the-badge) ![Team Size](https://img.shields.io/badge/Team%20Size-1-orange?style=for-the-badge) ![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=for-the-badge) ![Backend](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge) ![Database](https://img.shields.io/badge/Database-SQLite-003B57?style=for-the-badge) ---

# ChefPulse - AI-Powered Restaurant Operations Platform

# 📖 Overview

ChefPulse is an AI-powered restaurant management platform built for modern restaurants to streamline daily operations through intelligent automation, real-time dashboards, and role-based management.

The platform provides dedicated dashboards for restaurant administrators, kitchen staff, and customers while integrating AI-powered assistance for menu recommendations, restaurant analytics, inventory insights, customer support, and operational decision-making.

ChefPulse combines restaurant management, order processing, reservations, inventory tracking, analytics, notifications, and AI-driven interactions into a single platform.

Developed as a solo project for **Vibeathon 6.0**, ChefPulse demonstrates how AI can improve restaurant efficiency, reduce manual workload, and enhance customer experience.

---
# 👤 Team Information 
## Team Name **SoloStack** 
## Team Size **1** 
## Team Lead **Ria Bhagat** 

--- 
## Roles & Responsibilities 
Since this is a solo submission, all responsibilities were handled by the Team Lead. 
| Role | Member | 
|-------|--------| 
| Team Lead | Ria Bhagat | 
| UI/UX Designer | Ria Bhagat | 
| Frontend Developer | Ria Bhagat | 
| Backend Developer | Ria Bhagat | 
| Database Designer | Ria Bhagat | 
| API Developer | Ria Bhagat | 
| AI Integration | Ria Bhagat | 
| Testing & Deployment | Ria Bhagat | 

--- 
# 🚀 Live Demo 
## Frontend 
https://chef-pulse.vercel.app
## Backend API 
https://chefpulse-backend.onrender.com

--- 

# 🏆 Hackathon **Vibeathon 6.0** 

--- 
# 💡 Problem Statement 
Modern restaurants often rely on multiple disconnected systems to manage orders, inventory, reservations, customer interactions, and kitchen operations. This leads to inefficient workflows, slower service, increased manual effort, and limited operational insights. ChefPulse addresses these challenges by providing a centralized AI-powered platform that combines restaurant management, analytics, customer engagement, and intelligent automation into one seamless solution. ---

# ✨ Key Features 
## 👨‍💼 Admin Dashboard 
- Restaurant analytics
- Revenue insights
- Order management
- Customer management
- Reservation management
- Inventory management
- Menu management
- AI Assistant
- Notifications
- Profile management
---

## 🍽 Customer Dashboard 
- Browse luxury menu
- AI restaurant assistant
- Voice ordering
- Image-based dish recognition
- Smart recommendations
- Place orders
- View order history
- Reserve tables
- Manage profile
---

## 👨‍🍳 Kitchen Dashboard 
- View incoming orders
- Update order status
- Track kitchen workload
---

# 🤖 AI Features

## Customer AI Assistant

- Natural language restaurant assistant
- Smart menu recommendations
- Dietary preference filtering (Veg / Non-Veg)
- Budget-based food suggestions
- Category-wise recommendations
- Chef's special recommendations
- Side dish & beverage pairing suggestions
- Restaurant FAQs (hours, location, concept)

---

## Admin AI Assistant

The AI assistant can answer operational questions using live restaurant data.

Examples include:

- What sold the most today?
- What are today's sales?
- Which customers spent the most?
- Which dishes are underperforming?
- Which menu item should be restocked?
- Predict tomorrow's demand
- Inventory status
- Reservation summary
- Customer statistics
- Order status overview
- Marketing recommendations

---

## AI-Powered Features

- Intelligent menu recommendations
- AI-generated dish images
- Voice ordering support
- Image-based dish recognition
- Role-based AI responses
---

# 📊 Analytics

- Revenue dashboard
- Daily sales tracking
- Order statistics
- Best-selling dishes
- Customer insights
- Restaurant performance metrics
- AI-generated business insights
- Demand forecasting
---

# 📦 Inventory Management

- Inventory tracking
- Low stock detection
- Restock recommendations
- Category-wise inventory
- Stock level monitoring
---

## 🔐 Authentication 
- JWT Authentication
- Secure Login
- Registration
- OTP Email Verification
- Role-Based Access Control

---

# 📧 Notifications

- Real-time notifications
- Live updates using WebSockets
- Order notifications
- Reservation updates
---

## Frontend

- React
- Vite
- React Router
- Axios
- Framer Motion
- Recharts
- Lucide React

## Backend

- FastAPI
- SQLAlchemy
- Pydantic
- JWT Authentication
- Passlib
- Argon2
- WebSockets

## Database

- SQLite

## AI Features

- Rule-based Natural Language Assistant
- Intelligent Recommendation Engine
- Image Recognition
- AI-generated Dish Images

## Deployment

- Vercel (Frontend)
- Render (Backend)

# 📂 Project Structure

```text
ChefPulse/
├── .env.example              # Environment variables template
├── README.md                 # Project documentation
│
├── frontend/                 # React + Vite frontend
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── assets/           # Images, icons and illustrations
│   │   ├── components/       # Reusable UI components
│   │   ├── context/          # Authentication & global state
│   │   ├── hooks/            # Custom React hooks
│   │   ├── layouts/          # Dashboard layouts
│   │   ├── pages/            # Application pages
│   │   ├── services/         # API services (Axios)
│   │   ├── App.jsx           # Routing configuration
│   │   ├── main.jsx          # React entry point
│   │   └── index.css         # Global styles
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
└── backend/                  # FastAPI backend
    ├── requirements.txt
    └── app/
        ├── models/           # SQLAlchemy database models
        ├── routers/          # API endpoints
        ├── schemas/          # Pydantic schemas
        ├── services/         # AI assistant, authentication & business logic
        ├── static/
        │   └── dish_images/  # Generated/uploaded menu images
        ├── database.py       # Database configuration
        └── main.py           # FastAPI application entry point
```

# ⚙️ Installation 
## Clone Repository
bash
git clone

https://github.com/riabhagat27/ChefPulse.git

--- 

## Backend
bash
cd backend

python -m venv .venv

source .venv/bin/activate
Windows
bash
.venv\Scripts\activate
Install dependencies
bash
pip install -r requirements.txt
Run server
bash
uvicorn app.main:app --reload

--- 

## Frontend
bash
cd frontend

npm install

npm run dev

--- 

# 🌐 API FastAPI automatically generates API documentation. 
Swagger
/docs
Redoc
/redoc

---

# 🔥 Highlights

- AI Restaurant Assistant
- AI Business Analytics Assistant
- Smart Menu Recommendations
- Role-Based Dashboards
- Voice Ordering
- Image-Based Dish Recognition
- AI Dish Image Generation
- Restaurant Analytics
- Inventory Intelligence
- Demand Forecasting
- Reservation Management
- JWT Authentication
- WebSocket Notifications
- Responsive Modern UI
- Production Deployment
---

# 🚀 Future Improvements

- Online Payment Gateway
- QR Code Table Ordering
- Multi-Restaurant Management
- PostgreSQL Migration
- Docker Deployment
- CI/CD Pipeline
- Mobile App
- Multi-language Support
- Staff Attendance Management
- AI-Based Dynamic Pricing
- POS Integration
- Customer Loyalty & Rewards
---

# 📸 Screenshots
<img width="944" height="496" alt="image" src="https://github.com/user-attachments/assets/75c2d81a-d351-4fc1-9087-849051adb7cf" />



