"use client";

export default function SkeletonCard() {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="h-4 w-40 rounded bg-gray-200" />
      <div className="mt-3 h-6 w-3/4 rounded bg-gray-200" />
      <div className="mt-2 h-4 w-5/6 rounded bg-gray-200" />
      <div className="mt-2 h-4 w-2/3 rounded bg-gray-200" />
      <div className="mt-4 flex gap-2">
        <div className="h-9 w-32 rounded bg-gray-200" />
        <div className="h-9 w-28 rounded bg-gray-200" />
        <div className="h-9 w-28 rounded bg-gray-200" />
      </div>
    </div>
  );
}
