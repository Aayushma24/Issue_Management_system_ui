"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiRequest } from "@/lib/apiClient";
import IssueCard from "@/components/IssueCard";
import IssueDetailModal from "@/components/IssueDetailModal";
import Navbar from "@/components/Navbar";

// Per-role page copy: the heading and the empty-state line. The backend already
// scopes GET /issues to what the caller may see, so this is wording only.
const ROLE_META = {
  admin: {
    tag: "ADMIN",
    heading: "All open cases.",
    empty: "No tickets in the system yet.",
  },
};

/**
 * DashboardPage — route "/dashboard"
 *
 * The admin's every-ticket view: the whole queue as IssueCards, opening
 * IssueDetailModal (assign a team, verify, close) on click. Mutations come back
 * through the handlers below so the list updates without a refetch.
 *
 * STATUS: USED — the admin's home. Reporters have /my-issues and team members
 * have /team; neither can reach this page.
 */
export default function DashboardPage() {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState(null);

  const meta = user ? ROLE_META[user.role] : null;

  const fetchIssues = async () => {
  setLoading(true);
  try {
    const data = await apiRequest("/issues");
    setIssues(()=> Array.isArray(data) ? data : []);
  } catch (err) {
    // console.error(err.message);
    setIssues([]);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchIssues();
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
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="dashboard-page">
        <Navbar/>

        <main className="dash-main">
          <div className="dash-title-row">
            <h1>{meta?.heading}</h1>
          </div>

          {loading ? (
            <p className="dash-loading">Loading tickets…</p>
          ) : issues.length === 0 ? (
            <div className="dash-empty-card">
              <p>{meta?.empty}</p>
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