import numpy as np
from scipy.integrate import solve_ivp
from functools import partial

from app.services.reduced.rhs import ODE_RHS
from app.services.reduced.drug import x_dose
from app.services.reduced.rates import (
    V_TH, V_AADC, V_MAT, V_DAT, V_CATAB, C_TH, C_MAO
)
from app.services.reduced.parameters import k_cda, k_eda

t_0 = 0
t_n = 24

def solve_reduced_model(u0, *, dose, half_life, t_admin, repeated_daily_dosing=1):
    if repeated_daily_dosing == 1:
        rhs = partial(
            ODE_RHS,
            dose=dose,
            half_life=half_life,
            t_admin=t_admin,
        )
        sol = solve_ivp(
            rhs,
            (t_0, t_n * 7),
            u0,
            method="Radau",
            rtol=1e-9,
            atol=1e-12,
        )

    else:
        # --- piecewise repeated daily dosing ---
        u = np.asarray(u0, dtype=float)

        t_chunks = []
        y_chunks = []

        # (A) Pre-dose segment: 0 -> t_admin, with dose=0 so no drug effect yet
        if t_admin > t_0:
            rhs0 = partial(
                ODE_RHS,
                dose=0.0,
                half_life=half_life,
                t_admin=t_admin,  # doesn't matter when dose=0, but keep signature consistent
            )
            sol0 = solve_ivp(
                rhs0,
                (t_0, t_admin),
                u,
                method="Radau",
                rtol=1e-9,
                atol=1e-12,
            )
            t_chunks.append(sol0.t)
            y_chunks.append(sol0.y)
            u = sol0.y[:, -1]

        # (B) Dose once per day at t_admin + k*24, each segment lasts 24h
        for k in range(repeated_daily_dosing):
            t_k_admin = t_admin + k * t_n
            t_start = t_k_admin
            t_end = t_k_admin + t_n

            rhsk = partial(
                ODE_RHS,
                dose=dose,
                half_life=half_life,
                t_admin=t_k_admin,   # shift the single-dose model forward each day
            )

            solk = solve_ivp(
                rhsk,
                (t_start, t_end),
                u,
                method="Radau",
                rtol=1e-9,
                atol=1e-12,
            )

            # avoid duplicating boundary points when stitching
            if len(t_chunks) == 0:
                t_chunks.append(solk.t)
                y_chunks.append(solk.y)
            else:
                t_chunks.append(solk.t[1:])
                y_chunks.append(solk.y[:, 1:])

            u = solk.y[:, -1]

        # create a sol-like object for the rest of your code
        class _Sol:
            pass
        sol = _Sol()
        sol.t = np.concatenate(t_chunks) if len(t_chunks) else np.array([t_0], dtype=float)
        sol.y = np.concatenate(y_chunks, axis=1) if len(y_chunks) else np.asarray(u0, dtype=float)[:, None]

    # ===========================
    # everything below is unchanged
    # ===========================
    t = sol.t                      # (N,)
    y = sol.y                      # (4, N)
    ldopa = y[0, :]
    cda   = y[1, :]
    vda   = y[2, :]
    eda   = y[3, :]

     # --- drug effect x(t) on the solver grid (N,) ---
    # For now: single (unrepeated) dose only.
    # (We keep the repeated_daily_dosing machinery, but we do NOT sum doses here yet.)
    x_vals = np.array(
        [x_dose(ti, dose=dose, half_life=half_life, t_admin=t_admin) for ti in t],
        dtype=float,
    )
    x_vals = np.clip(x_vals, 0.0, 1.0)

    print("t_min, t_max, t_admin =", float(t[0]), float(t[-1]), float(t_admin))
    print("x_max =", float(np.max(x_vals)))
    print("x_at_admin_approx =", float(x_dose(t_admin, dose=dose, half_life=half_life, t_admin=t_admin)))



    tyrToLdopa_rate = np.array([V_TH(cda[i], eda[i]) * C_TH(t[i]) for i in range(len(t))], dtype=float)
    ldopaToCda_rate = np.array([V_AADC(ldopa[i]) for i in range(len(t))], dtype=float)

    lostCda_rate    = (k_cda * cda).astype(float)
    reuptaken_rate  = np.array([V_DAT(eda[i]) * (1.0 - x_vals[i]) for i in range(len(t))], dtype=float)

    cdaToVda_rate   = np.array([V_MAT(cda[i], vda[i]) for i in range(len(t))], dtype=float)
    destroyed_rate  = np.array([V_CATAB(eda[i]) * C_MAO(t[i]) for i in range(len(t))], dtype=float)
    lostEda_rate    = (k_eda * eda).astype(float)

    dt = np.diff(t)  # (N-1,)

    tyrToLdopa = 0.5 * (tyrToLdopa_rate[:-1] + tyrToLdopa_rate[1:]) * dt
    ldopaToCda = 0.5 * (ldopaToCda_rate[:-1] + ldopaToCda_rate[1:]) * dt

    lostCda    = 0.5 * (lostCda_rate[:-1]    + lostCda_rate[1:])    * dt
    reuptaken  = 0.5 * (reuptaken_rate[:-1]  + reuptaken_rate[1:])  * dt

    cdaToVda   = 0.5 * (cdaToVda_rate[:-1]   + cdaToVda_rate[1:])   * dt
    destroyed  = 0.5 * (destroyed_rate[:-1]  + destroyed_rate[1:])  * dt
    lostEda    = 0.5 * (lostEda_rate[:-1]    + lostEda_rate[1:])    * dt

    return {
        "t": t.tolist(),
        "y": y.tolist(),
        "x": x_vals.tolist(),
        "tyrToLdopa": tyrToLdopa.tolist(),
        "ldopaToCda": ldopaToCda.tolist(),
        "lostCda": lostCda.tolist(),
        "reuptaken": reuptaken.tolist(),
        "cdaToVda": cdaToVda.tolist(),
        "destroyed": destroyed.tolist(),
        "lostEda": lostEda.tolist(),
    }




'''
u0 = np.array([3.46937591e-01, 2.71787498e+00, 8.21367952e+01, 2.05312796e-03])
print("RHS(u0) =", ODE_RHS(0.0, u0))
print("norm =", np.linalg.norm(ODE_RHS(0.0, u0)))
'''

'''
from scipy.optimize import root
import numpy as np

u_guess = np.array([3.55798434e-01, 2.64647902e+00, 8.09585651e+01, 2.02349121e-03])

sol = root(lambda u: ODE_RHS(0.0, u), u_guess, method="hybr")

print("success:", sol.success)
print("u* =", sol.x)
print("RHS(u*) =", ODE_RHS(0.0, sol.x))
print("norm =", np.linalg.norm(ODE_RHS(0.0, sol.x)))
'''
'''
import numpy as np
from scipy.integrate import solve_ivp
from scipy.optimize import root

# --- your existing ODE_RHS(t, u) must be defined above this ---
# IMPORTANT: this assumes t is in HOURS everywhere (C_TH, C_MAO, fire, etc.)

T_PERIOD = 24.0  # hours

def integrate(u0, t0=0.0, t1=T_PERIOD):
    """
    Integrate the ODE from t0 to t1 starting at u0.
    Returns the state vector u(t1).
    """
    sol = solve_ivp(
        fun=ODE_RHS,
        t_span=(t0, t1),
        y0=np.asarray(u0, dtype=float),
        method="BDF",        # stiff-friendly; "RK45" also works if not stiff
        rtol=1e-8,
        atol=1e-10,
        max_step=0.25        # optional: limit step size (in hours) for stability/accuracy
    )
    if not sol.success:
        raise RuntimeError(f"ODE integration failed: {sol.message}")
    return sol.y[:, -1]

def poincare_residual(u0):
    """
    F(u0) = Phi_24(u0) - u0.
    A root of F corresponds to a 24h periodic solution (entrained orbit start).
    """
    u24 = integrate(u0, t0=0.0, t1=T_PERIOD)
    return u24 - u0

# Your autonomous steady state is a decent initial guess:
u_guess = np.array([3.55798434e-01, 2.64647902e+00, 8.09585651e+01, 2.02349121e-03], dtype=float)

sol = root(poincare_residual, u_guess, method="hybr")

print("success:", sol.success)
print("message:", sol.message)
print("u0_periodic =", sol.x)

# Verify: integrate one day and compare
u24 = integrate(sol.x, 0.0, T_PERIOD)
print("u(24h) - u(0) =", u24 - sol.x)
print("norm =", np.linalg.norm(u24 - sol.x))
'''