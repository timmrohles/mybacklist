"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Themen", href: "/themen" },
  { label: "Kuratoren", href: "/kuratoren" },
  { label: "Kurator", href: "/kurator" },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-14">
        <a href="/" className="font-serif text-xl text-white tracking-tight">
          The Backlist Club
        </a>

        {/* Desktop Nav */}
        <nav className="hidden sm:flex gap-6">
          {navLinks.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              className={cn(
                "text-sm transition-colors",
                pathname.startsWith(href) ? "text-white" : "text-white/70 hover:text-white"
              )}
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Mobile Menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden text-white hover:bg-white/10"
              aria-label="Menü öffnen"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64">
            <nav className="flex flex-col mt-8">
              {[
                ...navLinks,
                { label: "Impressum", href: "/impressum" },
                { label: "Datenschutz", href: "/datenschutz" },
              ].map(({ label, href }) => (
                <a
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="font-serif text-lg text-foreground border-b border-border py-4 hover:text-primary transition-colors"
                >
                  {label}
                </a>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
