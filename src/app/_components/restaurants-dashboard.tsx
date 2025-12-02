"use client";

import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import RestaurantCard from "./restaurant-card";
import RestaurantModal from "./restaurant-modal";
import { useQRForRestaurants } from "~/hooks/useQrForResturants";
import { toast } from "sonner";

export default function RestaurantsDashboard() {
  const utils = api.useUtils();
  const { data: restaurants, isLoading } =
    api.restaurant.myRestaurants.useQuery();

  const qrMap = useQRForRestaurants(restaurants);

  const del = api.restaurant.delete.useMutation({
    onSuccess: async () => {
      toast.success("Restaurant deleted!");
      await utils.restaurant.myRestaurants.invalidate();
    },
  });

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 rounded-full animate-spin border-4 border-muted border-t-primary" />
      </div>
    );

  return (
    <div className="space-y-6">

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Your Restaurants</h2>

        <RestaurantModal
          trigger={<Button>Add Restaurant</Button>}
          onSuccess={() => utils.restaurant.myRestaurants.invalidate()}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {restaurants?.map((r) => (
          <RestaurantCard
            key={r.id}
            restaurant={r}
            qr={qrMap[r.id] ?? ""}
            showActions={true} // ✅ show edit/delete in dashboard
            onDelete={() => del.mutate({ id: r.id })}
            utilsInvalidate={() => utils.restaurant.myRestaurants.invalidate()}
          />
        ))}
      </div>
    </div>
  );
}
