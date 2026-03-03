import type { Metadata } from "next";
import { Syne, Lora } from "next/font/google";
import "./globals.css";
import ClientLayout from "./components/ClientLayout";

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-lora",
  display: "swap",
});

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
    <html lang="de" className={`${syne.variable} ${lora.variable}`}>
      <body className="flex flex-col min-h-screen">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
