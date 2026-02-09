from celery import Celery
from celery.schedules import crontab
from sqlmodel import select

from config.database import get_session
from model.book import Book
from model.recommendation import Recommendation
from model.user import User
from util.book_api import search_book
from util.ollama import get_ai_recommendations

# Configuración básica
celery_app = Celery(
    "tasks",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0"
)

# Definición del Cron (Beat)
celery_app.conf.beat_schedule = {
    "generar-recomendaciones-cada-12h": {
        "task": "tasks.update_recommendations",
        "schedule": crontab(hour="*/12", minute=0),
    },
}

@celery_app.task(name="tasks.update_recommendations")
def update_recommendations():
    session = get_session()
    users = session.exec(select(User)).all()
    for user in users:
        # Reutilizamos la lógica que ya tenemos
        user_books = session.exec(select(Book).where(Book.user_id == user.id)).all()
        if not user_books: continue
        
        try:
            raw_recs = get_ai_recommendations(user_books)
            for item in raw_recs:
                details = search_book(item['title'], item['author'])
                new_rec = Recommendation(
                    user_id=user.id,
                    title=item['title'],
                    author=item['author'],
                    reason=item['reason'],
                    image_url=details.get('image_url'),
                    external_link=details.get('external_link')
                )
                session.add(new_rec)
            session.commit()
        except Exception as e:
            session.rollback()
            print(f"Error: {e}")