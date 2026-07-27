"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { homeRouteFor } from "@/lib/navbarnavigation";

const AuthContext = createContext();
const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * AuthProvider
 *
 * App-wide session holder. Restores user + token from localStorage on mount,
 * exposes login / register / logout (each of which calls the API directly with
 * fetch, not the apiClient helpers), and keeps localStorage in sync.
 *
 * STATUS: USED — mounted once in src/app/layout.js, so it wraps every route.
 * Consumed through the useAuth hook below.
 *
 * Two things to be aware of:
 *   - the mount effect redirects to /login whenever no token is stored, which
 *     applies to public routes ("/", /register) as well;
 *   - register() never writes the token to localStorage (the line is commented
 *     out), so a new account loses its session on the next load.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    console.log("Saved Token",savedToken, savedUser)
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    // validate token exists or not before accessing protected routes
    if(!savedToken || savedToken ===undefined ){
      router.push("/login");
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await fetch(`${API_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Login failed");
    }

    setUser(data.user);
    setToken(data.token);
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    router.push(homeRouteFor(data.user.role));
    return data;
  };

  // No role argument: the API always creates a reporter, and roles are granted
  // by an admin afterwards.
  const register = async (fullName, email, password) => {
    const res = await fetch(`${API_URL}/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, email, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Registration failed");
    }

    setUser(data.user);
    setToken(data.token);
    // localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    router.push(homeRouteFor(data.user.role));
    return data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth — accessor for the session above.
 *
 * STATUS: USED — by Navbar, ProtectedRoute, HomePage, LoginPage, RegisterPage
 * and DashboardPage.
 */
export const useAuth = () => useContext(AuthContext);