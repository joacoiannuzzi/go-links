# Go Links

A small internal URL shortcut service: `go/oncall`, `go/design-system`, `go/payroll`.

You can create a shortcut, browse and search existing ones, and visit `/go/<name>` to be redirected.

## Run it

Requires Node.js 22.13 or newer (uses the built-in `node:sqlite`) and pnpm.

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000. The database file `go-links.db` is created on first run. Set `GO_LINKS_DB` to store it elsewhere.

`pnpm verify` runs every check: `pnpm check` (Biome via Ultracite: formatting and general lint), `pnpm lint` (ESLint, type-aware rules only) and `pnpm typecheck`. `pnpm fix` applies Biome's fixes.

Note: `verify` starts with `next typegen`, which generates the `PageProps` and `RouteContext` types that the code relies on.

## How it works

The whole app is five files:

| File                           | What it does                                           |
| ------------------------------ | ------------------------------------------------------ |
| `src/lib/links.ts`             | Validation rules and the four database queries         |
| `src/app/actions.ts`           | Server actions: create and delete                      |
| `src/app/page.tsx`             | List, search, delete buttons                           |
| `src/app/create-link-form.tsx` | The create form; shows validation errors               |
| `src/app/go/[slug]/route.ts`   | The redirect; counts the visit                         |

The form submits to a server action. The action validates the input, writes to SQLite and the page re-renders with the new list. There is no separate JSON API.

## Type safety

`tsconfig.json` turns on every strictness flag TypeScript has (`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noPropertyAccessFromIndexSignature`, `verbatimModuleSyntax`, `erasableSyntaxOnly` and the rest). ESLint runs `typescript-eslint`'s `strictTypeChecked` preset and additionally forbids type assertions (`as`), non-null assertions (`!`) and `any`. Untyped data crosses into typed code in exactly two places, and both go through a check instead of a cast:

- Database rows are parsed with a zod schema (`linkRow` in `links.ts`).
- Form fields go through a `typeof value === "string"` guard (`text()` in `actions.ts`).

## Assumptions

- **Internal tool on a trusted network.** No authentication: anyone who can reach it can create and delete shortcuts.
- **Shortcut names are lowercase** letters, numbers and hyphens, up to 64 characters. Input is lowercased, so `go/OnCall` and `go/oncall` are the same shortcut.
- **Destinations must start with `http://` or `https://`.** This blocks `javascript:` and `data:` URLs.
- **One server.** SQLite on local disk.

## Tradeoffs I chose

- **Server actions instead of a REST API.** The only client is this page, so an API would be a second layer to keep in sync with the form. If a CLI or browser extension needs to create links, the queries in `links.ts` are ready to sit behind route handlers.
- **`node:sqlite` instead of Postgres or an ORM.** Real persistence with no install step. The cost is a recent Node.js version and hand-written SQL, which is four statements here.
- **Temporary redirect (307), not permanent (301).** Browsers cache permanent redirects, which would hide later changes to a shortcut and skip the visit counter.
- **Unknown shortcuts lead to the create form** with the name filled in, instead of a 404 page. Visiting a shortcut that does not exist is the usual way to find out you need one.
- **Duplicate names are rejected by the database** (`ON CONFLICT DO NOTHING`), not by a read followed by a write, so two people creating the same name at once cannot both succeed.
- **Search and delete are plain HTML forms.** They work without JavaScript. The cost: delete has no confirmation step.

## What I left out, and why

- **Authentication.** It depends on the company's identity provider; guessing would add code that gets thrown away.
- **Editing a shortcut.** Delete and recreate covers it for now. It is the first thing I would add.
- **Pagination.** Fine for hundreds of shortcuts.
- **Docker, CI/CD, deployment.** Not needed to evaluate the design.
- **Automated tests.** The brief did not ask for them and the hour went into the product. I tested every flow by hand: create, validation errors, duplicate name, redirect, unknown shortcut, search, delete. With tests I would start with the validation rules and the duplicate-name conflict.

## With another day

1. Edit a shortcut.
2. Undo after delete, since delete has no confirmation.
3. Tests: unit tests for validation and the queries, Playwright for create, redirect and delete, plus an automated accessibility check.
4. Authentication, an owner per shortcut and a history of changes.
5. Path passthrough: `go/jira/ABC-123` to `https://jira.example.com/browse/ABC-123`.
6. Logging and metrics (redirect hits and misses) once it runs behind other services.
