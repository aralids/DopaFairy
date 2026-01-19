import math

def x_dose(t: float, dose: float, half_life: float, t_admin: float) -> float:
    """
    Fractional DAT occupancy / inhibition in [0, 1].

    Paper: xdose jumps at t_admin and decays exponentially with half-life.
    xdose(t) = 0 for t < t_admin
              dose * exp(-ln(2) * (t - t_admin) / half_life) for t >= t_admin
    """
    if t < t_admin:
        return 0.0
    return dose * math.exp(-math.log(2.0) * (t - t_admin) / half_life)
