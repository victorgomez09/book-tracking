# CELERY
```bash
celery -A src.worker worker --loglevel=info
```
```bash
celery -A src.worker beat --loglevel=info
```