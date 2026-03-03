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
    <section className="bg-[linear-gradient(135deg,#214a57_0%,#2e6d7c_50%,#457870_100%)] py-16">
      <div className="max-w-xl mx-auto px-6 text-center">
        <p className="text-xs text-white/60 uppercase tracking-[0.12em] mb-2">Newsletter</p>
        <h2 className="font-serif text-[clamp(1.5rem,3vw,2rem)] text-white mb-3">
          Neue Empfehlungen per Mail
        </h2>
        <p className="text-white/75 mb-8">
          Keine Werbung, kein Spam – nur Bücher die wirklich bleiben.
        </p>
        {submitted ? (
          <p className="text-white font-medium">Danke! Du bist dabei.</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-3 max-w-sm mx-auto">
            <Input
              type="email"
              placeholder="deine@email.de"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 bg-white/90 border-0 text-foreground placeholder:text-muted-foreground"
            />
            <Button type="submit" className="bg-white text-[#214a57] hover:bg-white/90 font-medium">
              Anmelden
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
