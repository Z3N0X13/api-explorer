"use client";

import AiPanel from "@/components/AiPanel";
import CollectionSidebar from "@/components/CollectionsSidebar";
import EnvBar from "@/components/EnvBar";
import RequestPanel from "@/components/RequestPanel";
import ResponseViewer from "@/components/ResponseViewer";
import TabBar from "@/components/TabBar";
import { useCollectionsStore } from "@/store/collections";
import { useEnvironmentsStore } from "@/store/environments";
import { useEffect } from "react";

export default function HomePage() {
  const { init: initCollections } = useCollectionsStore();
  const { init: initEnvs } = useEnvironmentsStore();

  useEffect(() => {
    initCollections();
    initEnvs();
  }, [initCollections, initEnvs]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <header
        style={{
          height: 44,
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          gap: 12,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontWeight: 700,
            fontSize: 14,
            color: "var(--accent)",
            letterSpacing: "-0.01em",
          }}
        >
          API Explorer
        </span>
        <span style={{ color: "var(--border)", fontSize: 16 }}>|</span>
        <EnvBar />
      </header>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <CollectionSidebar />
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <TabBar />
          <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
            <RequestPanel />
            <ResponseViewer />
            <AiPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
