"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { apiRequest } from "@/lib/apiClient";

// Must match the category enum on the Team model.
const CATEGORIES = [
  "Electricity",
  "Water",
  "Road",
  "Internet",
  "Cleaning",
  "Security",
  "Other",
];

/**
 * AdminTeamsPage — route "/admin"
 *
 * Where teams come from. Only an admin can open it, and only an admin can
 * create a team (POST /teams) or put someone on one: members are ordinary
 * registered users, picked from the pool of accounts that aren't on a team yet
 * (GET /users?unassigned=true) and added with POST /teams/:id/members, which
 * flips their role to "team". Removing a member puts them back to reporter.
 *
 * Issue triage is not here — that lives in IssueDetailModal on the dashboard.
 *
 * STATUS: USED — linked from the Navbar as "Teams" for role === "admin".
 */
export default function AdminTeamsPage() {
  const [teams, setTeams] = useState([]);
  const [members, setMembers] = useState({}); // teamId -> member[]
  const [pool, setPool] = useState([]); // users with no team
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({ teamName: "", category: "", description: "" });
  const [picked, setPicked] = useState({}); // teamId -> selected userId

  const loadPool = () =>
    apiRequest("/users?unassigned=true")
      .then((data) => setPool(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message));

  const loadTeams = async () => {
    const data = await apiRequest("/teams");
    const list = Array.isArray(data) ? data : [];
    setTeams(list);

    const rosters = await Promise.all(
      list.map((team) =>
        apiRequest(`/teams/${team._id}/members`)
          .then((rows) => [team._id, Array.isArray(rows) ? rows : []])
          .catch(() => [team._id, []]),
      ),
    );
    setMembers(Object.fromEntries(rosters));
  };

  useEffect(() => {
    Promise.all([loadTeams(), loadPool()])
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const team = await apiRequest("/teams", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setTeams((prev) => [...prev, team]);
      setMembers((prev) => ({ ...prev, [team._id]: [] }));
      setForm({ teamName: "", category: "", description: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleAddMember = async (teamId) => {
    const userId = picked[teamId];
    if (!userId) return setError("Pick a user to add");

    setError("");
    setBusy(true);
    try {
      const data = await apiRequest(`/teams/${teamId}/members`, {
        method: "POST",
        body: JSON.stringify({ userId }),
      });
      setMembers((prev) => ({ ...prev, [teamId]: [...(prev[teamId] || []), data.member] }));
      setPool((prev) => prev.filter((u) => u._id !== userId));
      setPicked((prev) => ({ ...prev, [teamId]: "" }));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleRemoveMember = async (teamId, member) => {
    setError("");
    setBusy(true);
    try {
      await apiRequest(`/teams/${teamId}/members/${member._id}`, { method: "DELETE" });
      setMembers((prev) => ({
        ...prev,
        [teamId]: (prev[teamId] || []).filter((m) => m._id !== member._id),
      }));
      setPool((prev) => [...prev, { ...member, role: "reporter" }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="dashboard-page">
        <Navbar />

        <main className="dash-main">
          <div className="dash-title-row">
            <h1>Teams and their members.</h1>
          </div>

          {error && <div className="form-error">{error}</div>}

          <div className="team-card team-create-card">
            <p className="action-block-label">New team</p>
            <form className="team-create-form" onSubmit={handleCreate}>
              <input
                name="teamName"
                value={form.teamName}
                onChange={(e) => setForm({ ...form, teamName: e.target.value })}
                placeholder="Team name — e.g. Water Team"
                required
              />
              <select
                name="category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                required
              >
                <option value="">Category</option>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <input
                name="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="What they handle (optional)"
              />
              <button type="submit" className="btn btn-primary" disabled={busy}>
                Create Team
              </button>
            </form>
          </div>

          {loading ? (
            <p className="dash-loading">Loading teams…</p>
          ) : teams.length === 0 ? (
            <div className="dash-empty-card">
              <p>No teams yet. Create the first one above.</p>
            </div>
          ) : (
            <div className="issue-list">
              {teams.map((team) => (
                <div key={team._id} className="team-card">
                  <div className="team-card-head">
                    <div className="team-card-headings">
                      <p className="team-card-name">{team.teamName}</p>
                      <div className="issue-card-meta">
                        <span className="issue-card-category">{team.category}</span>
                        {team.description && (
                          <span className="team-card-desc">{team.description}</span>
                        )}
                      </div>
                    </div>
                    <span className="stamp stamp-1">
                      {(members[team._id] || []).length} MEMBER
                      {(members[team._id] || []).length === 1 ? "" : "S"}
                    </span>
                  </div>

                  {(members[team._id] || []).length > 0 && (
                    <ul className="member-list">
                      {members[team._id].map((member) => (
                        <li key={member._id} className="member-row">
                          <span className="member-name">{member.fullName}</span>
                          <span className="member-email">{member.email}</span>
                          <button
                            className="btn btn-ghost btn-small"
                            onClick={() => handleRemoveMember(team._id, member)}
                            disabled={busy}
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  <p className="action-block-label team-card-sub">Add a member</p>
                  <div className="inline-form">
                    <select
                      value={picked[team._id] || ""}
                      onChange={(e) =>
                        setPicked((prev) => ({ ...prev, [team._id]: e.target.value }))
                      }
                      disabled={pool.length === 0}
                    >
                      <option value="">
                        {pool.length === 0
                          ? "No unassigned users"
                          : "Select a registered user"}
                      </option>
                      {pool.map((candidate) => (
                        <option key={candidate._id} value={candidate._id}>
                          {candidate.fullName} — {candidate.email}
                        </option>
                      ))}
                    </select>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleAddMember(team._id)}
                      disabled={busy || !picked[team._id]}
                    >
                      Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
