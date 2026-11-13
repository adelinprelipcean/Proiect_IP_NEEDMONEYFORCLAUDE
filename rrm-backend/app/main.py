from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import (auth, notifications, reservations, resources,
                         users)

app = FastAPI(title="Research Resource Manager API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(resources.router)
app.include_router(reservations.router)
app.include_router(notifications.router)


@app.get("/")
def root():
    return {"status": "ok"}
