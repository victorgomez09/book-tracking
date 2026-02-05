from typing import Optional

from model.user import User
from util.auth import get_current_user
from config.database import get_session
from fastapi import APIRouter, Depends, HTTPException
from model.book import Book, UserBook
from sqlmodel import Session, select
from util.book_api import search_book

router = APIRouter(prefix="/books", tags=["books"])

@router.get("/find-all")
def find_all_books(session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    user_books = session.exec(
        select(UserBook).where(UserBook.user_id == current_user.id)
    ).all()
    
    books = []
    for ub in user_books:
        book = session.get(Book, ub.book_id)
        if book:
            books.append({
                "id": book.id,
                "title": book.title,
                "author": book.author,
                "description": book.description,
                "publisher": book.publisher,
                "published_date": book.published_date,
                "image_url": book.image_url,
                "rating": ub.rating,
                "notes": ub.notes,
                "tags": ub.tags,
                "status": ub.status,
                "current_page": ub.current_page
            })
    
    return books

@router.post("/by-title")
def add_book_title(title: str, author: Optional[str] = None, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    query_local = select(Book).where(Book.title.ilike(f"%{title}%"))
    if author:
        query_local = query_local.where(Book.author.ilike(f"%{author}%"))
    
    libro_db = session.exec(query_local).first()

    if not libro_db:
        print("Libro no encontrado en local. Consultando Google Books...")
        datos_google = search_book(title, author)
        
        if not datos_google:
            raise HTTPException(status_code=404, detail="Libro no encontrado en ninguna fuente")
        
        libro_db = Book(**datos_google)
        session.add(libro_db)
        session.commit()
        session.refresh(libro_db)

    existente = session.exec(
        select(UserBook).where(
            UserBook.user_id == current_user.id, 
            UserBook.book_id == libro_db.id
        )
    ).first()

    if existente:
        return {"message": "El libro ya está en tu biblioteca", "libro": libro_db}

    nuevo_user_book = UserBook(
        user_id=current_user.id,
        book_id=libro_db.id,
        status="PENDING",
        current_page=0
    )
    
    session.add(nuevo_user_book)
    session.commit()

    return {
        "message": "Libro añadido con éxito",
        "fuente": "Google Books" if not existente else "Local DB",
        "libro": libro_db.model_dump()
    }