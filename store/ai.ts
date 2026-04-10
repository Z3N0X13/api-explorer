import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AiMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
}

interface AiStore {
  messages: AiMessage[];
  isStreaming: boolean;
  isOpen: boolean;
  selectedModel: string;
  availableModels: string[];
  ollamaStatus: "unknown" | "online" | "offline";
  addMessage: (role: "user" | "assistant", content: string) => string;
  appendChunk: (id: string, chunk: string) => void;
  setStreaming: (v: boolean) => void;
  setOpen: (v: boolean) => void;
  setSelectedModel: (m: string) => void;
  setAvailableModels: (models: string[]) => void;
  setOllamaStatus: (s: "unknown" | "online" | "offline") => void;
  clearMessages: () => void;
}

export const useAiStore = create<AiStore>()(
  persist(
    (set) => ({
      messages: [],
      isStreaming: false,
      isOpen: false,
      selectedModel: "",
      availableModels: [],
      ollamaStatus: "unknown",

      addMessage: (role, content) => {
        const id = crypto.randomUUID();
        set((s) => ({
          messages: [
            ...s.messages,
            { id, role, content, createdAt: Date.now() },
          ],
        }));
        return id;
      },

      appendChunk: (id, chunk) =>
        set((s) => ({
          messages: s.messages.map((m) =>
            m.id === id ? { ...m, content: m.content + chunk } : m,
          ),
        })),

      setStreaming: (isStreaming) => set({ isStreaming }),
      setOpen: (isOpen) => set({ isOpen }),
      setSelectedModel: (selectedModel) => set({ selectedModel }),
      setAvailableModels: (availableModels) => set({ availableModels }),
      setOllamaStatus: (ollamaStatus) => set({ ollamaStatus }),
      clearMessages: () => set({ messages: [] }),
    }),
    {
      name: "api-explorer-ai",
      partialize: (s) => ({
        selectedModel: s.selectedModel,
        messages: s.messages.slice(-50),
      }),
    },
  ),
);
