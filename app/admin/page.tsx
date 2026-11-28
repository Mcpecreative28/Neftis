import Link from "next/link";
import { count, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getAdminContext } from "@/lib/auth/authorization";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const admin = await getAdminContext();
  if (!admin) redirect("/admin/login");
  const [{ db }, schema] = await Promise.all([import("@/lib/database"), import("@/lib/database/schema")]);
  const [users, usage, announcements, notifications, recent] = await Promise.all([
    db.select({ value: count() }).from(schema.authUser),
    db.select({ value: count() }).from(schema.usageEvents),
    db.select({ value: count() }).from(schema.announcements),
    db.select({ value: count() }).from(schema.notifications),
    db.select({ id: schema.adminAuditLogs.id, action: schema.adminAuditLogs.action, createdAt: schema.adminAuditLogs.createdAt })
      .from(schema.adminAuditLogs).orderBy(desc(schema.adminAuditLogs.createdAt)).limit(8),
  ]);
  const metrics = [
    ["Akun terdaftar", users[0]?.value ?? 0],
    ["Permintaan AI tercatat", usage[0]?.value ?? 0],
    ["Pengumuman", announcements[0]?.value ?? 0],
    ["Notifikasi", notifications[0]?.value ?? 0],
  ] as const;

  return (
    <main className="admin-console">
      <header className="admin-console-header">
        <Link href="/" className="admin-brand"><span>N</span> NEFTIS <small>CONTROL</small></Link>
        <div className="admin-identity"><span>{admin.role}</span><strong>{admin.user.name || admin.user.email}</strong></div>
      </header>
      <section className="admin-console-intro"><p className="admin-kicker">NEFTIS / OPERATIONS</p><h1>Control <em>room.</em></h1><p>Operasional platform, kesehatan komunitas, dan aktivitas akun.</p></section>
      <section className="admin-metrics" aria-label="Ringkasan platform">
        {metrics.map(([label, value]) => <article className="admin-metric" key={label}><span>{label}</span><strong>{value.toLocaleString("id-ID")}</strong></article>)}
      </section>
      <section className="admin-console-grid">
        <article className="admin-panel admin-panel-feature"><p className="admin-kicker">PUBLISHING</p><h2>Pengumuman</h2><p>Kelola kabar produk, pemeliharaan, perubahan fitur, dan informasi komunitas.</p><Link href="/admin/announcements">Buka pengelolaan ↗</Link></article>
        <article className="admin-panel"><p className="admin-kicker">MEMBERS</p><h2>Pengguna</h2><p>Kelola akses, status akun, dan aktivitas penggunaan.</p><span className="admin-soon">Kontrol akun bertahap</span></article>
        <article className="admin-panel"><p className="admin-kicker">SECURITY</p><h2>Audit & keamanan</h2><p>Riwayat tindakan administratif dan kontrol akses.</p><span className="admin-soon">Audit log aktif</span></article>
      </section>
      <section className="admin-panel admin-audit"><div className="admin-panel-heading"><div><p className="admin-kicker">AUDIT TRAIL</p><h2>Aktivitas admin terbaru</h2></div><span>{recent.length} catatan</span></div>
        {recent.length ? recent.map((entry) => <div className="admin-audit-row" key={entry.id}><span>{entry.action}</span><time dateTime={entry.createdAt.toISOString()}>{entry.createdAt.toLocaleString("id-ID")}</time></div>) : <p className="admin-empty">Belum ada tindakan administratif yang tercatat.</p>}
      </section>
    </main>
  );
}
