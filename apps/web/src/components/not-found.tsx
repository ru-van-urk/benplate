import { buttonVariants } from "@maribor/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@maribor/ui/components/empty";

import { Link } from "@tanstack/react-router";

export default function NotFound() {
  return (
    <Empty className="min-h-svh">
      <EmptyHeader>
        <EmptyTitle>Page not found</EmptyTitle>
        <EmptyDescription>The page you are looking for does not exist.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Link to="/" className={buttonVariants()}>
          Go home
        </Link>
      </EmptyContent>
    </Empty>
  );
}
