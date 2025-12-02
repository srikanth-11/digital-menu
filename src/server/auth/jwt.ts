import jwt from "jwt-simple";
import { env } from "~/env";

type JWTPayload = {
  userId: string;
  exp: number;
};

// Encode JWT
export function generateJWT(userId: string): string {
  const payload: JWTPayload = {
    userId,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  return jwt.encode(payload, env.JWT_SECRET);
}

// Decode JWT safely
export function verifyJWT(token: string): JWTPayload | null {
  try {
    const decoded = jwt.decode(token, env.JWT_SECRET) as unknown;

    // Type guard
    if (
      typeof decoded === "object" &&
      decoded !== null &&
      "userId" in decoded &&
      "exp" in decoded &&
      typeof (decoded as { exp: number }).exp === "number" &&
      typeof (decoded as { userId: string }).userId === "string"
    ) {
      const payload = decoded as JWTPayload;

      if (payload.exp < Date.now()) return null;
      return payload;
    }

    return null;
  } catch {
    return null;
  }
}
