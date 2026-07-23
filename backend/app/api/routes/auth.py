from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from app.core.security import create_access_token, verify_password, hash_password

router = APIRouter(prefix="/auth", tags=["auth"])

# Demo-only in-memory user store. Swap for a real users table once the
# problem statement is known and auth is actually needed.
_DEMO_USERS = {"demo@hackathon.dev": hash_password("hackathon")}


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest) -> TokenResponse:
    hashed = _DEMO_USERS.get(payload.email)
    if not hashed or not verify_password(payload.password, hashed):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    return TokenResponse(access_token=create_access_token(payload.email))
