import { create } from "zustand";
import type { Tab, ApiRequest } from "@/types";
import { v4 as uuid } from "uuid";

interface TabsStore {
  tabs: Tab[];
  activeTabId: string | null;
  openTab: (req: ApiRequest) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  markDirty: (id: string) => void;
  markClean: (id: string) => void;
}

export const useTabsStore = create<TabsStore>((set) => ({
  tabs: [],
  activeTabId: null,

  openTab: (req) =>
    set((s) => {
      const existing = s.tabs.find((t) => t.requestId === req.id);
      if (existing) return { activeTabId: existing.id };
      const tab: Tab = {
        id: uuid(),
        requestId: req.id,
        name: req.name,
        isDirty: false,
      };
      return { tabs: [...s.tabs, tab], activeTabId: tab.id };
    }),

  closeTab: (id) =>
    set((s) => {
      const remaining = s.tabs.filter((t) => t.id !== id);
      const nextActive =
        s.activeTabId === id
          ? (remaining[remaining.length - 1]?.id ?? null)
          : s.activeTabId;
      return { tabs: remaining, activeTabId: nextActive };
    }),

  setActiveTab: (id) => set({ activeTabId: id }),
  markDirty: (id) =>
    set((s) => ({
      tabs: s.tabs.map((t) => (t.id === id ? { ...t, isDirty: true } : t)),
    })),
  markClean: (id) =>
    set((s) => ({
      tabs: s.tabs.map((t) => (t.id === id ? { ...t, isDirty: false } : t)),
    })),
}));
