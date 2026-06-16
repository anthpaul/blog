"use client";
import { useEffect, useState } from "react";
import { Check, RotateCcw } from "lucide-react";

interface Item { id: string; label: string; }

export default function ChecklistTable({
  items,
  storageKey = "hardening-checklist",
}: {
  items: Item[];
  storageKey?: string;
}) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setChecked(JSON.parse(saved));
    } catch { /* noop */ }
    setHydrated(true);
  }, [storageKey]);

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* noop */ }
      return next;
    });
  };

  const reset = () => {
    setChecked({});
    try { localStorage.removeItem(storageKey); } catch { /* noop */ }
  };

  const completedCount = hydrated ? Object.values(checked).filter(Boolean).length : 0;
  const pct = items.length > 0 ? (completedCount / items.length) * 100 : 0;

  return (
    <div className="my-5">
      {/* Progress */}
      <div className="mb-3 flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-brand-text transition-[width] duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="shrink-0 font-mono text-[12px] text-subtle">
          {hydrated ? completedCount : "–"}/{items.length}
        </span>
        {completedCount > 0 && (
          <button
            onClick={reset}
            aria-label="Reiniciar checklist"
            className="flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[11px] text-subtle transition-colors hover:text-brand-text"
          >
            <RotateCcw size={10} />
            Reset
          </button>
        )}
      </div>

      <table className="w-full border-collapse text-[.9rem]">
        <thead>
          <tr>
            <th className="w-8 border border-border bg-surface-2 px-3 py-2.5 text-left font-mono text-[.82rem] uppercase tracking-[.04em] text-muted">
              #
            </th>
            <th className="border border-border bg-surface-2 px-3 py-2.5 text-left font-mono text-[.82rem] uppercase tracking-[.04em] text-muted">
              Medida
            </th>
            <th className="w-[88px] border border-border bg-surface-2 px-3 py-2.5 text-center font-mono text-[.82rem] uppercase tracking-[.04em] text-muted">
              Estado
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map(({ id, label }) => {
            const done = hydrated && (checked[id] ?? false);
            return (
              <tr
                key={id}
                onClick={() => toggle(id)}
                className={`cursor-pointer transition-colors duration-[150ms] ${
                  done ? "bg-green-50 hover:bg-green-50/80" : "hover:bg-surface-2"
                }`}
              >
                <td className="border border-border px-3 py-2.5 font-mono text-[12px] text-subtle">
                  {id}
                </td>
                <td className={`border border-border px-3 py-2.5 transition-colors duration-[150ms] ${
                  done ? "text-muted line-through" : "text-ink"
                }`}>
                  {label}
                </td>
                <td className="border border-border px-3 py-2.5 text-center">
                  <span className={`inline-flex h-5 w-5 items-center justify-center rounded border-2 transition-all duration-[150ms] ${
                    done
                      ? "border-green-500 bg-green-500 text-white"
                      : "border-border-heavy bg-surface"
                  }`}>
                    {done && <Check size={11} strokeWidth={3} />}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
