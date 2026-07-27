"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import IssueCard from "@/components/IssueCard";
import IssueDetailModal from "@/components/IssueDetailModal";
import { apiRequest } from "@/lib/apiClient";

/**
 * MyIssuesPage — route "/my-issues"
 *
 * The reporter's home screen: every ticket they filed, as IssueCards, opening
 * IssueDetailModal on click (which is where a Pending ticket can be deleted).
 * Reporters have no /dashboard, so this is where login lands them.
 *
 * STATUS: USED — linked from the Navbar and the target of homeRouteFor().
 */
export default function MyIssuesPage() {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState(null);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    apiRequest("/issues/mine")
      .then((data) => {
        if (!cancelled) setIssues(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setIssues([]);
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

  const handleDeleted = (id) => {
    setIssues((prev) => prev.filter((i) => i._id !== id));
    setSelectedIssue(null);
  };

  return (
    <ProtectedRoute allowedRoles={["reporter"]}>
      <div className="dashboard-page">
        <Navbar />

        <main className="dash-main">
          <div className="dash-title-row">
            <h1>Your reported issues.</h1>
            <Link href="/report" className="btn btn-primary">
              + Report an Issue
            </Link>
          </div>

          {loading ? (
            <p className="dash-loading">Loading tickets…</p>
          ) : issues.length === 0 ? (
            <div className="dash-empty-card">
              <p>You haven&apos;t filed a ticket yet. When something breaks, log it here.</p>
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
            onDeleted={handleDeleted}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
