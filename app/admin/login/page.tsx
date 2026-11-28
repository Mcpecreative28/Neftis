import Link from "next/link";

export default function AdminLoginPage() {
  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <span className="admin-brand"><span>N</span> NEFTIS <small>CONTROL</small></span>
        <p className="admin-kicker">RESTRICTED ACCESS</p>
        <h1>Akses <em>administrator.</em></h1>
        <p>Gunakan akun Neftis yang telah diberi izin administrator. Pendaftaran admin tidak tersedia untuk publik.</p>
        <Link className="admin-login-action" href="/login?next=/admin">Masuk dengan akun Neftis ↗</Link>
        <Link className="admin-login-back" href="/">Kembali ke Neftis</Link>
      </section>
    </main>
  );
}
