const FILTERS = ["all", "active", "completed"];

export default function FilterBar({ current, onChange }) {
  return (
    <div id="filter-buttons">
      {FILTERS.map((f) => (
        <button
          key={f}
          className={`filter-btn ${current === f ? "active" : ""}`}
          onClick={() => onChange(f)}
        >
          {f.charAt(0).toUpperCase() + f.slice(1)}
        </button>
      ))}
    </div>
  );
}
