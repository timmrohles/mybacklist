"use client";

import { useState } from "react";

const tabs = ["Lass dich inspirieren", "Eigenen Feed anlegen"] as const;

export default function HeroSection() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section className="bg-[linear-gradient(135deg,#214a57_0%,#2e6d7c_50%,#457870_100%)] pt-28 pb-16 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-12 items-center">

        {/* Left: Illustration placeholder (shows below on mobile) */}
        <div className="order-2 lg:order-1 min-h-[400px] rounded-2xl border-2 border-dashed border-white/20 bg-white/5 flex items-center justify-center">
          <p className="text-sm text-white/40 select-none">Illustration kommt hier</p>
        </div>

        {/* Right: Text + Tabs */}
        <div className="order-1 lg:order-2">
          <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-extrabold text-white leading-[1.05] mb-5">
            Bücher die wirklich bleiben.
          </h1>
          <p className="font-serif text-lg text-white/80 leading-[1.65] mb-8 font-normal">
            Handverlesene Empfehlungen von Menschen denen du vertraust.
          </p>

          {/* Tab pills */}
          <div className="flex gap-2 flex-wrap">
            {tabs.map((label, i) => (
              <button
                key={i}
                onClick={() => setActiveTab(i)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
                  activeTab === i
                    ? "bg-white text-black"
                    : "bg-black/60 text-white hover:bg-black/80"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
