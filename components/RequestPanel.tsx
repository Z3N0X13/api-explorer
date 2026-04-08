"use client";

import { useRequestStore } from "@/store/request";
import { useEnvironmentsStore } from "@/store/environments";
import { useCollectionsStore } from "@/store/collections";
import { useTabsStore } from "@/store/tabs";
import { sendRequest } from "@/lib/http";
import { interpolateRequest } from "@/lib/interpolate";
import type { HttpMethod } from "@/types";
import Select from "@/components/ui/Select";

const METHODS: HttpMethod[] = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "HEAD",
  "OPTIONS",
];

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: "var(--method-get)",
  POST: "var(--method-post)",
  PUT: "var(--method-put)",
  PATCH: "var(--method-patch)",
  DELETE: "var(--method-delete)",
  HEAD: "var(--muted)",
  OPTIONS: "var(--muted)",
};

export default function RequestPanel() {
  const {
    request,
    isLoading,
    activeBodyTab,
    setMethod,
    setUrl,
    setBody,
    setBodyType,
    setActiveBodyTab,
    addHeader,
    updateHeader,
    removeHeader,
    addParam,
    updateParam,
    removeParam,
    setResponse,
    setLoading,
    setError,
  } = useRequestStore();

  const { activeVariables } = useEnvironmentsStore();
  const { updateRequest } = useCollectionsStore();
  const { tabs, activeTabId, markClean } = useTabsStore();

  async function handleSend() {
    if (!request.url.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const vars = activeVariables();
      const { url, headers, body } = interpolateRequest(
        request.url,
        request.headers,
        request.body,
        vars,
      );
      const interpolated = {
        ...request,
        url,
        headers: request.headers.map((h, i) => ({
          ...h,
          value: headers[i]?.value ?? h.value,
        })),
        body,
      };
      const res = await sendRequest(interpolated);
      setResponse(res);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  function handleSave() {
    if (!request.collectionId) return;
    updateRequest(request.collectionId, request);
    const tab = tabs.find((t) => t.id === activeTabId);
    if (tab) markClean(tab.id);
  }

  const tabStyle = (active: boolean) =>
    ({
      padding: "6px 14px",
      cursor: "pointer",
      fontSize: 12,
      borderBottom: active
        ? "2px solid var(--accent)"
        : "2px solid transparent",
      color: active ? "var(--text)" : "var(--muted)",
      background: "none",
      border: "none",
    }) as React.CSSProperties;

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: "var(--bg)",
      }}
    >
      <div
        style={{
          padding: "10px 14px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          gap: 8,
          alignItems: "center",
        }}
      >
        <Select
          value={request.method}
          onChange={(val: string) => setMethod(val as HttpMethod)}
          options={METHODS.map((m) => ({
            value: m,
            label: m,
            color: METHOD_COLORS[m],
          }))}
          style={{ width: 100, fontWeight: 600 }}
        />
        <input
          value={request.url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="https://api.exemple.com/endpoint"
          style={{ flex: 1, fontFamily: "monospace", fontSize: 13 }}
        />
        <button
          className="primary"
          onClick={handleSend}
          disabled={isLoading}
          style={{ minWidth: 70 }}
        >
          {isLoading ? "..." : "Envoyer"}
        </button>
        {request.collectionId && (
          <button onClick={handleSave} style={{ fontSize: 12 }}>
            Sauver
          </button>
        )}
      </div>

      <div
        style={{
          display: "flex",
          borderBottom: "1px solid var(--border)",
          padding: "0 14px",
        }}
      >
        {(["params", "headers", "body"] as const).map((t) => (
          <button
            key={t}
            style={tabStyle(activeBodyTab === t)}
            onClick={() => setActiveBodyTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
            {t === "headers" &&
              request.headers.filter((h) => h.enabled && h.key).length > 0 && (
                <span
                  style={{
                    marginLeft: 4,
                    fontSize: 10,
                    color: "var(--accent)",
                  }}
                >
                  {request.headers.filter((h) => h.enabled && h.key).length}
                </span>
              )}
            {t === "params" &&
              request.params.filter((p) => p.enabled && p.key).length > 0 && (
                <span
                  style={{
                    marginLeft: 4,
                    fontSize: 10,
                    color: "var(--accent)",
                  }}
                >
                  {request.params.filter((p) => p.enabled && p.key).length}
                </span>
              )}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "12px 14px" }}>
        {activeBodyTab === "params" && (
          <div>
            {request.params.map((p) => (
              <div
                key={p.id}
                style={{
                  display: "flex",
                  gap: 6,
                  marginBottom: 6,
                  alignItems: "center",
                }}
              >
                <input
                  type="checkbox"
                  checked={p.enabled}
                  onChange={(e) =>
                    updateParam(p.id, "enabled", e.target.checked)
                  }
                  style={{ width: "auto", padding: 0 }}
                />
                <input
                  value={p.key}
                  onChange={(e) => updateParam(p.id, "key", e.target.value)}
                  placeholder="clé"
                  style={{ width: 160, fontSize: 12 }}
                />
                <input
                  value={p.value}
                  onChange={(e) => updateParam(p.id, "value", e.target.value)}
                  placeholder="valeur"
                  style={{ flex: 1, fontSize: 12 }}
                />
                <button
                  onClick={() => removeParam(p.id)}
                  className="danger"
                  style={{ padding: "3px 8px" }}
                >
                  ×
                </button>
              </div>
            ))}
            <button onClick={addParam} style={{ fontSize: 12, marginTop: 4 }}>
              + Paramètre
            </button>
          </div>
        )}

        {activeBodyTab === "headers" && (
          <div>
            {request.headers.map((h) => (
              <div
                key={h.id}
                style={{
                  display: "flex",
                  gap: 6,
                  marginBottom: 6,
                  alignItems: "center",
                }}
              >
                <input
                  type="checkbox"
                  checked={h.enabled}
                  onChange={(e) =>
                    updateHeader(h.id, "enabled", e.target.checked)
                  }
                  style={{ width: "auto", padding: 0 }}
                />
                <input
                  value={h.key}
                  onChange={(e) => updateHeader(h.id, "key", e.target.value)}
                  placeholder="Header-Name"
                  style={{ width: 180, fontSize: 12 }}
                />
                <input
                  value={h.value}
                  onChange={(e) => updateHeader(h.id, "value", e.target.value)}
                  placeholder="valeur"
                  style={{ flex: 1, fontSize: 12 }}
                />
                <button
                  onClick={() => removeHeader(h.id)}
                  className="danger"
                  style={{ padding: "3px 8px" }}
                >
                  ×
                </button>
              </div>
            ))}
            <button onClick={addHeader} style={{ fontSize: 12, marginTop: 4 }}>
              + Header
            </button>
          </div>
        )}

        {activeBodyTab === "body" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", gap: 8 }}>
              {(["none", "json", "text"] as const).map((t) => (
                <label
                  key={t}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="bodyType"
                    value={t}
                    checked={request.bodyType === t}
                    onChange={() => setBodyType(t)}
                    style={{ width: "auto", padding: 0 }}
                  />
                  {t}
                </label>
              ))}
            </div>
            {request.bodyType !== "none" && (
              <textarea
                value={request.body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={
                  request.bodyType === "json"
                    ? '{\n  "key": "value"\n}'
                    : "Corps de la requête..."
                }
                style={{
                  flex: 1,
                  minHeight: 200,
                  fontFamily: "monospace",
                  fontSize: 12,
                  resize: "vertical",
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
