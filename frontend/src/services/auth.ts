import { http } from "../lib/http";
import { tokenStorage } from "../lib/storage";

export async function login({ email, password }: { email: string; password: string }) {
  const res = await http.post<{ token: string; user?: any }>(
    "/usuarios/login",
    { email, senha: password } 
  );
  tokenStorage.set(res.data.token);
  return res.data;
}

export function logout() {
  tokenStorage.clear();
}

export function isAuthenticated() {
  return !!tokenStorage.get();
}