import { create } from "zustand";
import type { Collection, ApiRequest } from "@/types";
import { v4 as uuid } from "uuid";
import { saveToStorage, loadFromStorage } from "@/lib/storage";
import { defaultCollections } from "@/lib/defaultData";

const STORAGE_KEY = "api-explorer-collections";

interface CollectionsStore {
  collections: Collection[];
  init: () => void;
  addCollection: (name: string) => void;
  removeCollection: (id: string) => void;
  toggleCollection: (id: string) => void;
  renameCollection: (id: string, name: string) => void;
  addRequest: (collectionId: string, req?: Partial<ApiRequest>) => ApiRequest;
  updateRequest: (collectionId: string, req: ApiRequest) => void;
  removeRequest: (collectionId: string, requestId: string) => void;
  saveCurrentTo: (collectionId: string, req: ApiRequest) => void;
}

export const useCollectionsStore = create<CollectionsStore>((set, get) => ({
  collections: [],

  init: () => {
    const saved = loadFromStorage<Collection[]>(STORAGE_KEY, defaultCollections);
    set({ collections: saved });
  },

  addCollection: (name) => {
    const c: Collection = { id: uuid(), name, requests: [], isOpen: true };
    set((s) => {
      const next = [...s.collections, c];
      saveToStorage(STORAGE_KEY, next);
      return { collections: next };
    });
  },

  removeCollection: (id) =>
    set((s) => {
      const next = s.collections.filter((c) => c.id !== id);
      saveToStorage(STORAGE_KEY, next);
      return { collections: next };
    }),

  toggleCollection: (id) =>
    set((s) => {
      const next = s.collections.map((c) =>
        c.id === id ? { ...c, isOpen: !c.isOpen } : c
      );
      saveToStorage(STORAGE_KEY, next);
      return { collections: next };
    }),

  renameCollection: (id, name) =>
    set((s) => {
      const next = s.collections.map((c) => (c.id === id ? { ...c, name } : c));
      saveToStorage(STORAGE_KEY, next);
      return { collections: next };
    }),

  addRequest: (collectionId, partial = {}) => {
    const req: ApiRequest = {
      id: uuid(),
      name: "Nouvelle requête",
      method: "GET",
      url: "",
      headers: [],
      params: [],
      body: "",
      bodyType: "none",
      collectionId,
      ...partial,
    };
    set((s) => {
      const next = s.collections.map((c) =>
        c.id === collectionId ? { ...c, requests: [...c.requests, req] } : c
      );
      saveToStorage(STORAGE_KEY, next);
      return { collections: next };
    });
    return req;
  },

  updateRequest: (collectionId, req) =>
    set((s) => {
      const next = s.collections.map((c) =>
        c.id === collectionId
          ? { ...c, requests: c.requests.map((r) => (r.id === req.id ? req : r)) }
          : c
      );
      saveToStorage(STORAGE_KEY, next);
      return { collections: next };
    }),

  removeRequest: (collectionId, requestId) =>
    set((s) => {
      const next = s.collections.map((c) =>
        c.id === collectionId
          ? { ...c, requests: c.requests.filter((r) => r.id !== requestId) }
          : c
      );
      saveToStorage(STORAGE_KEY, next);
      return { collections: next };
    }),

  saveCurrentTo: (collectionId, req) => {
    get().updateRequest(collectionId, req);
  },
}));