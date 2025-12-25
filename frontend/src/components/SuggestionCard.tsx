"use client";

import { useMemo, useState } from "react";

export type Suggestion = {
  doc_name: string;
  doc_version: string;
  page: number;
  para_id: string;
  text: string;
  bbox?: { x1: number; y1: number; x2: number; y2: number };
  page_url?: string;
  highlight_url?: string;
};

function addQueryParam(url: string, key: string, value: string) {
  try {
    const u = new URL(url);
    u.searchParams.set(key, value);
    return u.toString();
  } catch {
    // fallback if url isn't absolute
    const joiner = url.includes("?") ? "&" : "?";
    return `${url}${joiner}${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
  }
}

export default function SuggestionCard({
  idx,
  s,
  onPreview,
  onToast,
}: {
  idx: number;
  s: Suggestion;
  onPreview: (title: string, url: string) => void;
  onToast: (msg: string, kind?: "success" | "error") => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const versionShort = useMemo(() => {
    const v = s.doc_version ?? "";
    return v.length > 12 ? `${v.slice(0, 6)}…${v.slice(-4)}` : v;
  }, [s.doc_version]);

  const citation = useMemo(() => {
    return `${s.doc_name} | v=${s.doc_version} | p.${s.page} | ${s.para_id}`;
  }, [s.doc_name, s.doc_version, s.page, s.para_id]);

  async function copyCitation() {
    try {
      await navigator.clipboard.writeText(citation);
      onToast("Citation copied!", "success");
    } catch {
      onToast("Failed to copy citation (clipboard blocked).", "error");
    }
  }

  const previewHighlight = () => {
    if (!s.highlight_url) return onToast("No highlight URL in response.", "error");
    const url = addQueryParam(s.highlight_url, "crop", "1"); // ✅ makes highlight readable
    onPreview(`Highlight — ${s.doc_name} p.${s.page} (${s.para_id})`, url);
  };

  const previewPage = () => {
    if (!s.page_url) return onToast("No page URL in response.", "error");
    onPreview(`Page — ${s.doc_name} p.${s.page}`, s.page_url);
  };

  const snippetRaw = (s.text ?? "").trim();
  const snippetOneLine = snippetRaw.replace(/\s+/g, " ").trim();
  const shortText =
    snippetOneLine.length > 220 ? snippetOneLine.slice(0, 220) + "…" : snippetOneLine;

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      {/* header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
            <span className="font-semibold text-gray-900">#{idx}</span>
            <span className="rounded-full bg-gray-100 px-2 py-1">{s.doc_name}</span>
            <span className="rounded-full bg-gray-100 px-2 py-1">v={versionShort}</span>
            <span className="rounded-full bg-gray-100 px-2 py-1">p.{s.page}</span>
            <span className="rounded-full bg-gray-100 px-2 py-1">{s.para_id}</span>
          </div>

          <div className="mt-3 text-sm font-semibold text-gray-900">
            {expanded ? snippetRaw : shortText}
          </div>

          {s.bbox && (
            <div className="mt-2 text-xs text-gray-500">
              bbox: ({s.bbox.x1},{s.bbox.y1}) → ({s.bbox.x2},{s.bbox.y2})
            </div>
          )}
        </div>

        {/* actions */}
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            onClick={previewHighlight}
            className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            Preview Highlight
          </button>

          <button
            onClick={previewPage}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Preview Page
          </button>

          <button
            onClick={copyCitation}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Copy Citation
          </button>
        </div>
      </div>

      {/* footer */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-sm font-semibold text-blue-600 hover:underline"
        >
          {expanded ? "Collapse text" : "View full text"}
        </button>

        <div className="max-w-full truncate text-xs text-gray-400">{citation}</div>
      </div>
    </div>
  );
}
