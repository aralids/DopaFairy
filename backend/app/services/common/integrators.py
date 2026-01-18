import numpy as np

def explicit_euler(f, u0, t_disc):
    y = np.zeros((len(t_disc),) + u0.shape)
    y[0] = u0
    tau = t_disc[1] - t_disc[0]
    for i in range(1, len(t_disc)):
        y[i] = y[i-1] + tau * f(t_disc[i-1], y[i-1])  
    return y

def neville(rhs, u_prev, tau, k):
    T = [[None for _ in range(k + 1)] for _ in range(k + 1)]

    # First column: T[i,1]
    for i in range(1, k + 1):
        new_tau = tau / i
        t_disc = new_tau * np.arange(i + 1)   # <-- key fix
        sol = explicit_euler(rhs, u_prev, t_disc)
        T[i][1] = sol[-1]

    p = 1
    for j in range(2, k + 1):
        for i in range(j, k + 1):
            sigma_i = (1.0 / i) ** p
            sigma_imj1 = (1.0 / (i - j + 1)) ** p
            denom = sigma_imj1 - sigma_i

            T[i][j] = T[i][j-1] + (sigma_i / denom) * (T[i][j-1] - T[i-1][j-1])

    return T[k][k], np.linalg.norm(T[k][k] - T[k][k-1])


TOL = 1e-4
rho = 0.8

def adaptive(rhs, u0, t0, init_tau, dtmax, T, k):
    t = t0
    u = u0.copy() if hasattr(u0, "copy") else u0
    tau = init_tau

    t_vals = [t]
    u_vals = [u]

    while t < T:

        tau = min(tau, T - t)

        # Neville extrapolation
        Tk_k, Delta = neville(rhs, u, tau, k)

        # Step size update (slide formula)
        h = min(rho * (TOL / Delta) ** (1.0 / k) * tau, 1.25 * tau, dtmax)

        # Accept / reject
        if Delta < TOL:
            t += tau
            u = Tk_k
            t_vals.append(t)
            u_vals.append(u)

        tau = h

    return np.array(t_vals), np.array(u_vals)