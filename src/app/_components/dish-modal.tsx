"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

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
import { Textarea } from "~/components/ui/textarea";
import { Checkbox } from "~/components/ui/checkbox";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { UploadButton } from "~/utils/uploadthing";

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────

export type CategoryOption = {
  id: string;
  name: string;
};

export type DishCategoryLink = {
  categoryId: string;
};

export type DishType = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  spiceLevel: number | null;
  isVeg: boolean;
  categories: DishCategoryLink[];
};

type DishModalProps = {
  restaurantId: string;
  categories: CategoryOption[];
  dish?: DishType | null;
  trigger: React.ReactNode;
  isDelete?: boolean;
};

// ─────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────

export default function DishModal({
  restaurantId,
  categories,
  dish,
  trigger,
  isDelete = false,
}: DishModalProps) {
  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [spiceLevel, setSpiceLevel] = useState<number | null>(null);
  const [isVeg, setIsVeg] = useState<boolean>(true);

  // Load dish data
  useEffect(() => {
    if (open && dish) {
      setName(dish.name);
      setDescription(dish.description ?? "");
      setCategoryIds(dish.categories.map((c) => c.categoryId));
      setImageUrl(dish.imageUrl ?? "");
      setSpiceLevel(dish.spiceLevel ?? null);
      setIsVeg(dish.isVeg);
    }

    if (!open && !dish) {
      setName("");
      setDescription("");
      setCategoryIds([]);
      setImageUrl("");
      setSpiceLevel(null);
      setIsVeg(true);
    }
  }, [open, dish]);

  const utils = api.useUtils();

  // ─────────────────────────────────────────
  // MUTATIONS
  // ─────────────────────────────────────────

  const create = api.dish.create.useMutation({
    onSuccess: async () => {
      toast.success("Dish created!");
      await utils.restaurant.getBySlugForOwner.invalidate();
      setOpen(false);
    },
  });

  const update = api.dish.update.useMutation({
    onSuccess: async () => {
      toast.success("Dish updated!");
      await utils.restaurant.getBySlugForOwner.invalidate();
      setOpen(false);
    },
  });

  const remove = api.dish.delete.useMutation({
    onSuccess: async () => {
      toast.success("Dish deleted!");
      await utils.restaurant.getBySlugForOwner.invalidate();
      setOpen(false);
    },
  });

  // ─────────────────────────────────────────
  // SUBMIT HANDLER
  // ─────────────────────────────────────────

  const handleSubmit = () => {
    if (isDelete && dish) {
      remove.mutate({ id: dish.id });
      return;
    }

    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (dish) {
      update.mutate({
        id: dish.id,
        name,
        description,
        imageUrl,
        spiceLevel: spiceLevel ?? null,
        isVeg,
        categoryIds,
      });
      return;
    }

    create.mutate({
      restaurantId,
      name,
      description,
      imageUrl,
      spiceLevel: spiceLevel ?? null,
      isVeg,
      categoryIds,
    });
  };

  // ─────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isDelete
              ? "Delete Dish"
              : dish
              ? "Edit Dish"
              : "Add Dish"}
          </DialogTitle>
        </DialogHeader>

        {isDelete && dish ? (
          <p className="text-muted-foreground">
            Are you sure you want to delete <b>{dish.name}</b>?
          </p>
        ) : (
          <div className="space-y-4">
            <Input
              placeholder="Dish name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <Textarea
              placeholder="Description…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            {/* IMAGE */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Dish Image</p>

              {imageUrl && (
                <Image
                  src={imageUrl}
                  alt="Dish image"
                  width={96}
                  height={96}
                  className="rounded-md object-cover"
                />
              )}

<UploadButton
  endpoint="dishImage"
  appearance={{
    button:
      "flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md",
  }}
  onClientUploadComplete={(res) => {
    if (res?.[0]?.url) setImageUrl(res[0].url);
  }}
  onUploadError={(err) => {
    toast.error(err.message);
  }}
/>

            </div>

            {/* VEG */}
            <div className="flex items-center gap-3">
              <Checkbox
                checked={isVeg}
                onCheckedChange={(value) =>
                  setIsVeg(Boolean(value))
                }
              />
              <span>Veg</span>
            </div>

            {/* SPICE LEVEL */}
            <div>
              <p className="text-sm font-medium">Spice Level</p>
              <select
                value={spiceLevel ?? ""}
                onChange={(e) =>
                  setSpiceLevel(
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                className="border p-2 rounded-md w-full"
              >
                <option value="">None</option>
                <option value={1}>Mild 🌶</option>
                <option value={2}>Medium 🌶🌶</option>
                <option value={3}>Hot 🌶🌶🌶</option>
              </select>
            </div>

            {/* CATEGORIES */}
            <div>
              <p className="text-sm font-medium">Categories</p>

              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <Button
                    key={c.id}
                    type="button"
                    variant={
                      categoryIds.includes(c.id)
                        ? "default"
                        : "outline"
                    }
                    onClick={() =>
                      setCategoryIds((prev) =>
                        prev.includes(c.id)
                          ? prev.filter((x) => x !== c.id)
                          : [...prev, c.id]
                      )
                    }
                  >
                    {c.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            className="w-full"
            variant={isDelete ? "destructive" : "default"}
            onClick={handleSubmit}
          >
            {isDelete ? "Delete" : dish ? "Save Changes" : "Create Dish"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
