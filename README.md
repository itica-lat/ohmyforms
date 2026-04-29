# OhMyForm

A browser-only form builder. Create forms, share them, collect responses — no backend, no account required.

All data persists in `localStorage`.

## Features

- Drag-and-drop form builder
- 12 field types: short text, long text, email, number, date, datetime, single select, multi select, file upload, signature, section divider, statement
- Conditional logic: show/hide fields based on other field values
- Public form link and embeddable iframe URL
- Response table with per-form response management
- Customizable accent color, submit label, success message, and redirect URL

## Getting started

```bash
bun install
bun dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build

```bash
bun run build
```

Output goes to `dist/`.

## Tech

- React 19, TypeScript, Vite
- TailwindCSS v4
- Zustand (state + localStorage persistence)
- @dnd-kit (drag-and-drop)
- react-hook-form (form rendering)
- react-router-dom v7
