"use client";

// Canonical status pipeline. The index doubles as the `stamp-N` CSS class
// suffix, so the colour of the stamp tracks how far along the ticket is.
const STATUS_ORDER = ["Pending", "Assigned", "Investigating", "In Progress", "Resolved", "Closed"];

/**
 * IssueCard
 *
 * Compact ticket-stub row for an issue list: ID on the left, title/category/
 * assigned team in the middle, colour-coded status stamp on the right.
 * Clicking anywhere on the card hands the whole issue object to `onClick`.
 *
 * STATUS: USED — rendered by the dashboard page (src/app/dashboard/page.jsx),
 * which passes `setSelectedIssue` as `onClick` to open IssueDetailModal.
 * Note: the dashboard currently only renders these for role === "admin".
 * Unrelated: src/app/team/page.jsx defines its own local component of the
 * same name; that one is a separate implementation, not this file.
 */
export default function IssueCard({ issue, onClick }) {
  const statusIndex = STATUS_ORDER.indexOf(issue.status);

  return (
    <div className="issue-card" onClick={() => onClick(issue)}>
      <div className="issue-card-left">
        <span className="stub-label">TICKET</span>
        <span className="stub-id">{issue.issueId}</span>
      </div>
      <div className="issue-card-body">
        <p className="issue-card-title">{issue.title}</p>
        <div className="issue-card-meta">
          <span className="issue-card-category">{issue.category}</span>
          {issue.assignedTeam && (
            <span className="issue-card-team">→ {issue.assignedTeam.teamName}</span>
          )}
        </div>
      </div>
      <div className="issue-card-right">
        <span className={`stamp stamp-${statusIndex}`}>{issue.status.toUpperCase()}</span>
      </div>
    </div>
  );
}