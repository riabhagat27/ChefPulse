# ChefPulse - AI-Powered Restaurant Operations Platform

ChefPulse is a premium AI SaaS dashboard and restaurant operations platform. This codebase represents the initial hackathon prototype foundation, featuring a high-fidelity landing page with glassmorphism, charts, animated statistics counters, and a placeholder FastAPI backend with CORS and SQLite configuration.

---

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

## Installation Commands

### 1. Prerequisites
Ensure you have the following installed:
- **Node.js** (v18+)
- **Python** (v3.8+)

### 2. Frontend Installation
Open a terminal in the `frontend` folder and run:
```bash
cd frontend
npm install
```

### 3. Backend Installation
Open a terminal in the `backend` folder, create a virtual environment, and install dependencies:
```bash
cd backend
python -m venv venv
# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

---

## Run Commands

To run both services locally:

### 1. Run Backend Server
From the `backend` directory (ensure your virtual environment is active):
```bash
uvicorn app.main:app --reload --port 8000
```
- API will run at: `http://localhost:8000`
- Swagger Documentation will be available at: `http://localhost:8000/docs`

### 2. Run Frontend Dev Server
From the `frontend` directory:
```bash
npm run dev
```
- Client will run at: `http://localhost:5173` (or the next available port)
