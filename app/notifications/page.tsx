import Link from "next/link";
import { and, desc, eq, isNull } from "drizzle-orm";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

async function markAllRead() {
  "use server";
  const { auth } = await import("@/lib/auth/server");
  const { data } = await auth.getSession();
  if (!data?.user) redirect("/login?next=/notifications");
  const [{ db }, { notifications }] = await Promise.all([import("@/lib/database"), import("@/lib/database/schema")]);
  await db.update(notifications).set({ readAt: new Date() })
    .where(and(eq(notifications.userId, data.user.id), isNull(notifications.readAt)));
  redirect("/notifications");
}

export default async function NotificationsPage() {
  const { auth } = await import("@/lib/auth/server");
  const { data } = await auth.getSession();
  if (!data?.user) redirect("/login?next=/notifications");
  const [{ db }, { notifications }] = await Promise.all([import("@/lib/database"), import("@/lib/database/schema")]);
  const items = await db.select().from(notifications).where(eq(notifications.userId, data.user.id))
    .orderBy(desc(notifications.createdAt)).limit(80);
  const unread = items.filter((item) => !item.readAt).length;
  return (
    <main className="announcements-page">
      <header className="announcements-header"><Link href="/" className="admin-brand"><span>N</span> NEFTIS</Link><Link href="/dashboard">Dashboard</Link></header>
      <section className="announcements-intro"><p className="admin-kicker">YOUR SPACE / INBOX</p><h1>Pusat <em>notifikasi.</em></h1><p>{unread} notifikasi belum dibaca.</p>{unread > 0 && <form action={markAllRead}><button className="admin-login-action" type="submit">Tandai semua dibaca</button></form>}</section>
      <section className="announcements-list">{items.length ? items.map((item) => <article className={`announcement-entry ${item.readAt ? "is-read" : "is-unread"}`} key={item.id}><div><span>{item.type}</span><time>{item.createdAt.toLocaleString("id-ID")}</time></div><h2>{item.title}</h2><p>{item.body}</p>{item.href && <Link href={item.href}>Lihat detail ↗</Link>}</article>) : <div className="announcement-empty"><span>INBOX CLEAR</span><h2>Belum ada notifikasi.</h2><p>Notifikasi penting akan muncul di sini.</p></div>}</section>
    </main>
  );
}
