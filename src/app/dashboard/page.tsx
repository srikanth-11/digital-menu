import { redirect } from "next/navigation";
import { getUser } from "~/server/auth/get-user";
import RestaurantsDashboard from "../_components/restaurants-dashboard";
import DashboardHeader from "../_components/dashboard-header";

export default async function DashboardPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        <RestaurantsDashboard />
      </main>
    </div>
  );
}
