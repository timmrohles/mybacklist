import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "The Backlist Club",
    template: "%s | The Backlist Club",
  },
  description: "Handverlesene Buchempfehlungen – keine Algorithmen, keine Bestsellerlisten. Bücher die wirklich bleiben.",
  openGraph: {
    siteName: "The Backlist Club",
    locale: "de_DE",
    type: "website",
  },
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
