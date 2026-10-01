"use client";

import { type ReactElement, useActionState } from "react";
import { createLinkAction } from "./actions";

type Field = "slug" | "url" | "description";

export function CreateLinkForm({
  defaultSlug,
}: {
  defaultSlug?: string;
}): ReactElement {
  const [state, action, pending] = useActionState(createLinkAction, {});

  const field = (name: Field, label: string, hint: string): ReactElement => {
    const error = state.errors?.[name]?.[0];
    return (
      <div>
        <label className="block font-medium text-sm" htmlFor={name}>
          {label}
        </label>
        <input
          aria-describedby={`${name}-help`}
          aria-invalid={error !== undefined}
          className="mt-1 w-full rounded border border-zinc-400 px-3 py-2 aria-invalid:border-red-700"
          defaultValue={
            state.values?.[name] ?? (name === "slug" ? defaultSlug : "")
          }
          id={name}
          name={name}
        />
        <p
          className={`mt-1 text-sm ${error === undefined ? "text-zinc-600" : "text-red-700"}`}
          id={`${name}-help`}
        >
          {error ?? hint}
        </p>
      </div>
    );
  };

  return (
    <form action={action} className="space-y-4">
      <h2 className="font-semibold text-lg">New shortcut</h2>

      {field(
        "slug",
        "Shortcut name",
        "Lowercase letters, numbers and hyphens."
      )}
      {field(
        "url",
        "Destination URL",
        "Where the shortcut should take people."
      )}
      {field(
        "description",
        "Description (optional)",
        "Helps teammates find it in search."
      )}

      <button
        className="rounded bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800 disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "Creating…" : "Create shortcut"}
      </button>

      <p className="text-green-800 text-sm" role="status">
        {state.created !== undefined && `Created go/${state.created}.`}
      </p>
    </form>
  );
}
