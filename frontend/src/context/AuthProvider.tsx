import React, { createContext, useContext, useMemo, useState } from "react";
import { isAuthenticated, login as authLogin, logout as authLogout } from "../services/auth";

type AuthCtx = {
  authed: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(isAuthenticated());

  const value = useMemo<AuthCtx>(() => ({
    authed,
    async login(email, password) {
      await authLogin({ email, password });
      setAuthed(true);
    },
    logout() {
      authLogout();
      setAuthed(false);
    },
  }), [authed]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}