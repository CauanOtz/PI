import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
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
  const navigate = useNavigate();

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

  useEffect(() => {
    const handler = (ev: Event) => {
      try {
        const detail = (ev as CustomEvent)?.detail || {};
        const message = detail?.message;
        // efetue logout local e redirecione com feedback
        authLogout();
        setAuthed(false);
        setUser(null);
        toast.error(message || "Sessão expirada. Faça login novamente.");
        navigate("/");
      } catch (e) {
        console.error('Erro ao tratar evento session:expired', e);
      }
    };

    window.addEventListener('session:expired', handler as EventListener);
    return () => window.removeEventListener('session:expired', handler as EventListener);
  }, [navigate]);

  const value = useMemo<AuthCtx>(() => ({
    authed,
    user,
    loading,
    async login(email, password) {
      setLoading(true);
      try {
        const data = await authLogin({ email, password });

        if (data.user) {
          setUser(data.user);
          setAuthed(true);
          return data;
        }

        try {
          const fetched = await fetchMe();
          if (fetched) {
            setUser(fetched);
            setAuthed(true);
            return { ...data, user: fetched };
          }

          // se não conseguimos obter o usuário, mantenha authed=false
          setUser(null);
          setAuthed(false);
          return data;
        } catch (err) {
          setUser(null);
          setAuthed(false);
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