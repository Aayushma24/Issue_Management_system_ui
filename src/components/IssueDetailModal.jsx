"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/apiClient";

// Same pipeline as IssueCard — the index drives the `stamp-N` CSS class.
const STATUS_ORDER = ["Pending", "Assigned", "Investigating", "In Progress", "Resolved", "Closed"];

/**
 * IssueDetailModal
 *
 * Full detail view for one ticket, plus every action available on it. Which
 * action blocks appear depends on the viewer's role and the ticket's status:
 *   - owner + Pending           → delete the ticket
 *   - admin + Pending           → pick a team from the dropdown and assign
 *   - team/admin + in-flight    → investigation notes/remarks, In Progress or Resolved
 *   - team/admin + Resolved     → verify the fix (pass, or fail to reopen)
 *   - admin + Resolved+verified → close the ticket
 * Every action calls the API and passes the updated issue up via `onUpdated`
 * (or the deleted id via `onDeleted`) so the parent list stays in sync.
 *
 * STATUS: USED — opened by src/app/dashboard/page.jsx when an IssueCard is
 * clicked. It is the only place in the app where assign/investigate/verify/
 * close are reachable.
 */
export default function IssueDetailModal({ issue, user, onClose, onUpdated, onDeleted }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [teamId, setTeamId] = useState("");
  const [teams, setTeams] = useState([]);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [notes, setNotes] = useState(issue.investigationNotes || "");
  const [remarks, setRemarks] = useState(issue.remarks || "");

  const isOwner = user.id === issue.reporter?._id || user.id === issue.reporter;
  const canDelete = isOwner && issue.status === "Pending";
  const canAssign = user.role === "admin" && issue.status === "Pending";

  // Teams for the assign dropdown. Only the admin on a Pending ticket ever sees
  // it, so don't spend the request otherwise.
  useEffect(() => {
    if (!canAssign) return;

    let cancelled = false;
    setTeamsLoading(true);

    apiRequest("/teams")
      .then((data) => {
        if (cancelled) return;
        const list = Array.isArray(data) ? data : data.teams || [];
        // The API rejects an assignment whose team category does not match the
        // ticket's, so only offer the teams that can actually take it.
        setTeams(list.filter((team) => team.category === issue.category));
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setTeamsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [canAssign, issue.category]);

  const runAction = async (url, body, method = "PATCH") => {
    setError("");
    setLoading(true);
    try {
      const data = await apiRequest(url, { method, body: JSON.stringify(body) });
      onUpdated(data.issue);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = () => {
    if (!teamId) return setError("Select a team");
    runAction(`/issues/assign/${issue.issueId}`, { teamId }, "PUT");
  };

  const handleSaveInvestigation = (status) => {
    runAction(`/issues/investigate/${issue.issueId}`, {
      investigationNotes: notes,
      remarks,
      status,
    });
  };

  const handleVerify = (passed) => {
    runAction(`/issues/verify/${issue.issueId}`, { passed });
  };

  const handleClose = () => {
    runAction(`/issues/close/${issue.issueId}`, {});
  };

  const handleDelete = async () => {
    setError("");
    setLoading(true);
    try {
      await apiRequest(`/issues/${issue.issueId}`, { method: "DELETE" });
      onDeleted(issue._id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-card--wide" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-row">
          <span className="stub-id">{issue.issueId}</span>
          <span className={`stamp stamp-${STATUS_ORDER.indexOf(issue.status)}`}>
            {issue.status.toUpperCase()}
          </span>
        </div>

        <h2>{issue.title}</h2>
        <p className="issue-detail-desc">{issue.description}</p>
        <div className="issue-detail-meta">
          <span>Category: <strong>{issue.category}</strong></span>
          {issue.assignedTeam && <span>Team: <strong>{issue.assignedTeam.teamName}</strong></span>}
          <span>Reported by: <strong>{issue.reporter?.fullName || "—"}</strong></span>
        </div>

        {error && <div className="form-error">{error}</div>}

        {canDelete && (
          <div className="action-block">
            <p className="action-block-label">Your ticket</p>
            <button className="btn btn-ghost" onClick={handleDelete} disabled={loading}>
              Delete Ticket
            </button>
          </div>
        )}

        {canAssign && (
          <div className="action-block">
            <p className="action-block-label">Assign to a {issue.category} team</p>
            <div className="inline-form">
              <select
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                disabled={teamsLoading || teams.length === 0}
              >
                <option value="">
                  {teamsLoading
                    ? "Loading teams…"
                    : teams.length === 0
                      ? `No ${issue.category} team yet — create one on Teams`
                      : "Select a team"}
                </option>
                {teams.map((team) => (
                  <option key={team._id} value={team._id}>
                    {team.teamName}
                  </option>
                ))}
              </select>
              <button
                className="btn btn-primary"
                onClick={handleAssign}
                disabled={loading || !teamId}
              >
                Assign
              </button>
            </div>
          </div>
        )}

        {["team", "admin"].includes(user.role) &&
          ["Assigned", "Investigating", "In Progress"].includes(issue.status) && (
            <div className="action-block">
              <p className="action-block-label">Investigation</p>
              <label>Notes</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
              <label>Remarks</label>
              <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={2} />
              <div className="modal-actions">
                <button
                  className="btn btn-ghost"
                  onClick={() => handleSaveInvestigation("In Progress")}
                  disabled={loading}
                >
                  Save as In Progress
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => handleSaveInvestigation("Resolved")}
                  disabled={loading}
                >
                  Mark Resolved
                </button>
              </div>
            </div>
          )}

        {["team", "admin"].includes(user.role) && issue.status === "Resolved" && !issue.verified && (
          <div className="action-block">
            <p className="action-block-label">Verify the fix</p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => handleVerify(false)} disabled={loading}>
                Fails — Reopen
              </button>
              <button className="btn btn-primary" onClick={() => handleVerify(true)} disabled={loading}>
                Passes
              </button>
            </div>
          </div>
        )}

        {user.role === "admin" && issue.status === "Resolved" && issue.verified && (
          <div className="action-block">
            <p className="action-block-label">Ready for closure</p>
            <button className="btn btn-primary" onClick={handleClose} disabled={loading}>
              Close Ticket
            </button>
          </div>
        )}

        <button className="btn btn-ghost modal-close-btn" onClick={onClose}>
          Close Window
        </button>
      </div>
    </div>
  );
}