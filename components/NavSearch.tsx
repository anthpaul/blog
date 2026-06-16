"use client";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

export default function NavSearch() {
  const searchParams = useSearchParams();
  const currentQuery = searchParams.get("q") ?? "";

  return (
    <form
      role="search"
      action="/"
      className="hidden items-center gap-2 rounded-full border border-border-heavy bg-surface-2 px-3.5 py-[6px] md:flex"
    >
      <Search size={13} className="shrink-0 text-subtle" />
      <input
        key={currentQuery}
        type="search"
        name="q"
        defaultValue={currentQuery}
        placeholder="Buscar…"
        aria-label="Buscar publicaciones"
        className="w-36 bg-transparent text-[13px] text-ink outline-none placeholder:text-subtle"
      />
    </form>
  );
}
