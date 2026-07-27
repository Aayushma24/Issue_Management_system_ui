"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { apiRequest } from "@/lib/apiClient";

// Must match the category enum on the Issue model.
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
 * ReportPage — route "/report"
 *
 * Full-page "file a new ticket" form (title, description, category). POSTs to
 * /issues and sends the reporter back to /my-issues, where the new ticket shows
 * up at the top of the list.
 *
 * STATUS: USED — linked from the Navbar and from the My Issues page. The
 * ReportIssueForm modal is the same flow in a dialog; nothing opens it now that
 * the dashboard is team/admin only, so this page is the one live create path.
 */
export default function ReportPage() {
  const router = useRouter();

  const [form, setForm] = useState({ title: "", description: "", category: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiRequest("/issues", {
        method: "POST",
        body: JSON.stringify(form),
      });
      router.push("/my-issues");
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["reporter"]}>
      <div className="dashboard-page">
        <Navbar />

        <main className="dash-main">
          <div className="form-card">
            <span className="form-tab">NEW TICKET</span>
            <h1>Report an issue.</h1>
            <p className="form-subtitle">
              Tell us what broke. An admin routes it to the right team from here.
            </p>

            {error && <div className="form-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <label htmlFor="title">Title</label>
              <input
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Short summary of the problem"
                required
              />

              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="What happened? Steps to reproduce, if any."
                rows={5}
                required
              />

              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                required
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="btn btn-primary form-submit"
                disabled={loading}
              >
                {loading ? "Filing…" : "File Ticket"}
              </button>
            </form>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
