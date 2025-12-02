import { PrismaClient } from "../generated/prisma/index.js";
import slugify from "slugify";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Seeding data...");

  const img =
    "https://7bhqajopy9.ufs.sh/f/oG2foVsMG5STp6HTrF7Q91cqb2vPeRIKg6zHGj07rUMNa8JY";

  // ---------------------------------------
  // USER
  // ---------------------------------------
  const user = await db.user.upsert({
    where: { email: "kasireddysrikanth27@gmail.com" },
    update: {},
    create: {
      email: "kasireddysrikanth27@gmail.com",
      fullName: "Srikanth Kasireddy",
      country: "India",
    },
  });

  // ---------------------------------------
  // RESTAURANTS
  // ---------------------------------------
  const restaurantSeeds = [
    { name: "Spicy Treats", location: "Hyderabad" },
    { name: "South Indian Delights", location: "Nellore" },
    { name: "Royal Biryani House", location: "Vijayawada" },
  ];

  const restaurants = [];

  for (const r of restaurantSeeds) {
    let baseSlug = slugify(r.name, { lower: true, strict: true });
    let slug = baseSlug;

    // Ensure unique slug
    let counter = 1;
    while (await db.restaurant.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const restaurant = await db.restaurant.upsert({
      where: { slug },
      update: {},
      create: {
        name: r.name,
        slug,
        location: r.location,
        userId: user.id,
        public: true,
      },
    });

    restaurants.push(restaurant);
  }

  // ---------------------------------------
  // CATEGORY + DISH DATA
  // NOTE: spiceLevel only supports 1–3
  // ---------------------------------------

  const restaurantData = [
    {
      rest: restaurants[0],
      categories: [
        {
          name: "Starters",
          dishes: [
            { name: "Chicken 65", desc: "Crispy spicy chicken", spice: 3, veg: false },
            { name: "Paneer Tikka", desc: "Smoky grilled paneer", spice: 2, veg: true },
            { name: "Chilli Mushroom", desc: "Semi-dry Indo-Chinese", spice: 3, veg: true },
          ],
        },
        {
          name: "Main Course",
          dishes: [
            { name: "Butter Chicken", desc: "Creamy curry", spice: 2, veg: false },
            { name: "Veg Biryani", desc: "Aromatic biryani rice", spice: 1, veg: true },
            { name: "Dal Tadka", desc: "Yellow dal with tadka", spice: 1, veg: true },
          ],
        },
      ],
    },
    {
      rest: restaurants[1],
      categories: [
        {
          name: "Breakfast",
          dishes: [
            { name: "Idli Sambar", desc: "Soft idlis + sambar", spice: 1, veg: true },
            { name: "Ghee Dosa", desc: "Crispy dosa", spice: 1, veg: true },
            { name: "Upma", desc: "Homely breakfast", spice: 1, veg: true },
          ],
        },
        {
          name: "Meals",
          dishes: [
            { name: "Andhra Meals", desc: "Full veg thali", spice: 2, veg: true },
            { name: "Pappu", desc: "Andhra style dal", spice: 1, veg: true },
          ],
        },
      ],
    },
    {
      rest: restaurants[2],
      categories: [
        {
          name: "Biryani",
          dishes: [
            { name: "Chicken Dum Biryani", desc: "Hyderabadi style", spice: 3, veg: false },
            { name: "Mutton Biryani", desc: "Rich & flavorful", spice: 3, veg: false },
            { name: "Veg Biryani", desc: "Fluffy & aromatic", spice: 1, veg: true },
          ],
        },
        {
          name: "Sides",
          dishes: [
            { name: "Raita", desc: "Curd with veggies", spice: 1, veg: true },
            { name: "Mirchi Ka Salan", desc: "Spicy gravy", spice: 3, veg: true },
            { name: "Onion Salad", desc: "Fresh crunchy onions", spice: 1, veg: true },
          ],
        },
      ],
    },
  ];

  // ---------------------------------------
  // INSERT CATEGORIES + DISHES
  // ---------------------------------------

  for (const r of restaurantData) {
   

    let position = 1;

    for (const cat of r.categories) {
      if (!r.rest) continue;
      const category = await db.category.create({
        data: {
          name: cat.name,
          position,
          restaurantId: r.rest.id,
        },
      });
      position++;

      for (const d of cat.dishes) {
        // spice value sanitization: ensure 1–3
        const spice = Math.max(1, Math.min(3, d.spice));

        const dish = await db.dish.create({
          data: {
            name: d.name,
            description: d.desc,
            imageUrl: img,
            spiceLevel: spice,
            isVeg: d.veg,
            restaurantId: r.rest.id,
          },
        });

        await db.dishCategory.create({
          data: {
            dishId: dish.id,
            categoryId: category.id,
          },
        });
      }
    }
  }

  console.log("✅ Seeding complete!");
}

main()
  .catch((err) => {
    console.error("❌ Seed error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
