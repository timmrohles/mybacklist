import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Backlist Club",
  description: "Handverlesene Buchempfehlungen – keine Algorithmen, keine Bestsellerlisten.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
