"use server";

import { redirect } from "next/navigation";

export async function signOutAction() {
  const { auth } = await import("@/lib/auth/server");
  await auth.signOut();
  redirect("/login");
}
