from typing import Optional

from dto.book import BookUpdate
from model.user import User
from util.auth import get_current_user
from config.database import get_session
from fastapi import APIRouter, Depends, HTTPException
from model.book import Book, UserBook
from sqlmodel import Session, and_, col, func, select
from util.book_api import fetch_multiple_books

router = APIRouter(prefix="/books", tags=["books"])


@router.get("/find-all")
def find_all_books(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    user_books = session.exec(
        select(UserBook).where(UserBook.user_id == current_user.id)
    ).all()

    books = []
    for ub in user_books:
        book = session.get(Book, ub.book_id)
        if book:
            books.append(
                {
                    "id": book.id,
                    "title": book.title,
                    "author": book.author,
                    "page_count": book.page_count,
                    "description": book.description,
                    "publisher": book.publisher,
                    "published_date": book.published_date,
                    "image_url": book.image_url,
                    "category": book.category,
                    "progress": ub.progress,
                    "rating": ub.rating,
                    "notes": ub.notes,
                    "tags": ub.tags,
                    "status": ub.status,
                    "current_page": ub.current_page,
                }
            )

    return books


@router.get("/by-title")
def search_book_title(
    title: str,
    author: Optional[str] = None,
    session: Session = Depends(get_session),
    _=Depends(get_current_user),
):
    clean_author = author.strip() if author else None
    query = select(Book).where(
        and_(
            col(Book.title).ilike(f"%{title.strip()}%"),
            func.abs(func.length(Book.title) - len(title.strip()))
            < 5,  # Margen de 5 caracteres
        )
    )

    if clean_author:
        query = query.where(col(Book.author).ilike(f"%{clean_author}%"))
    books_db = session.exec(query).all()

    if books_db:
        return {"message": "Libro encontrado en biblioteca local", "books": books_db}

    google_results = fetch_multiple_books(title, author, max_results=5)

    if not google_results:
        raise HTTPException(
            status_code=404, detail="No se encontró el libro en ninguna fuente"
        )

    for book in google_results:
        new_book = Book(**book)

        try:
            session.add(new_book)
            session.commit()
            session.refresh(new_book)
        except Exception as e:
            session.rollback()
            raise HTTPException(
                status_code=500, detail=f"Error al guardar el libro: {str(e)}"
            )

    return {"message": "Libros importado desde Google Books", "books": google_results}


@router.post("/by-title")
def add_book_title(
    title: str,
    author: Optional[str] = None,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    book_query = select(Book).where(Book.title.ilike(f"%{title}%"))
    if author:
        book_query = book_query.where(Book.author.ilike(f"%{author}%"))

    book_db = session.exec(book_query).first()
    source = "Local DB"

    if not book_db:
        google_results = fetch_multiple_books(title, author, max_results=1)

        if not google_results:
            raise HTTPException(
                status_code=404,
                detail="Libro no encontrado en Google Books",
            )

        best_match = google_results[0]
        book_db = Book(**best_match)

        session.add(book_db)
        session.commit()
        session.refresh(book_db)
        source = "Google Books"

    exists_query = select(UserBook).where(
        UserBook.user_id == current_user.id, UserBook.book_id == book_db.id
    )
    user_book_exists = session.exec(exists_query).first()

    if user_book_exists:
        raise HTTPException(
            status_code=409,
            detail="Este libro ya está en tu colección",
        )

    new_user_book = UserBook(
        user_id=current_user.id,
        book_id=book_db.id,
        status="PENDING",
        current_page=0,
        rating=0,
        notes="",
    )

    try:
        session.add(new_user_book)
        session.commit()
        session.refresh(new_user_book)
        # Refrescamos el book_db para que traiga la info actualizada (ID, etc)
        session.refresh(book_db)
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Error al vincular el libro al usuario: {str(e)}",
        )

    return {
        "message": "Libro añadido con éxito",
        "source": source,
        "user_book": new_user_book,
        "book": book_db,
    }


@router.put("/{book_id}")
def update_user_book(
    book_id: int,
    data: BookUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    query = select(UserBook).where(
        UserBook.book_id == book_id, UserBook.user_id == current_user.id
    )
    user_book = session.exec(query).first()

    if not user_book:
        raise HTTPException(
            status_code=404, detail="El usuario no tiene este libro asignado"
        )

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(user_book, key, value)

    session.add(user_book)
    session.commit()
    session.refresh(user_book)

    return {
        "message": "Book updated",
        "user_book": user_book.model_dump(),
        "book": user_book.book.model_dump(),
    }


@router.delete("/{book_id}")
def delete_user_book(
    book_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    query = select(UserBook).where(
        UserBook.book_id == book_id, UserBook.user_id == current_user.id
    )
    user_book = session.exec(query).first()

    if not user_book:
        raise HTTPException(
            status_code=404, detail="El usuario no tiene este libro asignado"
        )

    session.delete(user_book)
    session.commit()

    return {"message": "Book deleted"}
