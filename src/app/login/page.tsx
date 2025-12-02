"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { api } from "~/trpc/react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "~/components/ui/card";

// ------------------------------
// TYPES
// ------------------------------
interface LoginResponse {
  success?: boolean;
  error?: string;
}

interface VerifyResponse {
  success?: boolean;
  error?: string;
}

// ------------------------------
// LOGIN PAGE
// ------------------------------
export default function LoginPage() {
  const login = api.auth.login.useMutation<LoginResponse>();

  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const handleLogin = async () => {
    if (!email) {
      toast.error("Email is required");
      return;
    }

    const res = await login.mutateAsync({ email });

    if (res?.error) {
      toast.error(res.error);
      return;
    }

    toast.success("OTP sent to your email!");
    setOtpSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-card shadow-xl rounded-2xl p-6">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-semibold">
            Login
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {!otpSent ? (
            <>
              <Input
                placeholder="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Button
                className="w-full"
                onClick={handleLogin}
                disabled={login.isPending}
              >
                {login.isPending ? "Sending OTP..." : "Continue"}
              </Button>
            </>
          ) : (
            <OtpVerify email={email} />
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-2 mt-4">
          <Link
            href="/"
            className="text-primary text-sm hover:underline text-center"
          >
            ← Back to Home
          </Link>

          <Link
            href="/signup"
            className="text-muted-foreground text-sm hover:text-primary"
          >
            Don’t have an account?{" "}
            <span className="text-primary font-medium">Create one</span>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

// ------------------------------
// OTP VERIFY COMPONENT
// ------------------------------
function OtpVerify({ email }: { email: string }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!code) {
      toast.error("OTP is required");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/verify", {
      method: "POST",
      body: JSON.stringify({ email, code }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = (await res.json()) as VerifyResponse;

    setLoading(false);

    if (data.error) {
      toast.error(data.error);
      return;
    }

    toast.success("Login successful!");

    setTimeout(() => {
      router.push("/dashboard");
    }, 800);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Enter the OTP sent to <strong>{email}</strong>
      </p>

      <Input
        placeholder="Enter OTP"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />

      <Button className="w-full" onClick={handleVerify} disabled={loading}>
        {loading ? "Verifying..." : "Verify OTP"}
      </Button>
    </div>
  );
}
