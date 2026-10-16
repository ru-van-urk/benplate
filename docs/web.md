# Web app

React with TanStack Router and TanStack Query (`apps/web`), shadcn/ui components from `packages/ui`.

## Routes

File routes in two groups:

| Route                             | What it does                                                                                     |
| --------------------------------- | ------------------------------------------------------------------------------------------------ |
| `__root.ts`                       | Loads the session once (`beforeLoad`) into the router context; the header shows the user         |
| `(public)/…`                      | Pages anyone can open: the planet and people lists and pages, `/login` and `/register`           |
| `_app/route.ts`                   | Pathless layout for pages that need a signed-in user; redirects to `/login?redirect=<this page>` |
| `_app/planets/…`, `_app/people/…` | The create and edit forms                                                                        |

Route files only declare the route: its `context`, `loader`, `beforeLoad`, `validateSearch` and the page as `component`. They are `.ts`, so they can't hold JSX. The page lives in `src/features/<feature>/` (`planets/planet-page.tsx`, `people/person-form.tsx`) and reads its route through `getRouteApi("<route id>")`; importing a route file from a page would be circular, and lint rejects it. Code splitting still gives each page its own chunk. App-wide pieces (form fields, the delete dialog, the error and not-found screens) live in `src/components/`. A route param that holds an id is named `$publicId`.

## Data

Routes own their data, following [Reliable Query Prefetching with TanStack Router](https://tkdodo.eu/blog/reliable-query-prefetching-with-tanstack-router):

- The route's `context` builds the query options, named after the procedure: `listPlanetsQueryOptions` for `planet.list`, `getPersonQueryOptions` for `person.get`.
- Its `loader` prefetches them; the page reads the same options from the route context and passes them to `useSuspenseQuery`. A page never builds its own, so the prefetch and the render can't drift apart. The person form's route also loads the planets to choose a homeworld from.
- A search param that changes the data goes through `loaderDeps`.
- When the API answers `NOT_FOUND`, the loader throws `notFound()`, so a missing record shows the not-found screen.
- After a mutation, invalidate what changed: `orpc.planet.key()` for one resource, `orpc.key()` when a relation changes another resource too.

## Forms

[Formisch](https://formisch.dev) with the contract's own Valibot schemas (exported from `@benplate/contract`), so the form and the API agree on every rule. `src/components/form-fields.tsx` renders Formisch fields with the shared shadcn `Field`; `SelectField` takes enum values or `{ value, label }` pairs, such as planets for a homeworld. `planet-form.tsx` shows how an API error (`CONFLICT`) becomes a field error with `setErrors`.

## Session

The session comes from Better Auth's client (`authClient` in `src/utils/auth.ts`), read through `sessionQueryOptions`. The login and register pages send signed-in users on to their `redirect` parameter, which only accepts a same-origin path. After signing in or out, `refreshSession` reloads the session and reruns every route's `beforeLoad`, so the guards redirect wherever the user now belongs. An API call that answers `UNAUTHORIZED`, such as after the session expired, does the same.

## Components

Components are `const` arrow functions, which lint enforces in `apps/web` (`packages/ui` keeps shadcn's `function` style, so `shadcn add` output needs no edits). `no-use-before-define` is off on purpose: tsc already rejects a value read before its declaration (TS2448). Keep code that only some visitors need out of the first load: the delete dialog (`confirm-delete.tsx`) is `lazy`, so only signed-in users download it.

## UI

- Design tokens and global styles: `packages/ui/src/styles/globals.css`
- Shared primitives: `packages/ui/src/components/*`, imported as `@benplate/ui/components/button`
- Add shared primitives from the root: `npx shadcn@latest add dialog popover -c packages/ui`. Run the shadcn CLI from `apps/web` for app-specific blocks instead
