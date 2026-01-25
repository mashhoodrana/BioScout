import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { registerUser, loginUser, logoutUser } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load user and token from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem("bioscout_token");
    const storedUser = localStorage.getItem("bioscout_user");

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Failed to parse stored user", err);
        localStorage.removeItem("bioscout_token");
        localStorage.removeItem("bioscout_user");
      }
    }
  }, []);

  const register = async (email, name, password, confirmPassword) => {
    setLoading(true);
    setError(null);
    try {
      const response = await registerUser(
        email,
        name,
        password,
        confirmPassword,
      );

      // DO NOT auto-login after signup
      // User must go to login page and enter credentials again
      // Just return the response so UI can show success message
      return response;
    } catch (err) {
      const errorMessage = err.message || "Registration failed";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await loginUser(email, password);

      // Store token
      localStorage.setItem("bioscout_token", response.access_token);

      // Store user info
      const userData = {
        id: response.user?.id,
        name: response.user?.name,
        email: response.user?.email,
      };
      localStorage.setItem("bioscout_user", JSON.stringify(userData));
      setUser(userData);

      return response;
    } catch (err) {
      const errorMessage = err.message || "Login failed";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      await logoutUser();
    } catch (err) {
      console.error("Logout API call failed, clearing locally anyway", err);
    } finally {
      // Clear localStorage regardless of API response
      localStorage.removeItem("bioscout_token");
      localStorage.removeItem("bioscout_user");
      localStorage.removeItem("bioscout_chat_history");
      setUser(null);
      setLoading(false);
    }
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      register,
      login,
      logout,
      loading,
      error,
    }),
    [user, loading, error],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
