"use client";
import { useState } from "react";
import { Link as LinkIcon, Check } from "lucide-react";

export default function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  const handle = async () => {
    try { await navigator.clipboard.writeText(window.location.href); } catch { /* noop */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handle}
      className={`flex items-center gap-1.5 rounded-[7px] border px-3.5 py-1.5 font-mono text-[13px] transition-colors duration-[180ms] ${
        copied
          ? "border-green-300 bg-green-50 text-green-700"
          : "border-border-heavy text-muted hover:border-brand hover:text-brand"
      }`}
    >
      {copied ? <Check size={13} /> : <LinkIcon size={13} />}
      {copied ? "Copiado" : "Copiar enlace"}
    </button>
  );
}
