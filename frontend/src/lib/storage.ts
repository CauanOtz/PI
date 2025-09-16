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

let memoryUser: any | null = null;

export const userStorage = {
  get() {
    if (memoryUser) return memoryUser;
    const userStr = localStorage.getItem("auth_user");
    return userStr ? JSON.parse(userStr) : null;
  },
  set(user: any | null) {
    memoryUser = user;
    if (user) localStorage.setItem("auth_user", JSON.stringify(user));
    else localStorage.removeItem("auth_user");
  },
  clear() {
    memoryUser = null;
    localStorage.removeItem("auth_user");
  },
};