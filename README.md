# ChefPulse - AI-Powered Restaurant Operations Platform

ChefPulse is a premium AI SaaS dashboard and restaurant operations platform. This codebase represents the initial hackathon prototype foundation, featuring a high-fidelity landing page with glassmorphism, charts, animated statistics counters, and a placeholder FastAPI backend with CORS and SQLite configuration.

---

## Folder Structure

```text
ChefPulse/
├── .env.example            # Environment variables template
├── README.md               # Documentation and execution guide
├── frontend/               # React (Vite) client
│   ├── public/             # Static files
│   ├── src/
│   │   ├── assets/         # Images, graphics, and SVG assets
│   │   ├── components/     # Reusable components (Navbar, DashboardIllustration, etc.)
│   │   ├── context/        # React context providers
│   │   ├── hooks/          # Custom hooks
│   │   ├── layouts/        # Layout wrappers
│   │   ├── pages/          # App pages (LandingPage)
│   │   ├── services/       # API call definitions (Axios setup)
│   │   ├── App.jsx         # App router and layouts configuration
│   │   ├── index.css       # Tailwind entry and utility classes
│   │   └── main.jsx        # App mounting entry point
│   ├── index.html          # HTML Shell
│   ├── tailwind.config.js  # Tailwind config
│   ├── postcss.config.js   # PostCSS config
│   └── package.json        # Frontend dependencies
└── backend/                # FastAPI server
    ├── requirements.txt    # Python package lists
    └── app/
        ├── models/         # SQLAlchemy schemas definitions
        ├── routers/        # FastAPI sub-routes
        ├── schemas/        # Pydantic schemas
        ├── services/       # Core business logic helpers
        ├── database.py     # SQLAlchemy and SQLite configuration
        └── main.py         # Main server entry with CORS setup
```

---

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
