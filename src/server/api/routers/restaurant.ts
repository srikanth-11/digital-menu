import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import slugify from "slugify";
import { getUser } from "~/server/auth/get-user";

export const restaurantRouter = createTRPCRouter({

  // ============================
  // PUBLIC RESTAURANT LIST (Home Page)
  // ============================
  getAll: publicProcedure.query(async () => {
    return db.restaurant.findMany({
      where: { public: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        location: true,
      },
    });
  }),

  // ============================
  // PUBLIC DIGITAL MENU (By slug)
  // ============================
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      return db.restaurant.findFirst({
        where: { slug: input.slug, public: true },
      include: {
        categories: {
          orderBy: { position: "asc" },
          include: {
            dishes: {
              include: {
                dish: {
                  include: {
                    categories: true,  // ← ADD THIS
                  },
                },
              },
            },
          },
        },
      },
      });
    }),

  // ============================
  // DASHBOARD - MY RESTAURANTS
  // ============================
  myRestaurants: publicProcedure.query(async () => {
    const user = await getUser();
    if (!user) return [];

    return db.restaurant.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
  }),

  // ============================
  // DASHBOARD - CREATE RESTAURANT
  // ============================
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(2),
        location: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ input }) => {
      const user = await getUser();
      if (!user) return { error: "Unauthorized" };

      // Generate slug
      const baseSlug = slugify(input.name, { lower: true, strict: true });

      const existing = await db.restaurant.findMany({
        where: { slug: { startsWith: baseSlug } },
      });

      let slug = baseSlug;
      if (existing.length > 0) {
        slug = `${baseSlug}-${existing.length + 1}`;
      }

      await db.restaurant.create({
        data: {
          name: input.name,
          slug,
          public: true,
          location: input.location ?? null,
          userId: user.id,
        },
      });

      return { success: true };
    }),

  // ============================
  // DASHBOARD - UPDATE RESTAURANT
  // ============================
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(2),
        location: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ input }) => {
      const user = await getUser();
      if (!user) return { error: "Unauthorized" };

      await db.restaurant.updateMany({
        where: {
          id: input.id,
          userId: user.id,
        },
        data: {
          name: input.name,
          location: input.location ?? null,
        },
      });

      return { success: true };
    }),

  // ============================
  // DASHBOARD - DELETE RESTAURANT
  // ============================
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const user = await getUser();
      if (!user) return { error: "Unauthorized" };

      await db.restaurant.deleteMany({
        where: {
          id: input.id,
          userId: user.id,
        },
      });

      return { success: true };
    }),

  // ============================
  // OWNER PREVIEW BY SLUG (Private Dashboard)
  // ============================
getBySlugForOwner: publicProcedure
  .input(z.object({ slug: z.string() }))
  .query(async ({ input }) => {
    const user = await getUser();
    if (!user) return null;

    return db.restaurant.findFirst({
      where: {
        slug: input.slug,
        userId: user.id,
      },
      include: {
        categories: {
          orderBy: { position: "asc" },
          include: {
            dishes: {
              include: {
                dish: {
                  include: {
                    categories: true,  // ← ADD THIS
                  },
                },
              },
            },
          },
        },
      },
    });
  }),


});
