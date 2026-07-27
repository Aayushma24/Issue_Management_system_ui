"use client";

/**
 * SearchBar
 *
 * Controlled single-line text input for free-text search. Holds no state of
 * its own — the parent owns `searchTerm` and does the actual filtering.
 *
 * STATUS: NOT USED. No file imports this component.
 */
export default function SearchBar({
  searchTerm,
  setSearchTerm,
  placeholder = "Search issues..."
}) {
  return (
    <div
      style={{
        marginBottom: "20px",
        width: "100%",
      }}
    >
      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          width: "100%",
          padding: "12px 16px",
          fontSize: "16px",
          border: "1px solid #d1d5db",
          borderRadius: "8px",
          outline: "none",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}