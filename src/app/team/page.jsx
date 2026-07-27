"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import IssueCard from "@/components/IssueCard";
import IssueDetailModal from "@/components/IssueDetailModal";
import { apiRequest } from "@/lib/apiClient";

/**
 * TeamPage — route "/team"
 *
 * A team member's work queue: the tickets an admin has assigned to their team,
 * and nothing else. GET /issues is scoped server-side by role, so this is the
 * same call the admin dashboard makes — the API decides what comes back.
 *
 * Clicking a ticket opens IssueDetailModal, which is where the investigation
 * notes, remarks, In Progress / Resolved and verification actions live.
 *
 * STATUS: USED — the team role's home page and its Navbar link.
 */
export default function TeamPage() {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedIssue, setSelectedIssue] = useState(null);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    apiRequest("/issues")
      .then((data) => {
        if (!cancelled) setIssues(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!cancelled) {
          setIssues([]);
          setError(err.message);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleUpdated = (updatedIssue) => {
    setIssues((prev) => prev.map((i) => (i._id === updatedIssue._id ? updatedIssue : i)));
    setSelectedIssue(updatedIssue);
  };

  return (
    <ProtectedRoute allowedRoles={["team"]}>
      <div className="dashboard-page">
        <Navbar />

        <main className="dash-main">
          <div className="dash-title-row">
            <h1>Tickets assigned to your team.</h1>
          </div>

          {error && <div className="form-error">{error}</div>}

          {loading ? (
            <p className="dash-loading">Loading tickets…</p>
          ) : issues.length === 0 ? (
            <div className="dash-empty-card">
              <p>Nothing&apos;s been routed to you yet.</p>
            </div>
          ) : (
            <div className="issue-list">
              {issues.map((issue) => (
                <IssueCard key={issue._id} issue={issue} onClick={setSelectedIssue} />
              ))}
            </div>
          )}
        </main>

        {selectedIssue && (
          <IssueDetailModal
            issue={selectedIssue}
            user={user}
            onClose={() => setSelectedIssue(null)}
            onUpdated={handleUpdated}
            onDeleted={() => setSelectedIssue(null)}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
