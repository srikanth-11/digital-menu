import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { getUser } from "~/server/auth/get-user";

export const categoryRouter = createTRPCRouter({

  // ============================
  // GET CATEGORIES BY RESTAURANT
  // ============================
  getByRestaurant: publicProcedure
    .input(z.object({ restaurantId: z.string() }))
    .query(async ({ input }) => {
      return db.category.findMany({
        where: { restaurantId: input.restaurantId },
        orderBy: { position: "asc" },
      });
    }),

  // ============================
  // CREATE CATEGORY
  // ============================
  create: publicProcedure
    .input(z.object({
      restaurantId: z.string(),
      name: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      const user = await getUser();
      if (!user) return { error: "Unauthorized" };

      const restaurant = await db.restaurant.findUnique({
        where: { id: input.restaurantId },
      });
      if (!restaurant || restaurant.userId !== user.id)
        return { error: "Unauthorized" };

      const maxPos = await db.category.aggregate({
        where: { restaurantId: input.restaurantId },
        _max: { position: true },
      });

      const nextPos = (maxPos._max.position ?? 0) + 1;

      const created = await db.category.create({
        data: {
          name: input.name,
          position: nextPos,
          restaurantId: input.restaurantId,
        },
      });

      return { success: true, category: created };
    }),

  // ============================
  // UPDATE CATEGORY NAME
  // ============================
  update: publicProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      const user = await getUser();
      if (!user) return { error: "Unauthorized" };

      const cat = await db.category.findUnique({
        where: { id: input.id },
      });
      if (!cat) return { error: "Not found" };

      const restaurant = await db.restaurant.findUnique({
        where: { id: cat.restaurantId },
      });
      if (!restaurant || restaurant.userId !== user.id)
        return { error: "Unauthorized" };

      await db.category.update({
        where: { id: input.id },
        data: { name: input.name },
      });

      return { success: true };
    }),

  // ============================
  // DELETE CATEGORY (with reorder)
  // ============================
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const user = await getUser();
      if (!user) return { error: "Unauthorized" };

      const cat = await db.category.findUnique({
        where: { id: input.id },
      });
      if (!cat) return { error: "Not found" };

      const restaurant = await db.restaurant.findUnique({
        where: { id: cat.restaurantId },
      });
      if (!restaurant || restaurant.userId !== user.id)
        return { error: "Unauthorized" };

      await db.$transaction(async (tx) => {
        // Remove category mappings first
        await tx.dishCategory.deleteMany({
          where: { categoryId: input.id },
        });

        // Delete the category
        await tx.category.delete({
          where: { id: input.id },
        });

        // Reorder remaining categories
        const remaining = await tx.category.findMany({
          where: { restaurantId: restaurant.id },
          orderBy: { position: "asc" },
        });

        await Promise.all(
          remaining.map((c, index) =>
            tx.category.update({
              where: { id: c.id },
              data: { position: index + 1 },
            })
          )
        );
      });

      return { success: true };
    }),

  // ============================
  // DRAG & DROP REORDER
  // ============================
  reorder: publicProcedure
    .input(
      z.object({
        restaurantId: z.string(),
        orderedIds: z.array(z.string()), // [cat1, cat3, cat2, ...]
      })
    )
    .mutation(async ({ input }) => {
      const user = await getUser();
      if (!user) return { error: "Unauthorized" };

      const restaurant = await db.restaurant.findUnique({
        where: { id: input.restaurantId },
      });
      if (!restaurant || restaurant.userId !== user.id)
        return { error: "Unauthorized" };

      await db.$transaction(async (tx) => {
        await Promise.all(
          input.orderedIds.map((id, index) =>
            tx.category.update({
              where: { id },
              data: { position: index + 1 },
            })
          )
        );
      });

      return { success: true };
    }),

});
