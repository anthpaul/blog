"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Suspense } from "react";
import NavSearch from "./NavSearch";

const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/publicaciones/01-fundamentos", label: "Fundamentos" },
  { href: "/publicaciones/02-vulnerabilidades", label: "Vulnerabilidades" },
  { href: "/publicaciones/03-hardening", label: "Hardening" },
  { href: "/publicaciones/05-manual-hardening", label: "Manual" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="relative z-50 border-b border-border bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-[60px] max-w-[1200px] items-center gap-6 px-6">

        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2.5 no-underline">
          <span className="font-brand text-[15px] font-bold tracking-tight text-ink">
            SecUbuntU
            <span className="font-sans text-[12px] font-normal text-subtle"> / blog</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden flex-1 items-center justify-center gap-1 md:flex">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`rounded-[7px] px-3 py-[5px] text-sm font-medium no-underline transition-colors duration-[180ms] ${
                isActive(href)
                  ? "bg-brand-soft text-brand-text"
                  : "text-muted hover:bg-surface-2 hover:text-ink"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right: search pill + CTA */}
        <div className="ml-auto flex shrink-0 items-center gap-2.5">
          <Suspense>
            <NavSearch />
          </Suspense>
          <a
            href="https://ubuntu.com/download"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-[7px] bg-brand px-3.5 py-[6px] text-[13px] font-semibold text-white no-underline transition-opacity hover:opacity-90 md:block"
          >
            Descargar Ubuntu
          </a>
          <button
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((o) => !o)}
            className="flex h-11 w-11 items-center justify-center rounded-lg text-ink transition-colors hover:bg-surface-2 md:hidden"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div id="mobile-nav" className="border-t border-border bg-surface px-6 pb-4 pt-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex min-h-[44px] items-center rounded-lg px-3 text-[15px] font-medium no-underline transition-colors ${
                  isActive(href)
                    ? "bg-brand-soft text-brand-text"
                    : "text-muted hover:bg-surface-2"
                }`}
              >
                {label}
              </Link>
            ))}
            <a
              href="https://ubuntu.com/download"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex min-h-[44px] items-center justify-center rounded-lg bg-brand text-sm font-semibold text-white no-underline"
            >
              Descargar Ubuntu
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
