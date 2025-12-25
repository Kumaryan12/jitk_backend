"use client";

import { useMemo, useState } from "react";
import {
  suggest,
  answer,
  type SuggestResponse,
  type Suggestion,
  type AnswerResponse,
} from "@/lib/api";

import SuggestionCard from "@/components/SuggestionCard";
import PreviewModal from "@/components/PreviewModal";
import Toast, { type ToastItem } from "@/components/Toast";
import SkeletonCard from "@/components/SkeletonCard";

function withCrop(url: string) {
  return url.includes("?") ? `${url}&crop=1` : `${url}?crop=1`;
}

export default function Home() {
  const [caseId, setCaseId] = useState("C-1001");
  const [userId, setUserId] = useState("agent_7");
  const [claimType, setClaimType] = useState("Flood");
  const [state, setState] = useState("Florida");
  const [policyType, setPolicyType] = useState("HO-3");
  const [topK, setTopK] = useState(6);

  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"suggest" | "answer">("suggest");

  const [suggestResp, setSuggestResp] = useState<SuggestResponse | null>(null);
  const [answerResp, setAnswerResp] = useState<AnswerResponse | null>(null);

  // modal state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  // toast state
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // sources toggle in answer mode
  const [showSources, setShowSources] = useState(true);

  function pushToast(message: string, kind: "success" | "error" = "success") {
    const id = crypto.randomUUID();
    setToasts((p) => [...p, { id, message, kind }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 2400);
  }

  function openPreview(title: string, url: string) {
    setPreviewTitle(title);
    setPreviewUrl(url);
    setPreviewOpen(true);
  }

  const queryFields = useMemo(() => {
    return {
      "Claim Type": claimType,
      State: state,
      "Policy Type": policyType,
    };
  }, [claimType, state, policyType]);

  const results: Suggestion[] = useMemo(() => {
    if (mode === "suggest") return suggestResp?.suggestions ?? [];
    return answerResp?.sources ?? [];
  }, [mode, suggestResp, answerResp]);

  const queryUsed = suggestResp?.query_used ?? answerResp?.query_used ?? "";

  async function onSubmit() {
    try {
      setLoading(true);

      if (mode === "suggest") setSuggestResp(null);
      else setAnswerResp(null);

      if (mode === "suggest") {
        const data = await suggest({
          case_id: caseId,
          user_id: userId,
          fields: queryFields,
          top_k: topK,
        });
        setSuggestResp(data);
        pushToast("Suggestions loaded!", "success");
      } else {
        const data = await answer({
          case_id: caseId,
          user_id: userId,
          fields: queryFields,
          top_k: topK,
          max_bullets: 4,
        });
        setAnswerResp(data);
        setShowSources(true);
        pushToast("Answer generated!", "success");
      }
    } catch (e: any) {
      console.error(e);
      pushToast(e?.message ?? "Request failed.", "error");
    } finally {
      setLoading(false);
    }
  }

  const hasAnyResponse = Boolean(suggestResp || answerResp);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-100">
      <Toast items={toasts} />

      <PreviewModal
        open={previewOpen}
        title={previewTitle}
        url={previewUrl}
        onClose={() => setPreviewOpen(false)}
      />

      {/* Top glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.30),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.18),transparent_55%)]" />

      <div className="relative mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
        {/* HERO */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_30px_80px_-40px_rgba(0,0,0,0.8)] backdrop-blur-xl md:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.6)]" />
                Just-in-Time Knowledge • Demo
              </div>

              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white md:text-5xl">
                JITK{" "}
                <span className="bg-gradient-to-r from-indigo-300 via-sky-200 to-emerald-200 bg-clip-text text-transparent">
                  Case-Aware Retrieval
                </span>
              </h1>

              <p className="mt-3 text-sm leading-relaxed text-slate-300 md:text-base">
                Provide case context (Claim Type, State, Policy Type) and get{" "}
                <span className="font-semibold text-white">verifiable</span>{" "}
                policy clauses with{" "}
                <span className="font-semibold text-white">page + paragraph</span>{" "}
                provenance. Preview highlights instantly.
              </p>

              {/* MODE TOGGLE */}
              <div className="mt-6 inline-flex w-full flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-black/30 p-2 md:w-auto">
                <button
                  onClick={() => setMode("suggest")}
                  className={[
                    "rounded-xl px-4 py-2 text-sm font-semibold transition",
                    mode === "suggest"
                      ? "bg-white text-slate-950 shadow"
                      : "text-slate-200 hover:bg-white/10",
                  ].join(" ")}
                >
                  Suggestions
                </button>

                <button
                  onClick={() => setMode("answer")}
                  className={[
                    "rounded-xl px-4 py-2 text-sm font-semibold transition",
                    mode === "answer"
                      ? "bg-white text-slate-950 shadow"
                      : "text-slate-200 hover:bg-white/10",
                  ].join(" ")}
                >
                  Answer + Citations
                </button>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="w-full max-w-xl">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field
                  label="Case ID"
                  value={caseId}
                  onChange={setCaseId}
                  placeholder="C-1001"
                />
                <Field
                  label="User ID"
                  value={userId}
                  onChange={setUserId}
                  placeholder="agent_7"
                />
                <Field
                  label="Claim Type"
                  value={claimType}
                  onChange={setClaimType}
                  placeholder="Flood"
                />
                <Field
                  label="State"
                  value={state}
                  onChange={setState}
                  placeholder="Florida"
                />
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                <Field
                  label="Policy Type"
                  value={policyType}
                  onChange={setPolicyType}
                  placeholder="HO-3"
                />
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <label className="text-xs font-semibold text-slate-200">
                    Top K
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={topK}
                    onChange={(e) => setTopK(parseInt(e.target.value || "6", 10))}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder:text-slate-500 outline-none ring-0 focus:border-indigo-300/40 focus:bg-black/50"
                  />
                  <div className="mt-2 text-xs text-slate-400">
                    Higher K = more sources
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs font-semibold text-slate-200">
                    Backend
                  </div>
                  <div className="mt-2 rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-sm text-slate-200">
                    http://127.0.0.1:8000
                  </div>
                  <div className="mt-2 text-xs text-slate-400">
                    CORS enabled
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={onSubmit}
                  disabled={loading}
                  className={[
                    "inline-flex h-12 items-center justify-center rounded-2xl px-6 text-sm font-bold transition",
                    "bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 text-white",
                    "shadow-[0_20px_60px_-30px_rgba(99,102,241,0.9)]",
                    "hover:opacity-95 disabled:opacity-60 disabled:cursor-not-allowed",
                  ].join(" ")}
                >
                  {loading
                    ? "Working..."
                    : mode === "suggest"
                    ? "Get Suggestions"
                    : "Generate Answer"}
                </button>

                <button
                  onClick={() => {
                    setSuggestResp(null);
                    setAnswerResp(null);
                    pushToast("Cleared results.", "success");
                  }}
                  className="h-12 rounded-2xl border border-white/10 bg-white/5 px-6 text-sm font-semibold text-slate-200 hover:bg-white/10"
                >
                  Clear
                </button>
              </div>

              {queryUsed && (
                <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-slate-200">
                  <span className="font-semibold text-white">Query used:</span>{" "}
                  <span className="text-slate-300">{queryUsed}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* LEFT: Answer Panel (only in answer mode) */}
          {mode === "answer" && (
            <div className="lg:col-span-5">
              <div className="sticky top-6 space-y-6">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-lg font-extrabold text-white">
                        Generated Answer
                      </div>
                      <div className="mt-1 text-sm text-slate-300">
                        Constructed from retrieved clauses. Each bullet is cited.
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-xs font-semibold text-slate-200">
                      topK={topK}
                    </div>
                  </div>

                  {!loading && !answerResp && hasAnyResponse && (
                    <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-slate-300">
                      No answer response yet. Click{" "}
                      <span className="font-semibold text-white">
                        Generate Answer
                      </span>
                      .
                    </div>
                  )}

                  {loading && (
                    <div className="mt-4 space-y-3">
                      <div className="h-4 w-3/4 animate-pulse rounded bg-white/10" />
                      <div className="h-4 w-full animate-pulse rounded bg-white/10" />
                      <div className="h-4 w-5/6 animate-pulse rounded bg-white/10" />
                    </div>
                  )}

                  {!loading && answerResp && (
                    <>
                      <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-slate-200 whitespace-pre-line">
                        {answerResp.answer}
                      </div>

                      {answerResp.bullets?.length > 0 && (
                        <div className="mt-6">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-bold text-white">
                              Cited bullets
                            </div>

                            <div className="text-xs text-slate-400">
                              click to preview
                            </div>
                          </div>

                          <div className="mt-3 space-y-3">
                            {answerResp.bullets.map((b, i) => (
                              <div
                                key={`${b.doc_name}-${b.page}-${b.para_id}-${i}`}
                                className="rounded-2xl border border-white/10 bg-black/30 p-4"
                              >
                                <div className="text-sm font-semibold text-white">
                                  {i + 1}. {b.text}
                                </div>

                                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-300">
                                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
                                    {b.doc_name}
                                  </span>
                                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
                                    p.{b.page}
                                  </span>
                                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
                                    {b.para_id}
                                  </span>
                                </div>

                                <div className="mt-3 flex flex-wrap gap-2">
                                  <button
                                    onClick={() =>
                                      openPreview(
                                        `Highlight — ${b.doc_name} p.${b.page} (${b.para_id})`,
                                        withCrop(b.highlight_url)
                                      )
                                    }
                                    className="rounded-xl bg-white px-3 py-2 text-sm font-bold text-slate-950 hover:opacity-95"
                                  >
                                    Preview Highlight
                                  </button>

                                  <button
                                    onClick={() =>
                                      openPreview(
                                        `Page — ${b.doc_name} p.${b.page}`,
                                        b.page_url
                                      )
                                    }
                                    className="rounded-lg border border-gray-500 bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70"

                                  >
                                    Preview Page
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-6 flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                        <div className="text-sm font-semibold text-white">
                          Retrieved sources
                        </div>
                        <button
                          onClick={() => setShowSources((v) => !v)}
                          className="text-sm font-bold text-sky-200 hover:text-sky-100"
                        >
                          {showSources ? "Hide" : "Show"}
                        </button>
                      </div>
                    </>
                  )}
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
                  <div className="font-semibold text-white">Tip</div>
                  <div className="mt-1">
                    Use <span className="font-semibold text-white">Preview Highlight</span>{" "}
                    for fast provenance checks, and{" "}
                    <span className="font-semibold text-white">Preview Page</span>{" "}
                    for full context.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* RIGHT: Results */}
          <div className={mode === "answer" ? "lg:col-span-7" : "lg:col-span-12"}>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-lg font-extrabold text-white">
                    {mode === "suggest" ? "Suggestions" : "Retrieved Clauses"}
                  </div>
                  <div className="mt-1 text-sm text-slate-300">
                    {mode === "suggest"
                      ? "Top relevant snippets for this case context."
                      : "Raw retrieved chunks used as sources (each has provenance)."}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-xs font-semibold text-slate-200">
                    {results.length} results
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {loading && (
                  <>
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                  </>
                )}

                {!loading && results.length === 0 && hasAnyResponse && (
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-6 text-slate-300">
                    No results returned. Try broader fields (e.g., remove Policy Type).
                  </div>
                )}

                {!loading && mode === "answer" && answerResp && !showSources && (
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-6 text-slate-300">
                    Sources are hidden. Click <span className="font-semibold text-white">Show</span>{" "}
                    to view retrieved clauses.
                  </div>
                )}

                {!loading &&
                  (mode === "suggest"
                    ? suggestResp?.suggestions?.map((s, i) => (
                        <SuggestionCard
                          key={`${s.doc_name}-${s.page}-${s.para_id}-${i}`}
                          idx={i + 1}
                          s={s}
                          onPreview={openPreview}
                          onToast={pushToast}
                        />
                      ))
                    : answerResp && showSources
                    ? results.map((s, i) => (
                        <SuggestionCard
                          key={`${s.doc_name}-${s.page}-${s.para_id}-${i}`}
                          idx={i + 1}
                          s={s}
                          onPreview={openPreview}
                          onToast={pushToast}
                        />
                      ))
                    : null)}
              </div>
            </div>

            {/* Footer note */}
            <div className="mt-4 text-center text-xs text-slate-400">
              Built for fast, compliant, verifiable decision support — every output has page+paragraph provenance.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** UI helper: nice readable input with perfect text visibility */
function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <label className="text-xs font-semibold text-slate-200">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-indigo-300/40 focus:bg-black/50"
      />
    </div>
  );
}
