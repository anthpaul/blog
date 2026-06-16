import { Children, isValidElement, type ReactNode, type ReactElement } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import type { Components } from "react-markdown";
import { headingSlug } from "@/lib/utils";
import { AlertTriangle, Camera, Lightbulb, Info } from "lucide-react";
import CopyCodeButton from "./CopyCodeButton";
import ChecklistTable from "./ChecklistTable";

/* ── text extractor ─────────────────────────────────────── */
function getText(node: React.ReactNode): string {
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(getText).join("");
  if (node && typeof node === "object" && "props" in (node as object)) {
    const el = node as React.ReactElement<{ children?: React.ReactNode }>;
    return getText(el.props.children);
  }
  return "";
}

/* ── strip leading text marker from first text node ─────── */
const MARKER_RE = /^\[(AVISO|CAPTURA|TIP|INFO)\]\s*/;

function stripMarker(node: React.ReactNode, done = { v: false }): React.ReactNode {
  if (done.v) return node;
  if (typeof node === "string") {
    const next = node.replace(MARKER_RE, "");
    if (next !== node) done.v = true;
    return next;
  }
  if (Array.isArray(node)) return node.map((c) => stripMarker(c, done));
  if (node && typeof node === "object" && "props" in (node as object)) {
    const el = node as React.ReactElement<{ children?: React.ReactNode }>;
    return { ...el, props: { ...el.props, children: stripMarker(el.props.children, done) } };
  }
  return node;
}

/* ── callout config ─────────────────────────────────────── */
const CALLOUT = {
  warning: { Icon: AlertTriangle, cls: "border-callout-warning-border bg-callout-warning-bg text-callout-warning-ink" },
  capture: { Icon: Camera,        cls: "border-callout-capture-border bg-callout-capture-bg text-callout-capture-ink" },
  tip:     { Icon: Lightbulb,     cls: "border-callout-tip-border bg-callout-tip-bg text-callout-tip-ink" },
  info:    { Icon: Info,          cls: "border-callout-info-border bg-callout-info-bg text-callout-info-ink" },
} as const;

type CalloutKey = keyof typeof CALLOUT;

function detectCallout(text: string): CalloutKey | null {
  if (text.startsWith("[AVISO]")) return "warning";
  if (text.startsWith("[CAPTURA]")) return "capture";
  if (text.startsWith("[TIP]")) return "tip";
  if (text.startsWith("[INFO]")) return "info";
  return null;
}

/* ── checklist table detection ──────────────────────────── */
function parseChecklist(children: ReactNode): Array<{ id: string; label: string }> | null {
  let isChecklist = false;
  const items: Array<{ id: string; label: string }> = [];

  Children.forEach(children, (section) => {
    if (!isValidElement(section)) return;
    const el = section as ReactElement<{ children: ReactNode }>;
    const tag = typeof el.type === "string" ? el.type : "";

    if (tag === "thead") {
      if (getText(el.props.children).includes("Estado")) isChecklist = true;
    }

    if (tag === "tbody" && isChecklist) {
      Children.forEach(el.props.children, (row) => {
        if (!isValidElement(row)) return;
        const rowEl = row as ReactElement<{ children: ReactNode }>;
        const cells: string[] = [];
        Children.forEach(rowEl.props.children, (cell) => {
          if (isValidElement(cell)) {
            const cellEl = cell as ReactElement<{ children: ReactNode }>;
            cells.push(getText(cellEl.props.children));
          }
        });
        if (cells.length >= 2) items.push({ id: cells[0].trim(), label: cells[1].trim() });
      });
    }
  });

  return isChecklist && items.length > 0 ? items : null;
}

/* ── custom markdown components ─────────────────────────── */
const components: Components = {
  h2({ children }) {
    const id = headingSlug(getText(children));
    return (
      <h2
        id={id}
        className="mt-9 mb-3 scroll-mt-24 text-[1.35rem] font-bold tracking-[-0.03em] text-balance text-ink"
      >
        {children}
      </h2>
    );
  },

  h3({ children }) {
    const id = headingSlug(getText(children));
    return (
      <h3
        id={id}
        className="mt-7 mb-2 scroll-mt-24 text-[1.1rem] font-semibold text-ink"
      >
        {children}
      </h3>
    );
  },

  pre({ children }) {
    const codeEl = (Array.isArray(children) ? children[0] : children) as React.ReactElement<{
      className?: string;
      children?: React.ReactNode;
    }> | null;
    const cls = codeEl?.props?.className ?? "";
    const lang = /language-(\w+)/.exec(cls)?.[1] ?? "";
    const code = getText(codeEl?.props?.children);

    return (
      <div className="my-6 overflow-hidden rounded-[12px] shadow-float">
        {/* Chrome bar */}
        <div className="flex items-center gap-2 border-b border-white/[.06] bg-[#1a1a20] px-3.5 py-2.5">
          <div aria-hidden="true" className="flex shrink-0 gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          </div>
          <span className="flex-1 text-center font-mono text-[11px] lowercase tracking-[.04em] text-[#6b7280]">
            {lang || "code"}
          </span>
          <CopyCodeButton code={code} />
        </div>
        {/* Code */}
        <pre
          className={`${cls} !m-0 !rounded-none !bg-code-bg !p-5 font-mono !text-[13px] !leading-[1.7] !text-code-text [white-space:pre-wrap] [word-break:break-word]`}
        >
          {children}
        </pre>
      </div>
    );
  },

  code({ className, children }) {
    if (className) return <code className={className}>{children}</code>;
    return (
      <code className="rounded-[5px] border border-border bg-chip px-[.38em] py-[.15em] font-mono text-[.84em] text-brand-text">
        {children}
      </code>
    );
  },

  blockquote({ children }) {
    const text = getText(children);
    const type = detectCallout(text);

    if (type) {
      const { Icon, cls } = CALLOUT[type];
      const clean = stripMarker(children);
      return (
        <div
          className={`my-5 flex gap-3 rounded-[10px] border p-4 text-sm leading-relaxed ${cls}`}
        >
          <Icon size={16} className="mt-0.5 shrink-0" />
          <div className="[&_p]:m-0">{clean as React.ReactNode}</div>
        </div>
      );
    }

    return (
      <blockquote className="my-6 rounded-[8px] border border-border bg-surface-2 px-4 py-3 text-base text-muted italic [&_p]:m-0">
        {children}
      </blockquote>
    );
  },

  table({ children }) {
    const items = parseChecklist(children);
    if (items) return <ChecklistTable items={items} />;
    return (
      <div className="my-5 overflow-x-auto rounded-lg">
        <table className="min-w-[540px] w-full border-collapse">{children}</table>
      </div>
    );
  },
};

/* ── export ─────────────────────────────────────────────── */
export default function PostContent({ content }: { content: string }) {
  return (
    <div className="article-body max-w-[720px] text-ink">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
