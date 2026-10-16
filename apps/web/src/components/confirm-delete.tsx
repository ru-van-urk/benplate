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

// Only signed-in users see it, so pages load it lazily (Base UI, about 50 KB):
// `lazy(() => import("#/components/confirm-delete"))`. The page owns the mutation; the dialog stays open on an
// error and shows it, such as a planet that still has residents
const ConfirmDelete = ({
  name,
  isPending,
  error,
  onConfirm,
}: {
  name: string;
  isPending: boolean;
  error: string | undefined;
  onConfirm: () => void;
}) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="destructive" size="sm" />}>
        Delete
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {name}?</AlertDialogTitle>
          <AlertDialogDescription className={error ? "text-destructive" : undefined}>
            {error ?? "This can't be undone."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" disabled={isPending} onClick={onConfirm}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmDelete;
