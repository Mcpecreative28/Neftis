import Link from "next/link";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function AnnouncementsPage() {
  const [{ db }, { announcements }] = await Promise.all([import("@/lib/database"), import("@/lib/database/schema")]);
  const items = await db.select({
    id: announcements.id, title: announcements.title, excerpt: announcements.excerpt,
    publishedAt: announcements.publishedAt, pinned: announcements.pinned,
  }).from(announcements).where(eq(announcements.status, "published"))
    .orderBy(desc(announcements.pinned), desc(announcements.publishedAt)).limit(50);

  return (
    <main className="announcements-page">
      <header className="announcements-header"><Link href="/" className="admin-brand"><span>N</span> NEFTIS</Link><Link href="/">Kembali ke beranda</Link></header>
      <section className="announcements-intro"><p className="admin-kicker">NEFTIS / BULLETIN</p><h1>Kabar <em>terbaru.</em></h1><p>Rilis, perubahan layanan, pemeliharaan, dan kabar dari Neftis.</p></section>
      <section className="announcements-list" aria-label="Daftar pengumuman">
        {items.length ? items.map((item) => <article className="announcement-entry" key={item.id}><div><span>{item.pinned ? "PINNED" : "UPDATE"}</span><time>{item.publishedAt?.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</time></div><h2>{item.title}</h2><p>{item.excerpt}</p></article>) : <div className="announcement-empty"><span>NO UPDATES</span><h2>Belum ada pengumuman.</h2><p>Informasi baru akan muncul di sini saat diterbitkan.</p></div>}
      </section>
    </main>
  );
}
