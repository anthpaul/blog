"use client";
import { useState } from "react";
import { Check } from "lucide-react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <div aria-live="polite">
      {sent ? (
        <p role="status" className="flex items-center gap-1.5 font-mono text-[13px] text-brand">
          <Check size={14} /> Suscrito correctamente
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          <label htmlFor="newsletter-email" className="sr-only">
            Dirección de correo electrónico
          </label>
          <input
            id="newsletter-email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-[7px] border border-border-heavy bg-surface px-3 py-2 text-[13px] text-ink outline-none placeholder:text-subtle focus:border-brand"
          />
          <button
            onClick={() => { if (email) setSent(true); }}
            className="w-full rounded-[7px] bg-brand py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            Suscribirse
          </button>
        </div>
      )}
    </div>
  );
}
