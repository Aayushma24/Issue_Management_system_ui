"use client";

/**
 * Filter
 *
 * Two dropdowns (status + category) that drive a parent's filter state.
 * Fully controlled — the parent owns `selectedStatus` / `selectedCategory`
 * and passes the setters down.
 *
 * STATUS: NOT USED. No file imports this component. Note also that its
 * category list (Garbage) does not match the categories ReportIssueForm
 * submits (Cleaning, Security), so the lists must be reconciled before wiring
 * it into a page.
 */
export default function Filter({
  selectedStatus,
  setSelectedStatus,
  selectedCategory,
  setSelectedCategory,
}) {
  const statusOptions = [
    "All",
    "Pending",
    "Assigned",
    "In Progress",
    "Resolved",
    "Closed",
  ];

  const categoryOptions = [
    "All",
    "Water",
    "Electricity",
    "Road",
    "Internet",
    "Garbage",
    "Other",
  ];

  return (
    <div
      style={{
        display: "flex",
        gap: "20px",
        marginBottom: "20px",
        flexWrap: "wrap",
      }}
    >
      {/* Status Filter */}
      <div>
        <label
          style={{
            display: "block",
            marginBottom: "6px",
            fontWeight: "bold",
          }}
        >
          Status
        </label>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          style={{
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            minWidth: "180px",
          }}
        >
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {/* Category Filter */}
      <div>
        <label
          style={{
            display: "block",
            marginBottom: "6px",
            fontWeight: "bold",
          }}
        >
          Category
        </label>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            minWidth: "180px",
          }}
        >
          {categoryOptions.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}