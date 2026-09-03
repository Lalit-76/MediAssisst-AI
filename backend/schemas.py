from pydantic import BaseModel, EmailStr, Field


# ============================================================
# LOGIN
# ============================================================

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# ============================================================
# PROFILE RESPONSE
# ============================================================

class ProfileResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    profile_photo: str | None = None


# ============================================================
# PROFILE UPDATE
# ============================================================

class ProfileUpdateRequest(BaseModel):
    name: str = Field(
        ...,
        min_length=2,
        max_length=100
    )