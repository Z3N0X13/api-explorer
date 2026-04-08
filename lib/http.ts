import { ApiRequest, ApiResponse } from "@/types";

export async function sendRequest(req: ApiRequest): Promise<ApiResponse> {
  const start = performance.now();

  const url = buildUrl(req.url, req.params);

  const headers: Record<string, string> = {};
  for (const h of req.headers) {
    if (h.enabled && h.key.trim()) {
      headers[h.key.trim()] = h.value;
    }
  }

  if (req.bodyType === "json" && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const hasBody =
    req.method !== "GET" && req.method !== "HEAD" && req.bodyType !== "none";

  const fetchOptions: RequestInit = {
    method: req.method,
    headers,
    body: hasBody && req.body ? req.body : undefined,
  };

  const res = await fetch(url, fetchOptions);

  const elapsedMs = Math.round(performance.now() - start);

  const resHeaders: Record<string, string> = {};
  res.headers.forEach((value, key) => {
    resHeaders[key] = value;
  });

  const rawBody = await res.text();
  const size = new TextEncoder().encode(rawBody).length;

  return {
    status: res.status,
    statusText: res.statusText,
    headers: resHeaders,
    body: rawBody,
    elapsedMs,
    size,
  };
}

function buildUrl(base: string, params: ApiRequest["params"]): string {
  const enabled = params.filter((p) => p.enabled && p.key.trim());
  if (!enabled.length) return base;
  const qs = enabled
    .map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
    .join("&");
  return base.includes("?") ? `${base}&${qs}` : `${base}?${qs}`;
}
