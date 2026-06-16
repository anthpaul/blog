"use client";
import { useEffect, useState } from "react";
import type { Heading } from "@/lib/posts";

export default function TableOfContents({ headings }: { headings: Heading[] }) {
  const [active, setActive] = useState("");

  useEffect(() => {
    if (!headings.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-15% 0% -65% 0%", threshold: 0 }
    );
    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [headings]);

  if (!headings.length) return null;

  return (
    <nav aria-label="Tabla de contenidos" className="sticky top-[88px]">
      <p className="mb-2.5 font-mono text-[11px] font-semibold uppercase tracking-[.08em] text-subtle">
        Contenido
      </p>
      <ul className="flex flex-col gap-0.5">
        {headings.map(({ text, id }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              className={`block rounded-r-[5px] border-l-2 py-[5px] pl-2.5 pr-2 text-[13px] leading-snug no-underline transition-all duration-[180ms] ${
                active === id
                  ? "border-brand bg-brand-soft font-medium text-brand-text"
                  : "border-border text-muted hover:border-brand hover:bg-brand-soft hover:text-brand-text"
              }`}
            >
              {text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
