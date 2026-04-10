"use client";

import {
  buildSystemPrompt,
  fetchOllamaModels,
  OllamaChatMessage,
  pingOllama,
  streamOllamaChat,
} from "@/lib/ollama";
import { useAiStore } from "@/store/ai";
import { useRequestStore } from "@/store/request";
import Select from "@/components/ui/Select";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  RotateCcw,
  X,
  Bot,
  User,
  Sparkles,
  Zap,
  Terminal,
  MessageSquare,
  ChevronRight,
  Loader2,
} from "lucide-react";

export default function AiPanel() {
  const {
    messages,
    isStreaming,
    isOpen,
    selectedModel,
    availableModels,
    ollamaStatus,
    addMessage,
    appendChunk,
    setStreaming,
    setOpen,
    setSelectedModel,
    setAvailableModels,
    setOllamaStatus,
    clearMessages,
  } = useAiStore();

  const { request, response } = useRequestStore();
  const [input, setInput] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function check() {
      const online = await pingOllama();
      setOllamaStatus(online ? "online" : "offline");
      if (online) {
        const models = await fetchOllamaModels();
        const names = models.map((m) => m.name);
        setAvailableModels(names);
        if (!selectedModel && names.length > 0) setSelectedModel(names[0]);
      }
    }
    check();
  }, [selectedModel, setAvailableModels, setOllamaStatus, setSelectedModel]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || isStreaming || !selectedModel) return;
    const userText = input.trim();
    setInput("");

    addMessage("user", userText);

    const systemPrompt = buildSystemPrompt(
      request.method,
      request.url,
      request.body,
      response?.body ?? "",
      response?.status ?? 0,
    );

    const history: OllamaChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: userText },
    ];

    const assistantId = addMessage("assistant", "");
    setStreaming(true);

    abortRef.current = new AbortController();

    await streamOllamaChat(
      selectedModel,
      history,
      (chunk) => appendChunk(assistantId, chunk),
      () => setStreaming(false),
      (err) => {
        appendChunk(assistantId, `\n\n_Erreur : ${err}_`);
        setStreaming(false);
      },
      abortRef.current.signal,
    );
  }

  function handleStop() {
    abortRef.current?.abort();
    setStreaming(false);
  }

  if (!isOpen) {
    return (
      <motion.button
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: 40, opacity: 1 }}
        whileHover={{ backgroundColor: "var(--surface2)" }}
        onClick={() => setOpen(true)}
        className="shrink-0 w-10 bg-surface border-l border-border flex flex-col items-center justify-center gap-2 hover:bg-surface2 transition-colors relative group"
        title="Ouvrir l'assistant IA"
      >
        <Bot size={18} className="text-accent" />
        <span className="text-muted text-[9px] font-bold uppercase tracking-widest [writing-mode:vertical-lr]">
          Assistant
        </span>
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ x: 320 }}
      animate={{ x: 0 }}
      exit={{ x: 320 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="flex flex-col w-80 shrink-0 bg-surface border-l border-(--border) overflow-hidden relative"
    >
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-white/5 shrink-0 bg-surface/50">
        <div className="flex items-center gap-2">
          <Bot size={14} className="text-accent" />
          <span className="text-text font-semibold text-xs tracking-tight">
            AI Explorer
          </span>
        </div>

        <div className="flex items-center gap-1.5 ml-2">
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              ollamaStatus === "online"
                ? "bg-method-get shadow-[0_0_8px_rgba(29,158,117,0.4)]"
                : ollamaStatus === "offline"
                  ? "bg-method-delete/50"
                  : "bg-muted/30"
            }`}
          />
        </div>

        <div className="ml-auto flex items-center gap-1">
          {availableModels.length > 0 && (
            <Select
              value={selectedModel}
              onChange={setSelectedModel}
              options={availableModels.map((m) => ({ value: m, label: m }))}
              className="w-[100px]"
              style={{
                fontSize: "10px",
                padding: "2px 6px",
                background: "rgba(255,255,255,0.03)",
              }}
            />
          )}
          <button
            onClick={clearMessages}
            className="p-1.5 text-muted hover:text-text hover:bg-white/5 rounded-md transition-all"
            title="Effacer la conversation"
          >
            <RotateCcw size={13} />
          </button>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 text-muted hover:text-text hover:bg-white/5 rounded-md transition-all"
            title="Fermer"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {ollamaStatus === "offline" && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="mx-4 mt-4 p-3 bg-red-500/5 border border-red-500/10 rounded-lg text-[11px] text-muted leading-relaxed"
        >
          <div className="flex items-center gap-2 text-method-delete/80 font-semibold mb-2">
            <Zap size={12} />
            Ollama non détecté
          </div>
          <code className="block p-2 bg-black/40 rounded font-mono text-text/80 break-all border border-white/5">
            OLLAMA_ORIGINS=&quot;*&quot; ollama serve
          </code>
        </motion.div>
      )}

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 scroll-smooth">
        <AnimatePresence initial={false}>
          {messages.length === 0 && ollamaStatus === "online" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center h-full gap-8 text-center py-10"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-accent/10 blur-3xl rounded-full" />
                <div className="relative p-5 bg-surface2 border border-white/5 rounded-4xl">
                  <Sparkles size={32} className="text-accent" />
                </div>
              </div>

              <div>
                <h3 className="text-text font-bold text-sm mb-1.5">
                  Besoin d&apos;aide ?
                </h3>
                <p className="text-muted text-[11px] px-6 leading-relaxed opacity-60">
                  Je peux analyser vos requêtes API ou suggérer des
                  optimisations.
                </p>
              </div>

              <div className="flex flex-col gap-1.5 w-full max-w-[220px]">
                {[
                  {
                    text: "Explique cette réponse",
                    icon: <Terminal size={12} />,
                  },
                  {
                    text: "Pourquoi ce status code ?",
                    icon: <MessageSquare size={12} />,
                  },
                  {
                    text: "Optimise le body JSON",
                    icon: <ChevronRight size={12} />,
                  },
                ].map((s) => (
                  <button
                    key={s.text}
                    onClick={() => setInput(s.text)}
                    className="flex items-center gap-3 text-left text-[11px] bg-white/3 hover:bg-white/6 rounded-xl px-4 py-2.5 text-muted hover:text-text transition-all group"
                  >
                    <span className="text-accent/60 group-hover:text-accent transition-colors">
                      {s.icon}
                    </span>
                    {s.text}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {messages.map((m, idx) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex flex-col gap-2 ${m.role === "user" ? "items-end ml-8" : "items-start mr-8"}`}
            >
              <div className="flex items-center gap-1.5 px-1 opacity-40">
                {m.role === "user" ? (
                  <>
                    <span className="text-[9px] font-bold uppercase tracking-widest">
                      Vous
                    </span>
                    <User size={10} />
                  </>
                ) : (
                  <>
                    <Bot size={10} className="text-accent" />
                    <span className="text-[9px] font-bold uppercase tracking-widest">
                      {selectedModel}
                    </span>
                  </>
                )}
              </div>

              <div
                className={`rounded-2xl px-3.5 py-2.5 text-xs leading-[1.6] shadow-sm ${
                  m.role === "user"
                    ? "bg-accent text-white rounded-tr-none"
                    : "bg-surface2 border border-white/5 text-text/90 rounded-tl-none"
                }`}
              >
                {m.content}
                {m.role === "assistant" &&
                  isStreaming &&
                  idx === messages.length - 1 && (
                    <motion.span
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                      className="inline-block w-1 h-3.5 bg-accent ml-1 translate-y-0.5 rounded-full"
                    />
                  )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} className="h-4" />
      </div>

      {/* Input section - Integrated & Simple */}
      <div className="p-4 bg-surface/80 border-t border-white/5">
        <div className="relative flex flex-col gap-2 bg-surface2 rounded-2xl p-2.5 transition-all outline-1 outline-white/5 focus-within:outline-accent/30 shadow-2xl">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={
              ollamaStatus === "offline"
                ? "Ollama hors ligne..."
                : "Écrivez ici..."
            }
            disabled={ollamaStatus === "offline" || !selectedModel}
            rows={2}
            className="w-full bg-transparent border-0 text-text rounded-lg text-xs p-1 resize-none font-sans disabled:opacity-40 focus:ring-0 outline-none placeholder:text-muted/30"
          />
          <div className="flex items-center justify-between mt-1">
            <span className="text-[9px] text-muted/20 font-mono pl-1 px-1">
              {input.length > 0
                ? `${input.length} ch`
                : "Shift + Enter pour une nouvelle ligne"}
            </span>

            {isStreaming ? (
              <button
                onClick={handleStop}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl text-[10px] font-bold transition-all"
              >
                <Loader2 size={12} className="animate-spin" />
                STOP
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={
                  !input.trim() || !selectedModel || ollamaStatus === "offline"
                }
                className={`flex items-center justify-center w-8 h-8 rounded-xl transition-all ${
                  input.trim() && selectedModel && ollamaStatus === "online"
                    ? "bg-accent text-white shadow-lg shadow-accent/20 hover:scale-[1.03] active:scale-[0.97]"
                    : "bg-white/3 text-muted/20"
                }`}
              >
                <Send
                  size={14}
                  className={
                    input.trim() ? "translate-x-0.5 -translate-y-0.5" : ""
                  }
                />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
