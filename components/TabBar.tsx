"use client";

import { useTabsStore } from "@/store/tabs";
import { useRequestStore } from "@/store/request";
import { useCollectionsStore } from "@/store/collections";

export default function TabBar() {
  const { tabs, activeTabId, closeTab, setActiveTab } = useTabsStore();
  const { loadRequest } = useRequestStore();
  const { collections } = useCollectionsStore();

  function handleTabClick(tabId: string, requestId: string) {
    setActiveTab(tabId);
    for (const col of collections) {
      const req = col.requests.find((r) => r.id === requestId);
      if (req) {
        loadRequest(req);
        return;
      }
    }
  }

  if (!tabs.length) return null;

  return (
    <div
      style={{
        display: "flex",
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        overflowX: "auto",
        flexShrink: 0,
        minHeight: 36,
      }}
    >
      {tabs.map((tab) => (
        <div
          key={tab.id}
          onClick={() => handleTabClick(tab.id, tab.requestId)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "0 14px",
            cursor: "pointer",
            borderRight: "1px solid var(--border)",
            background: tab.id === activeTabId ? "var(--bg)" : "transparent",
            color: tab.id === activeTabId ? "var(--text)" : "var(--muted)",
            whiteSpace: "nowrap",
            fontSize: 12,
            minWidth: 0,
          }}
        >
          <span
            style={{
              maxWidth: 140,
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {tab.isDirty ? "● " : ""}
            {tab.name}
          </span>
          <span
            onClick={(e) => {
              e.stopPropagation();
              closeTab(tab.id);
            }}
            style={{
              opacity: 0.5,
              fontSize: 14,
              lineHeight: 1,
              padding: "0 2px",
            }}
          >
            ×
          </span>
        </div>
      ))}
    </div>
  );
}
