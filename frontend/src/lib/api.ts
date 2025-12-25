// src/lib/api.ts
export type BBox = { x1: number; y1: number; x2: number; y2: number };

export type Suggestion = {
  doc_name: string;
  doc_version: string;
  page: number;
  para_id: string;
  text: string;
  bbox?: BBox;
  page_url?: string;
  highlight_url?: string;
};

export type SuggestResponse = {
  query_used: string;
  suggestions: Suggestion[];
};

export type SuggestRequest = {
  case_id: string;
  user_id: string;
  fields: Record<string, string>;
  top_k?: number;
};

export type AnswerBullet = {
  text: string;
  doc_name: string;
  doc_version: string;
  page: number;
  para_id: string;
  page_url: string;
  highlight_url: string;
};

export type AnswerResponse = {
  query_used: string;
  answer: string;
  bullets: AnswerBullet[];
  sources: Suggestion[];
};

export type AnswerRequest = {
  case_id: string;
  user_id: string;
  fields: Record<string, string>;
  top_k?: number;
  max_bullets?: number;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000";

async function postJSON<T>(endpoint: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${endpoint} failed (${res.status}): ${text}`);
  }

  return (await res.json()) as T;
}

export async function suggest(req: SuggestRequest): Promise<SuggestResponse> {
  return postJSON<SuggestResponse>("/suggest", { top_k: 5, ...req });
}

export async function answer(req: AnswerRequest): Promise<AnswerResponse> {
  return postJSON<AnswerResponse>("/answer", { top_k: 6, max_bullets: 4, ...req });
}
