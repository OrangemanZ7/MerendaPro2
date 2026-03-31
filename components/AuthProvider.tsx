"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import Image from "next/image";
import { Loader2, ShieldCheck } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  location?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [origin, setOrigin] = useState("");

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUser = async () => {
    console.log("fetchUser called");
    try {
      console.log("fetching /api/auth/me");
      const res = await fetch(`/api/auth/me?t=${Date.now()}`, {
        credentials: "include",
      });
      console.log("fetch response status:", res.status);
      if (res.ok) {
        const data = await res.json();
        console.log("fetch response data:", data);
        if (data.authenticated) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to fetch user", error);
      setUser(null);
    } finally {
      console.log("fetchUser finally, setting isLoading to false");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setOrigin(window.location.origin);
    fetchUser();
  }, []);

  const login = async () => {
    // This is kept for compatibility with the context interface if needed,
    // but the actual login is handled by handleAuthSubmit
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsSubmitting(true);

    try {
      if (isRegistering) {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, name }),
        });
        const data = await res.json();
        if (res.ok) {
          await fetchUser();
        } else {
          setAuthError(data.error || "Erro ao registrar");
        }
      } else {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (res.ok) {
          await fetchUser();
        } else if (res.status === 404 && data.notFound) {
          setIsRegistering(true);
        } else {
          setAuthError(data.error || "Erro ao fazer login");
        }
      }
    } catch (error) {
      console.error("Auth error:", error);
      setAuthError("Erro de conexão");
    } finally {
      setIsSubmitting(false);
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setIsRegistering(false);
      setEmail("");
      setName("");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-600 mb-4" />
          <p className="text-slate-500 font-medium">Verificando sessão...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-100 text-center">
          <div className="mx-auto w-24 h-24 relative mb-6">
            <Image
              src="/logo_escola.png"
              alt="Logo Prof. João Florentino"
              fill
              sizes="96px"
              className="object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
                const parent = (e.target as HTMLImageElement).parentElement;
                if (parent) {
                  parent.innerHTML =
                    '<div class="w-full h-full bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-check"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg></div>';
                }
              }}
            />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Prof. João Florentino
          </h1>
          <p className="text-slate-500 mb-8">
            Faça login para gerenciar a cadeia de suprimentos das escolas
            públicas, ingredientes de alimentação e materiais de escritório.
          </p>

          <form onSubmit={handleAuthSubmit} className="space-y-4 text-left">
            {authError && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
                {authError}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                required
                disabled={isRegistering || isSubmitting}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm disabled:bg-slate-100 disabled:text-slate-500"
                placeholder="seu.email@exemplo.com"
              />
            </div>

            {isRegistering && (
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-slate-700 mb-1"
                >
                  Nome Completo
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  disabled={isSubmitting}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-emerald-500 sm:text-sm"
                  placeholder="Seu Nome"
                />
                <p className="mt-2 text-xs text-slate-500">
                  Conta não encontrada. Por favor, informe seu nome para criar
                  uma nova conta.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center px-4 py-3 border border-transparent shadow-sm text-base font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : isRegistering ? (
                "Criar Conta"
              ) : (
                "Entrar"
              )}
            </button>

            {isRegistering && (
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(false);
                  setAuthError("");
                }}
                disabled={isSubmitting}
                className="w-full mt-2 text-sm text-slate-500 hover:text-slate-700"
              >
                Voltar
              </button>
            )}
          </form>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
