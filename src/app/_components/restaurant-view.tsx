"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import CategoryModal from "./category-modal";
import DishModal from "./dish-modal";
import MenuSheet from "./menu-sheet";
import { VegIcon } from "~/components/ui/veg-icon";
import { SpiceBadge } from "./spice-badge";

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────

export type DishCategory = {
  categoryId: string;
};

export type Dish = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  spiceLevel: number | null;
  isVeg: boolean;
  categories: DishCategory[];
};

export type Category = {
  id: string;
  name: string;
  dishes: { dish: Dish }[];
};

export type Restaurant = {
  id: string;
  name: string;
  location: string | null;
  categories: Category[];
  userId?: string;
};

type Props = {
  restaurant: Restaurant;
  canEdit: boolean;
};

// ─────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────

export default function RestaurantView({ restaurant, canEdit }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("");

  // Typed ref map
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const observer = useRef<IntersectionObserver | null>(null);

  // Scroll observer
  useEffect(() => {
    observer.current = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        const name = visible?.target.getAttribute("data-name") ?? "";
        setActiveCategory(name);
      },
      {
        rootMargin: "-40% 0px -40% 0px",
        threshold: 0.1,
      }
    );

    Object.values(categoryRefs.current).forEach((section) => {
      if (section) observer.current?.observe(section);
    });

    return () => observer.current?.disconnect();
  }, [restaurant]);

  return (
    <div className="max-w-2xl mx-auto pb-24">

      {/* Header */}
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold">{restaurant.name}</h1>
        <p className="text-muted-foreground">
          {restaurant.location ?? ""}
        </p>

        {canEdit && (
          <div className="flex gap-2 mt-3">
            <CategoryModal
              restaurantId={restaurant.id}
              trigger={<Button size="sm">+ Category</Button>}
            />
            <DishModal
              restaurantId={restaurant.id}
              categories={restaurant.categories}
              trigger={<Button size="sm">+ Dish</Button>}
            />
          </div>
        )}
      </div>

      {/* Sticky category */}
      {activeCategory && (
        <div className="sticky top-0 z-40 bg-background py-2 px-4 border-b">
          <p className="text-lg font-semibold">{activeCategory}</p>
        </div>
      )}

      {/* Categories */}
      {restaurant.categories.map((cat) => (
        <div
          key={cat.id}
          ref={(el) => {
  categoryRefs.current[cat.id] = el;
}}
          data-name={cat.name}
          className="px-4 pt-6"
        >
          <h2 className="text-xl font-bold mb-4 opacity-70">{cat.name}</h2>

          <div className="space-y-4">
            {cat.dishes.map(({ dish }) => (
              <Card
                key={dish.id}
                className="
                  group p-4 rounded-2xl border border-border bg-card
                  shadow-sm transition-all duration-300
                  hover:-translate-y-1 hover:shadow-[0_8px_20px_-2px_rgba(255,100,100,0.25)]
                  hover:bg-accent/30
                "
              >
                <div className="flex items-start justify-between gap-4">

                  {/* LEFT SIDE */}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <VegIcon isVeg={dish.isVeg} />
                      <p className="font-semibold text-[17px] tracking-tight">
                        {dish.name}
                      </p>
                    </div>

                    {dish.spiceLevel !== null && dish.spiceLevel > 0 && (
                      <SpiceBadge level={dish.spiceLevel} />
                    )}

                    {dish.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-snug">
                        {dish.description}
                      </p>
                    )}

                    {/* Category chips */}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {dish.categories.map((dc) => {
                        const found = restaurant.categories.find(
                          (x) => x.id === dc.categoryId
                        );

                        return (
                          <span
                            key={dc.categoryId}
                            className="
                              text-xs px-2 py-0.5 rounded-full 
                              bg-muted text-muted-foreground border border-border
                            "
                          >
                            {found?.name ?? ""}
                          </span>
                        );
                      })}
                    </div>

                    {/* Edit/Delete */}
                    {canEdit && (
                      <div className="flex gap-2 pt-3">
                        <DishModal
                          dish={dish}
                          restaurantId={restaurant.id}
                          categories={restaurant.categories}
                          trigger={
                            <Button size="sm" variant="outline">
                              Edit
                            </Button>
                          }
                        />

                        <DishModal
                          dish={dish}
                          isDelete
                          restaurantId={restaurant.id}
                          categories={restaurant.categories}
                          trigger={
                            <Button size="sm" variant="destructive">
                              Delete
                            </Button>
                          }
                        />
                      </div>
                    )}
                  </div>

                  {/* RIGHT IMAGE */}
                  {dish.imageUrl && (
                    <div className="overflow-hidden rounded-xl shrink-0">
                      <Image
                        src={dish.imageUrl}
                        alt={dish.name}
                        width={96}
                        height={96}
                        className="
                          rounded-xl object-cover
                          transition-transform duration-300 
                          group-hover:scale-110
                        "
                      />
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {/* Floating menu button */}
      <div className="fixed bottom-4 left-0 right-0 flex justify-center z-50 pointer-events-none">
        <Button
          className="pointer-events-auto px-6 py-3 rounded-full shadow-xl bg-primary text-white"
          onClick={() => setMenuOpen(true)}
        >
          ≡ Menu
        </Button>
      </div>

      <MenuSheet
        categories={restaurant.categories}
        open={menuOpen}
        onOpenChange={setMenuOpen}
        onSelect={(id: string) => {
          const el = categoryRefs.current[id];
          el?.scrollIntoView({ behavior: "smooth" });
          setMenuOpen(false);
        }}
      />
    </div>
  );
}
