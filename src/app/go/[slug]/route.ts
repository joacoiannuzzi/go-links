import { redirect } from "next/navigation";
import { visitLink } from "@/lib/links";

export async function GET(
  _request: Request,
  { params }: RouteContext<"/go/[slug]">
): Promise<never> {
  const { slug } = await params;
  const url = visitLink(slug.toLowerCase());

  // Temporary redirect (307), so browsers ask again and every visit is counted.
  // Unknown shortcut: send the person to the form with the name filled in.
  redirect(url ?? `/?missing=${encodeURIComponent(slug)}`);
}
