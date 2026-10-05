import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { authService } from "../services/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }, []);

  const login = useCallback((newToken, newUser) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  // On app start, verify the stored token with GET /auth/me
  useEffect(() => {
    const verify = async () => {
      if (!localStorage.getItem("token")) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await authService.me();
        const me = data.user || data.data || data;
        setUser(me);
        localStorage.setItem("user", JSON.stringify(me));
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };
    verify();
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
