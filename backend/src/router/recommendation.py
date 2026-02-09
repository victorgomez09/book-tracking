from typing import List
from sqlmodel import select
from config.database import get_session
from fastapi import APIRouter, Depends, HTTPException
from model.book import Book, UserBook
from model.recommendation import Recommendation
from model.user import User
from requests import Session
from router.user import get_current_user
from util.book_api import fetch_multiple_books
from util.ollama import get_ai_recommendations

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


@router.post("/generate")
async def generate_and_save_recommendations(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    # 1. Obtener libros del usuario para el contexto (usando SQLModel)
    # Seleccionamos los libros que el usuario tiene vinculados en UserBook
    statement = select(Book).join(UserBook).where(UserBook.user_id == current_user.id)
    user_books = session.exec(statement).all()

    if not user_books:
        raise HTTPException(
            status_code=400,
            detail="No tienes suficientes libros para generar recomendaciones.",
        )

    # 2. Llamada a Ollama (Proceso pesado en Raspberry Pi)
    raw_recommendations = get_ai_recommendations(user_books)

    final_recs = []

    # 3. Enriquecer y Guardar
    for rec in raw_recommendations:
        # Intentamos encontrar si el libro recomendado ya existe en nuestra DB maestra
        book_query = select(Book).where(Book.title.ilike(f"%{rec['title']}%"))
        if rec.get("author"):
            book_query = book_query.where(Book.author.ilike(f"%{rec['author']}%"))

        book_db = session.exec(book_query).first()

        # Si no existe en la DB local, lo buscamos en Google Books
        if not book_db:
            google_results = fetch_multiple_books(
                rec["title"], rec.get("author", ""), max_results=1
            )

            if google_results:
                best_match = google_results[0]
                book_db = Book(**best_match)
                session.add(book_db)
                session.commit()  # Guardamos en la maestra para que otros usuarios lo aprovechen
                session.refresh(book_db)
            else:
                # Si Google tampoco lo encuentra, saltamos este libro o usamos datos de la IA
                print(f"Advertencia: No se encontró info extra para {rec['title']}")

        # 4. Crear la recomendación vinculada al usuario
        # Usamos los datos de la DB si los encontramos, si no, los de la IA
        db_rec = Recommendation(
            user_id=current_user.id,
            title=rec["title"],
            author=rec.get("author", "Autor desconocido"),
            reason=rec["reason"],
            image_url=book_db.image_url if book_db else None,
            external_link=book_db.external_link if book_db else None,
        )
        session.add(db_rec)
        final_recs.append(db_rec)

    try:
        session.commit()
        for r in final_recs:
            session.refresh(r)
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=500, detail="Error al guardar las recomendaciones."
        )

    return final_recs


@router.get("/latest", response_model=List[Recommendation])
async def get_latest_recommendations(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    print("current_user", current_user)
    # 1. Buscamos la fecha de la última recomendación creada para este usuario
    subquery = (
        select(Recommendation.created_at)
        .where(Recommendation.user_id == current_user["id"])
        .order_by(Recommendation.created_at.desc())
        .limit(1)
    )

    last_date = session.exec(subquery).first()

    if not last_date:
        return []

    # 2. Obtenemos todas las recomendaciones que se crearon en ese mismo instante
    # (ya que la IA suele generar 3 de golpe)
    statement = (
        select(Recommendation)
        .where(Recommendation.user_id == current_user.id)
        .where(Recommendation.created_at == last_date)
    )

    results = session.exec(statement).all()
    return results


@router.get("/history")
async def get_recommendation_history(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    statement = (
        select(Recommendation)
        .where(Recommendation.user_id == current_user.id)
        .order_by(Recommendation.created_at.desc())
    )

    return session.exec(statement).all()
