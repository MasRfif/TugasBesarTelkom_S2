import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import api from "../api";

const AuthContext = createContext(null);
const UNPAID_STATUS = ["PENDING", "COD_PENDING"];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    () => localStorage.getItem("ss_token") || null,
  );
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  const refreshCartCount = useCallback(
    async (activeToken = token) => {
      if (!activeToken) {
        setCartCount(0);
        return 0;
      }
      try {
        const res = await api.get("/my-transactions", activeToken);
        const count = (res.data || []).filter((trx) =>
          UNPAID_STATUS.includes(trx.status_pembayaran),
        ).length;
        setCartCount(count);
        return count;
      } catch {
        setCartCount(0);
        return 0;
      }
    },
    [token],
  );

  useEffect(() => {
    if (token) {
      api
        .get("/me", token)
        .then((d) => {
          setUser(d.data);
          refreshCartCount(token);
        })
        .catch(() => {
          setToken(null);
          setUser(null);
          setCartCount(0);
          localStorage.removeItem("ss_token");
        })
        .finally(() => setLoading(false));
    } else {
      setCartCount(0);
      setLoading(false);
    }
  }, [token, refreshCartCount]);

  function login(userData, userToken) {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem("ss_token", userToken);
    refreshCartCount(userToken);
  }

  function logout() {
    setUser(null);
    setToken(null);
    setCartCount(0);
    localStorage.removeItem("ss_token");
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        cartCount,
        setCartCount,
        refreshCartCount,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
