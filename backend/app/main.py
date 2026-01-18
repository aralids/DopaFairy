from fastapi import FastAPI
from app.api.routes import synapse, cube
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="DopaFairy",
    description="Interactive dopamine dynamics sandbox",
    version="0.1.0"
)

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
