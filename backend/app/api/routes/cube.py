from fastapi import APIRouter
from fastapi.responses import FileResponse
from app.models.schemas import CubeRequest
from app.services.blender_service import load_cube_glb
import numpy as np

router = APIRouter(prefix="/cube", tags=["Blender"])

@router.post("/load")
def load_cube(data: CubeRequest):

    output_path = load_cube_glb(data.scale)
    return FileResponse(
        path=output_path,
        media_type="model/gltf-binary",
        filename="cube.glb"
    )
