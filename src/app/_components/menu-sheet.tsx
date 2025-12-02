"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { Button } from "~/components/ui/button";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export type DishCategoryLink = {
  dish: {
    id: string;
    name: string;
  };
};

export type MenuCategory = {
  id: string;
  name: string;
  dishes: DishCategoryLink[];
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: MenuCategory[];
  onSelect: (categoryId: string) => void;
};

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────

export default function MenuSheet({
  open,
  onOpenChange,
  categories,
  onSelect,
}: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="top"
        className="
          max-h-[85vh]
          overflow-y-auto
          rounded-b-2xl
          border-b 
          shadow-lg
          bg-card/95 backdrop-blur
          max-w-xl mx-auto
          pb-10
        "
      >
        {/* Sticky sheet header */}
        <div className="sticky top-0 bg-card/95 backdrop-blur z-20 pb-3 pt-1">
          <SheetHeader>
            <SheetTitle className="text-xl font-semibold tracking-tight">
              Menu
            </SheetTitle>
          </SheetHeader>
        </div>

        {/* Category List */}
        <div className="mt-4 space-y-6">
          {categories.map((cat) => (
            <div key={cat.id} className="space-y-2">

              {/* Category Name */}
              <Button
                variant="secondary"
                className="
                  w-full justify-start
                  text-left font-semibold 
                  py-2 px-3 rounded-lg
                  bg-muted hover:bg-muted/80
                "
                onClick={() => onSelect(cat.id)}
              >
                {cat.name}
              </Button>

              {/* Dish Names */}
              <div className="ml-2 pl-3 border-l border-border/60 space-y-1.5">
                {cat.dishes.map((link) => (
                  <button
                    key={link.dish.id}
                    onClick={() => onSelect(cat.id)}
                    className="
                      w-full text-left 
                      text-sm text-muted-foreground 
                      hover:text-primary hover:underline
                      transition
                    "
                  >
                    {link.dish.name}
                  </button>
                ))}
              </div>

            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
