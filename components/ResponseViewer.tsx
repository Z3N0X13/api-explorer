"use client";

import { useRequestStore } from "@/store/request";
import StatusBadge from "./StatusBadge";
import CodeEditor from "./CodeEditor";

function prettyJson(raw: string): string {
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}

function detectLang(headers: Record<string, string>): "json" | "text" {
  const ct = headers["content-type"] ?? "";
  if (ct.includes("json")) return "json";
  return "text";
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
          borderLeft: "1px solid var(--border)",
          fontSize: 13,
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
        <CodeEditor
          value={`Erreur réseau :\n\n${error}`}
          readOnly
          lang="text"
          minHeight="100px"
        />
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
          gap: 10,
        }}
      >
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <path
            d="M8 20h24M24 14l6 6-6 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.25"
          />
        </svg>
        <span style={{ fontSize: 13 }}>
          Envoie une requête pour voir la réponse
        </span>
      </div>
    );
  }

  const lang = detectLang(response.headers);
  const displayBody =
    lang === "json" ? prettyJson(response.body) : response.body;

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
          style={{
            marginLeft: "auto",
            color: "var(--muted)",
            fontSize: 11,
            display: "flex",
            gap: 12,
          }}
        >
          <span
            style={{
              color:
                response.elapsedMs > 1000
                  ? "var(--status-4xx)"
                  : response.elapsedMs > 300
                    ? "var(--status-3xx)"
                    : "var(--status-2xx)",
            }}
          >
            {response.elapsedMs} ms
          </span>
          <span>{formatSize(response.size)}</span>
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
        <span
          style={{
            marginLeft: "auto",
            alignSelf: "center",
            fontSize: 10,
            color: "var(--muted)",
            fontFamily: "monospace",
          }}
        >
          {lang.toUpperCase()}
        </span>
      </div>

      <div style={{ flex: 1, overflow: "auto" }}>
        {activeResponseTab === "body" && (
          <CodeEditor
            value={displayBody}
            readOnly
            lang={lang}
            minHeight="100%"
          />
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
                      padding: "6px 14px",
                      color: "var(--muted)",
                      width: "35%",
                      fontFamily: "monospace",
                    }}
                  >
                    {k}
                  </td>
                  <td
                    style={{
                      padding: "6px 14px",
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
