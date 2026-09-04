# MediAssist AI 🩺🤖

MediAssist AI is a full-stack AI-powered health information web application designed to help users understand symptoms, explore general health information, and receive AI-generated educational guidance.

The application combines a modern React frontend, FastAPI backend, PostgreSQL database, JWT authentication, secure password hashing, and Google Gemini AI.

> **Medical Disclaimer:** MediAssist AI provides general health information for educational purposes only. It is not a doctor, does not provide medical diagnosis, and does not replace professional medical advice, diagnosis, or treatment. Users experiencing serious or emergency symptoms should seek appropriate professional medical care.

---

## 🌐 Live Application

**MediAssist AI:**  
https://medi-assisst-ai-bkfd.vercel.app/

**Backend API:**  
https://mediassist-backend-70gs.onrender.com/

**API Documentation:**  
https://mediassist-backend-70gs.onrender.com/docs

---

## ✨ Features

### 🔐 Authentication

- User registration
- Secure login with JWT authentication
- Remember account option
- Logout
- Forgot password
- Password reset using a temporary development reset token
- Change password
- Protected API endpoints

### 🤖 AI Health Assistant

- AI-powered health information assistant
- Natural language health questions
- General symptom information
- Self-care guidance when appropriate
- Warning-sign information
- Medical safety instructions
- Markdown-formatted AI responses

### 🩺 Symptom Assessment

Users can provide:

- Symptoms
- Duration
- Severity from 1–10
- Additional information

MediAssist AI then provides general educational health information based on the submitted information.

Users can also continue the assessment with follow-up questions.

### 📋 Health History

- Stores completed symptom assessments
- Shows previous assessment dates
- Displays symptoms and duration
- Shows severity
- Displays additional information
- Displays previous AI responses
- Sorts assessments with the newest first

### ❤️ Health Information

The application includes educational topics such as:

- Common Symptoms
- Heart Health
- Nutrition
- Exercise & Fitness
- Sleep
- Mental Wellness
- Warning Signs
- Respiratory Health
- Hydration
- First Aid

Users can search topics and open detailed information.

### 👤 Profile

- View account information
- Update name
- Upload profile photo
- JPG, PNG and WEBP support
- Maximum profile-photo size of 5 MB

### ⚙️ Settings

- View account information
- Change password
- Enable/disable notifications
- Enable/disable health reminders
- Privacy information
- Account logout

### 📱 Responsive Design

The interface is designed for:

- Desktop
- Laptop
- Tablet
- Android phones
- iPhones and other small-screen devices

The application uses responsive layouts, mobile-friendly controls, and reduced-motion accessibility support.

---

# 🛠️ Technology Stack

## Frontend

- React
- Vite
- React Router
- React Markdown
- HTML5
- CSS3
- JavaScript

## Backend

- Python
- FastAPI
- Uvicorn
- SQLAlchemy
- Pydantic
- JWT
- python-jose
- pwdlib
- Argon2

## Database

- PostgreSQL

## AI

- Google Gemini API
- Gemini Flash model

## Deployment

### Frontend

- Vercel

### Backend

- Render

### Database

- Render PostgreSQL

---

# 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │       User          │
                    │ Browser / Mobile    │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │    Vercel Frontend  │
                    │ React + Vite        │
                    └──────────┬──────────┘
                               │ HTTPS
                               ▼
                    ┌─────────────────────┐
                    │   FastAPI Backend   │
                    │      Render         │
                    └──────┬─────┬────────┘
                           │     │
                ┌──────────┘     └─────────────┐
                ▼                              ▼
      ┌──────────────────┐           ┌──────────────────┐
      │ PostgreSQL       │           │ Google Gemini    │
      │ Database         │           │ AI API           │
      └──────────────────┘           └──────────────────┘


      MediAssisst-AI/
│
├── backend/
│   ├── ai_service.py
│   ├── database.py
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   ├── requirements.txt
│   └── uploads/
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── ResetPassword.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Chat.jsx
│   │   │   ├── SymptomAssessment.jsx
│   │   │   ├── HealthHistory.jsx
│   │   │   ├── HealthInformation.jsx
│   │   │   ├── Profile.jsx
│   │   │   └── Settings.jsx
│   │   │
│   │   ├── App.jsx
│   │   └── App.css
│   │
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   └── vercel.json
│
├── .gitignore
└── README.md