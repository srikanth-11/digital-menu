"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "~/components/ui/card";
import { toast } from "sonner"; // shadcn toast

export default function SignupPage() {
  const router = useRouter();
  const signup = api.auth.signup.useMutation();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    country: "",
  });

  const handleSignup = async () => {
    try {
      const res = await signup.mutateAsync(form);

      if (res.error) {
        toast.error(res.error);
        return;
      }

      toast.success("Account created successfully! Redirecting to login...");

      setTimeout(() => {
        router.push("/login");
      }, 1500);

    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-card shadow-xl rounded-2xl p-6">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-semibold">
            Create Account
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Input
            placeholder="Full Name"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />

          <Input
            placeholder="Email Address"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <Input
            placeholder="Country"
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
          />

          <Button
            className="w-full"
            onClick={handleSignup}
            disabled={signup.isPending}
          >
            {signup.isPending ? "Creating..." : "Create Account"}
          </Button>
        </CardContent>

        <CardFooter className="flex flex-col gap-2 mt-4">
          <Link href="/" className="text-primary text-sm hover:underline text-center">
            ← Back to Home
          </Link>

          <Link href="/login" className="text-muted-foreground text-sm hover:text-primary">
            Already have an account? <span className="text-primary">Login</span>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
