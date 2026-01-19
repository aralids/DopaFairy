from pydantic import BaseModel, Field
from typing import Literal
from typing import List

DEFAULT_U0 = [
    0.346937591,   # ldopa
    2.71787498,    # cda
    82.1367952,    # vda
    0.00205312796  # eda
]

BehaviorName = Literal["bounce", "slide"]

class CubeRequest(BaseModel):
    scale: float = Field(..., gt=0, description="Radius of the sphere in Blender units")

class SynapseRequest(BaseModel):
    scale: float = Field(..., gt=0, description="Radius of the sphere in Blender units")

class DrugRequest(BaseModel):
    dose: float = Field(
        ...,
        ge=0,
        le=1,
        description=(
            "Initial fraction of dopamine transporters (DAT) inhibited by the drug. "
            "Dimensionless value between 0 and 1 (e.g., 0.2 = 20% inhibition)."
        ),
    )

    half_life: float = Field(
        ...,
        gt=0,
        le=24,
        description=(
            "Drug half-life in hours, controlling exponential decay of DAT inhibition. "
            "Typical values range from 1 to 24 hours (e.g., ~15 h for modafinil-like kinetics)."
        ),
    )

    t_admin: float = Field(
        ...,
        ge=0,
        lt=24,
        description=(
            "Circadian time of drug administration in hours (0–24), "
            "where 0 and 24 correspond to the same circadian phase."
        ),
    )

    u0: List[float] = Field(default=DEFAULT_U0, min_length=4, max_length=4, description="Initial state [ldopa, cda, vda, eda]")

class BehaviorRequest(BaseModel):
    behavior: BehaviorName

class BehaviorResponse(BaseModel):
    status: str
    behavior: BehaviorName
