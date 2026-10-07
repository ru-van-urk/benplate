import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@benplate/ui/components/alert-dialog";
import { Button } from "@benplate/ui/components/button";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getRouteApi } from "@tanstack/react-router";

// Split from the planet page, which loads it lazily
const route = getRouteApi("/(public)/planets/$id");

export function DeletePlanet({ id, name }: { id: string; name: string }) {
  const { orpc } = route.useRouteContext();
  const navigate = route.useNavigate();
  const queryClient = useQueryClient();

  const deletePlanet = useMutation(
    orpc.planet.delete.mutationOptions({
      onSuccess: async () => {
        await navigate({ to: "/" });
        await queryClient.invalidateQueries({ queryKey: orpc.planet.key() });
      },
    }),
  );

  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="destructive" size="sm" />}>
        Delete
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {name}?</AlertDialogTitle>
          <AlertDialogDescription>This can't be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={deletePlanet.isPending}
            onClick={() => deletePlanet.mutate({ id })}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
