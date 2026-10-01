import Link from "next/link";
import type { ReactElement } from "react";
import { listLinks } from "@/lib/links";
import { deleteLinkAction } from "./actions";
import { CreateLinkForm } from "./create-link-form";

export default async function Home({
  searchParams,
}: PageProps<"/">): Promise<ReactElement> {
  const { q, missing: missingParam } = await searchParams;
  const search = typeof q === "string" ? q.trim() : "";
  const links = listLinks(search);

  // Set by /go/[slug] when someone visits a shortcut that does not exist.
  const requested =
    typeof missingParam === "string" ? missingParam.toLowerCase() : "";
  const missing = links.some((link) => link.slug === requested)
    ? ""
    : requested;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-bold text-3xl">Go Links</h1>
      <p className="mt-1 text-zinc-600">
        Short, memorable links for internal tools and docs.
      </p>

      {missing !== "" && (
        <p
          className="mt-6 rounded border border-amber-300 bg-amber-50 px-4 py-3"
          role="status"
        >
          <span className="font-mono">go/{missing}</span> does not exist yet.
          You can create it below.
        </p>
      )}

      <div className="mt-8 grid gap-10 md:grid-cols-[1fr_20rem]">
        <section aria-labelledby="shortcuts">
          <h2 className="font-semibold text-lg" id="shortcuts">
            Shortcuts
          </h2>

          <form className="mt-3 flex gap-2">
            <input
              aria-label="Search shortcuts"
              className="w-full rounded border border-zinc-400 px-3 py-2"
              defaultValue={search}
              name="q"
              placeholder="Search by name, URL or description"
              type="search"
            />
            <button
              className="rounded border border-zinc-400 px-4 py-2 font-medium hover:bg-zinc-100"
              type="submit"
            >
              Search
            </button>
          </form>

          <p className="mt-3 text-sm text-zinc-600">
            {links.length} {links.length === 1 ? "shortcut" : "shortcuts"}
            {search !== "" && (
              <>
                {" "}
                matching “{search}”.{" "}
                <Link className="underline" href="/">
                  Clear search
                </Link>
              </>
            )}
          </p>

          <ul className="mt-3 divide-y divide-zinc-200 rounded border border-zinc-200 bg-white empty:hidden">
            {links.map((link) => (
              <li className="flex items-start gap-4 px-4 py-3" key={link.slug}>
                <div className="min-w-0 flex-1">
                  <a
                    className="font-mono font-semibold text-blue-700 hover:underline"
                    href={`/go/${link.slug}`}
                  >
                    go/{link.slug}
                  </a>
                  <p className="text-sm">{link.description}</p>
                  <p className="truncate text-sm text-zinc-600">{link.url}</p>
                </div>
                <div className="text-right text-sm">
                  <p className="text-zinc-600">
                    {link.visits} {link.visits === 1 ? "visit" : "visits"}
                  </p>
                  <form action={deleteLinkAction}>
                    <input name="slug" type="hidden" value={link.slug} />
                    <button
                      aria-label={`Delete go/${link.slug}`}
                      className="text-red-700 hover:underline"
                      type="submit"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <CreateLinkForm defaultSlug={missing} />
      </div>
    </main>
  );
}
