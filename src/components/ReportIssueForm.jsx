"use client";

import { useState } from "react";
import { apiRequest } from "@/lib/apiClient";

/**
 * ReportIssueForm
 *
 * Modal form for filing a new ticket (title, description, category). POSTs to
 * /issues, hands the created issue back through `onCreated` so the parent can
 * prepend it to its list, then closes. Clicking the overlay dismisses it.
 *
 * STATUS: USED — opened by the dashboard page (src/app/dashboard/page.jsx) via
 * the "+ Report an Issue" button, for role === "reporter".
 * Note: src/app/report/page.jsx is a separate full-page version of the same
 * flow, so the two duplicate each other (and their category lists differ).
 */
export default function ReportIssueForm({ onClose, onCreated }) {
  const [form, setForm] = useState({ title: "", description: "", category: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await apiRequest("/issues", {
        method: "POST",
        body: JSON.stringify(form),
      });
      onCreated(data.issue);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <span className="form-tab">NEW TICKET</span>
        <h2>Report an issue.</h2>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label>Title</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Short summary of the problem"
            required
          />

          <label>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="What happened? Steps to reproduce, if any."
            rows={4}
            required
          />
          {/* FIXME: Fixing the value of the category */}
          <label>Category</label>
          <select name="category" value={form.category} onChange={handleChange} required>
            <option value="">Select a category</option>
            <option value="Electricity">Electricity</option>
            <option value="Water">Water</option>
            <option value="Road">Road</option>
            <option value="Internet">Internet</option>
            <option value="Cleaning">Cleaning</option>
            <option value="Security">Security</option>
            <option value="Other">Other</option>
          </select>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Filing…" : "File Ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}