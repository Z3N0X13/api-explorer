import { create } from "zustand";
import type {
  ApiRequest,
  ApiResponse,
  HttpMethod,
  Header,
  QueryParam,
} from "@/types";
import { v4 as uuid } from "uuid";

function emptyRequest(): ApiRequest {
  return {
    id: uuid(),
    name: "Nouvelle requête",
    method: "GET",
    url: "",
    headers: [],
    params: [],
    body: "",
    bodyType: "none",
    collectionId: null,
  };
}

interface RequestStore {
  request: ApiRequest;
  response: ApiResponse | null;
  isLoading: boolean;
  error: string | null;
  activeBodyTab: "params" | "headers" | "body";
  activeResponseTab: "body" | "headers";
  setRequest: (req: Partial<ApiRequest>) => void;
  setMethod: (method: HttpMethod) => void;
  setUrl: (url: string) => void;
  setBody: (body: string) => void;
  setBodyType: (t: ApiRequest["bodyType"]) => void;
  addHeader: () => void;
  updateHeader: (
    id: string,
    field: keyof Header,
    value: string | boolean,
  ) => void;
  removeHeader: (id: string) => void;
  addParam: () => void;
  updateParam: (
    id: string,
    field: keyof QueryParam,
    value: string | boolean,
  ) => void;
  removeParam: (id: string) => void;
  setResponse: (res: ApiResponse) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
  setActiveBodyTab: (t: "params" | "headers" | "body") => void;
  setActiveResponseTab: (t: "body" | "headers") => void;
  loadRequest: (req: ApiRequest) => void;
  reset: () => void;
}

export const useRequestStore = create<RequestStore>((set) => ({
  request: emptyRequest(),
  response: null,
  isLoading: false,
  error: null,
  activeBodyTab: "params",
  activeResponseTab: "body",

  setRequest: (req) => set((s) => ({ request: { ...s.request, ...req } })),
  setMethod: (method) => set((s) => ({ request: { ...s.request, method } })),
  setUrl: (url) => set((s) => ({ request: { ...s.request, url } })),
  setBody: (body) => set((s) => ({ request: { ...s.request, body } })),
  setBodyType: (bodyType) =>
    set((s) => ({ request: { ...s.request, bodyType } })),

  addHeader: () =>
    set((s) => ({
      request: {
        ...s.request,
        headers: [
          ...s.request.headers,
          { id: uuid(), key: "", value: "", enabled: true },
        ],
      },
    })),
  updateHeader: (id, field, value) =>
    set((s) => ({
      request: {
        ...s.request,
        headers: s.request.headers.map((h) =>
          h.id === id ? { ...h, [field]: value } : h,
        ),
      },
    })),
  removeHeader: (id) =>
    set((s) => ({
      request: {
        ...s.request,
        headers: s.request.headers.filter((h) => h.id !== id),
      },
    })),

  addParam: () =>
    set((s) => ({
      request: {
        ...s.request,
        params: [
          ...s.request.params,
          { id: uuid(), key: "", value: "", enabled: true },
        ],
      },
    })),
  updateParam: (id, field, value) =>
    set((s) => ({
      request: {
        ...s.request,
        params: s.request.params.map((p) =>
          p.id === id ? { ...p, [field]: value } : p,
        ),
      },
    })),
  removeParam: (id) =>
    set((s) => ({
      request: {
        ...s.request,
        params: s.request.params.filter((p) => p.id !== id),
      },
    })),

  setResponse: (response) => set({ response }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setActiveBodyTab: (activeBodyTab) => set({ activeBodyTab }),
  setActiveResponseTab: (activeResponseTab) => set({ activeResponseTab }),
  loadRequest: (req) =>
    set({ request: { ...req }, response: null, error: null }),
  reset: () => set({ request: emptyRequest(), response: null, error: null }),
}));
