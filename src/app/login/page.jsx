"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

/**
 * LoginPage — route "/login"
 *
 * Email/password sign-in form. Delegates the actual request to
 * AuthContext.login, which stores the token and redirects to /dashboard;
 * this component only owns the field state and the error/loading display.
 *
 * STATUS: USED — linked from the landing page and the register page, and it is
 * where ProtectedRoute and AuthContext send anyone without a valid token.
 */
export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page">
      <Link href="/" className="back-link">← Back</Link>

      <div className="form-card">
        <span className="form-tab">SIGN IN</span>
        <h1>Welcome back.</h1>
        <p className="form-subtitle">Pick up where you left off.</p>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />

          <button type="submit" className="btn btn-primary form-submit" disabled={loading} >
            {loading ? "Signing in…" : "Sign In"} 
          </button>
        </form>

        <p className="form-footer-text">
          No account yet? <Link href="/register">Open one here</Link>
        </p>
      </div>
    </div>
  );
}