# RRM - Backend

FastAPI + PostgreSQL.

## Pornire

```
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

In `.env` pui parola de la PostgreSQL si un `JWT_SECRET` lung, random.
Baza trebuie sa existe (scriptul e in `db/RRM.sql`).

Dupa `db/RRM.sql` se ruleaza, in ordine, scripturile din `db/migrations/`:

```
psql -U postgres -d rrm -f db/migrations/001_resources_test_data.sql
psql -U postgres -d rrm -f db/migrations/002_maintenance_admin.sql
psql -U postgres -d rrm -f db/migrations/003_hash_test_passwords.sql
```

(sau din pgAdmin: Query Tool, deschizi fisierul si il rulezi)

Utilizatori de test (parola `1234`): `admin@usv.ro`, `ion@usv.ro` (Team Lead),
`ana@usv.ro` (membru), `maria@usv.ro` (Team Lead).

```
uvicorn app.main:app --reload
```

API: http://localhost:8000
Swagger: http://localhost:8000/docs

## Autentificare

`POST /api/auth/login` intoarce un token JWT. In Swagger apesi **Authorize**
si pui tokenul; endpoint-urile protejate il citesc din headerul
`Authorization: Bearer <token>`.
