"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { apiRequest } from "@/lib/apiClient";

/**
 * ProfilePage — route "/profile"
 *
 * The signed-in user's account record: name, email, role, and (for team
 * members) the team they belong to. Read-only — the API exposes GET /users/me
 * and nothing that updates a profile, so there is no save action to offer.
 *
 * STATUS: USED — linked from the Navbar for every role.
 */
export default function ProfilePage() {
  const { user } = useAuth();

  // Start from the session so the card is populated on first paint, then
  // refresh from /users/me for the fields the token does not carry (team,
  // createdAt).
  const [profile, setProfile] = useState(user);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    apiRequest("/users/me")
      .then((data) => {
        if (!cancelled) setProfile((prev) => ({ ...prev, ...data }));
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const joined = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString()
    : null;

  return (
    <ProtectedRoute>
      <div className="dashboard-page">
        <Navbar />

        <main className="dash-main">
          <div className="form-card">
            <span className="form-tab">PROFILE</span>
            <h1>Your record.</h1>
            <p className="form-subtitle">
              How you appear on every ticket you touch.
            </p>

            {error && <div className="form-error">{error}</div>}

            <label>Full Name</label>
            <input type="text" value={profile?.fullName || "—"} disabled />

            <label>Email</label>
            <input type="text" value={profile?.email || "—"} disabled />

            <label>Role</label>
            <input
              type="text"
              value={profile?.role ? profile.role.toUpperCase() : "—"}
              disabled
            />

            {profile?.role === "team" && (
              <>
                <label>Team</label>
                <input
                  type="text"
                  value={profile?.team?.teamName || profile?.team || "Not assigned"}
                  disabled
                />
              </>
            )}

            {joined && (
              <>
                <label>Member Since</label>
                <input type="text" value={joined} disabled />
              </>
            )}

            <p className="form-footer-text">
              Need a detail changed? Ask an admin — profile editing isn&apos;t
              open yet.
            </p>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
