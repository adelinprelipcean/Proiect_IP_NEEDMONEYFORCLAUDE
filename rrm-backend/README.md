# RRM - Backend

FastAPI + PostgreSQL.

## Pornire

```
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

In `.env` pui parola de la PostgreSQL. Baza `rrm` trebuie sa existe (scriptul e in `db/RRM.sql`).

```
uvicorn app.main:app --reload
```

API: http://localhost:8000
Swagger: http://localhost:8000/docs
