import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect("/login?next=/dashboard");

  const firstName = session.user.name?.trim().split(/\\s+/)[0] || "Pengguna";

  return (
    <main className="account-dashboard">
      <header className="account-dashboard-top">
        <Link href="/" className="account-dashboard-brand"><span>N</span> NEFTIS</Link>
        <nav aria-label="Account navigation">
          <Link href="/">Jelajahi Neftis</Link>
          <Link href="/api/auth/sign-out">Keluar</Link>
        </nav>
      </header>

      <section className="account-dashboard-hero">
        <div>
          <span className="account-eyebrow">PERSONAL WORKSPACE / OVERVIEW</span>
          <h1>Selamat datang,<br /><em>{firstName}.</em></h1>
          <p>Ruang pribadi untuk mengelola aktivitas, koneksi AI, dan preferensi Neftis.</p>
        </div>
        <div className="account-dashboard-orbit" aria-hidden="true"><span>N</span></div>
      </section>

      <section className="account-identity">
        <div className="account-avatar">{firstName.slice(0, 1).toUpperCase()}</div>
        <div><strong>{session.user.name || "Neftis member"}</strong><span>{session.user.email}</span></div>
        <span className="account-status">SIGNED IN</span>
      </section>

      <section className="account-dashboard-grid" aria-label="Workspace shortcuts">
        <Link href="/ai" className="account-dash-card account-dash-featured">
          <span>01 / INTELLIGENCE</span><strong>Neftis AI</strong>
          <p>Hubungkan token, endpoint, dan model AI pilihanmu.</p><i>↗</i>
        </Link>
        <Link href="/tools" className="account-dash-card">
          <span>02 / UTILITIES</span><strong>Tools library</strong>
          <p>Gunakan alat digital untuk pekerjaan sehari-hari.</p><i>↗</i>
        </Link>
        <Link href="/settings" className="account-dash-card">
          <span>03 / PREFERENCES</span><strong>Pengaturan</strong>
          <p>Kelola bahasa, tampilan, dan preferensi akun.</p><i>↗</i>
        </Link>
        <Link href="/profile" className="account-dash-card">
          <span>04 / IDENTITY</span><strong>Profil</strong>
          <p>Periksa informasi dan identitas akunmu.</p><i>↗</i>
        </Link>
      </section>

      <footer className="account-dashboard-footer">
        <span>NEFTIS / PERSONAL SPACE</span><span>{session.user.email}</span>
      </footer>
    </main>
  );
}
