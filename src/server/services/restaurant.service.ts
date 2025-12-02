import { db } from "~/server/db";

export const RestaurantService = {
  getAllPublic: async () => {
    return db.restaurant.findMany({
      where: { public: true },
      select: { id: true, name: true, slug: true, location: true },
      orderBy: { name: "asc" },
    });
  },

  getBySlug: async (slug: string) => {
    return db.restaurant.findUnique({
      where: { slug },
      include: {
        categories: {
          orderBy: { position: "asc" },
          include: {
            dishes: {
              include: {
                dish: true,
              },
            },
          },
        },
      },
    });
  },
};
