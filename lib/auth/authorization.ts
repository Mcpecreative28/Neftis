import { and, eq, isNull } from "drizzle-orm";

export type AdminContext = {
  user: { id: string; name?: string | null; email: string };
  role: "superadmin" | "admin" | "moderator" | "support";
};

export async function getAdminContext(): Promise<AdminContext | null> {
  const { auth } = await import("@/lib/auth/server");
  const { data } = await auth.getSession();
  const user = data?.user;
  if (!user?.id || !user.email) return null;

  const bootstrapEmails = (process.env.NEFTIS_SUPERADMIN_EMAILS ?? "")
    .split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);
  if (bootstrapEmails.includes(user.email.toLowerCase())) return { user, role: "superadmin" };

  const [{ db }, { adminMembers }] = await Promise.all([
    import("@/lib/database"), import("@/lib/database/schema"),
  ]);
  const [membership] = await db.select({ role: adminMembers.role }).from(adminMembers)
    .where(and(eq(adminMembers.userId, user.id), isNull(adminMembers.revokedAt))).limit(1);
  if (!membership || !["admin", "moderator", "support"].includes(membership.role)) return null;
  return { user, role: membership.role as AdminContext["role"] };
}
