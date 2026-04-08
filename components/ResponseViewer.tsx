"use client";

import { useRequestStore } from "@/store/request";
import StatusBadge from "./StatusBadge";

function prettyJson(raw: string): string {
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export default function ResponseViewer() {
  const {
    response,
    isLoading,
    error,
    activeResponseTab,
    setActiveResponseTab,
  } = useRequestStore();

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "6px 14px",
    cursor: "pointer",
    fontSize: 12,
    background: "none",
    border: "none",
    borderBottom: active ? "2px solid var(--accent)" : "2px solid transparent",
    color: active ? "var(--text)" : "var(--muted)",
  });

  if (isLoading) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--muted)",
          background: "var(--surface)",
        }}
      >
        Envoi en cours...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          flex: 1,
          padding: 20,
          background: "var(--surface)",
          borderLeft: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            color: "var(--status-4xx)",
            fontSize: 13,
            fontFamily: "monospace",
            whiteSpace: "pre-wrap",
          }}
        >
          Erreur : {error}
        </div>
      </div>
    );
  }

  if (!response) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--muted)",
          background: "var(--surface)",
          borderLeft: "1px solid var(--border)",
          gap: 8,
        }}
      >
        <span style={{ fontSize: 32, opacity: 0.2 }}>→</span>
        <span style={{ fontSize: 13 }}>
          Envoie une requête pour voir la réponse
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        background: "var(--surface)",
        borderLeft: "1px solid var(--border)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "8px 14px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexShrink: 0,
        }}
      >
        <StatusBadge status={response.status} />
        <span style={{ color: "var(--muted)", fontSize: 12 }}>
          {response.statusText}
        </span>
        <span
          style={{ color: "var(--muted)", fontSize: 11, marginLeft: "auto" }}
        >
          {response.elapsedMs} ms — {formatSize(response.size)}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          borderBottom: "1px solid var(--border)",
          padding: "0 14px",
          flexShrink: 0,
        }}
      >
        {(["body", "headers"] as const).map((t) => (
          <button
            key={t}
            style={tabStyle(activeResponseTab === t)}
            onClick={() => setActiveResponseTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: 14 }}>
        {activeResponseTab === "body" && (
          <pre
            style={{
              fontFamily: "monospace",
              fontSize: 12,
              color: "var(--text)",
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
              margin: 0,
            }}
          >
            {prettyJson(response.body)}
          </pre>
        )}
        {activeResponseTab === "headers" && (
          <table
            style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}
          >
            <tbody>
              {Object.entries(response.headers).map(([k, v]) => (
                <tr key={k} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td
                    style={{
                      padding: "5px 8px",
                      color: "var(--muted)",
                      width: "35%",
                      fontFamily: "monospace",
                    }}
                  >
                    {k}
                  </td>
                  <td
                    style={{
                      padding: "5px 8px",
                      color: "var(--text)",
                      fontFamily: "monospace",
                      wordBreak: "break-all",
                    }}
                  >
                    {v}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
