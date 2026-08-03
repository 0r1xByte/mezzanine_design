# apps/web

React + TypeScript single-page app (Vite): enquiry intake, geometry/loads input, design and BOM
review, quote builder, and drawing export triggers.

## Development

```
npm install
npm run dev
```

## Structure

```
src/
  styles/tokens.css   # design system tokens (light/dark)
  components/         # shared UI primitives (title block, rail, chips, tables)
  screens/            # Geometry, Design & BOM, Quote screens
  data/mock.ts        # mock project data used until apps/api is wired up
```
