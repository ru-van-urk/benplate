import { Button } from "@benplate/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@benplate/ui/components/empty";

import { type ErrorComponentProps, useRouter } from "@tanstack/react-router";

export default function RouteError({ error }: ErrorComponentProps) {
  const router = useRouter();

  return (
    <Empty className="min-h-svh">
      <EmptyHeader>
        <EmptyTitle>Something went wrong</EmptyTitle>
        <EmptyDescription>
          {error instanceof Error ? error.message : "An unexpected error occurred."}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        {/* Re-runs the loaders of the current route, which refetches their queries */}
        <Button onClick={() => void router.invalidate()}>Try again</Button>
      </EmptyContent>
    </Empty>
  );
}
