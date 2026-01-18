from pydantic import BaseModel, Field
from typing import Literal

BehaviorName = Literal["bounce", "slide"]

class CubeRequest(BaseModel):
    scale: float = Field(..., gt=0, description="Radius of the sphere in Blender units")

class SynapseRequest(BaseModel):
    scale: float = Field(..., gt=0, description="Radius of the sphere in Blender units")

class BehaviorRequest(BaseModel):
    behavior: BehaviorName

class BehaviorResponse(BaseModel):
    status: str
    behavior: BehaviorName
