import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const { auth } = await import("@/lib/auth/server");
  const { data: session } = await auth.getSession();
  if (!session?.user) redirect("/login?next=/profile");
  const user = session.user;

  return (
    <main className="account-detail-page">
      <header><Link href="/dashboard" className="account-dashboard-brand"><span>N</span> NEFTIS</Link><Link href="/dashboard">← Dashboard</Link></header>
      <section className="account-detail-hero">
        <span className="account-eyebrow">ACCOUNT / IDENTITY</span>
        <h1>Profil <em>akun.</em></h1>
        <p>Informasi identitas yang terhubung dengan akun Neftis kamu.</p>
      </section>
      <section className="account-profile-sheet">
        <div className="account-avatar account-avatar-large">{(user.name || user.email || "N").slice(0, 1).toUpperCase()}</div>
        <div className="account-profile-fields">
          <div><span>NAMA</span><strong>{user.name || "Belum diatur"}</strong></div>
          <div><span>EMAIL</span><strong>{user.email}</strong></div>
          <div><span>STATUS EMAIL</span><strong>{user.emailVerified ? "Terverifikasi" : "Menunggu verifikasi"}</strong></div>
        </div>
      </section>
      <footer className="account-dashboard-footer"><span>NEFTIS / ACCOUNT IDENTITY</span><Link href="/dashboard">Kembali ke dashboard ↗</Link></footer>
    </main>
  );
}
