export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "HEAD"
  | "OPTIONS";

export interface Header {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export interface QueryParam {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export interface ApiRequest {
  id: string;
  name: string;
  method: HttpMethod;
  url: string;
  headers: Header[];
  params: QueryParam[];
  body: string;
  bodyType: "none" | "json" | "text" | "form";
  collectionId: string | null;
}

export interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  elapsedMs: number;
  size: number;
}

export interface Collection {
  id: string;
  name: string;
  requests: ApiRequest[];
  isOpen: boolean;
}

export interface Environment {
  id: string;
  name: string;
  variables: Record<string, string>;
}

export interface Tab {
  id: string;
  requestId: string;
  name: string;
  isDirty: boolean;
}
