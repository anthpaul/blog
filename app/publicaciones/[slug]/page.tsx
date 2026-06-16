import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ChevronLeft } from "lucide-react";
import { getPost, getAllSlugs, getAllPosts, extractHeadings } from "@/lib/posts";
import { formatDate } from "@/lib/utils";
import PostContent from "@/components/PostContent";
import ReadingProgress from "@/components/ReadingProgress";
import TableOfContents from "@/components/TableOfContents";
import CopyLinkButton from "@/components/CopyLinkButton";
import NewsletterForm from "@/components/NewsletterForm";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return { title: `${post.title} — SecUbuntU`, description: post.description };
}

const UBUNTU_VERSIONS = [
  { name: "24.04 LTS Noble Numbat",    tagCls: "bg-brand",     tag: "LTS" },
  { name: "22.04 LTS Jammy Jellyfish", tagCls: "bg-[#5e5e72]", tag: "LTS" },
  { name: "25.04 Plucky Puffin",       tagCls: "bg-brand-2",   tag: "Dev" },
];

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const allPosts = getAllPosts();
  const idx = allPosts.findIndex((p) => p.slug === slug);
  const prev = allPosts[idx + 1] ?? null;
  const next = allPosts[idx - 1] ?? null;
  const headings = extractHeadings(post.content);
  const seriesPosts = allPosts.filter((p) => p.slug !== slug).slice(0, 5);

  const initials = (post.author ?? "A")
    .split(/\s+/)
    .map((w) => w[0].toUpperCase())
    .join("")
    .slice(0, 2);

  const chip = post.tags[0] ?? "ubuntu";

  return (
    <>
      <ReadingProgress />

      <div className="mx-auto max-w-[1200px] flex-1 px-6 pb-20 pt-10">
        {/* Back link */}
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 font-mono text-[13px] text-subtle no-underline transition-colors hover:text-brand"
        >
          <ArrowLeft size={13} /> Volver al inicio
        </Link>

        {/* Hero */}
        <header className="mb-9">
          {/* Chip */}
          <span className="mb-3.5 inline-block rounded-[5px] border border-brand/20 bg-brand-soft px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-[.05em] text-brand-text">
            {chip}
          </span>

          {/* Title */}
          <h1 className="mb-3.5 max-w-[760px] text-[clamp(1.6rem,3.5vw,2.2rem)] font-extrabold leading-[1.22] tracking-[-0.04em] text-balance text-ink">
            {post.title}
          </h1>

          {/* Description */}
          <p className="mb-5 max-w-[640px] text-[1.05rem] leading-[1.65] text-muted">
            {post.description}
          </p>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-mono text-[12px] text-subtle">
                {formatDate(post.date)}
              </span>
              <span className="text-border-heavy">·</span>
              <span className="font-mono text-[12px] text-subtle">
                {post.readingTime} min lectura
              </span>
            </div>
            <div className="ml-1 flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-[5px] border border-border bg-chip px-[7px] py-0.5 font-mono text-[11px] text-subtle"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Hero image placeholder */}
          <div
            className="img-stripe mt-7 flex h-[220px] items-center justify-center rounded-[12px] border border-border font-mono text-[12px] tracking-wider text-subtle"
            aria-hidden="true"
          >
            [ imagen destacada ]
          </div>
        </header>

        {/* 3-column grid */}
        <div className="grid grid-cols-1 items-start gap-x-[46px] lg:grid-cols-[220px_minmax(0,1fr)_264px]">
          {/* Left: TOC — hidden on mobile */}
          <aside className="hidden lg:block">
            <TableOfContents headings={headings} />
          </aside>

          {/* Center: content */}
          <div>
            <PostContent content={post.content} />

            {/* Share */}
            <div className="mt-12 flex flex-wrap items-center gap-2.5 border-t border-border pt-6">
              <span className="font-mono text-[13px] text-subtle">Compartir:</span>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-[7px] border border-border-heavy px-3.5 py-1.5 font-mono text-[13px] text-muted no-underline transition-colors hover:border-brand hover:text-brand"
              >
                X / Twitter
              </a>
              <CopyLinkButton />
            </div>

            {/* Prev / Next */}
            <nav className="mt-8 grid grid-cols-2 gap-4">
              {prev ? (
                <Link
                  href={`/publicaciones/${prev.slug}`}
                  className="flex flex-col rounded-[10px] border border-border bg-surface px-4 py-3.5 text-left no-underline transition-colors hover:border-brand"
                >
                  <span className="flex items-center gap-1 font-mono text-[11px] uppercase tracking-[.06em] text-subtle">
                    <ChevronLeft size={11} /> Anterior
                  </span>
                  <span className="mt-1 text-[14px] font-semibold text-ink">
                    {prev.title}
                  </span>
                </Link>
              ) : <div />}

              {next ? (
                <Link
                  href={`/publicaciones/${next.slug}`}
                  className="flex flex-col rounded-[10px] border border-border bg-surface px-4 py-3.5 text-right no-underline shadow-card transition-colors hover:border-brand"
                >
                  <span className="flex items-center justify-end gap-1 font-mono text-[11px] uppercase tracking-[.06em] text-subtle">
                    Siguiente <ArrowRight size={11} />
                  </span>
                  <span className="mt-1 text-[14px] font-semibold text-ink">
                    {next.title}
                  </span>
                </Link>
              ) : <div />}
            </nav>
          </div>

          {/* Right: sidebar */}
          <aside className="flex flex-col gap-7 lg:sticky lg:top-[88px]">
            {/* Ubuntu versions */}
            <div className="rounded-[12px] border border-border bg-surface p-4">
              <h2 className="mb-3 text-[12px] font-semibold text-muted">
                Versiones Ubuntu
              </h2>
              {UBUNTU_VERSIONS.map((v) => (
                <div
                  key={v.name}
                  className="flex items-center justify-between border-b border-border py-2 text-[13px] last:border-0"
                >
                  <span className="text-muted">{v.name}</span>
                  <span
                    className={`shrink-0 rounded-[4px] px-1.5 py-0.5 font-mono text-[10px] font-semibold text-white ${v.tagCls}`}
                  >
                    {v.tag}
                  </span>
                </div>
              ))}
            </div>

            {/* Series */}
            <div className="rounded-[12px] border border-border bg-surface p-4">
              <h2 className="mb-3 text-[12px] font-semibold text-muted">
                De la serie
              </h2>
              <ul className="flex flex-col gap-1">
                {seriesPosts.map((p) => (
                  <li key={p.slug}>
                    <Link
                      href={`/publicaciones/${p.slug}`}
                      className="block rounded-[6px] px-2 py-1.5 text-[13px] leading-[1.4] text-muted no-underline transition-colors hover:bg-surface-2 hover:text-brand"
                    >
                      {p.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
