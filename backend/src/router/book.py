from typing import Optional

from dto.book import BookUpdate
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
                "page_count": book.page_count,
                "description": book.description,
                "publisher": book.publisher,
                "published_date": book.published_date,
                "image_url": book.image_url,
                "progress": ub.progress,
                "rating": ub.rating,
                "notes": ub.notes,
                "tags": ub.tags,
                "status": ub.status,
                "current_page": ub.current_page
            })
    
    return books

@router.get("/by-title")
def search_book_title(title: str, author: Optional[str] = None, session: Session = Depends(get_session), dependencies=Depends(get_current_user)):
    query = select(Book).where(Book.title.ilike(f"%{title}%"))
    if author:
        query = query.where(Book.author.ilike(f"%{author}%"))
    
    book_db = session.exec(query).first()
    if not book_db:
        google_book = search_book(title, author)
        
        if not google_book:
            raise HTTPException(status_code=404, detail="Book dont found")
        
        book_db = Book(**google_book)
        session.add(book_db)
        session.commit()
        session.refresh(book_db)

    return {
        "message": "Book finded",
        "book": book_db.model_dump()
    }

@router.post("/by-title")
def add_book_title(title: str, author: Optional[str] = None, session: Session = Depends(get_session), current_user: User = Depends(get_current_user)):
    query = select(Book).where(Book.title.ilike(f"%{title}%"))
    if author:
        query = query.where(Book.author.ilike(f"%{author}%"))
    
    book_db = session.exec(query).first()
    if not book_db:
        google_book = search_book(title, author)
        
        if not google_book:
            raise HTTPException(status_code=404, detail="Book dont found")
        
        book_db = Book(**google_book)
        session.add(book_db)
        session.commit()
        session.refresh(book_db)

    exists = session.exec(
        select(UserBook).where(
            UserBook.user_id == current_user.id, 
            UserBook.book_id == book_db.id
        )
    ).first()
    if exists:
        raise HTTPException(status_code=409, detail="Book already added")

    new_user_book = UserBook(
        user_id=current_user.id,
        book_id=book_db.id,
        status="PENDING",
        current_page=0
    )
    
    session.add(new_user_book)
    session.commit()
    session.refresh(new_user_book)
    session.refresh(book_db)

    return {
        "message": "Book added",
        "fuente": "Google Books" if not exists else "Local DB",
        "user_book": new_user_book.model_dump(),
        "book": book_db.model_dump()
    }

@router.put("/{book_id}")
def update_user_book(
    book_id: int, 
    data: BookUpdate, 
    session: Session = Depends(get_session), 
    current_user: User = Depends(get_current_user)
):
    query = select(UserBook).where(
        UserBook.book_id == book_id, 
        UserBook.user_id == current_user.id
    )
    user_book = session.exec(query).first()

    if not user_book:
        raise HTTPException(status_code=404, detail="El usuario no tiene este libro asignado")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(user_book, key, value)

    session.add(user_book)
    session.commit()
    session.refresh(user_book)

    return {
        "message": "Book updated",
        "user_book": user_book.model_dump(),
        "book": user_book.book.model_dump()
    }

@router.delete("/{book_id}")
def delete_user_book(
    book_id: int, 
    session: Session = Depends(get_session), 
    current_user: User = Depends(get_current_user)
):
    query = select(UserBook).where(
        UserBook.book_id == book_id, 
        UserBook.user_id == current_user.id
    )
    user_book = session.exec(query).first()

    if not user_book:
        raise HTTPException(status_code=404, detail="El usuario no tiene este libro asignado")

    session.delete(user_book)
    session.commit()

    return {
        "message": "Book deleted"
    }