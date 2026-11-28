import Link from "next/link";
import { desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getAdminContext } from "@/lib/auth/authorization";

export const dynamic = "force-dynamic";

async function publishAnnouncement(formData: FormData) {
  "use server";
  const admin = await getAdminContext();
  if (!admin || !["superadmin", "admin", "moderator"].includes(admin.role)) redirect("/admin/login");
  const title = String(formData.get("title") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (title.length < 4 || title.length > 120 || excerpt.length < 10 || excerpt.length > 240 || body.length < 20 || body.length > 12000) {
    redirect("/admin/announcements?error=validation");
  }
  const [{ db }, { announcements, adminAuditLogs, notifications }, { sql }] = await Promise.all([
    import("@/lib/database"), import("@/lib/database/schema"), import("drizzle-orm"),
  ]);
  const slugBase = title.normalize("NFKD").toLowerCase().replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 72);
  const slug = `${slugBase || "announcement"}-${crypto.randomUUID().slice(0, 8)}`;
  const [created] = await db.insert(announcements).values({
    slug, title, excerpt, body, status: "published", pinned: formData.get("pinned") === "on",
    publishedAt: new Date(), authorUserId: admin.user.id,
  }).returning({ id: announcements.id, slug: announcements.slug });
  await db.insert(adminAuditLogs).values({
    actorUserId: admin.user.id, action: "announcement.publish", metadata: { announcementId: created.id, slug: created.slug },
  });
  await db.execute(sql`INSERT INTO public.notifications (user_id, announcement_id, type, title, body, href)
    SELECT u.id, ${created.id}::uuid, 'announcement', ${title}, ${excerpt}, '/announcements'
    FROM neon_auth."user" AS u
    WHERE u.id <> ${admin.user.id}::uuid`);
  redirect("/admin/announcements?published=1");
}

export default async function AdminAnnouncementsPage() {
  const admin = await getAdminContext();
  if (!admin || !["superadmin", "admin", "moderator"].includes(admin.role)) redirect("/admin/login");
  const [{ db }, { announcements }] = await Promise.all([import("@/lib/database"), import("@/lib/database/schema")]);
  const items = await db.select({
    id: announcements.id, title: announcements.title, status: announcements.status,
    pinned: announcements.pinned, publishedAt: announcements.publishedAt,
  }).from(announcements).orderBy(desc(announcements.createdAt)).limit(50);

  return (
    <main className="admin-console">
      <header className="admin-console-header"><Link href="/admin" className="admin-brand"><span>N</span> NEFTIS <small>CONTROL</small></Link><Link href="/admin" className="admin-back-link">← Control room</Link></header>
      <section className="admin-console-intro"><p className="admin-kicker">PUBLISHING / BULLETIN</p><h1>Kelola <em>pengumuman.</em></h1><p>Pengumuman yang diterbitkan akan muncul di halaman kabar dan dikirim ke pusat notifikasi pengguna.</p></section>
      <section className="admin-editor-grid">
        <form action={publishAnnouncement} className="admin-panel admin-announcement-form">
          <p className="admin-kicker">NEW ANNOUNCEMENT</p><h2>Tulis pengumuman</h2>
          <label>Judul<input name="title" minLength={4} maxLength={120} required /></label>
          <label>Ringkasan<textarea name="excerpt" minLength={10} maxLength={240} rows={3} required /></label>
          <label>Isi pengumuman<textarea name="body" minLength={20} maxLength={12000} rows={8} required /></label>
          <label className="admin-check"><input type="checkbox" name="pinned" /> Sematkan di halaman kabar</label>
          <button type="submit">Terbitkan pengumuman ↗</button>
        </form>
        <section className="admin-panel admin-announcement-list"><div className="admin-panel-heading"><div><p className="admin-kicker">CONTENT</p><h2>Riwayat terbit</h2></div><span>{items.length} item</span></div>
          {items.length ? items.map((item) => <article className="admin-announcement-row" key={item.id}><div><strong>{item.title}</strong><span>{item.status}{item.pinned ? " · pinned" : ""}</span></div><time>{item.publishedAt?.toLocaleDateString("id-ID") ?? "Draft"}</time></article>) : <p className="admin-empty">Belum ada pengumuman.</p>}
        </section>
      </section>
    </main>
  );
}
