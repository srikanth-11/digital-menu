"use client";

import { useEffect, useState } from "react";

// -----------------------------
// Type for restaurant list item
// -----------------------------
export interface QrRestaurant {
  id: string;
  slug: string;
}

// -----------------------------
// Hook
// -----------------------------
export function useQRForRestaurants(
  restaurants: QrRestaurant[] | undefined
) {
  const [qrMap, setQrMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!restaurants) return;

    const map: Record<string, string> = {};

    restaurants.forEach((r) => {
      const url = `${window.location.origin}/dashboard/restaurants/${r.slug}`;

      map[r.id] =
        "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" +
        encodeURIComponent(url);
    });

    setQrMap(map);
  }, [restaurants]);

  return qrMap;
}
