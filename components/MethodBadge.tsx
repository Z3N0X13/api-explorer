import type { HttpMethod } from "@/types";

const colors: Record<HttpMethod, string> = {
  GET:     "var(--method-get)",
  POST:    "var(--method-post)",
  PUT:     "var(--method-put)",
  PATCH:   "var(--method-patch)",
  DELETE:  "var(--method-delete)",
  HEAD:    "var(--muted)",
  OPTIONS: "var(--muted)",
};

export default function MethodBadge({ method }: { method: HttpMethod }) {
  return (
    <span
      style={{
        color: colors[method],
        fontWeight: 600,
        fontSize: 11,
        minWidth: 52,
        display: "inline-block",
        letterSpacing: "0.03em",
      }}
    >
      {method}
    </span>
  );
}
