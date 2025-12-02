"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import { api } from "~/trpc/react";

// ---- CATEGORY TYPE ----
export type RestaurantCategory = {
  id: string;
  name: string;
  restaurantId: string;
};

type CategoryModalProps = {
  restaurantId: string;
  category?: RestaurantCategory | null; // edit/delete only
  isDelete?: boolean;
  trigger: React.ReactNode;
};

export default function CategoryModal({
  restaurantId,
  category,
  isDelete = false,
  trigger,
}: CategoryModalProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  // Load name when editing
  useEffect(() => {
    if (open && category) setName(category.name);
  }, [open, category]);

  const utils = api.useUtils();

  // --- MUTATIONS ---

  const create = api.category.create.useMutation({
    onSuccess: async () => {
      toast.success("Category created!");
      await utils.restaurant.getBySlugForOwner.invalidate();
      setOpen(false);
      setName("");
    },
    onError: () => toast.error("Failed to create category"),
  });

  const update = api.category.update.useMutation({
    onSuccess: async () => {
      toast.success("Category updated!");
      await utils.restaurant.getBySlugForOwner.invalidate();
      setOpen(false);
    },
    onError: () => toast.error("Failed to update category"),
  });

  const remove = api.category.delete.useMutation({
    onSuccess: async () => {
      toast.success("Category deleted!");
      await utils.restaurant.getBySlugForOwner.invalidate();
      setOpen(false);
    },
    onError: () => toast.error("Failed to delete category"),
  });

  // ---- HANDLER ----
  const handleSubmit = () => {
    if (isDelete && category) {
      remove.mutate({ id: category.id });
      return;
    }

    if (category) {
      update.mutate({ id: category.id, name });
    } else {
      create.mutate({ name, restaurantId });
    }
  };

  // ---- UI TEXT ----
  const title = isDelete
    ? "Delete Category"
    : category
    ? "Edit Category"
    : "Add Category";

  const buttonText = isDelete
    ? "Delete"
    : category
    ? "Save"
    : "Create";

  const buttonVariant: "default" | "destructive" =
    isDelete ? "destructive" : "default";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {/* EDIT / CREATE */}
        {!isDelete && (
          <Input
            placeholder="Category name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-3"
          />
        )}

        {/* DELETE CONFIRMATION */}
        {isDelete && category && (
          <p className="text-muted-foreground text-sm mt-2">
            Are you sure you want to delete{" "}
            <strong>{category.name}</strong>?
          </p>
        )}

        <DialogFooter>
          <Button
            variant={buttonVariant}
            className="w-full mt-4"
            onClick={handleSubmit}
          >
            {buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
