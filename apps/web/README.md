# apps/web

React + TypeScript single-page app (Vite): enquiry intake, geometry/loads input, design and BOM
review, quote builder, and drawing export triggers.

## Development

Requires `apps/api` (and, through it, `services/calc-engine`) running — see their READMEs.

```
cp .env.example .env   # adjust VITE_API_URL if apps/api runs elsewhere
npm install
npm run dev
```

## Structure

```
src/
  api.ts               # apps/api client
  styles/tokens.css     # design system tokens (light/dark)
  components/           # shared UI primitives (title block, rail, chips, tables)
  screens/
    EnquiryScreen.tsx    # creates a project + first design revision
    GeometryScreen.tsx   # boundary/grid, rendered from the live DesignRevision
    DesignBomScreen.tsx  # member schedule + BOM summary, rendered from the live DesignRevision
    QuoteScreen.tsx       # generates/fetches the quote, links to PDF/DXF/CSV exports
  data/workflow.ts      # workflow step list (Enquiry -> Geometry -> ... -> Drawings)
```

Only the rectangular single-tier case is exposed in the enquiry form for now — the polygon/
obstruction editing canvas described in PLAN.md is future work; the calc engine already supports
it via the API.
