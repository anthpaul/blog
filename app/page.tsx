import { getAllPosts } from "@/lib/posts";
import PostCard from "@/components/PostCard";

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function Home({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const allPosts = getAllPosts();
  const posts = query
    ? allPosts.filter((p) => {
        const haystack = `${p.title} ${p.description} ${p.tags.join(" ")}`.toLowerCase();
        return haystack.includes(query.toLowerCase());
      })
    : allPosts;

  const featured = !query && posts.length > 0 ? posts[0] : null;
  const rest = !query ? posts.slice(1) : posts;

  return (
    <main className="flex-1 bg-surface-2">
      {/* Header */}
      <div className="border-b border-border bg-surface px-6 pb-11 pt-[52px]">
        <div className="mx-auto max-w-[1200px]">
          <h1 className="mb-3 text-[clamp(1.8rem,4vw,2.6rem)] font-extrabold leading-[1.2] tracking-[-0.04em] text-balance text-ink">
            Seguridad Informática
            <br />
            <span className="text-brand">en Ubuntu</span>
          </h1>
          <p className="max-w-[560px] text-[1.05rem] leading-[1.65] text-muted">
            Fundamentos, análisis de vulnerabilidades, hardening y buenas prácticas
            para sistemas Ubuntu 22.04 / 24.04 LTS.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] px-6 pb-16 pt-10">
        {/* Search feedback */}
        {query && (
          <div className="mb-6 flex items-center gap-3">
            <p className="text-[13px] text-muted">
              {posts.length > 0
                ? `${posts.length} resultado${posts.length !== 1 ? "s" : ""} para `
                : `Sin resultados para `}
              <span className="font-semibold text-ink">&ldquo;{query}&rdquo;</span>
            </p>
            <a
              href="/"
              className="font-mono text-[12px] text-subtle underline transition-colors hover:text-brand-text"
            >
              Limpiar
            </a>
          </div>
        )}

        {/* Empty state */}
        {posts.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-[1rem] text-muted">No se encontraron publicaciones.</p>
          </div>
        )}

        {/* Featured post */}
        {featured && (
          <section className="mb-10">
            <h2 className="mb-3.5 text-[13px] font-semibold text-muted">
              Publicación reciente
            </h2>
            <PostCard post={featured} featured />
          </section>
        )}

        {/* Grid */}
        {rest.length > 0 && (
          <section>
            <h2 className="mb-3.5 text-[13px] font-semibold text-muted">
              {query ? "Resultados" : "Todas las publicaciones"}
            </h2>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5">
              {rest.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
