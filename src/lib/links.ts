import { DatabaseSync } from "node:sqlite";
import { z } from "zod";

export const linkSchema = z.object({
  description: z.string().trim().max(200, "Use 200 characters or fewer."),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .max(64, "Use 64 characters or fewer.")
    .regex(
      /^[a-z0-9]+(-[a-z0-9]+)*$/,
      "Use lowercase letters, numbers and hyphens, e.g. design-system."
    ),
  // Only http(s): blocks javascript: and data: destinations.
  url: z
    .string()
    .trim()
    .max(2048, "Use 2048 characters or fewer.")
    .regex(
      /^https?:\/\/\S+$/i,
      "Enter a full URL starting with http:// or https://."
    ),
});

export type LinkInput = z.infer<typeof linkSchema>;

// Rows come back from SQLite untyped; parsing them is the only way to get a
// `Link` without a type assertion.
const linkRow = z.object({
  description: z.string().nullable(),
  slug: z.string(),
  url: z.string(),
  visits: z.number().int(),
});

export type Link = z.infer<typeof linkRow>;

const { GO_LINKS_DB } = process.env;
const db = new DatabaseSync(GO_LINKS_DB ?? "go-links.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS links (
    slug TEXT PRIMARY KEY,
    url TEXT NOT NULL,
    description TEXT,
    visits INTEGER NOT NULL DEFAULT 0
  )
`);

export function listLinks(search = ""): Link[] {
  const rows = db
    .prepare(
      `SELECT slug, url, description, visits FROM links
       WHERE slug || ' ' || url || ' ' || coalesce(description, '') LIKE ?
       ORDER BY slug`
    )
    .all(`%${search}%`);
  return linkRow.array().parse(rows);
}

/** Returns false when the slug is already taken. */
export function createLink(link: LinkInput): boolean {
  const result = db
    .prepare(
      `INSERT INTO links (slug, url, description) VALUES (?, ?, ?)
       ON CONFLICT (slug) DO NOTHING`
    )
    .run(
      link.slug,
      link.url,
      link.description === "" ? null : link.description
    );
  return result.changes === 1;
}

export function deleteLink(slug: string): void {
  db.prepare("DELETE FROM links WHERE slug = ?").run(slug);
}

/** Counts the visit and returns the destination, or undefined if unknown. */
export function visitLink(slug: string): string | undefined {
  const row = db
    .prepare(
      "UPDATE links SET visits = visits + 1 WHERE slug = ? RETURNING url"
    )
    .get(slug);
  return row === undefined
    ? undefined
    : linkRow.pick({ url: true }).parse(row).url;
}
