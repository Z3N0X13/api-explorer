import { create } from "zustand";
import type { Environment } from "@/types";
import { v4 as uuid } from "uuid";
import { saveToStorage, loadFromStorage } from "@/lib/storage";
import { defaultEnvironments } from "@/lib/defaultData";

const STORAGE_KEY = "api-explorer-environments";
const ACTIVE_KEY = "api-explorer-active-env";

interface EnvironmentsStore {
  environments: Environment[];
  activeEnvId: string | null;
  init: () => void;
  activeVariables: () => Record<string, string>;
  addEnvironment: (name: string) => void;
  removeEnvironment: (id: string) => void;
  setActiveEnv: (id: string | null) => void;
  setVariable: (envId: string, key: string, value: string) => void;
  removeVariable: (envId: string, key: string) => void;
}

export const useEnvironmentsStore = create<EnvironmentsStore>((set, get) => ({
  environments: [],
  activeEnvId: null,

  init: () => {
    const envs = loadFromStorage<Environment[]>(
      STORAGE_KEY,
      defaultEnvironments,
    );
    const activeId = loadFromStorage<string | null>(
      ACTIVE_KEY,
      envs[0]?.id ?? null,
    );
    set({ environments: envs, activeEnvId: activeId });
  },

  activeVariables: () => {
    const { environments, activeEnvId } = get();
    if (!activeEnvId) return {};
    return environments.find((e) => e.id === activeEnvId)?.variables ?? {};
  },

  addEnvironment: (name) => {
    const env: Environment = { id: uuid(), name, variables: {} };
    set((s) => {
      const next = [...s.environments, env];
      saveToStorage(STORAGE_KEY, next);
      return { environments: next };
    });
  },

  removeEnvironment: (id) =>
    set((s) => {
      const next = s.environments.filter((e) => e.id !== id);
      saveToStorage(STORAGE_KEY, next);
      return { environments: next };
    }),

  setActiveEnv: (id) => {
    saveToStorage(ACTIVE_KEY, id);
    set({ activeEnvId: id });
  },

  setVariable: (envId, key, value) =>
    set((s) => {
      const next = s.environments.map((e) =>
        e.id === envId
          ? { ...e, variables: { ...e.variables, [key]: value } }
          : e,
      );
      saveToStorage(STORAGE_KEY, next);
      return { environments: next };
    }),

  removeVariable: (envId, key) =>
    set((s) => {
      const next = s.environments.map((e) => {
        if (e.id !== envId) return e;
        const vars = { ...e.variables };
        delete vars[key];
        return { ...e, variables: vars };
      });
      saveToStorage(STORAGE_KEY, next);
      return { environments: next };
    }),
}));
