import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { addMinutes } from "date-fns";
import crypto from "crypto";
import { sendOtpEmail } from "~/server/email/sendOtp";
import { generateJWT } from "~/server/auth/jwt";
import { NextResponse } from "next/server";


export function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

export const authRouter = createTRPCRouter({

signup: publicProcedure
    .input(
      z.object({
        fullName: z.string().min(3),
        email: z.string().email(),
        country: z.string().min(2),
      })
    )
    .mutation(async ({ input }) => {
      const existing = await db.user.findUnique({
        where: { email: input.email },
      });

      if (existing) {
        return { error: "User already exists" };
      }

      await db.user.create({
        data: {
          email: input.email,
          fullName: input.fullName,
          country: input.country,
        },
      });

      return { success: true };
    }),

  // LOGIN — SEND OTP
  login: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const user = await db.user.findUnique({
        where: { email: input.email },
      });

      if (!user) return { error: "User not found" };

      const otp = generateOTP();

      await db.oTP.create({
        data: {
          code: otp,
          expiresAt: addMinutes(new Date(), 10),
          userId: user.id,
        },
      });

      await sendOtpEmail(user.email, otp);

      return { success: true };
    }),

  // OTP VERIFY — SAME
verifyOtp: publicProcedure
  .input(z.object({ email: z.string(), code: z.string() }))
  .mutation(async ({ input }) => {
    const user = await db.user.findUnique({
      where: { email: input.email },
    });

    if (!user) return { error: "User not found" };

    const otp = await db.oTP.findFirst({
      where: {
        userId: user.id,
        code: input.code,
        expiresAt: { gt: new Date() },
      },
    });

    if (!otp) return { error: "Invalid or expired OTP" };
    console.log("OTP verified successfully for user:", user.email, user, generateJWT(user.id) );

    const token = generateJWT(user.id);
    console.log("Generated JWT:", token);

    // ⭐ Create response only to set cookies
    const res = NextResponse.next();
    res.cookies.set("session", token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    // 👇 MUST RETURN A NORMAL JSON (not NextResponse)
    return { success: true };
  }),

});
