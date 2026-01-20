from fastapi import FastAPI
from app.api.routes import synapse, cube
from fastapi.middleware.cors import CORSMiddleware

from fastapi.staticfiles import StaticFiles
from pathlib import Path

app = FastAPI(
    title="DopaFairy",
    description="Interactive dopamine dynamics sandbox",
    version="0.1.0"
)

BASE_DIR = Path(__file__).resolve().parents[1]      # backend/app
ASSETS_DIR = BASE_DIR.parent / "blender"            # backend/blender

app.mount("/assets", StaticFiles(directory=str(ASSETS_DIR)), name="assets")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(synapse.router)
app.include_router(cube.router)

@app.get("/")
def root():
    return {
        "app": "DopaFairy",
        "status": "running"
    }
