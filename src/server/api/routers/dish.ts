import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { getUser } from "~/server/auth/get-user";

export const dishRouter = createTRPCRouter({

  // ============================
  // GET ALL DISHES FOR A RESTAURANT
  // ============================
  getByRestaurant: publicProcedure
    .input(z.object({ restaurantId: z.string() }))
    .query(async ({ input }) => {
      return db.dish.findMany({
        where: { restaurantId: input.restaurantId },
        include: {
          categories: {
            include: { category: true },
          },
        },
      });
    }),

  // ============================
  // CREATE DISH
  // ============================
  create: publicProcedure
    .input(z.object({
      restaurantId: z.string(),
      name: z.string().min(1),
      description: z.string().nullable().optional(),
      imageUrl: z.string().nullable().optional(),
      spiceLevel: z.number().int().min(1).max(5).nullable().optional(),
      isVeg: z.boolean().default(true),         // ✅ ADDED
      categoryIds: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input }) => {
      const user = await getUser();
      if (!user) return { error: "Unauthorized" };

      const restaurant = await db.restaurant.findUnique({
        where: { id: input.restaurantId },
      });
      if (!restaurant || restaurant.userId !== user.id)
        return { error: "Unauthorized" };

      // Validate categories belong to restaurant
      if (input.categoryIds?.length) {
        const count = await db.category.count({
          where: {
            id: { in: input.categoryIds },
            restaurantId: input.restaurantId,
          },
        });
        if (count !== input.categoryIds.length)
          return { error: "Invalid category assignment" };
      }

      const result = await db.$transaction(async (tx) => {
        const dish = await tx.dish.create({
          data: {
            name: input.name,
            description: input.description ?? null,
            imageUrl: input.imageUrl ?? null,
            spiceLevel: input.spiceLevel ?? null,
            isVeg: input.isVeg,                // ✅ SAVED TO DB
            restaurantId: input.restaurantId,
          },
        });

        if (input.categoryIds?.length) {
          const mapping = input.categoryIds.map((cid) => ({
            dishId: dish.id,
            categoryId: cid,
          }));
          await tx.dishCategory.createMany({ data: mapping });
        }

        return dish;
      });

      return { success: true, dish: result };
    }),

  // ============================
  // UPDATE DISH
  // ============================
  update: publicProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1),
      description: z.string().nullable().optional(),
      imageUrl: z.string().nullable().optional(),
      spiceLevel: z.number().int().min(1).max(5).nullable().optional(),
      isVeg: z.boolean().optional(),           // ✅ ADDED
      categoryIds: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input }) => {
      const user = await getUser();
      if (!user) return { error: "Unauthorized" };

      const existing = await db.dish.findUnique({
        where: { id: input.id },
      });
      if (!existing) return { error: "Not found" };

      const restaurant = await db.restaurant.findUnique({
        where: { id: existing.restaurantId },
      });
      if (!restaurant || restaurant.userId !== user.id)
        return { error: "Unauthorized" };

      // Validate categories
      if (input.categoryIds?.length) {
        const count = await db.category.count({
          where: {
            id: { in: input.categoryIds },
            restaurantId: restaurant.id,
          },
        });
        if (count !== input.categoryIds.length)
          return { error: "Invalid category assignment" };
      }

      await db.$transaction(async (tx) => {
        await tx.dish.update({
          where: { id: input.id },
          data: {
            name: input.name,
            description: input.description ?? null,
            imageUrl: input.imageUrl ?? null,
            spiceLevel: input.spiceLevel ?? null,
            isVeg: input.isVeg ?? existing.isVeg,   // ✅ UPDATED
          },
        });

        await tx.dishCategory.deleteMany({ where: { dishId: input.id } });

        if (input.categoryIds?.length) {
          const mapping = input.categoryIds.map((cid) => ({
            dishId: input.id,
            categoryId: cid,
          }));
          await tx.dishCategory.createMany({ data: mapping });
        }
      });

      return { success: true };
    }),

  // ============================
  // DELETE DISH
  // ============================
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const user = await getUser();
      if (!user) return { error: "Unauthorized" };

      const existing = await db.dish.findUnique({
        where: { id: input.id },
      });
      if (!existing) return { error: "Not found" };

      const restaurant = await db.restaurant.findUnique({
        where: { id: existing.restaurantId },
      });
      if (!restaurant || restaurant.userId !== user.id)
        return { error: "Unauthorized" };

      await db.$transaction(async (tx) => {
        await tx.dishCategory.deleteMany({ where: { dishId: input.id } });
        await tx.dish.delete({ where: { id: input.id } });
      });

      return { success: true };
    }),

});
