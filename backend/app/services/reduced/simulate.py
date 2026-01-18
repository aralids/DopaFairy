import numpy as np
from app.services.reduced.rhs import ODE_RHS
from app.services.common.integrators import adaptive
from scipy.integrate import solve_ivp

t_0 = 0
t_n = 24
tau = 0.01
t_disc = np.arange(t_0, t_n + tau, tau)

u0 = np.array([3.46937591e-01, 2.71787498e+00, 8.21367952e+01, 2.05312796e-03])

#solution = adaptive(ODE_RHS, u0, t_0, tau, 0.1, t_n, 10)
solution = solve_ivp(
    ODE_RHS,
    (t_0, t_n),
    u0,
    method="Radau",   # or "BDF"
    rtol=1e-9,
    atol=1e-12,
)

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