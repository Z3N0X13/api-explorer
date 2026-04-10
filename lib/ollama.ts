export interface OllamaModel {
  name: string;
  size: number;
  modified_at: string;
}

export interface OllamaChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface OllamaStreamChunk {
  message: { role: string; content: string };
  done: boolean;
}

const BASE = "http://localhost:11434";

export async function fetchOllamaModels(): Promise<OllamaModel[]> {
  const res = await fetch(`${BASE}/api/tags`);
  if (!res.ok) throw new Error(`Ollama non disponible (${res.status})`);
  const data = await res.json();
  return data.models ?? [];
}

export async function pingOllama(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/api/tags`, {
      signal: AbortSignal.timeout(2000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function streamOllamaChat(
  model: string,
  messages: OllamaChatMessage[],
  onChunk: (chunk: string) => void,
  onDone: () => void,
  onError: (err: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  try {
    const res = await fetch(`${BASE}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages, stream: true }),
      signal,
    });

    if (!res.ok) {
      const err = await res.text();
      onError(`Ollama error ${res.status}: ${err}`);
      return;
    }

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    if (!reader) {
      onError("Pas de stream disponible");
      return;
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const lines = decoder.decode(value).split("\n").filter(Boolean);
      for (const line of lines) {
        try {
          const parsed: OllamaStreamChunk = JSON.parse(line);
          if (parsed.message?.content) onChunk(parsed.message.content);
          if (parsed.done) {
            onDone();
            return;
          }
        } catch {}
      }
    }
    onDone();
  } catch (e: unknown) {
    if (e instanceof Error && e.name === "AbortError") return;
    onError(String(e));
  }
}

export function buildSystemPrompt(
  method: string,
  url: string,
  requestBody: string,
  responseBody: string,
  responseStatus: number,
): string {
  return `Tu es un expert en APIs REST. Tu aides à analyser et déboguer des requêtes HTTP.

Contexte de la requête actuelle :
- Méthode : ${method}
- URL : ${url}
${requestBody ? `- Body envoyé :\n\`\`\`json\n${requestBody}\n\`\`\`` : ""}
${responseBody ? `- Réponse reçue (status ${responseStatus}) :\n\`\`\`json\n${responseBody.slice(0, 2000)}\n\`\`\`` : ""}

Réponds en français, de façon concise et technique. Si tu suggères du code ou du JSON, utilise des blocs de code.`;
}
