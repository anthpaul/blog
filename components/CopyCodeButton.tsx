"use client";
import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      aria-label="Copiar código"
      onClick={async () => {
        try { await navigator.clipboard.writeText(code); } catch { /* noop */ }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className={`flex shrink-0 items-center gap-1 rounded border px-2 py-0.5 font-mono text-[11px] transition-colors duration-[180ms] ${
        copied
          ? "border-[#28c840]/40 text-[#28c840]"
          : "border-white/10 text-[#6b7280] hover:border-white/25 hover:text-code-text"
      }`}
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? "Copiado" : "Copiar"}
    </button>
  );
}
