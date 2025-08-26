let memoryToken: string | null = null;

export const tokenStorage = {
  get() {
    return memoryToken ?? localStorage.getItem("auth_token");
  },
  set(token: string | null) {
    memoryToken = token;
    if (token) localStorage.setItem("auth_token", token);
    else localStorage.removeItem("auth_token");
  },
  clear() {
    memoryToken = null;
    localStorage.removeItem("auth_token");
  },
};