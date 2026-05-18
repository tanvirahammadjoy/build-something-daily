export default function SearchBar({ value, onChange }) {
  return (
    <input
      id="search"
      placeholder="🔍 Search todos..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
