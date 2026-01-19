import numpy as np

data = {  # <-- paste your JSON here
    # "t": [...],
    # "y": [...],
    # "tyrToLdopa": [...],
    # "ldopaToCda": [...],
    # "lostCda": [...],
    # "reuptaken": [...],
    # "cdaToVda": [...],
    # "destroyed": [...],
    # "lostEda": [...],
}

t = np.array(data["t"], dtype=float)
y = np.array(data["y"], dtype=float)          # shape (4, N)
ldopa, cda, vda, eda = y[0], y[1], y[2], y[3]

# interval deltas (N-1)
d_ldopa = ldopa[1:] - ldopa[:-1]
d_cda   = cda[1:]   - cda[:-1]
d_vda   = vda[1:]   - vda[:-1]
d_eda   = eda[1:]   - eda[:-1]

# interval amounts (N-1)
tyrToLdopa = np.array(data["tyrToLdopa"], dtype=float)
ldopaToCda = np.array(data["ldopaToCda"], dtype=float)
lostCda    = np.array(data["lostCda"], dtype=float)
reuptaken  = np.array(data["reuptaken"], dtype=float)
cdaToVda   = np.array(data["cdaToVda"], dtype=float)
destroyed  = np.array(data["destroyed"], dtype=float)
lostEda    = np.array(data["lostEda"], dtype=float)

N = len(t)
assert tyrToLdopa.shape[0] == N-1

# Residuals based on reduced-model sources/sinks (Eqs 15-18),
# with drug effect already baked into your reuptaken array.
r_ldopa = d_ldopa - (tyrToLdopa - ldopaToCda)
r_cda   = d_cda   - (ldopaToCda - cdaToVda + reuptaken - lostCda)

fired_from_vda = cdaToVda - d_vda
fired_from_eda = d_eda + reuptaken + destroyed + lostEda
r_fire = fired_from_vda - fired_from_eda

def max_abs_with_index(r):
    i = int(np.argmax(np.abs(r)))
    return float(np.max(np.abs(r))), i

max_ldopa, i_ldopa = max_abs_with_index(r_ldopa)
max_cda,   i_cda   = max_abs_with_index(r_cda)
max_fire,  i_fire  = max_abs_with_index(r_fire)

print("max |ldopa balance residual| =", max_ldopa, "at interval", i_ldopa, "between", t[i_ldopa], "and", t[i_ldopa+1])
print("max |cda   balance residual| =", max_cda,   "at interval", i_cda,   "between", t[i_cda],   "and", t[i_cda+1])
print("max |fire consistency residual| =", max_fire, "at interval", i_fire, "between", t[i_fire], "and", t[i_fire+1])

# Optional: relative (scale-aware) versions
eps = 1e-12
scale_ldopa = np.maximum(np.abs(tyrToLdopa) + np.abs(ldopaToCda), eps)
scale_cda   = np.maximum(np.abs(ldopaToCda)+np.abs(cdaToVda)+np.abs(reuptaken)+np.abs(lostCda), eps)
scale_fire  = np.maximum(np.abs(fired_from_vda)+np.abs(fired_from_eda), eps)

print("max relative ldopa residual =", float(np.max(np.abs(r_ldopa)/scale_ldopa)))
print("max relative cda residual   =", float(np.max(np.abs(r_cda)/scale_cda)))
print("max relative fire residual  =", float(np.max(np.abs(r_fire)/scale_fire)))
