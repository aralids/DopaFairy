import numpy as np
from app.services.reduced.parameters import tyr, K_i_tyr, V_max_tyr, bh4, K_tyr, K_i_cda, V_max_ldopa, K_m_ldopa, V_max_cda, K_m_cda, k_out, V_max_eda, K_m_eda, V_max_catab, K_m_catab, K_bh4

def V_TH(cda, eda):
    fst_par = 0.56 / (1 + (tyr / K_i_tyr))
    snd_par = 4.5 / (8 * ((eda / 0.002024)**4) + 1) + 0.5
    thr_par = (V_max_tyr * tyr * bh4) / (tyr * bh4 +  K_tyr * bh4 + K_tyr * K_bh4 * (1 + cda / K_i_cda))

    return fst_par * snd_par * thr_par

def V_AADC(ldopa): 
    return V_max_ldopa * ldopa / (K_m_ldopa + ldopa)

def V_MAT(cda, vda):
    return V_max_cda * cda / (K_m_cda + cda) - k_out * vda

def V_DAT(eda): 
    return V_max_eda * eda / (K_m_eda + eda)

def V_CATAB(eda):
    return V_max_catab * eda / (K_m_catab + eda)

def fire(t):
    return 1

def C_TH(t, amp=0.25, phase=12.0):
    """
    Circadian modulation of TH activity.

    amp   : relative amplitude (e.g. 0.25 = ±25%)
    phase : phase shift in hours
    """
    return 1.0 + amp * np.sin(np.pi / 12.0 * (t - phase))

def C_MAO(t, amp=0.25, phase=20.0):
    """
    Circadian modulation of MAO activity.

    amp   : relative amplitude (e.g. 0.25 = ±25%)
    phase : phase shift in hours
    """
    return 1.0 + amp * np.sin(np.pi / 12.0 * (t - phase))
