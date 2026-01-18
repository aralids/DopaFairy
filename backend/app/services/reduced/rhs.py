import numpy as np
from app.services.reduced.rates import V_TH, V_AADC, V_MAT, V_DAT, V_CATAB, fire, C_TH, C_MAO
from app.services.reduced.parameters import k_cda, k_eda

def ODE_RHS(t, u):
    ldopa, cda, vda, eda = u
    dldopa = V_TH(cda, eda) * C_TH(t) - V_AADC(ldopa)
    dcda = V_AADC(ldopa) - V_MAT(cda, vda) + V_DAT(eda) - k_cda*cda
    dvda = V_MAT(cda, vda) - fire(t) * vda
    deda = fire(t) * vda - V_DAT(eda) - V_CATAB(eda) * C_MAO(t) - k_eda*eda

    return np.array([dldopa, dcda, dvda, deda])