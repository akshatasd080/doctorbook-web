export default function StatusBadge({ value }) {
  if (!value) return null;
  const key = String(value).toLowerCase();
  return <span className={`badge badge-${key}`}>{value}</span>;
}
