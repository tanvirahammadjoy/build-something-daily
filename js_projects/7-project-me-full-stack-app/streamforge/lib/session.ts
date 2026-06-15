import { getServerSession as nextAuthGetServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Session } from "next-auth";

export async function getServerSession(): Promise<Session | null> {
  return nextAuthGetServerSession(authOptions);
}
