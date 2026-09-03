from datetime import datetime, timedelta, timezone
from pathlib import Path
import uuid
import secrets
import os

from dotenv import load_dotenv

from fastapi import (
    FastAPI,
    Depends,
    HTTPException,
    status,
    UploadFile,
    File
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles

from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from pwdlib import PasswordHash
from jose import jwt, JWTError

from database import engine, Base, get_db
import models

from ai_service import ask_ai


# ============================================================
# ENVIRONMENT VARIABLES
# ============================================================

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")

if not SECRET_KEY:
    raise RuntimeError(
        "SECRET_KEY is missing. Please add SECRET_KEY to the backend .env file."
    )


# ============================================================
# DATABASE
# ============================================================

Base.metadata.create_all(bind=engine)


# ============================================================
# FASTAPI APP
# ============================================================

app = FastAPI(
    title="MediAssist AI API",
    description="Backend API for MediAssist AI",
    version="1.0.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
        "http://127.0.0.1:5176",
        "https://medi-assisst-ai-bkfd.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)


# ============================================================
# PROFILE PHOTO UPLOAD FOLDER
# ============================================================

UPLOAD_DIR = Path("uploads/profile_photos")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)


# ============================================================
# PASSWORD HASHING
# ============================================================

password_hash = PasswordHash.recommended()


# ============================================================
# JWT SETTINGS
# ============================================================

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440

security = HTTPBearer(auto_error=False)


# ============================================================
# REQUEST MODELS
# ============================================================

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


class ChatRequest(BaseModel):
    message: str


class AssessmentRequest(BaseModel):
    symptoms: str
    duration: str | None = None
    severity: int | None = None
    additional_info: str | None = None


class ProfileUpdateRequest(BaseModel):
    name: str


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def create_access_token(user_id: int, email: str):
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": str(user_id),
        "email": email,
        "exp": expire
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


def user_response(user):
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "profile_photo": getattr(user, "profile_photo", None)
    }


# ============================================================
# GET CURRENT USER
# ============================================================

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):

    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )

    if credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication scheme"
        )

    token = credentials.credentials

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing"
        )

    if token.count(".") != 2:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token format"
        )

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("sub")

        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )

        try:
            user_id = int(user_id)
        except (ValueError, TypeError):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid user ID in token"
            )

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

    user = db.query(models.User).filter(
        models.User.id == user_id
    ).first()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    return user


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():
    return {
        "message": "MediAssist AI Backend is running"
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "message": "MediAssist AI API is working"
    }


# ============================================================
# REGISTER
# ============================================================

@app.post("/register")
def register_user(
    request: RegisterRequest,
    db: Session = Depends(get_db)
):  # sourcery skip: use-named-expression

    existing_user = db.query(models.User).filter(
        models.User.email == request.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    if not request.name.strip():
        raise HTTPException(
            status_code=400,
            detail="Name cannot be empty"
        )

    if len(request.password) < 6:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 6 characters"
        )

    hashed_password = password_hash.hash(
        request.password
    )

    new_user = models.User(
        name=request.name.strip(),
        email=request.email,
        password_hash=hashed_password
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "Registration successful",
        "user": user_response(new_user)
    }


# ============================================================
# LOGIN
# ============================================================

@app.post("/login")
def login_user(
    request: LoginRequest,
    db: Session = Depends(get_db)
):

    user = db.query(models.User).filter(
        models.User.email == request.email
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    try:
        password_correct = password_hash.verify(
            request.password,
            user.password_hash
        )
    except Exception:
        password_correct = False

    if not password_correct:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = create_access_token(
        user.id,
        user.email
    )

    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "name": user.name,
        "email": user.email,
        "profile_photo": getattr(user, "profile_photo", None)
    }


# ============================================================
# FORGOT PASSWORD
# DEVELOPMENT VERSION
# ============================================================

@app.post("/forgot-password")
def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):

    user = (
        db.query(models.User)
        .filter(models.User.email == request.email)
        .first()
    )

    generic_message = (
        "If the email is registered, a password reset token has been generated."
    )

    # Do not reveal whether the account exists
    if not user:
        return {
            "message": generic_message
        }

    # Invalidate previous unused tokens
    previous_tokens = (
        db.query(models.PasswordResetToken)
        .filter(
            models.PasswordResetToken.user_id == user.id,
            models.PasswordResetToken.used == 0
        )
        .all()
    )

    for old_token in previous_tokens:
        old_token.used = 1

    # Generate secure random token
    reset_token = secrets.token_urlsafe(32)

    # Token expires after 30 minutes
    expires_at = (
        datetime.now(timezone.utc)
        + timedelta(minutes=30)
    )

    password_reset = models.PasswordResetToken(
        user_id=user.id,
        token=reset_token,
        expires_at=expires_at,
        used=0
    )

    db.add(password_reset)
    db.commit()

    return {
        "message": generic_message,

        # DEVELOPMENT ONLY
        # Remove this before production deployment.
        "reset_token": reset_token
    }


# ============================================================
# RESET PASSWORD
# ============================================================

@app.post("/reset-password")
def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db)
):

    reset_record = (
        db.query(models.PasswordResetToken)
        .filter(
            models.PasswordResetToken.token == request.token
        )
        .first()
    )

    if not reset_record:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired reset token."
        )

    if reset_record.used == 1:
        raise HTTPException(
            status_code=400,
            detail="This reset token has already been used."
        )

    if reset_record.expires_at < datetime.now(timezone.utc):
        reset_record.used = 1
        db.commit()

        raise HTTPException(
            status_code=400,
            detail="This reset token has expired."
        )

    if len(request.new_password) < 6:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 6 characters long."
        )

    user = (
        db.query(models.User)
        .filter(
            models.User.id == reset_record.user_id
        )
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found."
        )

    user.password_hash = password_hash.hash(
        request.new_password
    )

    reset_record.used = 1

    db.commit()

    return {
        "message": (
            "Password reset successfully. "
            "You can now login with your new password."
        )
    }


# ============================================================
# GET CURRENT USER
# ============================================================

@app.get("/me")
def get_me(
    current_user: models.User = Depends(get_current_user)
):
    return user_response(current_user)


# ============================================================
# GET PROFILE
# ============================================================

@app.get("/profile")
def get_profile(
    current_user: models.User = Depends(get_current_user)
):
    return user_response(current_user)


# ============================================================
# UPDATE PROFILE NAME
# ============================================================

@app.put("/profile")
def update_profile(
    request: ProfileUpdateRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    new_name = request.name.strip()

    if not new_name:
        raise HTTPException(
            status_code=400,
            detail="Name cannot be empty"
        )

    if len(new_name) > 100:
        raise HTTPException(
            status_code=400,
            detail="Name must be 100 characters or less"
        )

    current_user.name = new_name

    db.commit()
    db.refresh(current_user)

    return {
        "message": "Profile updated successfully",
        "user": user_response(current_user)
    }


# ============================================================
# UPLOAD PROFILE PHOTO
# ============================================================

@app.post("/profile/photo")
async def upload_profile_photo(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):  # sourcery skip: use-contextlib-suppress

    allowed_types = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp"
    }

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, PNG and WEBP images are allowed."
        )

    contents = await file.read()

    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="Image size must be less than 5 MB."
        )

    extension = allowed_types[file.content_type]

    filename = (
        f"user_{current_user.id}_"
        f"{uuid.uuid4().hex}"
        f"{extension}"
    )

    filepath = UPLOAD_DIR / filename

    filepath.write_bytes(contents)

    old_photo = getattr(
        current_user,
        "profile_photo",
        None
    )

    if old_photo and old_photo.startswith(
        "/uploads/profile_photos/"
    ):

        old_path = Path(
            old_photo.lstrip("/")
        )

        if old_path.exists():
            try:
                old_path.unlink()
            except Exception:
                pass

    current_user.profile_photo = (
        f"/uploads/profile_photos/{filename}"
    )

    db.commit()
    db.refresh(current_user)

    return {
        "message": "Profile photo updated successfully",
        "profile_photo": current_user.profile_photo,
        "user": user_response(current_user)
    }


# ============================================================
# CHAT WITH AI
# ============================================================

@app.post("/chat")
def chat(
    request: ChatRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    message = request.message.strip()

    if not message:
        raise HTTPException(
            status_code=400,
            detail="Message cannot be empty"
        )

    try:
        ai_response = ask_ai(message)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI service error: {str(e)}"
        )

    chat_record = models.ChatHistory(
        user_id=current_user.id,
        message=message,
        response=ai_response
    )

    db.add(chat_record)
    db.commit()
    db.refresh(chat_record)

    return {
        "message": message,
        "response": ai_response,
        "chat_id": chat_record.id
    }


# ============================================================
# DASHBOARD STATISTICS
# ============================================================

@app.get("/dashboard/stats")
def dashboard_stats(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):  # sourcery skip: use-assigned-variable

    health_assessments = db.query(
        models.HealthAssessment
    ).filter(
        models.HealthAssessment.user_id == current_user.id
    ).count()

    ai_conversations = db.query(
        models.ChatHistory
    ).filter(
        models.ChatHistory.user_id == current_user.id
    ).count()

    health_records = health_assessments

    return {
        "health_assessments": health_assessments,
        "ai_conversations": ai_conversations,
        "health_records": health_records
    }


# ============================================================
# HEALTH ASSESSMENT
# ============================================================

@app.post("/assessment")
def create_assessment(
    request: AssessmentRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    symptoms = request.symptoms.strip()

    if not symptoms:
        raise HTTPException(
            status_code=400,
            detail="Symptoms cannot be empty"
        )

# sourcery skip: merge-nested-ifs
    if request.severity is not None:

        if request.severity < 1 or request.severity > 10:
            raise HTTPException(
                status_code=400,
                detail="Severity must be between 1 and 10"
            )

    prompt = f"""
You are MediAssist AI, a health information assistant.

The user has provided the following information:

Symptoms:
{symptoms}

Duration:
{request.duration or "Not provided"}

Severity:
{request.severity if request.severity is not None else "Not provided"}/10

Additional information:
{request.additional_info or "Not provided"}

Provide general health information only.

Your response should:
1. Summarize the possible general causes or categories.
2. Explain what the user can monitor.
3. Give general self-care guidance when appropriate.
4. Mention warning signs that may require urgent medical attention.
5. Recommend consulting a qualified healthcare professional when appropriate.

Do not claim to diagnose the user.
"""

    try:
        ai_response = ask_ai(prompt)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI service error: {str(e)}"
        )

    assessment = models.HealthAssessment(
        user_id=current_user.id,
        symptoms=symptoms,
        duration=request.duration,
        severity=request.severity,
        additional_info=request.additional_info,
        ai_response=ai_response
    )

    db.add(assessment)
    db.commit()
    db.refresh(assessment)

    return {
        "message": "Health assessment completed",
        "assessment_id": assessment.id,
        "user_id": current_user.id,
        "symptoms": assessment.symptoms,
        "response": assessment.ai_response,
        "created_at": assessment.created_at
    }


# ============================================================
# GET HEALTH ASSESSMENTS
# ============================================================

@app.get("/assessments")
def get_assessments(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    assessments = db.query(
        models.HealthAssessment
    ).filter(
        models.HealthAssessment.user_id == current_user.id
    ).order_by(
        models.HealthAssessment.created_at.desc()
    ).all()

    return [
        {
            "id": assessment.id,
            "user_id": assessment.user_id,
            "symptoms": assessment.symptoms,
            "duration": assessment.duration,
            "severity": assessment.severity,
            "additional_info": assessment.additional_info,
            "ai_response": assessment.ai_response,
            "created_at": assessment.created_at
        }
        for assessment in assessments
    ]


# ============================================================
# CHAT HISTORY
# ============================================================

@app.get("/chat-history")
def get_chat_history(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    chats = db.query(
        models.ChatHistory
    ).filter(
        models.ChatHistory.user_id == current_user.id
    ).order_by(
        models.ChatHistory.created_at.desc()
    ).all()

    return [
        {
            "id": chat.id,
            "user_id": chat.user_id,
            "message": chat.message,
            "response": chat.response,
            "created_at": chat.created_at
        }
        for chat in chats
    ]