from sqlmodel import Field, SQLModel, Relationship
from typing import TYPE_CHECKING, List, Optional

if TYPE_CHECKING:
    from .book import UserBook

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    email: str = Field(unique=True)
    hashed_password: str
    
    user_books: List["UserBook"] = Relationship(back_populates="user")