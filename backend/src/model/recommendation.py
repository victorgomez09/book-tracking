from datetime import datetime
from typing import TYPE_CHECKING, Optional
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from .user import User


class Recommendation(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    title: str
    author: str
    reason: str
    image_url: Optional[str] = None
    external_link: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # user: Optional["User"] = Relationship(back_populates="user_id")
