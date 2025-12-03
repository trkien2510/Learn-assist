from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from db.mongodb import init_db
from api import user_router, classroom_router, auth_router, document_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    lifespan=lifespan,
    openapi_url=f"{settings.API_PREFIX}/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router, prefix=f"{settings.API_PREFIX}/auth", tags=["Auth"])
app.include_router(user_router.router, prefix=f"{settings.API_PREFIX}/user", tags=["User"])
app.include_router(classroom_router.router, prefix=f"{settings.API_PREFIX}/classroom", tags=["ClassRooms"])
app.include_router(document_router.router, prefix=f"{settings.API_PREFIX}/document", tags=["Documents"])

@app.get("/")
def root():
    return {"message": "API is running", "docs": "/docs"}
