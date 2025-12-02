import { HydrateClient, api } from "~/trpc/server";
import { getUser } from "~/server/auth/get-user";
import DashboardHeader from "~/app/_components/dashboard-header";
import RestaurantsList from "./_components/restaurants";

export default async function HomePage() {
  const user = await getUser();
  void api.restaurant.getAll.prefetch();

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <DashboardHeader user={user} />

      {/* CONTENT */}
      <main className="max-w-6xl mx-auto px-4 py-10">
        <HydrateClient>
          <RestaurantsList />
        </HydrateClient>
      </main>
    </div>
  );
}
