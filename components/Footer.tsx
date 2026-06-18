import Link from "next/link";
import { GitFork, ExternalLink } from "lucide-react";

const SERIES = [
  { href: "/publicaciones/01-fundamentos",    label: "Fundamentos" },
  { href: "/publicaciones/02-vulnerabilidades", label: "Vulnerabilidades" },
  { href: "/publicaciones/03-hardening",      label: "Hardening" },
  { href: "/publicaciones/04-informe-final",  label: "Informe Final" },
  { href: "/publicaciones/05-manual-hardening", label: "Manual de Hardening" },
];

const RECURSOS = [
  { href: "https://ubuntu.com/security",                           label: "Ubuntu Security" },
  { href: "https://cisofy.com/lynis/",                             label: "Lynis" },
  { href: "https://www.cisecurity.org/benchmark/ubuntu_linux",     label: "CIS Benchmark" },
  { href: "https://ubuntu.com/security/notices",                   label: "Ubuntu USN" },
  { href: "https://cve.mitre.org",                                 label: "MITRE CVE" },
];

const BLOG_LINKS = [
  { href: "/",                                label: "Inicio" },
  { href: "/publicaciones/00-indice-guia",    label: "Índice y Guía" },
];

function ColTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[.08em] text-subtle">
      {children}
    </p>
  );
}

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto max-w-[1200px] px-6 pb-8 pt-12">
        {/* Top grid */}
        <div className="grid grid-cols-2 gap-x-12 gap-y-9 sm:grid-cols-4">
          {/* Brand column */}
          <div className="col-span-2 flex flex-col gap-3 sm:col-span-1">
            <div className="flex items-center gap-2.5">
              <span className="font-brand text-[15px] font-bold text-ink">SecUbuntU</span>
            </div>
            <p className="max-w-[240px] text-[13px] leading-relaxed text-muted">
              Blog académico sobre seguridad informática en Ubuntu. Proyecto de Seguridad Informática.
            </p>
          </div>

          {/* Serie */}
          <div>
            <ColTitle>Serie</ColTitle>
            <ul className="flex flex-col gap-2">
              {SERIES.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-[14px] text-muted no-underline transition-colors hover:text-brand">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Recursos */}
          <div>
            <ColTitle>Recursos</ColTitle>
            <ul className="flex flex-col gap-2">
              {RECURSOS.map(({ href, label }) => (
                <li key={href}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[14px] text-muted no-underline transition-colors hover:text-brand"
                  >
                    {label} <ExternalLink size={11} />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Blog */}
          <div>
            <ColTitle>Blog</ColTitle>
            <ul className="flex flex-col gap-2">
              {BLOG_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-[14px] text-muted no-underline transition-colors hover:text-brand">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-5">
          <p className="font-mono text-[12px] text-subtle">
            © 2026 SecUbuntU · Grupo 8
          </p>
        </div>
      </div>
    </footer>
  );
}
