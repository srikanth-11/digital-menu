"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "~/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu";

// Define strict user type
export interface HeaderUser {
  id: string;
  fullName: string;
  email: string;
}

export default function DashboardHeader({ user }: { user: HeaderUser | null }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  // ----------------------------
  // ACTIVE TAB LOGIC
  // ----------------------------
  const isRestaurantsActive = user
    ? pathname === "/dashboard" || pathname.startsWith("/dashboard/restaurants")
    : pathname === "/";

  const goToRestaurants = () => {
    router.push(user ? "/dashboard" : "/");
  };

  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur supports-backdrop-filter:backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">

        {/* LEFT SECTION: LOGO + NAV */}
        <div className="flex items-center gap-6">
          {/* LOGO */}
          <div
            className="text-xl font-bold cursor-pointer tracking-tight"
            onClick={() => router.push("/")}
          >
            Digital Menu
          </div>

          {/* RESTAURANTS TAB */}
          <button
            onClick={goToRestaurants}
            className={`
              text-sm font-medium pb-1 transition
              ${
                isRestaurantsActive
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-primary"
              }
            `}
          >
            Restaurants
          </button>
        </div>

        {/* RIGHT SECTION */}
        <div className="flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar className="cursor-pointer">
                  <AvatarImage src="/avatar.png" />
                  <AvatarFallback>
                    {user.fullName?.charAt(0).toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user.fullName}</DropdownMenuLabel>

                <p className="px-3 pb-1 text-xs text-muted-foreground">
                  {user.email}
                </p>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                  Dashboard
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive"
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex gap-3">
              <Link href="/login" className="btn-ghost">
                Login
              </Link>
              <Link href="/signup" className="btn-primary">
                Signup
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
