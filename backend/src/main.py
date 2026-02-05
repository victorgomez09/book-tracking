from contextlib import asynccontextmanager

from config.database import init_db
from fastapi import FastAPI
from router import book, user


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    yield

app = FastAPI(lifespan=lifespan)

app.include_router(book.router)
app.include_router(user.router)