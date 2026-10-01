import type { Metadata } from "next";
import type { ReactElement } from "react";
import "./globals.css";

export const metadata: Metadata = {
  description: "Short, memorable links for internal tools and docs.",
  title: "Go Links",
};

export default function RootLayout({
  children,
}: LayoutProps<"/">): ReactElement {
  return (
    <html lang="en">
      <body className="bg-zinc-50 text-zinc-900">{children}</body>
    </html>
  );
}
