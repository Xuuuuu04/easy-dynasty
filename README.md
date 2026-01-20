# EasyDynasty (Easy Dynasty)

EasyDynasty is a comprehensive AI-powered numerology platform, evolving from TarotWhisper. It combines Tarot, Bazi (Four Pillars of Destiny), and Ziwei Dou Shu into a single integrated system.

## Project Structure

*   **`web/`**: Frontend application (Next.js 16 + React 19 + Tailwind CSS).
*   **`backend/`**: Backend API (Python FastAPI + SQLAlchemy + MySQL).

## Getting Started

### Prerequisites

*   Node.js 18+
*   Python 3.10+
*   MySQL 8.0+

### 1. Database Setup

The project uses a local MySQL database.
Credentials configured: `root` / `xsy19507`

Initialize the database:
```bash
cd backend
# Create a virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create Database
python init_db.py
```

### 2. Backend Startup

```bash
cd backend
uvicorn main:app --reload --port 8000
```
API Documentation will be available at: http://localhost:8000/docs

### 3. Frontend Startup

```bash
cd web
npm install
npm run dev
```
Access the application at: http://localhost:3000

## Features

*   **Tarot**: Complete 78-card deck, 3D animations, AI interpretation.
*   **Bazi (Coming Soon)**: Four Pillars calculation, strength analysis.
*   **Ziwei (Coming Soon)**: 12 Palaces chart, star analysis.
