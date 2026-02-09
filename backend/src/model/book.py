from typing import TYPE_CHECKING, List, Optional
from sqlmodel import Field, Relationship, SQLModel
from datetime import datetime

if TYPE_CHECKING:
    from .user import User

class Book(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    isbn: str = Field(index=True, unique=True)
    title: str
    author: str
    publisher: Optional[str] = None
    published_date: Optional[datetime] = None
    description: Optional[str] = None
    page_count: Optional[int] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    external_link: Optional[str] = None

    user_books: List["UserBook"] = Relationship(back_populates="book")

class UserBook(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    book_id: int = Field(foreign_key="book.id")
    
    status: str = Field(default="PENDING")
    current_page: int = Field(default=0)
    
    rating: Optional[float] = None
    notes: Optional[str] = None
    tags: Optional[str] = None
    added_at: datetime = Field(default_factory=datetime.now)
    
    user: Optional["User"] = Relationship(back_populates="user_books")
    book: Optional["Book"] = Relationship(back_populates="user_books")

    # Propiedad calculada para el progreso
    @property
    def progress(self) -> float:
        if self.book and self.book.page_count:
            return (self.current_page / self.book.page_count) * 100
        return 0.0