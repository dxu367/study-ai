import { getServerSession, Session } from "next-auth";
import { authOptions } from "./auth";

export async function getRequiredSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getUserId(session: Session | any): string {
  const id = (session?.user as Record<string, unknown>)?.id as string | undefined;
  if (!id) throw new Error("No user id in session");
  return id;
}
