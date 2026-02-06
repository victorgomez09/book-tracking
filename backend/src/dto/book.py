from typing import Optional
from pydantic import BaseModel

class BookUpdate(BaseModel):
    status: Optional[str] = "READING"
    current_page: Optional[int] = None
    rating: Optional[float] = None
    notes: Optional[str] = None
    tags: Optional[str] = None
