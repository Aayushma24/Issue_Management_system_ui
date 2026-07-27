"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { homeRouteFor } from "@/lib/navbarnavigation";

/**
 * ProtectedRoute
 *
 * Auth gate wrapper. Waits for AuthContext to finish restoring the session,
 * then redirects to /login if there is no user, or back to the role's own home
 * page if the role is not in `allowedRoles`. Renders a placeholder while
 * loading and its children once access is confirmed.
 *
 * STATUS: USED — by /dashboard (team + admin), /my-issues and /report
 * (reporter) and /profile (any role). /admin and /team are still unwrapped.
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (allowedRoles && !allowedRoles.includes(user.role)) {
        router.push(homeRouteFor(user.role));
      }
    }
  }, [user, loading, allowedRoles, router]);

  if (loading || !user || (allowedRoles && !allowedRoles.includes(user.role))) {
    return (
      <div className="loading-screen">
        <p>Loading…</p>
      </div>
    );
  }

  return children;
}