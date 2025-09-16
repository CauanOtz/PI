import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import { isAuthenticated, login as authLogin, logout as authLogout, getUser, fetchMe } from "../services/auth";

interface User {
  id: number;
  nome: string;
  email: string;
  role?: string; // role é usado em runtime
  [key: string]: any;
}

type AuthCtx = {
  authed: boolean;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ user?: any }>;
  logout: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState<boolean>(isAuthenticated());
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // inicializa o estado de autenticação e carrega o usuário, se houver token
    const init = async () => {
      try {
        if (isAuthenticated()) {
          // primeiro tenta obter user do storage imediato
          const currentUser = getUser();
          if (currentUser) {
            setUser(currentUser);
            setAuthed(true);
          } else {
            // se tiver token mas não há user em storage, buscar do backend
            const fetched = await fetchMe();
            if (fetched) {
              setUser(fetched);
              setAuthed(true);
            } else {
              setUser(null);
              setAuthed(false);
            }
          }
        } else {
          setUser(null);
          setAuthed(false);
        }
      } catch (err) {
        setUser(null);
        setAuthed(false);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const value = useMemo<AuthCtx>(() => ({
    authed,
    user,
    loading,
    async login(email, password) {
      setLoading(true);
      try {
        const data = await authLogin({ email, password });
        setAuthed(true);
        if (data.user) {
          setUser(data.user);
          return data;
        }
        try {
          const fetched = await fetchMe();
          setUser(fetched || null);
          return { ...data, user: fetched };
        } catch (err) {
          setUser(null);
          return data;
        }
      } finally {
        setLoading(false);
      }
    },
    logout() {
      authLogout();
      setAuthed(false);
      setUser(null);
    },
  }), [authed, user, loading]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}