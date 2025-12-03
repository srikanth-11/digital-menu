import { cookies } from "next/headers";
import { verifyJWT } from "./jwt";
import { db } from "../db";

export async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) return null;

  const decoded = verifyJWT(token);
  if (!decoded) return null;

  const user = await db.user.findUnique({
    where: { id: decoded.userId },
  });

  return user;
}
