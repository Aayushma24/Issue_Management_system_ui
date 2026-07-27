const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * apiRequest
 *
 * The working API helper: prefixes the base URL, attaches the bearer token from
 * localStorage, sets the JSON content type, and throws on a non-2xx response so
 * callers can just try/catch. Returns the parsed body — it is NOT an axios
 * instance, so there is no `.get()`/`.post()` and no `res.data`.
 *
 * STATUS: USED — by the dashboard page, IssueDetailModal and ReportIssueForm.
 *
 * Note: api/apiClient.jsx at the project root is a second, broken copy of this
 * (it reads a `token` variable it never declares). The pages that import from
 * there — /admin, /team, /my-issues, /report, /profile — should be pointed at
 * this file instead.
 */
export async function apiRequest(url, options = {}) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}