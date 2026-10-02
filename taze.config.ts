import { defineConfig } from "taze";

export default defineConfig({
  recursive: true,
  // The drizzle and oRPC pre-releases are pinned exactly; without this, taze skips them
  includeLocked: true,
  // drizzle-orm's registry metadata is large enough to hit the default timeout
  requestTimeout: 30_000,
  // Matches pnpm's default minimumReleaseAge, so deps:update never writes versions pnpm refuses
  maturityPeriod: 1,
});
