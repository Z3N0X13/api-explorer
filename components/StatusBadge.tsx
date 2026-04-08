export default function StatusBadge({ status }: { status: number }) {
  const color =
    status >= 500
      ? "var(--status-5xx)"
      : status >= 400
        ? "var(--status-4xx)"
        : status >= 300
          ? "var(--status-3xx)"
          : "var(--status-2xx)";

  return (
    <span
      style={{
        color,
        fontWeight: 600,
        fontSize: 12,
        background: `${color}18`,
        border: `1px solid ${color}44`,
        borderRadius: 4,
        padding: "2px 8px",
      }}
    >
      {status}
    </span>
  );
}
