
from typing import List
from sqlmodel import select
from config.database import get_session
from fastapi import APIRouter, Depends, HTTPException
from model.book import Book
from model.recommendation import Recommendation
from model.user import User
from requests import Session
from router.user import get_current_user
from util.book_api import search_book
from util.ollama import get_ai_recommendations

router = APIRouter(prefix="/recommendations", tags=["recommendations"])

@router.get("/generate")
async def generate_and_save_recommendations(
    current_user: User = Depends(get_current_user), 
    session: Session = Depends(get_session)
):
    # 1. Obtener libros del usuario para el contexto
    user_books = session.query(Book).filter(Book.user_id == current_user.id).all()
    
    # 2. Llamada a Ollama (usando la función que refinamos antes)
    raw_recommendations = get_ai_recommendations(user_books) # Retorna lista de dicts
    
    final_recs = []
    
    # 3. Enriquecer y Guardar
    for rec in raw_recommendations:
        query = select(Book).where(Book.title.ilike(f"%{rec['title']}%"))
        if rec['author']:
            query = query.where(Book.author.ilike(f"%{rec['author']}%"))
    
        book_db = session.exec(query).first()
        if not book_db:
            google_book = search_book(rec['title'], rec['author'])
            
            if not google_book:
                raise HTTPException(status_code=404, detail="Book dont found")
            
            book_db = Book(**google_book)
            session.add(book_db)
            session.commit()
            session.refresh(book_db)
        
        db_rec = Recommendation(
            user_id=current_user.id,
            title=rec['title'],
            author=rec['author'],
            reason=rec['reason'],
            image_url=book_db.image_url,
            external_link=book_db.external_link
        )
        session.add(db_rec)
        final_recs.append(db_rec)
    
    session.commit()

    return final_recs

@router.get("/latest", response_model=List[Recommendation])
async def get_latest_recommendations(
    *,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    # 1. Buscamos la fecha de la última recomendación creada para este usuario
    subquery = select(Recommendation.created_at)\
        .where(Recommendation.user_id == current_user.id)\
        .order_by(Recommendation.created_at.desc())\
        .limit(1)
    
    last_date = session.exec(subquery).first()

    if not last_date:
        return []

    # 2. Obtenemos todas las recomendaciones que se crearon en ese mismo instante 
    # (ya que la IA suele generar 3 de golpe)
    statement = select(Recommendation)\
        .where(Recommendation.user_id == current_user.id)\
        .where(Recommendation.created_at == last_date)
    
    results = session.exec(statement).all()
    return results

@router.get("/history")
async def get_recommendation_history(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    statement = select(Recommendation).where(Recommendation.user_id == current_user.id).order_by(Recommendation.created_at.desc())

    return session.exec(statement).all()