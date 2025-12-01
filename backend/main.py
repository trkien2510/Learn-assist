from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from db.mongodb import init_db
from routers import user_router, classroom_router


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

app.include_router(user_router.router, prefix=f"{settings.API_PREFIX}/user", tags=["User"])
app.include_router(classroom_router.router, prefix=f"{settings.API_PREFIX}/classroom", tags=["ClassRooms"])

@app.get("/")
def root():
    return {"message": "API is running", "docs": "/docs"}
