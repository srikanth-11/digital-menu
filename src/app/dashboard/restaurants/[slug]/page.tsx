import { redirect } from "next/navigation";
import { getUser } from "~/server/auth/get-user";
import { api } from "~/trpc/server";
import RestaurantView from "~/app/_components/restaurant-view";
import DashboardHeader from "~/app/_components/dashboard-header";

export default async function RestaurantPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const user = await getUser(); // user | null

  // Ensure slug is valid string
  const { slug } = await params;


  let restaurant;

  if (user) {
    // Logged-in user → owner version
    restaurant = await api.restaurant.getBySlugForOwner({
      slug,
    });
  } else {
    // Public version
    restaurant = await api.restaurant.getBySlug({
      slug,
    });
  }

  // Redirect to home if not found
  if (!restaurant) redirect("/");

  // Owner-only edit permission
  const canEdit = user?.id === restaurant.userId;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        {/* @ts-expect-error: component expects stricter type than runtime data */}
        <RestaurantView restaurant={restaurant} canEdit={canEdit} />
      </main>
    </div>
  );
}
