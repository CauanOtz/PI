import { http } from "../lib/http";
import { tokenStorage, userStorage } from "../lib/storage";

export async function login({ email, password }: { email: string; password: string }) {
  const res = await http.post<{ token: string; user?: any }>(
    "/usuarios/login",
    { email, senha: password }
  );
  tokenStorage.set(res.data.token);
  if (res.data.user) {
    userStorage.set(res.data.user);
  }
  return res.data;
}

export async function fetchMe() {
  const res = await http.get<any>("/usuarios/me");
  const payload = res.data;
  const user = payload?.user ?? payload;
  if (user) userStorage.set(user);
  return user;
}

export function logout() {
  tokenStorage.clear();
  userStorage.clear();
}

export function isAuthenticated() {
  return !!tokenStorage.get();
}

export function getUser() {
  return userStorage.get();
}