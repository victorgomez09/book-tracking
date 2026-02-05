from fastapi.security import OAuth2PasswordRequestForm
from dto.user import UserCreate
from config.database import get_session
from fastapi import APIRouter, Depends, HTTPException, status
from model.user import User
from sqlmodel import Session, select
from util.auth import create_access_token, get_password_hash, verify_password

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    # 1. Buscar al usuario por nombre de usuario
    user = session.exec(select(User).where(User.username == form_data.username)).first()
    
    # 2. Verificar existencia y contraseña
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 3. Generar el token
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/")
def create_user(user_data: UserCreate, session: Session = Depends(get_session)):
    existing_user = session.exec(
        select(User).where((User.username == user_data.username) | (User.email == user_data.email))
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=400, 
            detail="El nombre de usuario o el email ya están registrados."
        )

    hashed_pwd = get_password_hash(user_data.password)
    
    db_user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_pwd
    )
    
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    
    return {
        "id": db_user.id,
        "username": db_user.username,
        "message": "Usuario creado con éxito"
    }