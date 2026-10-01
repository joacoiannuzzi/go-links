"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createLink, deleteLink, linkSchema } from "@/lib/links";

export interface FormState {
  created?: string;
  errors?: { slug?: string[]; url?: string[]; description?: string[] };
  values?: Record<keyof z.infer<typeof linkSchema>, string>;
}

/** Form fields are strings; anything else (a file, a missing field) is treated as empty. */
function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export async function createLinkAction(
  _previous: FormState,
  formData: FormData
): Promise<FormState> {
  const values = {
    description: text(formData, "description"),
    slug: text(formData, "slug"),
    url: text(formData, "url"),
  };

  const parsed = linkSchema.safeParse(values);
  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors, values };
  }
  if (!createLink(parsed.data)) {
    return {
      errors: { slug: ["This shortcut name is already taken."] },
      values,
    };
  }

  revalidatePath("/");
  return { created: parsed.data.slug };
}

export async function deleteLinkAction(formData: FormData): Promise<void> {
  deleteLink(text(formData, "slug"));
  revalidatePath("/");
}
