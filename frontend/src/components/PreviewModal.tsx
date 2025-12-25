"use client";

import { useEffect, useState } from "react";

type PreviewModalProps = {
  open: boolean;
  title?: string;
  url?: string;
  onClose: () => void;
};

export default function PreviewModal({ open, title, url, onClose }: PreviewModalProps) {
  const [fit, setFit] = useState(true);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) setFit(true);
  }, [open, url]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="absolute left-1/2 top-1/2 w-[min(1100px,94vw)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b p-4">
          <div className="min-w-0">
            <div className="truncate font-semibold text-gray-900">{title ?? "Preview"}</div>
            {url && <div className="truncate text-xs text-gray-500">{url}</div>}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFit((v) => !v)}
              className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50"
            >
              {fit ? "Actual Size" : "Fit"}
            </button>

            {url && (
              <>
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50"
                >
                  Open
                </a>
                <a
                  href={url}
                  download
                  className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50"
                >
                  Download
                </a>
              </>
            )}

            <button
              onClick={onClose}
              className="rounded-lg bg-black px-3 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              Close
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="max-h-[80vh] overflow-auto bg-gray-50 p-4">
          {!url ? (
            <div className="rounded-xl border bg-white p-8 text-center text-gray-600">
              No preview URL available.
            </div>
          ) : fit ? (
            /**
             * FIT MODE (no cropping):
             * - wrapper controls viewport size
             * - img is contained within both width and height
             */
            <div className="mx-auto flex h-[72vh] w-full items-center justify-center rounded-xl border bg-white p-2">
              <img
                src={url}
                alt="Preview"
                className="max-h-full max-w-full object-contain"
              />
            </div>
          ) : (
            /**
             * ACTUAL SIZE:
             * - no scaling; user pans by scrolling (overflow-auto)
             */
            <div className="inline-block rounded-xl border bg-white p-2">
              <img src={url} alt="Preview" className="block h-auto w-auto max-w-none" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
