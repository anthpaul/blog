import Link from "next/link";
import { Clock } from "lucide-react";
import type { PostMeta } from "@/lib/posts";
import { formatDate } from "@/lib/utils";

export default function PostCard({
  post,
  featured = false,
}: {
  post: PostMeta;
  featured?: boolean;
}) {
  const chip = post.tags[0] ?? "ubuntu";

  return (
    <article className="group flex flex-col overflow-hidden rounded-[14px] border border-border bg-surface transition-all duration-[180ms] hover:-translate-y-0.5 hover:border-brand hover:shadow-[0_4px_12px_-4px_rgba(233,84,32,.18)]">
      {/* Image placeholder */}
      <div
        aria-hidden="true"
        className={`img-stripe flex items-center justify-center border-b border-border font-mono text-[12px] tracking-wider text-subtle ${
          featured ? "h-48" : "h-32"
        }`}
      >
        [ imagen ]
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-5">
        {/* Category chip */}
        <span className="inline-block self-start rounded-[5px] border border-brand/20 bg-brand-soft px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-[.05em] text-brand-text">
          {chip}
        </span>

        {/* Title */}
        <h2
          className={`text-balance leading-[1.35] tracking-[-0.03em] text-ink ${
            featured ? "text-xl font-bold" : "text-[17px] font-bold"
          }`}
        >
          <Link
            href={`/publicaciones/${post.slug}`}
            className="no-underline text-inherit transition-colors hover:text-brand"
          >
            {post.title}
          </Link>
        </h2>

        {/* Description */}
        <p className="flex-1 text-sm leading-relaxed text-muted">
          {post.description}
        </p>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <span className="font-mono text-[12px] text-subtle">
            {formatDate(post.date)}
          </span>
          <span className="text-[12px] text-subtle">·</span>
          <span className="flex items-center gap-1 font-mono text-[12px] text-subtle">
            <Clock size={11} />
            {post.readingTime} min
          </span>
          {post.author && (
            <>
              <span className="text-[12px] text-subtle">·</span>
              <span className="font-mono text-[12px] text-subtle">{post.author}</span>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
