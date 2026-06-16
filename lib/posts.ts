import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { headingSlug, readingTime } from "@/lib/utils";

const contentDir = path.join(process.cwd(), "content");


export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  description: string;
  author: string;
  tags: string[];
  readingTime: number;
}

export interface Post extends PostMeta {
  content: string;
}

export interface Heading {
  text: string;
  id: string;
}

export function getAllPosts(): PostMeta[] {
  const files = fs.readdirSync(contentDir).filter((f) => f.endsWith(".md"));

  return files
    .map((filename) => {
      const slug = filename.replace(/\.md$/, "");
      const raw = fs.readFileSync(path.join(contentDir, filename), "utf-8");
      const { data, content } = matter(raw);
      return {
        slug,
        title: data.title ?? slug,
        date: data.date ?? "",
        description: data.description ?? "",
        author: data.author ? String(data.author) : "",
        tags: Array.isArray(data.tags) ? data.tags : [],
        readingTime: readingTime(content),
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPost(slug: string): Post | null {
  const filePath = path.join(contentDir, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);

  return {
    slug,
    title: data.title ?? slug,
    date: data.date ?? "",
    description: data.description ?? "",
    author: data.author ?? "",
    tags: Array.isArray(data.tags) ? data.tags : [],
    readingTime: readingTime(content),
    content,
  };
}

export function getAllSlugs(): string[] {
  return fs
    .readdirSync(contentDir)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

export function extractHeadings(content: string): Heading[] {
  const matches = [...content.matchAll(/^##\s+(.+)$/gm)];
  return matches.map((m) => {
    const raw = m[1].trim();
    const text = raw.replace(/\*\*(.+?)\*\*/g, "$1").replace(/`(.+?)`/g, "$1").trim();
    return { text, id: headingSlug(text) };
  });
}
