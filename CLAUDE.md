# OhMyForm — CLAUDE.md

## Project overview

OhMyForm is a browser-only form builder. Users create forms, share a public link (or embed URL), and view responses — all persisted in `localStorage` via Zustand.

There is no backend. All state lives client-side.

## Stack

- React 19, TypeScript strict, Vite
- TailwindCSS v4 (PostCSS plugin)
- Zustand v5 with `persist` middleware
- `@dnd-kit` for drag-and-drop field reordering
- `react-hook-form` for form rendering/validation
- `react-router-dom` v7 for routing

## Key directories

```
src/
  types/form.ts          — all shared types (FormSchema, FieldDefinition, etc.)
  store/formStore.ts     — form CRUD + field operations (persisted)
  store/responseStore.ts — response submission + retrieval (persisted)
  lib/conditionalEngine.ts — field visibility logic
  lib/utils.ts           — nanoid, now()
  pages/                 — route-level components
  components/
    builder/             — drag-drop builder UI
    renderer/            — public form rendering + embed
    responses/           — response table
    ui/                  — shared primitives (Button, Input, Toggle, etc.)
```

## Routes

| Path | Component | Purpose |
|---|---|---|
| `/` | `HomePage` | List all forms, create/delete |
| `/builder/:formId` | `BuilderPage` | Drag-drop editor |
| `/form/:formId` | `PublicFormPage` | Public respondent view |
| `/embed/:formId` | `EmbedPage` | Iframe-embeddable view |
| `/responses/:formId` | `ResponsesPage` | Response table |

## localStorage keys

- `ohmyforms-schemas` — all `FormSchema[]`
- `ohmyforms-responses` — all `FormResponse[]`

## Field types

Defined in `src/types/form.ts` as `FieldType`. Categories:

- **Text**: `short_text`, `long_text`, `email`, `number`
- **Date & Time**: `date`, `datetime`
- **Choice**: `single_select`, `multi_select`
- **Media**: `file_upload`, `signature`
- **Layout**: `section_divider`, `statement` (no value, not included in responses)

## Conditional logic

`src/lib/conditionalEngine.ts` evaluates `Condition[]` on a field to determine visibility. Each condition has:

```ts
{ if: { fieldId, operator, value }, action: 'show' | 'hide' }
```

Operators: `equals`, `not_equals`, `contains`, `is_empty`, `is_not_empty`.

Logic: if a field has `show` conditions and none match, it is hidden. `hide` conditions take priority when matched.

## Dev commands

```bash
bun dev          # start dev server
bun run build    # tsc + vite build
bunx tsc --noEmit  # typecheck
bunx oxlint .    # lint
```

## Conventions

- TypeScript strict — no `any`
- Functional components only
- No backend, no network calls
- State mutations go through Zustand store actions only — never mutate state directly
- Field IDs: `field_${nanoid(8)}`; form IDs: `nanoid()`
