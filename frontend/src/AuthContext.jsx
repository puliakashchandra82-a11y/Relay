import { createContext, useContext, useEffect, useState } from "react";
import { api } from "./api";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("relay_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .me()
      .then((u) => setUser(u))
      .catch(() => localStorage.removeItem("relay_token"))
      .finally(() => setLoading(false));
  }, []);

  function login(token, u) {
    localStorage.setItem("relay_token", token);
    setUser(u);
  }

  function logout() {
    localStorage.removeItem("relay_token");
    setUser(null);
  }

  return <AuthCtx.Provider value={{ user, login, logout, loading }}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
