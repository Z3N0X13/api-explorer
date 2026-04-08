"use client";

import { useEffect, useState } from "react";
import { useCollectionsStore } from "@/store/collections";
import { useRequestStore } from "@/store/request";
import { useTabsStore } from "@/store/tabs";
import MethodBadge from "./MethodBadge";
import type { ApiRequest } from "@/types";

export default function CollectionSidebar() {
  const {
    collections,
    init,
    addCollection,
    toggleCollection,
    removeCollection,
    addRequest,
    removeRequest,
  } = useCollectionsStore();
  const { loadRequest } = useRequestStore();
  const { openTab } = useTabsStore();
  const [newColName, setNewColName] = useState("");
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    init();
  }, [init]);

  function handleOpenRequest(req: ApiRequest) {
    loadRequest(req);
    openTab(req);
  }

  function handleAddCollection() {
    if (!newColName.trim()) return;
    addCollection(newColName.trim());
    setNewColName("");
    setShowInput(false);
  }

  return (
    <aside
      style={{
        width: 230,
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          padding: "10px 12px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontSize: 11,
            color: "var(--muted)",
            letterSpacing: "0.06em",
          }}
        >
          COLLECTIONS
        </span>
        <button
          onClick={() => setShowInput((v) => !v)}
          style={{ padding: "2px 8px", fontSize: 12 }}
          title="Nouvelle collection"
        >
          +
        </button>
      </div>

      {showInput && (
        <div
          style={{
            padding: "8px 12px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            gap: 6,
          }}
        >
          <input
            autoFocus
            value={newColName}
            onChange={(e) => setNewColName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddCollection()}
            placeholder="Nom de la collection"
            style={{ flex: 1, fontSize: 12 }}
          />
          <button
            onClick={handleAddCollection}
            className="primary"
            style={{ padding: "4px 8px" }}
          >
            OK
          </button>
        </div>
      )}

      <div style={{ flex: 1, overflowY: "auto" }}>
        {collections.map((col) => (
          <div key={col.id}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "7px 12px",
                cursor: "pointer",
                gap: 6,
                borderBottom: "1px solid var(--border)",
              }}
              onClick={() => toggleCollection(col.id)}
            >
              <span style={{ color: "var(--muted)", fontSize: 10 }}>
                {col.isOpen ? "▾" : "▸"}
              </span>
              <span
                style={{
                  flex: 1,
                  fontWeight: 500,
                  fontSize: 12,
                  color: "var(--text)",
                }}
              >
                {col.name}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addRequest(col.id);
                }}
                style={{ padding: "1px 6px", fontSize: 11, opacity: 0.6 }}
                title="Ajouter une requête"
              >
                +
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm("Supprimer cette collection ?"))
                    removeCollection(col.id);
                }}
                className="danger"
                style={{ padding: "1px 6px", fontSize: 11 }}
                title="Supprimer"
              >
                ×
              </button>
            </div>

            {col.isOpen && (
              <div>
                {col.requests.map((req) => (
                  <div
                    key={req.id}
                    onClick={() => handleOpenRequest(req)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "6px 16px",
                      cursor: "pointer",
                      borderBottom: "1px solid #1f1f1f",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "var(--surface2)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <MethodBadge method={req.method} />
                    <span
                      style={{
                        flex: 1,
                        fontSize: 12,
                        color: "var(--text)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {req.name}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeRequest(col.id, req.id);
                      }}
                      style={{
                        padding: "0 4px",
                        fontSize: 12,
                        opacity: 0,
                        background: "none",
                        border: "none",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.opacity = "1")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.opacity = "0")
                      }
                      title="Supprimer"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {col.requests.length === 0 && (
                  <div
                    style={{
                      padding: "8px 16px",
                      color: "var(--muted)",
                      fontSize: 11,
                    }}
                  >
                    Aucune requête
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}
