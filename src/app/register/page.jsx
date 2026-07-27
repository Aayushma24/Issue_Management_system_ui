"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

/**
 * RegisterPage — route "/register"
 *
 * Account creation form (name, email, password). Every sign-up is a reporter —
 * the API ignores any role in the body, team membership is granted by an admin
 * on /admin, and admins are made with scripts/makeAdmin.js. Hands off to
 * AuthContext.register, which sets the session and redirects to /my-issues.
 *
 * STATUS: USED — linked from the landing page and the login page.
 * Note: AuthContext.register currently has the token's localStorage write
 * commented out, so a freshly registered user has no persisted token and gets
 * bounced to /login on the next page load.
 */
export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });
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
      await register(form.fullName, form.email, form.password);
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
        <span className="form-tab">NEW CASE FILE</span>
        <h1>Open an account.</h1>
        <p className="form-subtitle">
          Start reporting and tracking issues in minutes. An admin can add you to
          a team later.
        </p>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label htmlFor="fullName">Full Name</label>
          <input
            id="fullName"
            type="text"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            placeholder="Jane Doe"
            required
          />

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
            placeholder="At least 6 characters"
            minLength={6}
            required
          />

          <button type="submit" className="btn btn-primary form-submit" disabled={loading}>
            {loading ? "Creating account…" : "Open an Account"}
          </button>
        </form>

        <p className="form-footer-text">
          Already have an account? <Link href="/login">Sign in here</Link>
        </p>
      </div>
    </div>
  );
}
