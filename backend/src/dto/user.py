from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    username: str
    email: EmailStr  # Valida automáticamente que sea un email real
    password: str