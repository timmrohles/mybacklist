"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: Backend-Integration (Mailchimp / Resend / etc.)
    setSubmitted(true);
  }

  return (
    <section className="py-16 border-t border-border">
      <div className="max-w-xl mx-auto px-6 text-center">
        <p className="text-xs text-muted-foreground uppercase tracking-[0.12em] mb-2">
          Newsletter
        </p>
        <h2 className="font-serif text-[clamp(1.5rem,3vw,2rem)] text-foreground mb-3">
          Neue Empfehlungen per Mail
        </h2>
        <p className="text-muted-foreground mb-8">
          Keine Werbung, kein Spam – nur Bücher die wirklich bleiben.
        </p>
        {submitted ? (
          <p className="text-primary font-medium">Danke! Du bist dabei.</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-3 max-w-sm mx-auto">
            <Input
              type="email"
              placeholder="deine@email.de"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1"
            />
            <Button type="submit">Anmelden</Button>
          </form>
        )}
      </div>
    </section>
  );
}
