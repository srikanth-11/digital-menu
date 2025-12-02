"use client";

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
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { api } from "~/trpc/react";

// ─────────────────────────────
// Types
// ─────────────────────────────

export type RestaurantModalData = {
  id: string;
  name: string;
  location: string | null;
};

type Props = {
  restaurant?: RestaurantModalData;
  trigger: React.ReactNode;
  onSuccess: () => void;
};

// ─────────────────────────────
// Component
// ─────────────────────────────

export default function RestaurantModal({
  restaurant,
  trigger,
  onSuccess,
}: Props) {

  const [open, setOpen] = useState(false);

  const [name, setName] = useState<string>("");
  const [location, setLocation] = useState<string>("");

  // Pre-fill values only when opening modal for edit
  useEffect(() => {
    if (open && restaurant) {
      setName(restaurant.name ?? "");
      setLocation(restaurant.location ?? "");
    }
    if (!open && !restaurant) {
      setName("");
      setLocation("");
    }
  }, [open, restaurant]);

  const create = api.restaurant.create.useMutation();
  const update = api.restaurant.update.useMutation();

  const save = async () => {
    if (name.trim().length === 0) {
      toast.error("Name is required");
      return;
    }

    if (restaurant) {
      await update.mutateAsync({
        id: restaurant.id,
        name,
        location,
      });

      toast.success("Restaurant updated!");
    } else {
      await create.mutateAsync({
        name,
        location,
      });

      toast.success("Restaurant created!");
    }

    onSuccess();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {restaurant ? "Edit Restaurant" : "Add Restaurant"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          <Input
            placeholder="Restaurant name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            placeholder="Location (optional)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button className="w-full" onClick={save}>
            {restaurant ? "Save Changes" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
