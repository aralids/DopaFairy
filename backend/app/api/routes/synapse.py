from fastapi import APIRouter
from fastapi.responses import FileResponse
from app.models.schemas import SynapseRequest, DrugRequest
from app.services.blender_service import load_synapse_glb
from app.services.reduced.simulate import solve_reduced_model
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[3]   # backend/app
ASSETS_DIR = BASE_DIR.parent / "blender"         # backend/blender

router = APIRouter(prefix="/synapse", tags=["Blender"])

@router.post("/load")
def load_synapse(data: SynapseRequest):
    output_path = load_synapse_glb(data.scale)
    return FileResponse(
        path=output_path,
        media_type="model/gltf-binary",
        filename="synapse.glb"
    )

@router.post("/compute_drug_influence")
def compute_drug_influence(data: DrugRequest):
    result = solve_reduced_model(
        u0=data.u0,                      # or default inside solver
        dose=data.dose,
        half_life=data.half_life,
        t_admin=data.t_admin,
    )

    print("result ldopa: ", result["y"][0][-1])
    print("result cda: ", result["y"][1][-1])
    print("result vda: ", result["y"][2][-1])
    print("result eda: ", result["y"][3][-1])

    return result

@router.get("/assets")
def list_glb_assets():
    print("HELLO")
    glbs = sorted(ASSETS_DIR.glob("*.glb"))

    assets = {p.stem: f"http://localhost:8000/assets/{p.name}" for p in glbs}
    default = assets.get("synapse") or next(iter(assets.values()), None)


    print("default: ", default)

    return {
        "default": default,
        "assets": assets,
    }

