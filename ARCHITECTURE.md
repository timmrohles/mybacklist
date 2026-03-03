# Backlist Club – Architektur & Zielbild

> Einzige Quelle der Wahrheit für alle AI-Tools und den Entwickler.
> Letzte Aktualisierung: März 2026

---

## Was ist Backlist Club?

Kuratierte Buchentdeckungsplattform. Kuratoren bauen persönliche Buchhandlungen.

**Kernaussage:** "Bücher finden. Bücher teilen."
**Monetarisierung:** 100% Affiliate.
**Zielgruppe:** DACH.

---

## Tech Stack

| Bereich | Technologie |
|---|---|
| Framework | Next.js 15 (App Router) |
| Sprache | TypeScript strict |
| Styling | Tailwind CSS 4 + shadcn/ui (new-york) |
| Datenbank | Neon (Postgres) via Drizzle ORM |
| Package Manager | pnpm |
| Deployment | Vercel (auto-deploy aus main) |
| Auth | HMAC-signed Session Tokens (middleware.ts) |

---

## Kuratoren-Typen

| Typ | Provision | Beschreibung |
|---|---|---|
| editorial | 0% | Timm selbst |
| standard | 90% | Normale Kuratoren |
| premium | Individuell | Buchhändler, privilegierte Partner |

Nur Admin kann Kuratoren freischalten (kein Self-Signup).

---

## Affiliate-Logik (KRITISCH)

Alle Links laufen über Timmʼs Account. Kuratoren-Anteil wird intern berechnet.

**SZENARIO A – Ref-Link:**
```
backlist.club?ref=kurator-slug
→ Cookie: { curator_id, expires: now + attribution_days }
→ Besucher kauft IRGENDETWAS im Window → Ref-Kurator erhält vollen Anteil
```

**SZENARIO B – Organisch:**
```
Besucher klickt kuratiertes Buch → Kurator erhält Anteil
ABER: aktives Ref-Cookie hat immer Priorität
```

**PRIORITÄT:** 1. Ref-Cookie > 2. Kurations-Attribution > 3. Timm

- Attribution-Window: pro Partner unterschiedlich (`affiliates.attribution_days`)
- Überschreibbar pro Kurator (`curator_affiliates.attribution_days_override`)

---

## Seitenstruktur

**ÖFFENTLICH:**
```
/                     → Homepage
/kuratoren            → Übersicht
/kuratoren/[slug]     → Storefront
/themen               → Übersicht
/themen/[slug]        → Bücher zu Thema
/buch/[id]            → Buchseite (SEO-kritisch)
/blog                 → Redaktion (Phase 2)
/impressum, /datenschutz, /faq
```

**ADMIN (geschützt):**
```
/admin                → Dashboard
/admin/login
/admin/buecher
/admin/kuratoren      (inkl. Typ + Provision)
/admin/tags
/admin/affiliates
/admin/provisionen    (Phase 2)
```

**KURATOREN-PORTAL (Phase 2):**
```
/kurator              → Dashboard
/kurator/handlung
/kurator/statistiken
```

---

## Datenbankschema

### PHASE 1 (aktuell + sofortige Migrationen nötig)

```sql
books: id, title, author, slug, publisher, isbn, isbn13, cover_url,
       description, year, price, availability, language, page_count,
       is_featured boolean DEFAULT false,  -- MIGRATION NÖTIG
       deleted_at timestamp,               -- MIGRATION NÖTIG
       created_at, updated_at

curators: id, name, slug, bio, avatar_url, visible,
          curator_type text DEFAULT 'standard',  -- MIGRATION NÖTIG
          provision_rate decimal DEFAULT 0.90,   -- MIGRATION NÖTIG
          email text,                            -- MIGRATION NÖTIG
          created_at

affiliates: id, name, slug, link_template, logo_url, favicon_url,
            attribution_days integer DEFAULT 30,  -- MIGRATION NÖTIG
            is_active boolean DEFAULT true        -- MIGRATION NÖTIG

tags:       id, name, slug, description, color, category
book_tags:  book_id → books, tag_id → tags
```

### PHASE 2 (noch zu bauen)

```sql
curator_books: curator_id, book_id, sort_order, note, created_at

curator_affiliates: curator_id, affiliate_id,
                    provision_override decimal,
                    attribution_days_override integer

clicks: id, book_id, curator_id, ref_curator_id, affiliate_id,
        attribution ('ref'|'curation'|'editorial'),
        ip_hash (DSGVO: nur gehashed!), session_id, created_at

attribution_sessions: session_id, curator_id, expires_at, created_at

provisions: id, click_id, curator_id, affiliate_id,
            gross_amount, curator_rate, curator_amount,
            status ('pending'|'paid'), paid_at, created_at
```

---

## Design System Regeln

- `/components/ui/` → shadcn/ui (**NIEMALS** direkt editieren)
- `/components/features/` → BookCard, CuratorCard, ThemeCard, AffiliateButton
- `/components/layout/` → SiteHeader, SiteFooter
- Immer shadcn/ui als Basis, niemals eigene Button/Input/Card
- Niemals inline styles
- Abstände: `py-16` für Sections, `px-4 md:px-8` für Container
- Schriften: Serif Headlines, Sans Body

---

## Code-Regeln

- DB-Zugriff: **IMMER** Singleton aus `lib/db.ts`, **NIE** `neon()` direkt in Routes
- Parametrisierte Queries immer (kein String-Concat)
- Soft-Delete überall (`deleted_at`)
- Admin-Pages: `export const dynamic = 'force-dynamic'`
- Schema (`lib/schema.ts`) muss immer mit echter DB synchron sein

---

## Env-Vars

```
DATABASE_URL
ADMIN_PASSWORD
HMAC_SECRET
```

---

## Offene TODOs

### SOFORT (Build-Blocker)

- [ ] Migration: `is_featured` + `deleted_at` in books
- [ ] Migration: `curator_type` + `provision_rate` + `email` in curators
- [ ] Migration: `attribution_days` + `is_active` in affiliates
- [ ] Neon Connection als Singleton in `lib/db.ts`

### PHASE 1

- [ ] Öffentliche Seiten mit echten Daten
- [ ] BookCard + CuratorCard Komponenten
- [ ] Ref-Link Cookie-Logik

### PHASE 2

- [ ] `curator_books` Tabelle + API
- [ ] Klick-Tracking + Attribution-Sessions
- [ ] Kuratoren-Login + Dashboard
- [ ] Provisions-Übersicht + Auszahlung

### EXTERNE ANTRÄGE (je früher, desto besser)

- [ ] **Awin Publisher-Netzwerk-Antrag stellen** — Voraussetzung für Phase 2 (Bearbeitungszeit: 2–4 Wochen + Rückfragen). Nicht als Standard-Publisher, sondern explizit als "Publisher-Netzwerk" / Sub-Netzwerk beantragen.
- [ ] **VLB Datenbezieher-Account beantragen** — Voraussetzung für Buchkatalog-Skalierung. Gibt Zugang zu 1,5 Mio. deutschsprachigen Titeln inkl. aktueller Preise, Beschreibungen und Cover in hoher Auflösung. Kosten: typisch einige hundert Euro/Jahr für kleine Publisher, Preise auf Anfrage.

---

## Affiliate-Partner (recherchiert März 2026)

| Partner | Netzwerk | Provision Bücher | Cookie-Window |
|---|---|---|---|
| Thalia.de | Awin | 11–12% | 30 Tage |
| Thalia.at | Awin | 12% | 30 Tage |
| bücher.de | Awin | 8% | 30 Tage |
| Hugendubel | Tradedoubler | 10% | 30 Tage |

- **Phase 1:** Nur Awin (Thalia + bücher.de)
- **Phase 2:** Tradedoubler (Hugendubel)

---

## ⚠️ KRITISCHER BLOCKER vor Phase 2

Backlist Club = Sub-Netzwerk nach Awin-Definition.
Provision-Weitergabe an Kuratoren ist **nur erlaubt** wenn Awin Backlist Club offiziell als Publisher-Netzwerk einstuft.

**PFLICHT vor Phase-2-Build:**

1. Awin-Konto beantragen als "Publisher-Netzwerk" (nicht Standard-Publisher)
2. Schriftliche Genehmigung von Awin einholen
3. Thalia-Programmbedingungen auf Sub-Netzwerk-Ausschluss prüfen
4. Anwalt konsultieren für Kuratoren-Verträge (Haftung für Sub-Publisher)
5. Erst dann: Kuratoren-Auszahlungslogik bauen

> **Ohne Schritt 1–4 kein Phase-2-Code schreiben!**
