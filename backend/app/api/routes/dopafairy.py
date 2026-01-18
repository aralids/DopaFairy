'''
from fastapi import APIRouter, HTTPException
from app.models.schemas import BehaviorResponse
from app.services.blender_service import send_behavior_command

router = APIRouter(prefix="/behavior", tags=["DopaFairy"])

ALLOWED_BEHAVIORS = {"bounce", "slide"}

@router.post("/{behavior}", response_model=BehaviorResponse)
def set_behavior(behavior: str):
    if behavior not in ALLOWED_BEHAVIORS:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown behavior '{behavior}'"
        )

    send_behavior_command(behavior)

    return {
        "status": "ok",
        "behavior": behavior
    }
'''