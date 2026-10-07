# Adding a resource

Copy `people` (it has a relation) or `planets` (it has none) as a starting point.

1. **Table**: `packages/db/src/schema/<resource>.ts`, exported from `src/schema/index.ts`, following the [table rules](database.md#tables): a private `id`, a `publicId`, `...timestamps`, named constraints, and for a relation a named foreign key and an index ([Relations](database.md#relations)).
2. **Prefix**: add the resource to `publicIdPrefixes` in `packages/contract/src/common.ts`.
3. **Migration**: iterate with `pnpm run db:push`, then `pnpm run db:generate --name add_<resource>`. Add the table's `updated_at` trigger to the end of that migration ([updated_at](database.md#updated_at)), then commit it with `packages/db/src/generated/db.ts` ([Schema changes](database.md#schema-changes)).
4. **Contract**: `packages/contract/src/<resource>.ts`, added to `appContract` in `src/index.ts`. Write the output and input schemas and declare the errors ([The contract](api.md#the-contract)). Decide per route: `oc` for public, `authedContract` for signed-in users.
5. **Router**: `packages/api/src/server/router/<resource>.ts`, added to `appRouter` in `router/index.ts`, with `os` or `protectedProcedure` to match ([Procedures](api.md#procedures)).
6. **Routes**: one `.ts` file per page under `apps/web/src/routes/(public)/` or `routes/_app/`. Its `context` builds the query options, its `loader` prefetches them, and its `component` is the page ([Web app](web.md#routes)).
7. **Pages**: `apps/web/src/features/<resource>/`, with the list, the page, the form and the new and edit pages.

Then `pnpm fix` and `pnpm check`.
