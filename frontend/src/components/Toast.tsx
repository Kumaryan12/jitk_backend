"use client";

export type ToastItem = { id: string; message: string; kind?: "success" | "error" };

export default function Toast({ items }: { items: ToastItem[] }) {
  if (!items.length) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
      {items.map((t) => (
        <div
          key={t.id}
          className={[
            "rounded-xl px-4 py-3 shadow-lg border text-sm font-medium",
            t.kind === "error"
              ? "bg-red-50 border-red-200 text-red-800"
              : "bg-green-50 border-green-200 text-green-800",
          ].join(" ")}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
