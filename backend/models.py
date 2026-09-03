from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime

from database import Base


# ============================================================
# USER MODEL
# ============================================================

class User(Base):
    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String(100),
        nullable=False
    )

    email = Column(
        String(255),
        unique=True,
        index=True,
        nullable=False
    )

    password_hash = Column(
        String(255),
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        default=datetime.utcnow
    )

    # ========================================================
    # PROFILE PHOTO
    # ========================================================

    profile_photo = Column(
        Text,
        nullable=True
    )


# ============================================================
# PASSWORD RESET TOKEN MODEL
# ============================================================

class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        nullable=False
    )

    token = Column(
        String(255),
        unique=True,
        nullable=False,
        index=True
    )

    expires_at = Column(
        DateTime(timezone=True),
        nullable=False
    )

    used = Column(
        Integer,
        default=0,
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        default=datetime.utcnow
    )


# ============================================================
# HEALTH ASSESSMENT MODEL
# ============================================================

class HealthAssessment(Base):
    __tablename__ = "health_assessments"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        nullable=False
    )

    symptoms = Column(
        Text,
        nullable=False
    )

    duration = Column(
        String,
        nullable=True
    )

    severity = Column(
        Integer,
        nullable=True
    )

    additional_info = Column(
        Text,
        nullable=True
    )

    ai_response = Column(
        Text,
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# ============================================================
# CHAT HISTORY MODEL
# ============================================================

class ChatHistory(Base):
    __tablename__ = "chat_history"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        nullable=False
    )

    message = Column(
        Text,
        nullable=False
    )

    response = Column(
        Text,
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )