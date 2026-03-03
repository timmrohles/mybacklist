# Backlist Club – Entwicklungsregeln

## Stack

- Next.js 15 App Router
- TypeScript strict
- Tailwind CSS 4
- shadcn/ui (new-york theme)
- Drizzle ORM + Neon Postgres
- pnpm als Package Manager

## Design-Regeln

- Immer shadcn/ui Basis-Komponenten nutzen
- Niemals inline styles
- Niemals eigene Button/Input/Card bauen wenn shadcn/ui Komponente existiert
- Alle UI-Komponenten leben in `/components/ui/`
- Feature-Komponenten leben in `/components/features/`

## Farben (nur diese)

- Hintergrund: warm white / paper-Töne
- Primär: dunkles Grün (literarisch, ruhig)
- Akzent: warmes Beige
- Text: slate-900

## Typografie

- Überschriften: Serif-Font (literarischer Charakter)
- Body: Sans-serif, gut lesbar
- Keine dekorativen Fonts

## Abstände

- Padding/Margin immer in Tailwind-Standardschritten
- Konsistente Section-Abstände: `py-16` für Sections

## Komponenten-Regeln

- **BookCard**: immer mit Cover, Titel, Autor, Affiliate-Button
- **CuratorCard**: immer mit Avatar, Name, Bio-Kurztext
- Niemals Komponenten-Styles überschreiben ohne Kommentar warum

## Datenbankzugriff

- Neon Connection immer als Singleton aus `lib/db.ts`
- Niemals direkt `neon()` in API-Routes aufrufen
- Parametrisierte Queries, niemals String-Interpolation

## Sicherheit

- Auth läuft über `middleware.ts`
- Niemals Passwörter oder Secrets in den Code
- Alle Admin-Routes sind unter `/admin/*`
