from fastapi import APIRouter
from fastapi.responses import FileResponse
from app.models.schemas import SynapseRequest, DrugRequest
from app.services.blender_service import load_synapse_glb
from app.services.reduced.simulate import solve_reduced_model

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

    return result
