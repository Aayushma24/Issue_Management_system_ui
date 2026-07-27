const API_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * apiRequest (root-level copy)
 *
 * STATUS: IMPORTED BUT BROKEN. /admin, /my-issues, /report, /profile and /team
 * import from this file, and every one of those pages fails as a result:
 *   - `token` is read on the headers line but its declaration is commented out,
 *     so any call throws a ReferenceError;
 *   - there is no default export, yet /team imports one;
 *   - it is a plain fetch helper, but the pages call it as an axios instance
 *     (apiRequest.get(...), res.data).
 * The maintained version is src/lib/apiClient.js — prefer that and delete this.
 */
export async function apiRequest(url, options = {}) {
  // const token = localStorage.getItem("token");

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