"use client";

import Link from "next/link";
import Image from "next/image";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import RestaurantModal from "~/app/_components/restaurant-modal";

export interface RestaurantCardData {
  id: string;
  name: string;
  slug: string;
  location: string | null;
}

interface RestaurantCardProps {
  restaurant: RestaurantCardData;
  qr: string;
  showActions?: boolean;
  onDelete?: () => void;
  utilsInvalidate?: () => void;
}

export default function RestaurantCard({
  restaurant,
  qr,
  showActions = false,
  onDelete,
  utilsInvalidate,
}: RestaurantCardProps) {

  const noop = () => undefined; // ✅ ESLint-safe no-op

  return (
    <Card
      className="
        group p-5 rounded-2xl border border-border bg-card
        shadow-sm transition-all duration-300
        hover:-translate-y-1 hover:shadow-[0_8px_20px_-2px_rgba(255,100,100,0.25)]
        hover:bg-accent/30
        flex flex-row items-start gap-4
      "
    >
      {/* LEFT SIDE — TEXT */}
      <div className="flex-1 min-w-0 space-y-1">
        <Link
          href={`/dashboard/restaurants/${restaurant.slug}`}
          className="block group cursor-pointer"
        >
          <h3 className="text-lg font-semibold group-hover:text-primary transition">
            {restaurant.name}
          </h3>

          {restaurant.location && (
            <p className="text-sm text-muted-foreground">
              {restaurant.location}
            </p>
          )}
        </Link>

        {/* ACTION BUTTONS — Only Dashboard */}
        {showActions && (
          <div className="flex flex-wrap gap-2 mt-4">
            <RestaurantModal
              restaurant={restaurant}
              trigger={<Button variant="secondary">Edit</Button>}
              onSuccess={utilsInvalidate ?? noop}
            />

            <Button variant="destructive" onClick={onDelete}>
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* QR CODE */}
      <div className="w-[110px] shrink-0 flex items-center justify-center">
        <Image
          src={qr}
          width={100}
          height={100}
          alt={`${restaurant.name} QR code`}
          className="rounded-md border shadow-sm"
        />
      </div>
    </Card>
  );
}
