"use client";

import { useEffect, useState } from "react";
import { useEnvironmentsStore } from "@/store/environments";
import Select from "@/components/ui/Select";

export default function EnvBar() {
  const {
    environments,
    activeEnvId,
    init,
    setActiveEnv,
    addEnvironment,
    setVariable,
  } = useEnvironmentsStore();
  const [showPanel, setShowPanel] = useState(false);
  const [newEnvName, setNewEnvName] = useState("");

  useEffect(() => {
    init();
  }, [init]);

  const activeEnv = environments.find((e) => e.id === activeEnvId);

  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "0 16px",
          height: 38,
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <span style={{ fontSize: 11, color: "var(--muted)" }}>ENV</span>
        <Select
          value={activeEnvId ?? ""}
          onChange={(val: string) => setActiveEnv(val || null)}
          options={[
            { value: "", label: "Aucun environnement" },
            ...environments.map((e) => ({ value: e.id, label: e.name })),
          ]}
          style={{ minWidth: 160 }}
        />
        <button
          onClick={() => setShowPanel((v) => !v)}
          style={{ padding: "3px 8px", fontSize: 11 }}
        >
          Gérer
        </button>
      </div>

      {showPanel && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            zIndex: 50,
            width: 380,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: 16,
          }}
        >
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <input
              value={newEnvName}
              onChange={(e) => setNewEnvName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newEnvName.trim()) {
                  addEnvironment(newEnvName.trim());
                  setNewEnvName("");
                }
              }}
              placeholder="Nom du nouvel environnement"
              style={{ flex: 1, fontSize: 12 }}
            />
            <button
              className="primary"
              onClick={() => {
                if (newEnvName.trim()) {
                  addEnvironment(newEnvName.trim());
                  setNewEnvName("");
                }
              }}
            >
              Créer
            </button>
          </div>

          {activeEnv && (
            <div>
              <div
                style={{ fontSize: 11, color: "var(--muted)", marginBottom: 8 }}
              >
                Variables de « {activeEnv.name} »
              </div>
              {Object.entries(activeEnv.variables).map(([key, value]) => (
                <div
                  key={key}
                  style={{ display: "flex", gap: 6, marginBottom: 6 }}
                >
                  <input
                    value={key}
                    readOnly
                    style={{ width: 120, fontSize: 11 }}
                  />
                  <input
                    value={value}
                    onChange={(e) =>
                      setVariable(activeEnv.id, key, e.target.value)
                    }
                    style={{ flex: 1, fontSize: 11 }}
                    placeholder="valeur"
                  />
                </div>
              ))}
              <button
                onClick={() =>
                  setVariable(activeEnv.id, `var_${Date.now()}`, "")
                }
                style={{ fontSize: 11, marginTop: 4 }}
              >
                + Variable
              </button>
            </div>
          )}

          <button
            onClick={() => setShowPanel(false)}
            style={{ marginTop: 12, width: "100%", fontSize: 12 }}
          >
            Fermer
          </button>
        </div>
      )}
    </div>
  );
}
