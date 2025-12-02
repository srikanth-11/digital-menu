import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { generateJWT } from "~/server/auth/jwt";

type VerifyRequest = {
  email: string;
  code: string;
};

export async function POST(req: Request) {
  // --- Safely parse JSON ---
  const body = (await req.json()) as VerifyRequest;

  const email = body.email;
  const code = body.code;

  if (typeof email !== "string" || typeof code !== "string") {
    return NextResponse.json(
      { error: "Invalid request payload" },
      { status: 400 }
    );
  }

  // --- Find user ---
  const user = await db.user.findUnique({ where: { email } });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 400 });
  }

  // --- Validate OTP ---
  const otp = await db.oTP.findFirst({
    where: {
      userId: user.id,
      code,
      expiresAt: { gt: new Date() },
    },
  });

  if (!otp) {
    return NextResponse.json(
      { error: "Invalid or expired OTP" },
      { status: 400 }
    );
  }

  // --- Generate token ---
  const token = generateJWT(user.id);

  // --- Prepare response & cookie ---
  const res = NextResponse.json({ success: true });

  res.cookies.set("session", token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  return res;
}
