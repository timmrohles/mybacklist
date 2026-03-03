import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "./components/ClientLayout";

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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de">
      <body className="flex flex-col min-h-screen">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
