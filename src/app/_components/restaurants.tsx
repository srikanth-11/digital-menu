"use client";

import { api } from "~/trpc/react";
import RestaurantCard from "./restaurant-card";
import { useQRForRestaurants } from "~/hooks/useQrForResturants";

export default function RestaurantsList() {
  const [restaurants, { isLoading }] = api.restaurant.getAll.useSuspenseQuery();
  const qrMap = useQRForRestaurants(restaurants);

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 rounded-full animate-spin border-4 border-muted border-t-primary" />
      </div>
    );

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-6">
      {restaurants?.map((r) => (
        <RestaurantCard
          key={r.id}
          restaurant={r}
          qr={qrMap[r.id] ?? ""}
          showActions={false} // Public view → NO edit/delete
        />
      ))}
    </div>
  );
}
